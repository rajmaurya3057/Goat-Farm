require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Setting = require('../models/Setting');

const seed = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const password = process.env.SEED_ADMIN_PASSWORD || 'Password123';
    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Farm Admin',
      email: (process.env.SEED_ADMIN_EMAIL || 'admin@goatfarm.com').toLowerCase(),
      password: hashed,
      role: 'ADMIN',
    });
    console.log('Admin user created');
    console.log(`Email: ${process.env.SEED_ADMIN_EMAIL || 'admin@goatfarm.com'}`);
  } else {
    console.log('Users already exist, skipping admin seed');
  }

  const settings = await Setting.findOne();
  if (!settings) {
    await Setting.create({ farmName: 'My Goat Farm' });
    console.log('Default settings created');
  }

  await mongoose.disconnect();
  console.log('Seed completed');
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
