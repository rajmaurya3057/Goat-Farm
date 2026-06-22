const { body, param } = require('express-validator');

const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
  body('role')
    .isIn(['ADMIN', 'STAFF', 'VETERINARIAN'])
    .withMessage('Role must be ADMIN, STAFF, or VETERINARIAN'),
];

const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().notEmpty(),
  body('email').optional().trim().isEmail(),
  body('role').optional().isIn(['ADMIN', 'STAFF', 'VETERINARIAN']),
  body('isActive').optional().isBoolean(),
];

const userIdValidator = [param('id').isMongoId().withMessage('Invalid user ID')];

module.exports = { createUserValidator, updateUserValidator, userIdValidator };
