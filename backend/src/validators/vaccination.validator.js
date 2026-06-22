const { body, param } = require('express-validator');

const createVaccinationValidator = [
  body('goat').isMongoId().withMessage('Valid goat ID is required'),
  body('vaccineName').trim().notEmpty().withMessage('Vaccine name is required'),
  body('dateGiven').isISO8601().withMessage('Valid date given is required'),
  body('nextDueDate')
    .isISO8601()
    .withMessage('Valid next due date is required')
    .custom((value, { req }) => {
      if (req.body.dateGiven && new Date(value) <= new Date(req.body.dateGiven)) {
        throw new Error('Next due date must be after date given');
      }
      return true;
    }),
  body('veterinarian').optional().trim(),
  body('notes').optional().trim(),
];

const updateVaccinationValidator = [
  param('id').isMongoId().withMessage('Invalid vaccination ID'),
  body('goat').optional().isMongoId(),
  body('vaccineName').optional().trim().notEmpty(),
  body('dateGiven').optional().isISO8601(),
  body('nextDueDate').optional().isISO8601(),
];

const vaccinationIdValidator = [param('id').isMongoId().withMessage('Invalid vaccination ID')];

module.exports = {
  createVaccinationValidator,
  updateVaccinationValidator,
  vaccinationIdValidator,
};
