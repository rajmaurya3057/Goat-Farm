const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    farmName: { type: String, required: true, trim: true, default: 'My Goat Farm' },
    ownerName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    logo: { type: String, trim: true },
    description: { type: String },
    establishedYear: { type: Number, min: 1800, max: new Date().getFullYear() },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
