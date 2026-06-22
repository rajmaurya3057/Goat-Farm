const Vaccination = require('../models/Vaccination');
const Goat = require('../models/Goat');
const { buildListQuery } = require('../utils/queryBuilder');
const { buildPaginationMeta } = require('../utils/pagination');
const logger = require('../config/logger');

const validateGoat = async (goatId) => {
  const goat = await Goat.findOne({ _id: goatId, isDeleted: false });
  if (!goat) {
    const err = new Error('Goat not found');
    err.statusCode = 404;
    throw err;
  }
  return goat;
};

const validateDates = (dateGiven, nextDueDate) => {
  if (dateGiven && nextDueDate && new Date(nextDueDate) <= new Date(dateGiven)) {
    const err = new Error('Next due date must be after date given');
    err.statusCode = 400;
    throw err;
  }
};

const buildStatusFilter = (status) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  switch (status) {
    case 'overdue':
      return { nextDueDate: { $lt: today } };
    case 'due':
      return { nextDueDate: { $gte: today, $lte: in7Days } };
    case 'completed':
      return { nextDueDate: { $gt: in7Days } };
    default:
      return {};
  }
};

const createVaccination = async (data, userId) => {
  await validateGoat(data.goat);
  validateDates(data.dateGiven, data.nextDueDate);

  const vaccination = await Vaccination.create({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });

  logger.info('Vaccination created', { vaccinationId: vaccination._id });
  return vaccination;
};

const getVaccinations = async (query) => {
  const { filter, sort, page, limit, skip } = buildListQuery(query, {
    searchFields: ['vaccineName'],
    filterFields: ['goat'],
  });

  if (query.status) {
    Object.assign(filter, buildStatusFilter(query.status));
  }

  const [vaccinations, total] = await Promise.all([
    Vaccination.find(filter)
      .populate('goat', 'uidTag name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Vaccination.countDocuments(filter),
  ]);

  return { vaccinations, meta: buildPaginationMeta(total, page, limit) };
};

const getVaccinationById = async (id) => {
  const vaccination = await Vaccination.findById(id)
    .populate('goat', 'uidTag name gender breed')
    .lean();
  if (!vaccination) {
    const err = new Error('Vaccination not found');
    err.statusCode = 404;
    throw err;
  }
  return vaccination;
};

const updateVaccination = async (id, data, userId) => {
  const vaccination = await Vaccination.findById(id);
  if (!vaccination) {
    const err = new Error('Vaccination not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.goat) await validateGoat(data.goat);
  validateDates(
    data.dateGiven || vaccination.dateGiven,
    data.nextDueDate || vaccination.nextDueDate
  );

  Object.assign(vaccination, data, { updatedBy: userId });
  await vaccination.save();

  logger.info('Vaccination updated', { vaccinationId: id });
  return vaccination;
};

const deleteVaccination = async (id) => {
  const vaccination = await Vaccination.findByIdAndDelete(id);
  if (!vaccination) {
    const err = new Error('Vaccination not found');
    err.statusCode = 404;
    throw err;
  }
  logger.info('Vaccination deleted', { vaccinationId: id });
  return vaccination;
};

module.exports = {
  createVaccination,
  getVaccinations,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
};
