const { isConfigured } = require('../config/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const uploadImage = async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return errorResponse(res, 'Cloudinary is not configured', 503);
    }

    if (!req.file) {
      return errorResponse(res, 'No image file provided', 400);
    }

    const folder = req.body.folder || 'general';
    const allowedFolders = ['goats', 'medicines', 'settings', 'general'];
    const uploadFolder = allowedFolders.includes(folder) ? folder : 'general';

    const url = await uploadToCloudinary(req.file.buffer, uploadFolder);
    return successResponse(res, { url }, 'Image uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage };
