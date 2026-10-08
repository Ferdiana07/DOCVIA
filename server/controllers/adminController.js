const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Dispute = require('../models/Dispute');
const PlatformSetting = require('../models/PlatformSetting');
const { createNotification } = require('../utils/notificationHelper');
const { getPlatformSettings } = require('../utils/platformSettings');
const cache = require('../utils/cache');

/**
 * @route   GET /api/admin/stats
 * @desc    Dashboard statistics overview
 * @access  Private (admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      completedAppointments,
      openDisputes,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Doctor.countDocuments(),
      Doctor.countDocuments({ status: 'pending' }),
      Doctor.countDocuments({ status: 'approved' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'approved' }),
      Appointment.countDocuments({ status: 'completed' }),
      Dispute.countDocuments({ status: { $in: ['open', 'in_review'] } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
        completedAppointments,
        openDisputes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (excluding admins)
 * @access  Private (admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email phone role profilePicture isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctor applications (all statuses)
 * @access  Private (admin)
 */
const getAllDoctors = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/doctors/:id/approve
 * @desc    Approve a pending doctor application
 * @access  Private (admin)
 */
const approveDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    if (doctor.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already approved.',
      });
    }

    if (doctor.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending doctor applications can be approved.',
      });
    }

    doctor.status = 'approved';
    await doctor.save();

    // Promote the account only after the professional profile is verified.
    await User.findByIdAndUpdate(doctor.userId, { role: 'doctor' });
    cache.delByPrefix('doctors:');

    // Notify the doctor
    await createNotification(
      doctor.userId,
      'Doctor application approved',
      `Your application as Dr. ${doctor.name} (${doctor.specialization}) has been approved. Sign in again to open your doctor dashboard.`,
      'doctor_approved',
      doctor._id
    );

    res.status(200).json({
      success: true,
      message: `Dr. ${doctor.name} has been approved.`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/doctors/:id/reject
 * @desc    Reject a pending doctor application
 * @access  Private (admin)
 */
const rejectDoctor = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    if (doctor.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending doctor applications can be rejected.',
      });
    }

    doctor.status = 'rejected';
    await doctor.save();

    // Revert user role back to patient
    await User.findByIdAndUpdate(doctor.userId, { role: 'patient' });
    cache.delByPrefix('doctors:');

    // Notify the doctor (their user account)
    await createNotification(
      doctor.userId,
      'Application Rejected',
      `Your doctor application has been reviewed and rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
      'doctor_rejected',
      doctor._id
    );

    res.status(200).json({
      success: true,
      message: `Dr. ${doctor.name}'s application has been rejected.`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: await getPlatformSettings() });
  } catch (error) { next(error); }
};

const updateSettings = async (req, res, next) => {
  try {
    const allowed = [
      'platformName', 'supportEmail', 'supportPhone', 'appointmentLeadTimeHours',
      'allowPatientCancellation', 'cancellationCutoffHours', 'reminder24hEnabled',
      'reminder2hEnabled', 'maintenanceMode', 'privacyNotice', 'termsNotice',
    ];
    const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    const settings = await PlatformSetting.findOneAndUpdate(
      { key: 'default' },
      { $set: updates, $setOnInsert: { key: 'default' } },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ success: true, message: 'Platform settings updated.', data: settings });
  } catch (error) { next(error); }
};

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments in the system
 * @access  Private (admin)
 */
const getAllAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name')
      .populate({ path: 'doctorId', select: 'name specialization' })
      .sort({ appointmentDate: -1 });

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
 * @route   DELETE /api/admin/users/:id
 * @desc    Deactivate (soft-delete) a user account
 * @access  Private (admin)
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate another admin account.',
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account has been deactivated.',
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be true or false.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin account status cannot be changed here.' });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive ? 'User account reactivated.' : 'User account deactivated.',
      data: { _id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  getAllAppointments,
  deactivateUser,
  updateUserStatus,
  getSettings,
  updateSettings,
};
