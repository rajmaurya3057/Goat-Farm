const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    goat: { type: mongoose.Schema.Types.ObjectId, ref: 'Goat', required: true },
    vaccineName: { type: String, required: true, trim: true },
    dateGiven: { type: Date, required: true },
    nextDueDate: { type: Date, required: true },
    veterinarian: { type: String, trim: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

vaccinationSchema.index({ goat: 1 });
vaccinationSchema.index({ nextDueDate: 1 });
vaccinationSchema.index({ vaccineName: 1 });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
