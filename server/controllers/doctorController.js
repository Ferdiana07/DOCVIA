const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');
const cache = require('../utils/cache');
const { getPlatformSettings } = require('../utils/platformSettings');
const { parseDateOnly, buildAvailableSlots } = require('../utils/availability');
const { escapeRegExp, validateAvailability } = require('../utils/validation');

/**
 * @route   POST /api/doctors/apply
 * @desc    A user with role 'patient' applies to become a doctor.
 *          The account remains a patient until an admin approves the profile.
 * @access  Private (authenticated user)
 */
const applyAsDoctor = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patient accounts can apply as a doctor.' });
    }

    // Check if this user already has a doctor profile
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor && existingDoctor.status !== 'rejected') {
      return res.status(409).json({
        success: false,
        message: 'You have already applied as a doctor.',
      });
    }

    const { specialization, experience, qualification, consultationFee, description, phone, location, availability } = req.body;

    if (!specialization || experience === undefined || !qualification || consultationFee === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Specialization, experience, qualification, and consultation fee are required.',
      });
    }

    const scheduleError = validateAvailability(availability);
    if (scheduleError) return res.status(400).json({ success: false, message: scheduleError });

    const numericExperience = Number(experience);
    const numericFee = Number(consultationFee);
    if (!Number.isFinite(numericExperience) || numericExperience < 0 || !Number.isFinite(numericFee) || numericFee < 0) {
      return res.status(400).json({ success: false, message: 'Experience and consultation fee must be valid non-negative numbers.' });
    }

    const application = {
      userId,
      name: req.user.name,
      specialization,
      experience: numericExperience,
      qualification,
      consultationFee: numericFee,
      description: description || '',
      phone: phone || req.user.phone || '',
      location: location || '',
      availability,
      status: 'pending',
    };

    const doctor = existingDoctor
      ? Object.assign(existingDoctor, application)
      : new Doctor(application);
    await doctor.save();
    cache.delByPrefix('doctors:');

    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    await Promise.all(admins.map((admin) => createNotification(
      admin._id,
      'Doctor application received',
      `${req.user.name} submitted a doctor application for review.`,
      'doctor_application',
      doctor._id
    )));

    res.status(201).json({
      success: true,
      message: 'Doctor application submitted. Please wait for admin approval.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/doctors
 * @desc    Get all approved doctors. Supports search by name/specialization.
 * @access  Public
 */
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, location, availableDay } = req.query;

    const cacheKey = `doctors:list:${JSON.stringify({ search: search || '', specialization: specialization || '', location: location || '', availableDay: availableDay || '' })}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);
    const filter = { status: 'approved' };

    if (specialization) {
      filter.specialization = { $regex: escapeRegExp(String(specialization).slice(0, 80)), $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: escapeRegExp(String(location).slice(0, 80)), $options: 'i' };
    }

    if (availableDay) {
      filter.availability = { $elemMatch: { day: availableDay } };
    }

    if (search) {
      const safeSearch = escapeRegExp(String(search).slice(0, 80));
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { specialization: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const doctors = await Doctor.find(filter).select('-userId')
      .sort({ createdAt: -1 });

    const payload = {
      success: true,
      count: doctors.length,
      data: doctors,
    };
    if (doctors.length) cache.set(cacheKey, payload);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/doctors/:id
 * @desc    Get a single doctor's profile by their Doctor document ID
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-userId');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Patients should only see approved doctors
    if (doctor.status !== 'approved' && (!req.user || req.user.role === 'patient')) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/doctors/profile/me
 * @desc    Get the logged-in doctor's own profile
 * @access  Private (doctor)
 */
const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/doctors/profile/me
 * @desc    Update logged-in doctor's profile
 * @access  Private (doctor)
 */
const updateDoctorProfile = async (req, res, next) => {
  try {
    const { name, specialization, experience, qualification, consultationFee, description, phone, location, availability } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    if (availability !== undefined) {
      const scheduleError = validateAvailability(availability);
      if (scheduleError) return res.status(400).json({ success: false, message: scheduleError });
    }
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return res.status(400).json({ success: false, message: 'Doctor name must contain at least 2 characters.' });
    }
    if (experience !== undefined && (!Number.isFinite(Number(experience)) || Number(experience) < 0)) {
      return res.status(400).json({ success: false, message: 'Experience must be a valid non-negative number.' });
    }
    if (consultationFee !== undefined && (!Number.isFinite(Number(consultationFee)) || Number(consultationFee) < 0)) {
      return res.status(400).json({ success: false, message: 'Consultation fee must be a valid non-negative number.' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      {
        name: name || doctor.name,
        specialization: specialization || doctor.specialization,
        experience: experience !== undefined ? Number(experience) : doctor.experience,
        qualification: qualification || doctor.qualification,
        consultationFee: consultationFee !== undefined ? Number(consultationFee) : doctor.consultationFee,
        description: description !== undefined ? description : doctor.description,
        phone: phone !== undefined ? phone : doctor.phone,
        location: location !== undefined ? location : doctor.location,
        availability: availability !== undefined ? availability : doctor.availability,
      },
      { returnDocument: 'after', runValidators: true }
    );
    await User.findByIdAndUpdate(req.user._id, { name: updatedDoctor.name }, { runValidators: true });
    cache.delByPrefix('doctors:');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/doctors/specializations
 * @desc    Get a distinct list of all specializations (for filter dropdowns)
 * @access  Public
 */
const getSpecializations = async (req, res, next) => {
  try {
    const cached = cache.get('doctors:specializations');
    if (cached) return res.status(200).json(cached);
    const specializations = await Doctor.distinct('specialization', { status: 'approved' });
    const payload = { success: true, data: specializations.sort() };
    if (specializations.length) cache.set('doctors:specializations', payload);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const cached = cache.get('doctors:locations');
    if (cached) return res.status(200).json(cached);
    const locations = await Doctor.distinct('location', {
      status: 'approved',
      location: { $ne: '' },
    });
    const payload = { success: true, data: locations.sort() };
    if (locations.length) cache.set('doctors:locations', payload);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const date = parseDateOnly(req.query.date);
    if (!date) return res.status(400).json({ success: false, message: 'A valid date in YYYY-MM-DD format is required.' });

    const doctor = await Doctor.findOne({ _id: req.params.id, status: 'approved' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: { $gte: date, $lt: nextDay },
      status: { $in: ['pending', 'approved'] },
    }).select('appointmentTime');
    const settings = await getPlatformSettings();
    const slots = buildAvailableSlots({
      date,
      availability: doctor.availability,
      bookedTimes: appointments.map((item) => item.appointmentTime),
      leadTimeHours: settings.appointmentLeadTimeHours,
    });
    res.status(200).json({ success: true, data: slots, meta: { date: req.query.date, slotMinutes: 30 } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyAsDoctor,
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  getSpecializations,
  getLocations,
  getAvailableSlots,
};
