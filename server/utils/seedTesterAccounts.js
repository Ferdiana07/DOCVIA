require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const TEST_PASSWORD = 'DocviaTest-2026!';
const TEST_ACCOUNTS = [
  {
    name: 'Raka Pradana',
    email: 'raka.pradana@example.com',
    phone: '08987654321',
    role: 'patient',
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@docvia.local',
    phone: '08123456701',
    role: 'doctor',
  },
  {
    name: 'DOCVIA Administrator',
    email: 'admin@docvia.local',
    phone: '',
    role: 'admin',
  },
];

const upsertUser = async (account) => {
  let user = await User.findOne({ email: account.email }).select('+password');
  if (!user) user = new User();

  user.name = account.name;
  user.email = account.email;
  user.phone = account.phone;
  user.role = account.role;
  user.password = TEST_PASSWORD;
  user.isActive = true;
  await user.save();
  return user;
};

const ensureTesterAccounts = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Tester account seeding is disabled in production.');
  }
  const users = {};
  for (const account of TEST_ACCOUNTS) {
    users[account.role] = await upsertUser(account);
  }

  await Doctor.findOneAndUpdate(
    { userId: users.doctor._id },
    {
      $set: {
        name: 'Sarah Jenkins',
        specialization: 'Cardiology',
        qualification: 'MD, PhD',
        experience: 12,
        consultationFee: 250000,
        description: 'Expert in adult cardiology with over a decade of experience in heart disease management and prevention.',
        profilePicture: '/images/doctors/sarah-jenkins.webp',
        phone: '08123456701',
        location: 'Menteng, Jakarta',
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '14:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '14:00' },
          { day: 'Friday', startTime: '13:00', endTime: '18:00' },
        ],
        status: 'approved',
      },
    },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

const logTesterAccounts = () => {
  console.log('DOCVIA tester accounts are ready (development only).');
  for (const account of TEST_ACCOUNTS) {
    console.log(`${account.role.padEnd(7)} ${account.email}`);
  }
  console.log(`password ${TEST_PASSWORD}`);
};

const seedTesterAccounts = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required to seed tester accounts.');
  }
  await mongoose.connect(process.env.MONGO_URI);
  await ensureTesterAccounts();
  logTesterAccounts();
};

if (require.main === module) {
  seedTesterAccounts()
    .catch((error) => {
      console.error(`Tester seeding failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = { ensureTesterAccounts, logTesterAccounts, TEST_ACCOUNTS, TEST_PASSWORD };
