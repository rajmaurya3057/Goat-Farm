const vaccinationService = require('../services/vaccination.service');
const { successResponse } = require('../utils/apiResponse');

const createVaccination = async (req, res, next) => {
  try {
    const vaccination = await vaccinationService.createVaccination(req.body, req.user._id);
    return successResponse(res, vaccination, 'Vaccination created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getVaccinations = async (req, res, next) => {
  try {
    const { vaccinations, meta } = await vaccinationService.getVaccinations(req.query);
    return successResponse(res, vaccinations, 'Operation successful', 200, meta);
  } catch (error) {
    next(error);
  }
};

const getVaccinationById = async (req, res, next) => {
  try {
    const vaccination = await vaccinationService.getVaccinationById(req.params.id);
    return successResponse(res, vaccination);
  } catch (error) {
    next(error);
  }
};

const updateVaccination = async (req, res, next) => {
  try {
    const vaccination = await vaccinationService.updateVaccination(
      req.params.id,
      req.body,
      req.user._id
    );
    return successResponse(res, vaccination, 'Vaccination updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteVaccination = async (req, res, next) => {
  try {
    await vaccinationService.deleteVaccination(req.params.id);
    return successResponse(res, null, 'Vaccination deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVaccination,
  getVaccinations,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
};
