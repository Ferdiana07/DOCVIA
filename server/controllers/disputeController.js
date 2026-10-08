const Dispute = require('../models/Dispute');
const Appointment = require('../models/Appointment');
const { createNotification } = require('../utils/notificationHelper');

const createDispute = async (req, res, next) => {
  try {
    if (!['patient', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only patients and doctors can open support cases.' });
    }
    const { appointmentId, subject, description, priority } = req.body;
    if (!subject || !description) return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate('doctorId', 'userId');
      if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
      const allowed = appointment.patientId.toString() === req.user._id.toString()
        || appointment.doctorId?.userId?.toString() === req.user._id.toString();
      if (!allowed) return res.status(403).json({ success: false, message: 'That appointment does not belong to you.' });
    }
    const dispute = await Dispute.create({ openedBy: req.user._id, appointmentId: appointmentId || null, subject, description, priority });
    res.status(201).json({ success: true, message: 'Support case created.', data: dispute });
  } catch (error) { next(error); }
};

const getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ openedBy: req.user._id }).populate('appointmentId', 'appointmentDate appointmentTime status').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: disputes.length, data: disputes });
  } catch (error) { next(error); }
};

const getAllDisputes = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const disputes = await Dispute.find(filter)
      .populate('openedBy', 'name email role')
      .populate('appointmentId', 'appointmentDate appointmentTime status')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: disputes.length, data: disputes });
  } catch (error) { next(error); }
};

const updateDispute = async (req, res, next) => {
  try {
    const allowed = ['status', 'priority', 'adminResponse'];
    const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    updates.assignedAdmin = req.user._id;
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true });
    if (!dispute) return res.status(404).json({ success: false, message: 'Support case not found.' });
    await createNotification(dispute.openedBy, 'Support case updated', `Your support case is now ${dispute.status.replace('_', ' ')}.`, 'dispute_updated', dispute._id);
    res.status(200).json({ success: true, message: 'Support case updated.', data: dispute });
  } catch (error) { next(error); }
};

module.exports = { createDispute, getMyDisputes, getAllDisputes, updateDispute };
