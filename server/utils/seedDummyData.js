require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Dummy Doctor Data
const dummyDoctors = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@docvia.local',
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
      { day: 'Friday', startTime: '13:00', endTime: '18:00' }
    ]
  },
  {
    name: 'Budi Santoso',
    email: 'budi.s@docvia.local',
    specialization: 'Pediatrics',
    qualification: 'Sp.A',
    experience: 8,
    consultationFee: 150000,
    description: 'Friendly and experienced pediatrician dedicated to children\'s health and development from infancy to adolescence.',
    profilePicture: '/images/doctors/budi-santoso.webp',
    phone: '08123456702',
    location: 'Tebet, Jakarta',
    availability: [
      { day: 'Tuesday', startTime: '10:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '16:00' }
    ]
  },
  {
    name: 'Emily Chen',
    email: 'emily.c@docvia.local',
    specialization: 'Dermatology',
    qualification: 'MD, FAAD',
    experience: 5,
    consultationFee: 200000,
    description: 'Specializes in medical and cosmetic dermatology. Passionate about helping patients achieve healthy skin.',
    profilePicture: '/images/doctors/emily-chen.webp',
    phone: '08123456703',
    location: 'Dago, Bandung',
    availability: [
      { day: 'Monday', startTime: '13:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '13:00', endTime: '17:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '12:00' }
    ]
  },
  {
    name: 'Ahmad Ridwan',
    email: 'ahmad.r@docvia.local',
    specialization: 'Neurology',
    qualification: 'Sp.N',
    experience: 15,
    consultationFee: 300000,
    description: 'Senior neurologist focusing on stroke prevention, migraines, and neurodegenerative disorders.',
    profilePicture: '/images/doctors/ahmad-ridwan.webp',
    phone: '08123456704',
    location: 'Sleman, Yogyakarta',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '12:00' },
      { day: 'Friday', startTime: '08:00', endTime: '12:00' }
    ]
  },
  {
    name: 'Linda Wijaya',
    email: 'linda.w@docvia.local',
    specialization: 'General Practice',
    qualification: 'dr.',
    experience: 3,
    consultationFee: 100000,
    description: 'Dedicated general practitioner ready to help with your everyday medical needs and general check-ups.',
    profilePicture: '/images/doctors/linda-wijaya.webp',
    phone: '08123456705',
    location: 'Kebayoran Baru, Jakarta',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '20:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '20:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '20:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '20:00' },
      { day: 'Friday', startTime: '08:00', endTime: '20:00' }
    ]
  }
];

// Dummy Patient Data
const dummyPatients = [
  { name: 'Raka Pradana', email: 'raka.pradana@example.com', phone: '08987654321' },
  { name: 'Nadia Kusuma', email: 'nadia.kusuma@example.com', phone: '08987654322' },
  { name: 'Kevin Halim', email: 'kevin.halim@example.com', phone: '08987654323' }
];

const dummyPassword = process.env.DUMMY_USER_PASSWORD || 'LocalDemo-Only-2026!';

const ensureDummyData = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Dummy data seeding is disabled in production.');
  }

  console.log('Seeding doctors...');
  let doctorCount = 0;
  for (const docData of dummyDoctors) {
    let user = await User.findOne({ email: docData.email });
    if (!user) {
      user = await User.create({
        name: docData.name,
        email: docData.email,
        password: dummyPassword,
        phone: docData.phone,
        role: 'doctor'
      });

      await Doctor.create({
        userId: user._id,
        name: docData.name,
        specialization: docData.specialization,
        experience: docData.experience,
        qualification: docData.qualification,
        consultationFee: docData.consultationFee,
        description: docData.description,
        profilePicture: docData.profilePicture,
        phone: docData.phone,
        location: docData.location,
        availability: docData.availability,
        status: 'approved'
      });
      console.log(`✅ Created doctor: Dr. ${docData.name}`);
      doctorCount++;
    } else {
      await Doctor.updateOne(
        { userId: user._id },
        { $set: { profilePicture: docData.profilePicture } }
      );
      console.log(`⚠️ Doctor already exists: ${docData.email}`);
    }
  }

  console.log('\nSeeding patients...');
  let patientCount = 0;
  for (const patData of dummyPatients) {
    const user = await User.findOne({ email: patData.email });
    if (!user) {
      await User.create({
        name: patData.name,
        email: patData.email,
        password: dummyPassword,
        phone: patData.phone,
        role: 'patient'
      });
      console.log(`✅ Created patient: ${patData.name}`);
      patientCount++;
    } else {
      console.log(`⚠️ Patient already exists: ${patData.email}`);
    }
  }

  console.log(`Dummy data ready. Added ${doctorCount} doctors and ${patientCount} patients.`);
  return { doctorCount, patientCount };
};

const seedDummyData = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required to seed dummy data.');
  await mongoose.connect(process.env.MONGO_URI);
  await ensureDummyData();
};

if (require.main === module) {
  seedDummyData()
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = { ensureDummyData, dummyDoctors, dummyPatients };
