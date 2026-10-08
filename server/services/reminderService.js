const Appointment = require('../models/Appointment');
const { createNotification } = require('../utils/notificationHelper');
const { getPlatformSettings } = require('../utils/platformSettings');
const { dateTimeFor } = require('../utils/availability');
const { deliverReminder } = require('./deliveryService');

let running = false;

const runAppointmentReminders = async () => {
  if (running) return;
  running = true;
  try {
    const settings = await getPlatformSettings();
    const horizon = new Date(Date.now() + 25 * 60 * 60 * 1000);
    const appointments = await Appointment.find({ status: 'approved', appointmentDate: { $lte: horizon } })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name');

    for (const appointment of appointments) {
      const startsAt = dateTimeFor(appointment.appointmentDate, appointment.appointmentTime);
      const hours = startsAt ? (startsAt.getTime() - Date.now()) / 3600000 : -1;
      const candidates = [
        { enabled: settings.reminder24hEnabled, field: 'reminder24hSentAt', max: 24, min: 2, label: '24 hours' },
        { enabled: settings.reminder2hEnabled, field: 'reminder2hSentAt', max: 2, min: 0, label: '2 hours' },
      ];
      for (const reminder of candidates) {
        if (!reminder.enabled || appointment[reminder.field] || hours < reminder.min || hours > reminder.max) continue;
        const claimed = await Appointment.findOneAndUpdate(
          { _id: appointment._id, [reminder.field]: null },
          { $set: { [reminder.field]: new Date() } },
          { returnDocument: 'after' }
        );
        if (!claimed) continue;
        const text = `Reminder: your appointment with Dr. ${appointment.doctorId.name} starts within ${reminder.label}, at ${appointment.appointmentTime}.`;
        await createNotification(appointment.patientId._id, 'Upcoming appointment', text, 'appointment_reminder', appointment._id);
        const delivery = await deliverReminder({
          email: appointment.patientId.email,
          phone: appointment.patientId.phone,
          subject: 'DOCVIA appointment reminder',
          text,
        });
        if (process.env.NODE_ENV !== 'test') console.log('Reminder delivery:', appointment._id.toString(), delivery);
      }
    }
  } catch (error) {
    console.error('Reminder scheduler failed:', error.message);
  } finally {
    running = false;
  }
};

const startReminderScheduler = () => {
  runAppointmentReminders();
  const timer = setInterval(runAppointmentReminders, Number(process.env.REMINDER_INTERVAL_MS) || 5 * 60 * 1000);
  timer.unref();
  return timer;
};

module.exports = { runAppointmentReminders, startReminderScheduler };
