const alertService = require('../services/alert.service');
const { successResponse } = require('../utils/apiResponse');

const getAlerts = async (req, res, next) => {
  try {
    const { alerts, meta } = await alertService.getAlerts(req.query);
    return successResponse(res, alerts, 'Operation successful', 200, meta);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const alert = await alertService.markAsRead(req.params.id);
    return successResponse(res, alert, 'Alert marked as read');
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await alertService.markAllAsRead();
    return successResponse(res, result, 'All alerts marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, markAsRead, markAllAsRead };
