const equipmentService = require('../services/equipment.service');
const { successResponse } = require('../utils/apiResponse');

const createEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.createEquipment(req.body, req.user._id);
    return successResponse(res, equipment, 'Equipment created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getEquipments = async (req, res, next) => {
  try {
    const { equipmentList, meta } = await equipmentService.getEquipments(req.query);
    return successResponse(res, equipmentList, 'Operation successful', 200, meta);
  } catch (error) {
    next(error);
  }
};

const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getEquipmentById(req.params.id);
    return successResponse(res, { equipment });
  } catch (error) {
    next(error);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.updateEquipment(req.params.id, req.body, req.user._id);
    return successResponse(res, equipment, 'Equipment updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    await equipmentService.deleteEquipment(req.params.id, req.user._id);
    return successResponse(res, null, 'Equipment deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
};
