const Equipment = require('../models/Equipment');
const { buildListQuery } = require('../utils/queryBuilder');
const { buildPaginationMeta } = require('../utils/pagination');
const logger = require('../config/logger');

const createEquipment = async (data, userId) => {
  const equipment = new Equipment({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });
  await equipment.save();
  logger.info('Equipment created', { equipmentId: equipment._id, name: equipment.name });
  return equipment;
};

const getEquipments = async (query) => {
  const { filter, sort, page, limit, skip } = buildListQuery(query, {
    searchFields: ['name'],
    filterFields: ['status', 'category'],
  });

  filter.isDeleted = false;

  const [equipmentList, total] = await Promise.all([
    Equipment.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Equipment.countDocuments(filter),
  ]);

  return { equipmentList, meta: buildPaginationMeta(total, page, limit) };
};

const getEquipmentById = async (id) => {
  const equipment = await Equipment.findOne({ _id: id, isDeleted: false }).lean();
  if (!equipment) {
    const err = new Error('Equipment not found');
    err.statusCode = 404;
    throw err;
  }
  return equipment;
};

const updateEquipment = async (id, data, userId) => {
  const equipment = await Equipment.findOne({ _id: id, isDeleted: false });
  if (!equipment) {
    const err = new Error('Equipment not found');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(equipment, data, { updatedBy: userId });
  await equipment.save();

  logger.info('Equipment updated', { equipmentId: id });
  return equipment;
};

const deleteEquipment = async (id, userId) => {
  const equipment = await Equipment.findOne({ _id: id, isDeleted: false });
  if (!equipment) {
    const err = new Error('Equipment not found');
    err.statusCode = 404;
    throw err;
  }

  equipment.isDeleted = true;
  equipment.updatedBy = userId;
  await equipment.save();

  logger.info('Equipment soft deleted', { equipmentId: id });
  return equipment;
};

module.exports = {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
};
