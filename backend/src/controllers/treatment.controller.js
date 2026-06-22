const treatmentService = require('../services/treatment.service');
const { successResponse } = require('../utils/apiResponse');

const createTreatment = async (req, res, next) => {
  try {
    const treatment = await treatmentService.createTreatment(req.body, req.user._id);
    return successResponse(res, treatment, 'Treatment created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getTreatments = async (req, res, next) => {
  try {
    const { treatments, meta } = await treatmentService.getTreatments(req.query);
    return successResponse(res, treatments, 'Operation successful', 200, meta);
  } catch (error) {
    next(error);
  }
};

const getTreatmentById = async (req, res, next) => {
  try {
    const treatment = await treatmentService.getTreatmentById(req.params.id);
    return successResponse(res, treatment);
  } catch (error) {
    next(error);
  }
};

const updateTreatment = async (req, res, next) => {
  try {
    const treatment = await treatmentService.updateTreatment(
      req.params.id,
      req.body,
      req.user._id
    );
    return successResponse(res, treatment, 'Treatment updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteTreatment = async (req, res, next) => {
  try {
    await treatmentService.deleteTreatment(req.params.id);
    return successResponse(res, null, 'Treatment deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
};
