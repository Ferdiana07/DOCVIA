const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { getAllDisputes, updateDispute } = require('../controllers/disputeController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication AND admin role
router.use(authenticateUser, requireAdmin);

// GET  /api/admin/stats
router.get('/stats', getDashboardStats);

// GET  /api/admin/users
router.get('/users', getAllUsers);

// DELETE /api/admin/users/:id (soft-deactivate)
router.delete('/users/:id', deactivateUser);
router.patch('/users/:id/status', updateUserStatus);

// GET  /api/admin/doctors
router.get('/doctors', getAllDoctors);

// PUT  /api/admin/doctors/:id/approve
router.put('/doctors/:id/approve', approveDoctor);

// PUT  /api/admin/doctors/:id/reject
router.put('/doctors/:id/reject', rejectDoctor);

// GET  /api/admin/appointments
router.get('/appointments', getAllAppointments);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/disputes', getAllDisputes);
router.put('/disputes/:id', updateDispute);

module.exports = router;
