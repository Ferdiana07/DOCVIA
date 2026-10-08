require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const locations = {
  'Sarah Jenkins': 'Menteng, Jakarta',
  'Budi Santoso': 'Tebet, Jakarta',
  'Emily Chen': 'Dago, Bandung',
  'Ahmad Ridwan': 'Sleman, Yogyakarta',
  'Linda Wijaya': 'Kebayoran Baru, Jakarta',
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let locationUpdates = 0;
  for (const [name, location] of Object.entries(locations)) {
    const user = await User.findOne({ name }).select('_id');
    if (!user) continue;
    const result = await Doctor.updateOne({ userId: user._id, $or: [{ location: '' }, { location: { $exists: false } }] }, { $set: { location } });
    locationUpdates += result.modifiedCount;
  }

  const active = await Appointment.find({ status: { $in: ['pending', 'approved'] } }).sort({ createdAt: 1 });
  let bookingKeys = 0;
  for (const appointment of active) {
    const date = [
      appointment.appointmentDate.getFullYear(),
      String(appointment.appointmentDate.getMonth() + 1).padStart(2, '0'),
      String(appointment.appointmentDate.getDate()).padStart(2, '0'),
    ].join('-');
    const key = `${appointment.doctorId}:${date}:${appointment.appointmentTime}`;
    if (appointment.bookingKey === key) continue;
    if (await Appointment.exists({ _id: { $ne: appointment._id }, bookingKey: key })) continue;
    appointment.bookingKey = key;
    await appointment.save();
    bookingKeys += 1;
  }
  console.log(`Migration complete: ${locationUpdates} locations and ${bookingKeys} active booking keys updated.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Migration failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
