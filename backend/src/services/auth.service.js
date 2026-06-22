const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const SALT_ROUNDS = 12;

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const register = async (data) => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    const err = new Error('Registration is disabled. Contact an administrator.');
    err.statusCode = 403;
    throw err;
  }

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
    role: 'ADMIN',
  });

  logger.info('User registered', { userId: user._id, email: user.email });
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is disabled');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn('Failed login attempt', { email });
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);
  logger.info('User logged in', { userId: user._id });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe, generateToken };
