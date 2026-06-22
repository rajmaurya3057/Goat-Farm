const { body, param } = require('express-validator');

const createTreatmentValidator = [
  body('goat').isMongoId().withMessage('Valid goat ID is required'),
  body('medicine').isMongoId().withMessage('Valid medicine ID is required'),
  body('disease').trim().notEmpty().withMessage('Disease is required'),
  body('treatmentDate').isISO8601().withMessage('Valid treatment date is required'),
  body('notes').optional().trim(),
];

const updateTreatmentValidator = [
  param('id').isMongoId().withMessage('Invalid treatment ID'),
  body('goat').optional().isMongoId(),
  body('medicine').optional().isMongoId(),
  body('disease').optional().trim().notEmpty(),
  body('treatmentDate').optional().isISO8601(),
];

const treatmentIdValidator = [param('id').isMongoId().withMessage('Invalid treatment ID')];

module.exports = { createTreatmentValidator, updateTreatmentValidator, treatmentIdValidator };
