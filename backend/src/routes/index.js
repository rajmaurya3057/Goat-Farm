const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const goatRoutes = require('./goat.routes');
const medicineRoutes = require('./medicine.routes');
const vaccinationRoutes = require('./vaccination.routes');
const treatmentRoutes = require('./treatment.routes');
const alertRoutes = require('./alert.routes');
const settingRoutes = require('./setting.routes');
const uploadRoutes = require('./upload.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/goats', goatRoutes);
router.use('/medicines', medicineRoutes);
router.use('/vaccinations', vaccinationRoutes);
router.use('/treatments', treatmentRoutes);
router.use('/alerts', alertRoutes);
router.use('/settings', settingRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
