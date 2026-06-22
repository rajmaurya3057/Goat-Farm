const medicineService = require('../services/medicine.service');
const { successResponse } = require('../utils/apiResponse');

const createMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.createMedicine(req.body, req.user._id);
    return successResponse(res, medicine, 'Medicine created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getMedicines = async (req, res, next) => {
  try {
    const { medicines, meta } = await medicineService.getMedicines(req.query);
    return successResponse(res, medicines, 'Operation successful', 200, meta);
  } catch (error) {
    next(error);
  }
};

const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    return successResponse(res, { medicine });
  } catch (error) {
    next(error);
  }
};

const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body, req.user._id);
    return successResponse(res, medicine, 'Medicine updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteMedicine = async (req, res, next) => {
  try {
    await medicineService.deleteMedicine(req.params.id, req.user._id);
    return successResponse(res, null, 'Medicine deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
