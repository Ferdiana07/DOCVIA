const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_created',
        'appointment_approved',
        'appointment_rejected',
        'appointment_cancelled',
        'appointment_rescheduled',
        'appointment_reminder',
        'appointment_completed',
        'doctor_approved',
        'doctor_rejected',
        'doctor_application',
        'dispute_updated',
        'general',
      ],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional: link to the related record for navigation
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup of a user's notifications sorted by newest first
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
