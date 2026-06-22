const settingService = require('../services/setting.service');
const { successResponse } = require('../utils/apiResponse');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getSettings();
    return successResponse(res, settings);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingService.updateSettings(req.body);
    return successResponse(res, settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
