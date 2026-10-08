const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticateUser);

// GET  /api/notifications
router.get('/', getMyNotifications);

// PUT  /api/notifications/read-all
router.put('/read-all', markAllAsRead);

// PUT  /api/notifications/:id/read
router.put('/:id/read', markAsRead);

module.exports = router;
