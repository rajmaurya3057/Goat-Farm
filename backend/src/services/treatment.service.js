const mongoose = require('mongoose');
const Treatment = require('../models/Treatment');
const Goat = require('../models/Goat');
const medicineService = require('./medicine.service');
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
};

const createTreatment = async (data, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await validateGoat(data.goat);
    await medicineService.decrementQuantity(data.medicine, session);

    const [treatment] = await Treatment.create(
      [{ ...data, createdBy: userId, updatedBy: userId }],
      { session }
    );

    await session.commitTransaction();
    logger.info('Treatment created', { treatmentId: treatment._id });
    return treatment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getTreatments = async (query) => {
  const { filter, sort, page, limit, skip } = buildListQuery(query, {
    filterFields: ['goat', 'medicine'],
  });

  const [treatments, total] = await Promise.all([
    Treatment.find(filter)
      .populate('goat', 'uidTag name')
      .populate('medicine', 'name type')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Treatment.countDocuments(filter),
  ]);

  return { treatments, meta: buildPaginationMeta(total, page, limit) };
};

const getTreatmentById = async (id) => {
  const treatment = await Treatment.findById(id)
    .populate('goat', 'uidTag name gender')
    .populate('medicine', 'name type quantity status')
    .lean();

  if (!treatment) {
    const err = new Error('Treatment not found');
    err.statusCode = 404;
    throw err;
  }
  return treatment;
};

const updateTreatment = async (id, data, userId) => {
  const treatment = await Treatment.findById(id);
  if (!treatment) {
    const err = new Error('Treatment not found');
    err.statusCode = 404;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (data.medicine && data.medicine.toString() !== treatment.medicine.toString()) {
      await medicineService.incrementQuantity(treatment.medicine, session);
      await medicineService.decrementQuantity(data.medicine, session);
    }

    if (data.goat) await validateGoat(data.goat);
    Object.assign(treatment, data, { updatedBy: userId });
    await treatment.save({ session });

    await session.commitTransaction();
    logger.info('Treatment updated', { treatmentId: id });
    return treatment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteTreatment = async (id) => {
  const treatment = await Treatment.findById(id);
  if (!treatment) {
    const err = new Error('Treatment not found');
    err.statusCode = 404;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await medicineService.incrementQuantity(treatment.medicine, session);
    await Treatment.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    logger.info('Treatment deleted', { treatmentId: id });
    return treatment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  createTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
};
