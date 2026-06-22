const Setting = require('../models/Setting');
const logger = require('../config/logger');

const getSettings = async () => {
  let settings = await Setting.findOne().lean();
  if (!settings) {
    settings = await Setting.create({ farmName: 'My Goat Farm' });
    settings = settings.toObject();
  }
  return settings;
};

const updateSettings = async (data) => {
  const settings = await Setting.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true });
  logger.info('Settings updated');
  return settings;
};

module.exports = { getSettings, updateSettings };
