const Goat = require('../models/Goat');
const WeightLog = require('../models/WeightLog');
const Vaccination = require('../models/Vaccination');
const Treatment = require('../models/Treatment');
const { buildListQuery } = require('../utils/queryBuilder');
const { buildPaginationMeta } = require('../utils/pagination');
const logger = require('../config/logger');

const validateParents = async (goatId, motherId, fatherId) => {
  if (motherId && goatId && motherId.toString() === goatId.toString()) {
    const err = new Error('A goat cannot be its own mother');
    err.statusCode = 400;
    throw err;
  }
  if (fatherId && goatId && fatherId.toString() === goatId.toString()) {
    const err = new Error('A goat cannot be its own father');
    err.statusCode = 400;
    throw err;
  }

  if (motherId) {
    const mother = await Goat.findOne({ _id: motherId, isDeleted: false });
    if (!mother) {
      const err = new Error('Mother goat not found');
      err.statusCode = 404;
      throw err;
    }
    if (mother.gender !== 'Female') {
      const err = new Error('Mother must be a female goat');
      err.statusCode = 400;
      throw err;
    }
  }

  if (fatherId) {
    const father = await Goat.findOne({ _id: fatherId, isDeleted: false });
    if (!father) {
      const err = new Error('Father goat not found');
      err.statusCode = 404;
      throw err;
    }
    if (father.gender !== 'Male') {
      const err = new Error('Father must be a male goat');
      err.statusCode = 400;
      throw err;
    }
  }
};

const validateDob = (dob) => {
  if (dob && new Date(dob) > new Date()) {
    const err = new Error('Date of birth cannot be in the future');
    err.statusCode = 400;
    throw err;
  }
};

const createGoat = async (data, userId) => {
  validateDob(data.dob);
  await validateParents(null, data.mother, data.father);

  const goat = await Goat.create({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });

  logger.info('Goat created', { goatId: goat._id, uidTag: goat.uidTag });
  return goat;
};

const getGoats = async (query) => {
  const { filter, sort, page, limit, skip } = buildListQuery(query, {
    searchFields: ['name', 'uidTag'],
    filterFields: ['gender', 'breed', 'status'],
  });

  filter.isDeleted = false;

  const [goats, total] = await Promise.all([
    Goat.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Goat.countDocuments(filter),
  ]);

  return { goats, meta: buildPaginationMeta(total, page, limit) };
};

const getGoatById = async (id) => {
  const goat = await Goat.findOne({ _id: id, isDeleted: false })
    .populate('mother', 'uidTag name gender breed status')
    .populate('father', 'uidTag name gender breed status')
    .lean();

  if (!goat) {
    const err = new Error('Goat not found');
    err.statusCode = 404;
    throw err;
  }

  const [kids, weightHistory, vaccinations, treatments] = await Promise.all([
    Goat.find({ $or: [{ mother: id }, { father: id }], isDeleted: false })
      .select('uidTag name gender breed status')
      .lean(),
    WeightLog.find({ goat: id }).sort({ date: 1 }).lean(),
    Vaccination.find({ goat: id }).sort({ dateGiven: -1 }).lean(),
    Treatment.find({ goat: id })
      .populate('medicine', 'name type')
      .sort({ treatmentDate: -1 })
      .lean(),
  ]);

  return { goat, mother: goat.mother, father: goat.father, kids, weightHistory, vaccinations, treatments };
};

const updateGoat = async (id, data, userId) => {
  const goat = await Goat.findOne({ _id: id, isDeleted: false });
  if (!goat) {
    const err = new Error('Goat not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.dob) validateDob(data.dob);
  await validateParents(id, data.mother || goat.mother, data.father || goat.father);

  Object.assign(goat, data, { updatedBy: userId });
  await goat.save();

  logger.info('Goat updated', { goatId: id });
  return goat;
};

const deleteGoat = async (id, userId) => {
  const goat = await Goat.findOne({ _id: id, isDeleted: false });
  if (!goat) {
    const err = new Error('Goat not found');
    err.statusCode = 404;
    throw err;
  }

  goat.isDeleted = true;
  goat.updatedBy = userId;
  await goat.save();

  logger.info('Goat soft deleted', { goatId: id });
  return goat;
};

module.exports = {
  createGoat,
  getGoats,
  getGoatById,
  updateGoat,
  deleteGoat,
};
