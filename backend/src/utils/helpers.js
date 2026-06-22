const mongoose = require('mongoose');

const calculateMedicineStatus = (quantity, expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  if (expiry < today) return 'Expired';
  if (quantity === 0) return 'Out Of Stock';
  if (quantity < 5) return 'Low Stock';
  return 'Available';
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = { calculateMedicineStatus, isValidObjectId };
