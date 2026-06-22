const express = require('express');
const vaccinationController = require('../controllers/vaccination.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createVaccinationValidator,
  updateVaccinationValidator,
  vaccinationIdValidator,
} = require('../validators/vaccination.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', vaccinationController.getVaccinations);
router.get('/:id', vaccinationIdValidator, validate, vaccinationController.getVaccinationById);
router.post(
  '/',
  authorize('ADMIN', 'VETERINARIAN'),
  createVaccinationValidator,
  validate,
  vaccinationController.createVaccination
);
router.put(
  '/:id',
  authorize('ADMIN', 'VETERINARIAN'),
  updateVaccinationValidator,
  validate,
  vaccinationController.updateVaccination
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  vaccinationIdValidator,
  validate,
  vaccinationController.deleteVaccination
);

module.exports = router;
