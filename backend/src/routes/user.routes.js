const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
} = require('../validators/user.validator');

const router = express.Router();

router.use(authMiddleware, authorize('ADMIN'));

router.get('/', userController.getUsers);
router.post('/', createUserValidator, validate, userController.createUser);
router.patch('/:id', updateUserValidator, validate, userController.updateUser);
router.delete('/:id', userIdValidator, validate, userController.deleteUser);

module.exports = router;
