const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return successResponse(res, user, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
