const express = require('express');
const router = express.Router();
const {
  applyAsDoctor,
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  getSpecializations,
  getLocations,
  getAvailableSlots,
} = require('../controllers/doctorController');
const { authenticateUser, requireDoctor, requirePatient } = require('../middleware/auth');

// GET /api/doctors — public: browse approved doctors
router.get('/', getDoctors);

// GET /api/doctors/specializations — public: get unique specializations
router.get('/specializations', getSpecializations);

// GET /api/doctors/locations - public: get available clinic locations
router.get('/locations', getLocations);

// GET /api/doctors/profile/me — doctor: view own profile
router.get('/profile/me', authenticateUser, requireDoctor, getMyDoctorProfile);

// PUT /api/doctors/profile/me — doctor: update own profile
router.put('/profile/me', authenticateUser, requireDoctor, updateDoctorProfile);

// POST /api/doctors/apply — authenticated user applies as a doctor
router.post('/apply', authenticateUser, requirePatient, applyAsDoctor);

// GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
router.get('/:id/available-slots', getAvailableSlots);

// GET /api/doctors/:id — public: view doctor detail
// Note: optionally check req.user for admin access to non-approved doctors
router.get('/:id', getDoctorById);

module.exports = router;
