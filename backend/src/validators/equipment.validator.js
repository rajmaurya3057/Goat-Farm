const { body, param } = require('express-validator');

const VALID_CATEGORIES = [
  'Feeding Equipment',
  'Medical Equipment',
  'Cleaning Equipment',
  'Water Equipment',
  'Farm Machinery',
  'Electrical Equipment',
  'Other',
];

const VALID_STATUSES = ['Working', 'Under Maintenance', 'Non Working', 'Disposed'];

const createEquipmentValidator = [
  body('name').trim().notEmpty().withMessage('Equipment Name is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(VALID_CATEGORIES)
    .withMessage('Invalid category'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer >= 0'),
  body('purchaseDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid purchase date format')
    .custom((value) => {
      const pDate = new Date(value);
      pDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (pDate > today) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),
  body('purchaseCost')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Purchase cost must be >= 0'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage('Invalid status value'),
  body('photo').optional({ checkFalsy: true }).trim(),
  body('supplier').optional({ checkFalsy: true }).trim(),
  body('location').optional({ checkFalsy: true }).trim(),
  body('notes').optional({ checkFalsy: true }).trim(),
];

const updateEquipmentValidator = [
  param('id').isMongoId().withMessage('Invalid equipment ID'),
  body('name').optional().trim().notEmpty().withMessage('Equipment Name cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isIn(VALID_CATEGORIES)
    .withMessage('Invalid category'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be an integer >= 0'),
  body('purchaseDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid purchase date format')
    .custom((value) => {
      const pDate = new Date(value);
      pDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (pDate > today) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),
  body('purchaseCost')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Purchase cost must be >= 0'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage('Invalid status value'),
  body('photo').optional({ checkFalsy: true }).trim(),
  body('supplier').optional({ checkFalsy: true }).trim(),
  body('location').optional({ checkFalsy: true }).trim(),
  body('notes').optional({ checkFalsy: true }).trim(),
];

const equipmentIdValidator = [param('id').isMongoId().withMessage('Invalid equipment ID')];

module.exports = {
  createEquipmentValidator,
  updateEquipmentValidator,
  equipmentIdValidator,
};
