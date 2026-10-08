const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { createNotification } = require('../utils/notificationHelper');
const { getPlatformSettings } = require('../utils/platformSettings');
const { parseDateOnly, dateTimeFor, isSlotWithinAvailability } = require('../utils/availability');
const { deliverReminder } = require('../services/deliveryService');
const path = require('path');
const fs = require('fs');

/**
 * @route   POST /api/appointments
 * @desc    Patient books an appointment with an approved doctor.
 *          Prevents double-booking for the same doctor/date/time.
 * @access  Private (patient)
 */
const createAppointment = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    // 1. Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, time, and reason are required.',
      });
    }

    // 2. Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // 3. Verify doctor is approved
    if (doctor.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This doctor is not available for appointments.',
      });
    }

    // 4. Validate appointment date is not in the past
    const apptDate = parseDateOnly(appointmentDate);
    if (!apptDate) {
      return res.status(400).json({ success: false, message: 'Use a valid appointment date in YYYY-MM-DD format.' });
    }
    const appointmentDateTime = dateTimeFor(apptDate, appointmentTime);
    const settings = await getPlatformSettings();
    const earliest = new Date(Date.now() + settings.appointmentLeadTimeHours * 60 * 60 * 1000);
    if (!appointmentDateTime || appointmentDateTime < earliest) {
      return res.status(400).json({
        success: false,
        message: `Appointments must be booked at least ${settings.appointmentLeadTimeHours} hour(s) in advance.`,
      });
    }
    if (!isSlotWithinAvailability(apptDate, appointmentTime, doctor.availability)) {
      return res.status(400).json({ success: false, message: 'The selected time is outside this doctor\'s published schedule.' });
    }

    // 5. Check for double-booking:
    //    Same doctor, same date, same time, and not cancelled/rejected
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: apptDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.',
      });
    }

    // 6. Check if the patient already has a pending/approved appointment at the same time
    const patientConflict = await Appointment.findOne({
      patientId,
      appointmentDate: apptDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (patientConflict) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment at this time.',
      });
    }

    // 7. Handle optional uploaded document
    const document = req.file ? req.file.filename : '';

    // 8. Create the appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: apptDate,
      appointmentTime,
      bookingKey: `${doctorId}:${appointmentDate}:${appointmentTime}`,
      reason,
      document,
      status: 'pending',
    });

    // 9. Send notifications
    await createNotification(
      patientId,
      'Appointment Submitted',
      `Your appointment with Dr. ${doctor.name} on ${apptDate.toDateString()} at ${appointmentTime} has been submitted and is pending approval.`,
      'appointment_created',
      appointment._id
    );
    await deliverReminder({
      email: req.user.email,
      phone: req.user.phone,
      subject: 'DOCVIA appointment request received',
      text: `Your appointment request with Dr. ${doctor.name} on ${appointmentDate} at ${appointmentTime} was received and is awaiting confirmation.`,
    });

    await createNotification(
      doctor.userId,
      'New Appointment Request',
      `You have a new appointment request from a patient for ${apptDate.toDateString()} at ${appointmentTime}.`,
      'appointment_created',
      appointment._id
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully. Awaiting doctor approval.',
      data: appointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another time.' });
    }
    next(error);
  }
};

/**
 * @route   GET /api/appointments
 * @desc    Get appointments for the logged-in user.
 *          - Patient: their own appointments
 *          - Doctor: appointments for their profile
 * @access  Private (patient or doctor)
 */
const getMyAppointments = async (req, res, next) => {
  try {
    if (!['patient', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Use the admin appointment endpoint for operational oversight.' });
    }
    let filter = {};
    const { status } = req.query;

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
      }
      filter.doctorId = doctor._id;
    }

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone profilePicture dateOfBirth gender medicalProfile emergencyContact')
      .populate({
        path: 'doctorId',
        select: 'name specialization consultationFee profilePicture location',
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a specific appointment by ID
 * @access  Private (owner patient, owner doctor, or admin)
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone profilePicture dateOfBirth gender medicalProfile emergencyContact')
      .populate({
        path: 'doctorId',
        select: 'name specialization consultationFee profilePicture location userId',
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Authorization: only the patient, the doctor, or admin can view
    const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId.userId &&
      appointment.doctorId.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this appointment.',
      });
    }

    if (isAdmin) {
      const redacted = appointment.toObject();
      delete redacted.patientId.medicalProfile;
      delete redacted.patientId.emergencyContact;
      delete redacted.patientId.dateOfBirth;
      delete redacted.patientId.gender;
      delete redacted.clinicalRecord;
      delete redacted.document;
      return res.status(200).json({ success: true, data: redacted });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * Download an appointment document after ownership and role validation.
 */
const downloadAppointmentDocument = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId', 'userId');

    if (!appointment || !appointment.document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId?.userId?.toString() === req.user._id.toString();
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this document.' });
    }

    const safeFilename = path.basename(appointment.document);
    const filePath = path.join(__dirname, '..', 'uploads', safeFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Document file is no longer available.' });
    }

    return res.download(filePath, safeFilename);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status.
 *          - Doctor: can approve, reject, complete
 *          - Patient: can cancel (only pending or approved → cancelled)
 * @access  Private (doctor or patient)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor =
      appointment.doctorId.userId &&
      appointment.doctorId.userId.toString() === req.user._id.toString();
    if (!['patient', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only the patient or assigned doctor can change appointment status.' });
    }

    // Patient can only cancel their own pending or approved appointments
    if (req.user.role === 'patient') {
      if (!isPatient) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Patients can only cancel appointments.',
        });
      }
      if (!['pending', 'approved'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an appointment that is already ${appointment.status}.`,
        });
      }
      const settings = await getPlatformSettings();
      if (!settings.allowPatientCancellation) {
        return res.status(403).json({ success: false, message: 'Patient cancellation is currently disabled. Contact support for help.' });
      }
      const startsAt = dateTimeFor(appointment.appointmentDate, appointment.appointmentTime);
      if (startsAt && startsAt.getTime() - Date.now() < settings.cancellationCutoffHours * 60 * 60 * 1000) {
        return res.status(400).json({ success: false, message: `Cancellation closes ${settings.cancellationCutoffHours} hour(s) before the appointment.` });
      }
    }

    // Doctor can approve, reject, or complete
    if (req.user.role === 'doctor') {
      if (!isDoctor) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      const allowed = appointment.status === 'pending'
        ? ['approved', 'rejected']
        : appointment.status === 'approved' ? ['completed'] : [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `The transition from ${appointment.status} to ${status} is not allowed.`,
        });
      }
      if (status === 'completed') {
        const startsAt = dateTimeFor(appointment.appointmentDate, appointment.appointmentTime);
        if (startsAt && startsAt.getTime() > Date.now()) {
          return res.status(400).json({
            success: false,
            message: 'An appointment cannot be completed before its scheduled time.',
          });
        }
      }
    }

    appointment.status = status;
    if (['rejected', 'cancelled', 'completed'].includes(status)) appointment.bookingKey = undefined;
    if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;
    await appointment.save();

    // Send notification to patient
    const notifMessages = {
      approved: `Your appointment with Dr. ${appointment.doctorId.name} has been approved.`,
      rejected: `Your appointment with Dr. ${appointment.doctorId.name} has been rejected. ${doctorNotes ? `Reason: ${doctorNotes}` : ''}`,
      completed: `Your appointment with Dr. ${appointment.doctorId.name} has been marked as completed.`,
      cancelled: `Your appointment has been cancelled.`,
    };

    const notifTypes = {
      approved: 'appointment_approved',
      rejected: 'appointment_rejected',
      completed: 'appointment_completed',
      cancelled: 'appointment_cancelled',
    };

    if (notifMessages[status]) {
      await createNotification(
        appointment.patientId,
        `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        notifMessages[status],
        notifTypes[status],
        appointment._id
      );
      if (isPatient || status !== 'cancelled') {
        const patient = await require('../models/User').findById(appointment.patientId).select('email phone');
        if (patient) await deliverReminder({
          email: patient.email,
          phone: patient.phone,
          subject: `DOCVIA appointment ${status}`,
          text: notifMessages[status],
        });
      }
      if (status === 'cancelled') {
        await createNotification(
          appointment.doctorId.userId,
          'Appointment cancelled',
          `The patient cancelled the appointment scheduled at ${appointment.appointmentTime}.`,
          'appointment_cancelled',
          appointment._id
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully.`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

const rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('doctorId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only reschedule your own appointments.' });
    }
    if (!['pending', 'approved'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `A ${appointment.status} appointment cannot be rescheduled.` });
    }

    const date = parseDateOnly(appointmentDate);
    const settings = await getPlatformSettings();
    const startsAt = date && dateTimeFor(date, appointmentTime);
    const earliest = new Date(Date.now() + settings.appointmentLeadTimeHours * 60 * 60 * 1000);
    if (!date || !startsAt || startsAt < earliest) {
      return res.status(400).json({ success: false, message: `Choose a valid slot at least ${settings.appointmentLeadTimeHours} hour(s) from now.` });
    }
    if (!isSlotWithinAvailability(date, appointmentTime, appointment.doctorId.availability)) {
      return res.status(400).json({ success: false, message: 'The selected time is outside this doctor\'s schedule.' });
    }
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId._id,
      appointmentDate: date,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });
    if (conflict) return res.status(409).json({ success: false, message: 'That slot was just booked. Please select another time.' });
    const patientConflict = await Appointment.findOne({
      _id: { $ne: appointment._id }, patientId: appointment.patientId,
      appointmentDate: date, appointmentTime, status: { $in: ['pending', 'approved'] },
    });
    if (patientConflict) return res.status(409).json({ success: false, message: 'You already have another appointment at that time.' });

    appointment.rescheduleHistory.push({
      previousDate: appointment.appointmentDate,
      previousTime: appointment.appointmentTime,
      changedBy: req.user._id,
    });
    appointment.appointmentDate = date;
    appointment.appointmentTime = appointmentTime;
    appointment.bookingKey = `${appointment.doctorId._id}:${appointmentDate}:${appointmentTime}`;
    appointment.status = 'pending';
    appointment.reminder24hSentAt = null;
    appointment.reminder2hSentAt = null;
    await appointment.save();

    const message = `Appointment rescheduled to ${date.toDateString()} at ${appointmentTime} and is awaiting doctor approval.`;
    await Promise.all([
      createNotification(appointment.patientId, 'Appointment rescheduled', message, 'appointment_rescheduled', appointment._id),
      createNotification(appointment.doctorId.userId, 'Rescheduled appointment request', message, 'appointment_rescheduled', appointment._id),
    ]);
    res.status(200).json({ success: true, message, data: appointment });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'That slot was just booked. Please select another time.' });
    next(error);
  }
};

const updateClinicalRecord = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    const isAssignedDoctor = appointment.doctorId.userId?.toString() === req.user._id.toString();
    if (!isAssignedDoctor) return res.status(403).json({ success: false, message: 'Only the assigned doctor can update this clinical record.' });
    if (!['approved', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Clinical notes can be added after an appointment is approved.' });
    }
    const { diagnosis = '', visitSummary = '', prescription = '', recommendations = '', followUpDate = null } = req.body;
    appointment.clinicalRecord = {
      diagnosis,
      visitSummary,
      prescription,
      recommendations,
      followUpDate: followUpDate || null,
      updatedAt: new Date(),
    };
    await appointment.save();
    await createNotification(
      appointment.patientId,
      'Consultation record updated',
      `Dr. ${appointment.doctorId.name} added consultation notes and recommendations.`,
      'appointment_completed',
      appointment._id
    );
    res.status(200).json({ success: true, message: 'Clinical record saved.', data: appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  downloadAppointmentDocument,
  updateAppointmentStatus,
  rescheduleAppointment,
  updateClinicalRecord,
};
