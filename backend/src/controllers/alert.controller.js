const alertService = require('../services/alert.service');
const { successResponse } = require('../utils/apiResponse');

const getAlerts = async (req, res, next) => {
  try {
    const { alerts, meta, unreadCount } = await alertService.getAlerts(req.query);
    const body = { success: true, message: 'Operation successful', data: alerts, meta, unreadCount };
    return res.status(200).json(body);
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
