const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    goat: { type: mongoose.Schema.Types.ObjectId, ref: 'Goat', required: true },
    weight: { type: Number, required: true, min: 0.1, max: 300 },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

weightLogSchema.index({ goat: 1, date: 1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
