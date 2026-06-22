const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    farmName: { type: String, default: 'My Goat Farm' },
    logo: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

module.exports = mongoose.model('Setting', settingSchema);
