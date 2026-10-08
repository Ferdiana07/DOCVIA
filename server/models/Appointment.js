const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String, // stored as "HH:MM" e.g. "10:00"
      required: [true, 'Appointment time is required'],
      match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'],
    },
    bookingKey: { type: String, default: undefined },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    document: {
      type: String, // file path or filename of uploaded supporting document
      default: '',
    },
    /**
     * Status flow:
     *  pending    → doctor can approve or reject
     *  approved   → doctor confirmed the appointment
     *  rejected   → doctor declined
     *  cancelled  → patient cancelled (only allowed from pending/approved)
     *  completed  → doctor marked as done
     */
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    // Optional: notes from the doctor on rejection or completion
    doctorNotes: {
      type: String,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    clinicalRecord: {
      diagnosis: { type: String, trim: true, default: '', maxlength: 1000 },
      visitSummary: { type: String, trim: true, default: '', maxlength: 2000 },
      prescription: { type: String, trim: true, default: '', maxlength: 2000 },
      recommendations: { type: String, trim: true, default: '', maxlength: 2000 },
      followUpDate: { type: Date, default: null },
      updatedAt: { type: Date, default: null },
    },
    rescheduleHistory: [{
      previousDate: Date,
      previousTime: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
    reminder24hSentAt: { type: Date, default: null },
    reminder2hSentAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound index to detect double-booking:
// Same doctor + same date + same time should not have two pending/approved appointments
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ bookingKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
