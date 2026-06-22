const express = require('express');
const equipmentController = require('../controllers/equipment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createEquipmentValidator,
  updateEquipmentValidator,
  equipmentIdValidator,
} = require('../validators/equipment.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', equipmentController.getEquipments);
router.get('/:id', equipmentIdValidator, validate, equipmentController.getEquipmentById);
router.post('/', authorize('ADMIN'), createEquipmentValidator, validate, equipmentController.createEquipment);
router.put('/:id', authorize('ADMIN'), updateEquipmentValidator, validate, equipmentController.updateEquipment);
router.delete('/:id', authorize('ADMIN'), equipmentIdValidator, validate, equipmentController.deleteEquipment);

module.exports = router;
