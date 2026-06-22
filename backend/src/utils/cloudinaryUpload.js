const { cloudinary } = require('../config/cloudinary');
const logger = require('../config/logger');

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `gfms/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', { message: error.message });
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });

module.exports = { uploadToCloudinary };
