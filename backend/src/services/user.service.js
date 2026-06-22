const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { buildListQuery } = require('../utils/queryBuilder');
const { buildPaginationMeta } = require('../utils/pagination');
const logger = require('../config/logger');

const SALT_ROUNDS = 12;

const getUsers = async (query) => {
  const { filter, sort, page, limit, skip } = buildListQuery(query, {
    searchFields: ['name', 'email'],
    filterFields: ['role'],
  });

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return { users, meta: buildPaginationMeta(total, page, limit) };
};

const createUser = async (data) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already exists');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    role: data.role,
  });

  logger.info('User created by admin', { userId: user._id });
  const result = user.toObject();
  delete result.password;
  return result;
};

const updateUser = async (id, data, requestingUserId) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.email && data.email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      const err = new Error('Email already exists');
      err.statusCode = 409;
      throw err;
    }
    user.email = data.email.toLowerCase();
  }

  if (data.name) user.name = data.name;
  if (data.role) user.role = data.role;
  if (data.isActive !== undefined) {
    if (id.toString() === requestingUserId.toString() && !data.isActive) {
      const err = new Error('Cannot deactivate your own account');
      err.statusCode = 400;
      throw err;
    }
    user.isActive = data.isActive;
  }

  await user.save();
  logger.info('User updated', { userId: id });

  const result = user.toObject();
  delete result.password;
  return result;
};

const deleteUser = async (id, requestingUserId) => {
  if (id.toString() === requestingUserId.toString()) {
    const err = new Error('Cannot delete your own account');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  logger.info('User deleted', { userId: id });
  return user;
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
