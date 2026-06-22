const express = require('express');
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/image', upload.single('image'), handleUploadError, uploadController.uploadImage);

module.exports = router;
