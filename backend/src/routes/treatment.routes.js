const express = require('express');
const treatmentController = require('../controllers/treatment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createTreatmentValidator,
  updateTreatmentValidator,
  treatmentIdValidator,
} = require('../validators/treatment.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', treatmentController.getTreatments);
router.get('/:id', treatmentIdValidator, validate, treatmentController.getTreatmentById);
router.post(
  '/',
  authorize('ADMIN', 'STAFF', 'VETERINARIAN'),
  createTreatmentValidator,
  validate,
  treatmentController.createTreatment
);
router.put(
  '/:id',
  authorize('ADMIN', 'VETERINARIAN'),
  updateTreatmentValidator,
  validate,
  treatmentController.updateTreatment
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  treatmentIdValidator,
  validate,
  treatmentController.deleteTreatment
);

module.exports = router;
