const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    goat: { type: mongoose.Schema.Types.ObjectId, ref: 'Goat', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    disease: { type: String, required: true, trim: true },
    treatmentDate: { type: Date, required: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

treatmentSchema.index({ goat: 1 });
treatmentSchema.index({ medicine: 1 });
treatmentSchema.index({ treatmentDate: 1 });

module.exports = mongoose.model('Treatment', treatmentSchema);
