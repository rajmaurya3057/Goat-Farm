const { errorResponse } = require('../utils/apiResponse');
const logger = require('../config/logger');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  if (!roles.includes(req.user.role)) {
    logger.warn('Unauthorized access attempt', {
      userId: req.user._id,
      role: req.user.role,
      requiredRoles: roles,
      path: req.path,
    });
    return errorResponse(res, 'Forbidden', 403);
  }

  next();
};

module.exports = authorize;
