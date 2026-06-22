const { body, param } = require('express-validator');

const createMedicineValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be >= 0'),
  body('expiryDate')
    .isISO8601()
    .withMessage('Valid expiry date is required')
    .custom((value) => {
      const expiry = new Date(value);
      expiry.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  body('purchaseDate').optional().isISO8601(),
];

const updateMedicineValidator = [
  param('id').isMongoId().withMessage('Invalid medicine ID'),
  body('name').optional().trim().notEmpty(),
  body('type').optional().trim().notEmpty(),
  body('quantity').optional().isInt({ min: 0 }),
  body('expiryDate').optional().isISO8601(),
];

const medicineIdValidator = [param('id').isMongoId().withMessage('Invalid medicine ID')];

module.exports = { createMedicineValidator, updateMedicineValidator, medicineIdValidator };
