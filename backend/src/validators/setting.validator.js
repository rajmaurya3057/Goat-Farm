const { body } = require('express-validator');

const updateSettingsValidator = [
  body('farmName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Farm Name cannot be empty'),
  body('ownerName')
    .optional({ checkFalsy: true })
    .trim(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+\d\s\-().]{6,20}$/)
    .withMessage('Invalid phone number format'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('address')
    .optional({ checkFalsy: true })
    .trim(),
  body('logo')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false })
    .withMessage('Logo must be a valid URL'),
  body('description')
    .optional({ checkFalsy: true })
    .trim(),
  body('establishedYear')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Established year must be between 1800 and ${new Date().getFullYear()}`),
  body('notes')
    .optional({ checkFalsy: true })
    .trim(),
];

module.exports = { updateSettingsValidator };
