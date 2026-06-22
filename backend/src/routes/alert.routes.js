const express = require('express');
const { param } = require('express-validator');
const alertController = require('../controllers/alert.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', alertController.getAlerts);
router.patch('/read-all', alertController.markAllAsRead);
router.patch(
  '/:id/read',
  param('id').isMongoId().withMessage('Invalid alert ID'),
  validate,
  alertController.markAsRead
);

module.exports = router;
