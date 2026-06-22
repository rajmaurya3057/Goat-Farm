const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    image: { type: String },
    batchNumber: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, trim: true },
    purchaseDate: { type: Date },
    expiryDate: { type: Date, required: true },
    supplier: { type: String, trim: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Available', 'Low Stock', 'Out Of Stock', 'Expired'],
      default: 'Available',
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 1 });
medicineSchema.index({ type: 1 });
medicineSchema.index({ status: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
