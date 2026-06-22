const Setting = require('../models/Setting');
const logger = require('../config/logger');

const getSettings = async () => {
  let settings = await Setting.findOne().lean();
  if (!settings) {
    const created = await Setting.create({ farmName: 'My Goat Farm' });
    settings = created.toObject();
  }
  return settings;
};

const updateSettings = async (data, userId) => {
  const existing = await Setting.findOne();

  if (!existing) {
    const created = await Setting.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
    logger.info('Settings created (first time)', { userId });
    return created;
  }

  Object.assign(existing, data, { updatedBy: userId });
  await existing.save();
  logger.info('Settings updated', { userId });
  return existing;
};

module.exports = { getSettings, updateSettings };
