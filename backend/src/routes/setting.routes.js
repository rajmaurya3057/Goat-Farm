const express = require('express');
const settingController = require('../controllers/setting.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', settingController.getSettings);
router.put('/', authorize('ADMIN'), settingController.updateSettings);

module.exports = router;
