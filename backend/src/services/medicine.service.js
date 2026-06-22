const Medicine = require('../models/Medicine');
const { buildListQuery } = require('../utils/queryBuilder');
const { buildPaginationMeta } = require('../utils/pagination');
const { calculateMedicineStatus } = require('../utils/helpers');
const logger = require('../config/logger');

const applyStatus = (medicine) => {
  medicine.status = calculateMedicineStatus(medicine.quantity, medicine.expiryDate);
  return medicine;
};

const createMedicine = async (data, userId) => {
  const medicine = new Medicine({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });
  applyStatus(medicine);
  await medicine.save();
  logger.info('Medicine created', { medicineId: medicine._id, name: medicine.name });
  return medicine;
};

const getMedicines = async (query) => {
  const { filter, sort, page, limit, skip } = buildListQuery(query, {
    searchFields: ['name', 'type'],
    filterFields: ['status', 'type'],
  });

  filter.isDeleted = false;

  const [medicines, total] = await Promise.all([
    Medicine.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Medicine.countDocuments(filter),
  ]);

  return { medicines, meta: buildPaginationMeta(total, page, limit) };
};

const getMedicineById = async (id) => {
  const medicine = await Medicine.findOne({ _id: id, isDeleted: false }).lean();
  if (!medicine) {
    const err = new Error('Medicine not found');
    err.statusCode = 404;
    throw err;
  }
  return medicine;
};

const updateMedicine = async (id, data, userId) => {
  const medicine = await Medicine.findOne({ _id: id, isDeleted: false });
  if (!medicine) {
    const err = new Error('Medicine not found');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(medicine, data, { updatedBy: userId });
  applyStatus(medicine);
  await medicine.save();

  logger.info('Medicine updated', { medicineId: id });
  return medicine;
};

const deleteMedicine = async (id, userId) => {
  const medicine = await Medicine.findOne({ _id: id, isDeleted: false });
  if (!medicine) {
    const err = new Error('Medicine not found');
    err.statusCode = 404;
    throw err;
  }

  medicine.isDeleted = true;
  medicine.updatedBy = userId;
  await medicine.save();

  logger.info('Medicine soft deleted', { medicineId: id });
  return medicine;
};

const decrementQuantity = async (medicineId, session) => {
  const medicine = await Medicine.findOne({ _id: medicineId, isDeleted: false }).session(session);
  if (!medicine) {
    const err = new Error('Medicine not found');
    err.statusCode = 404;
    throw err;
  }
  if (medicine.quantity <= 0) {
    const err = new Error('Medicine out of stock');
    err.statusCode = 400;
    throw err;
  }

  medicine.quantity -= 1;
  applyStatus(medicine);
  await medicine.save({ session });
  return medicine;
};

const incrementQuantity = async (medicineId, session) => {
  const medicine = await Medicine.findOne({ _id: medicineId, isDeleted: false }).session(session);
  if (!medicine) {
    const err = new Error('Medicine not found');
    err.statusCode = 404;
    throw err;
  }

  medicine.quantity += 1;
  applyStatus(medicine);
  await medicine.save({ session });
  return medicine;
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  decrementQuantity,
  incrementQuantity,
  applyStatus,
};
