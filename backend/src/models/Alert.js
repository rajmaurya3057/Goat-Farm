const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'LOW_STOCK',
        'MEDICINE_EXPIRING',
        'MEDICINE_EXPIRED',
        'VACCINATION_DUE',
        'VACCINATION_OVERDUE',
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    entityType: { type: String, enum: ['Medicine', 'Vaccination', 'Goat'] },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

alertSchema.index({ type: 1, referenceId: 1, isRead: 1 });
alertSchema.index({ isRead: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
