const Notification = require('../models/Notification');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the logged-in user (newest first)
 * @access  Private (any authenticated user)
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent notifications

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private (owner only)
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    // Ensure the notification belongs to the requesting user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification.',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark ALL of the user's notifications as read
 * @access  Private (any authenticated user)
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
