const Notification = require('../models/Notification');

/**
 * createNotification
 * -------------------
 * Helper to create a notification record in the database.
 * Called from controllers after important events (booking, approval, etc.).
 *
 * @param {string} userId    - The recipient user's ID
 * @param {string} title     - Short notification title
 * @param {string} message   - Detailed notification message
 * @param {string} type      - One of the Notification.type enum values
 * @param {string} relatedId - Optional: ID of the related record (appointment, etc.)
 */
const createNotification = async (userId, title, message, type = 'general', relatedId = null) => {
  try {
    await Notification.create({ userId, title, message, type, relatedId });
  } catch (error) {
    // Notifications are supplementary; log error but do not crash the main request
    console.error('Notification creation failed:', error.message);
  }
};

module.exports = { createNotification };
