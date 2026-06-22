const goatService = require('../services/goat.service');
const weightService = require('../services/weight.service');
const { successResponse } = require('../utils/apiResponse');

const createGoat = async (req, res, next) => {
  try {
    const goat = await goatService.createGoat(req.body, req.user._id);
    return successResponse(res, goat, 'Goat created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getGoats = async (req, res, next) => {
  try {
    const { goats, meta } = await goatService.getGoats(req.query);
    return successResponse(res, goats, 'Operation successful', 200, meta);
  } catch (error) {
    next(error);
  }
};

const getGoatById = async (req, res, next) => {
  try {
    const data = await goatService.getGoatById(req.params.id);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
};

const updateGoat = async (req, res, next) => {
  try {
    const goat = await goatService.updateGoat(req.params.id, req.body, req.user._id);
    return successResponse(res, goat, 'Goat updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteGoat = async (req, res, next) => {
  try {
    await goatService.deleteGoat(req.params.id, req.user._id);
    return successResponse(res, null, 'Goat deleted successfully');
  } catch (error) {
    next(error);
  }
};

const recordWeight = async (req, res, next) => {
  try {
    const log = await weightService.recordWeight(req.params.id, req.body.weight, req.user._id);
    return successResponse(res, log, 'Weight recorded', 201);
  } catch (error) {
    next(error);
  }
};

const getWeightHistory = async (req, res, next) => {
  try {
    const history = await weightService.getWeightHistory(req.params.id);
    return successResponse(res, history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGoat,
  getGoats,
  getGoatById,
  updateGoat,
  deleteGoat,
  recordWeight,
  getWeightHistory,
};
