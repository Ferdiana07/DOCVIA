/**
 * Admin Seeder
 * ------------
 * Run this once to create the admin account in the database.
 *
 * Usage:
 *   node server/utils/seedAdmin.js
 *
 * The admin account credentials are set via environment variables.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@docvia.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD is required when seeding an admin in production.');
  }

  try {
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log(`Admin account already exists: ${adminEmail}`);
      process.exit(0);
    }

    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log(`✅ Admin account created successfully.`);
    console.log(`   Email:    ${adminEmail}`);
    console.log('   Password was read from configuration and is not printed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeder failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
