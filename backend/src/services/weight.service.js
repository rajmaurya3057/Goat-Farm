const Goat = require('../models/Goat');
const WeightLog = require('../models/WeightLog');
const logger = require('../config/logger');

const recordWeight = async (goatId, weight, userId) => {
  const goat = await Goat.findOne({ _id: goatId, isDeleted: false });
  if (!goat) {
    const err = new Error('Goat not found');
    err.statusCode = 404;
    throw err;
  }

  const log = await WeightLog.create({
    goat: goatId,
    weight,
    date: new Date(),
    createdBy: userId,
  });

  goat.currentWeight = weight;
  goat.updatedBy = userId;
  await goat.save();

  logger.info('Weight recorded', { goatId, weight });
  return log;
};

const getWeightHistory = async (goatId) => {
  const goat = await Goat.findOne({ _id: goatId, isDeleted: false });
  if (!goat) {
    const err = new Error('Goat not found');
    err.statusCode = 404;
    throw err;
  }

  return WeightLog.find({ goat: goatId }).sort({ date: 1 }).lean();
};

module.exports = { recordWeight, getWeightHistory };
