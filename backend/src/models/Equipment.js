const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Feeding Equipment',
        'Medical Equipment',
        'Cleaning Equipment',
        'Water Equipment',
        'Farm Machinery',
        'Electrical Equipment',
        'Other',
      ],
      default: 'Other',
    },
    quantity: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date },
    purchaseCost: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['Working', 'Under Maintenance', 'Non Working', 'Disposed'],
      default: 'Working',
    },
    photo: { type: String, trim: true },
    supplier: { type: String, trim: true },
    location: { type: String, trim: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

equipmentSchema.index({ name: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
