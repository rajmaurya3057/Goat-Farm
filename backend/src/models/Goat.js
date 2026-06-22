const mongoose = require('mongoose');

const goatSchema = new mongoose.Schema(
  {
    uidTag: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    breed: { type: String, trim: true },
    color: { type: String, trim: true },
    dob: { type: Date },
    currentWeight: { type: Number, min: 0 },
    photo: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Sold', 'Dead', 'Pregnant'],
      default: 'Active',
    },
    mother: { type: mongoose.Schema.Types.ObjectId, ref: 'Goat' },
    father: { type: mongoose.Schema.Types.ObjectId, ref: 'Goat' },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

goatSchema.index({ gender: 1 });
goatSchema.index({ breed: 1 });
goatSchema.index({ status: 1 });
goatSchema.index({ isDeleted: 1 });
goatSchema.index({ name: 'text', uidTag: 'text' });

module.exports = mongoose.model('Goat', goatSchema);
