const { body, param } = require('express-validator');

const createGoatValidator = [
  body('uidTag').trim().isLength({ min: 3, max: 50 }).withMessage('UID must be 3-50 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  body('status')
    .optional()
    .isIn(['Active', 'Sold', 'Dead', 'Pregnant'])
    .withMessage('Invalid status'),
  body('currentWeight').optional().isFloat({ min: 0 }).withMessage('Weight must be positive'),
  body('dob').optional().isISO8601().withMessage('Invalid date of birth'),
  body('mother').optional().isMongoId().withMessage('Invalid mother ID'),
  body('father').optional().isMongoId().withMessage('Invalid father ID'),
];

const updateGoatValidator = [
  param('id').isMongoId().withMessage('Invalid goat ID'),
  body('uidTag').optional().trim().isLength({ min: 3, max: 50 }),
  body('gender').optional().isIn(['Male', 'Female']),
  body('status').optional().isIn(['Active', 'Sold', 'Dead', 'Pregnant']),
  body('currentWeight').optional().isFloat({ min: 0 }),
  body('mother').optional().isMongoId(),
  body('father').optional().isMongoId(),
];

const goatIdValidator = [param('id').isMongoId().withMessage('Invalid goat ID')];

const weightValidator = [
  param('id').isMongoId().withMessage('Invalid goat ID'),
  body('weight')
    .isFloat({ min: 0.1, max: 300 })
    .withMessage('Weight must be between 0.1 and 300 kg'),
];

module.exports = {
  createGoatValidator,
  updateGoatValidator,
  goatIdValidator,
  weightValidator,
};
