const express = require('express');
const { rateLimit } = require('express-rate-limit');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many sign-in attempts. Please wait and try again.' },
});

// POST /api/auth/register — anyone can register
router.post('/register', authLimiter, register);

// POST /api/auth/login — anyone can login
router.post('/login', authLimiter, login);

// GET /api/auth/me — requires valid JWT
router.get('/me', authenticateUser, getMe);

// PUT /api/auth/profile — update own profile
router.put('/profile', authenticateUser, updateProfile);

// PUT /api/auth/change-password — change own password
router.put('/change-password', authenticateUser, changePassword);

module.exports = router;
