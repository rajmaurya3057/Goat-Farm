const settingService = require('../services/setting.service');
const { successResponse } = require('../utils/apiResponse');
const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const settings = await settingService.updateSettings(req.body, req.user._id);
    return successResponse(res, settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
