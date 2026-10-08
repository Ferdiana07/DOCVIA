const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  downloadAppointmentDocument,
  updateAppointmentStatus,
  rescheduleAppointment,
  updateClinicalRecord,
} = require('../controllers/appointmentController');
const { authenticateUser, requirePatient } = require('../middleware/auth');
const { upload, validateUploadedFile, cleanupRejectedUpload } = require('../middleware/upload');

// POST /api/appointments — patient creates an appointment (with optional document upload)
router.post(
  '/',
  authenticateUser,
  requirePatient,
  upload.single('document'),
  validateUploadedFile,
  cleanupRejectedUpload,
  createAppointment
);

// GET /api/appointments — get appointments for the logged-in user
router.get('/', authenticateUser, getMyAppointments);
router.get('/:id/document', authenticateUser, downloadAppointmentDocument);

// GET /api/appointments/:id — get a specific appointment
router.get('/:id', authenticateUser, getAppointmentById);

// PUT /api/appointments/:id/status — update status (patient cancels, doctor approves/rejects/completes)
router.put('/:id/status', authenticateUser, updateAppointmentStatus);
router.put('/:id/reschedule', authenticateUser, requirePatient, rescheduleAppointment);
router.put('/:id/clinical-record', authenticateUser, updateClinicalRecord);

module.exports = router;
