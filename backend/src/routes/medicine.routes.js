const express = require('express');
const medicineController = require('../controllers/medicine.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createMedicineValidator,
  updateMedicineValidator,
  medicineIdValidator,
} = require('../validators/medicine.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', medicineController.getMedicines);
router.get('/:id', medicineIdValidator, validate, medicineController.getMedicineById);
router.post('/', authorize('ADMIN'), createMedicineValidator, validate, medicineController.createMedicine);
router.put('/:id', authorize('ADMIN'), updateMedicineValidator, validate, medicineController.updateMedicine);
router.delete('/:id', authorize('ADMIN'), medicineIdValidator, validate, medicineController.deleteMedicine);

module.exports = router;
