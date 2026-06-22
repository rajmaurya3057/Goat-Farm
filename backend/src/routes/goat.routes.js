const express = require('express');
const goatController = require('../controllers/goat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createGoatValidator,
  updateGoatValidator,
  goatIdValidator,
  weightValidator,
} = require('../validators/goat.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', goatController.getGoats);
router.get('/:id/weight-history', goatIdValidator, validate, goatController.getWeightHistory);
router.get('/:id', goatIdValidator, validate, goatController.getGoatById);

router.post('/', authorize('ADMIN'), createGoatValidator, validate, goatController.createGoat);
router.put(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  updateGoatValidator,
  validate,
  goatController.updateGoat
);
router.delete('/:id', authorize('ADMIN'), goatIdValidator, validate, goatController.deleteGoat);
router.post(
  '/:id/weight',
  authorize('ADMIN', 'STAFF'),
  weightValidator,
  validate,
  goatController.recordWeight
);

module.exports = router;
