const mongoose = require('mongoose');
const { TIME_PATTERN, timeToMinutes } = require('../utils/validation');

/**
 * Availability slot — e.g. { day: "Monday", startTime: "09:00", endTime: "17:00" }
 * Patients use this to know when a doctor is accepting appointments.
 */
const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [TIME_PATTERN, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: true,
      match: [TIME_PATTERN, 'End time must be in HH:MM format'],
      validate: {
        validator(value) {
          const start = timeToMinutes(this.startTime);
          const end = timeToMinutes(value);
          return start !== null && end !== null && start < end;
        },
        message: 'End time must be later than start time',
      },
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    // Link back to the User document that owns this doctor profile
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [160, 'Location must be less than 160 characters'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    availability: {
      type: [availabilitySchema],
      default: [],
      validate: {
        validator(value) {
          return new Set(value.map((slot) => slot.day)).size === value.length;
        },
        message: 'Availability cannot contain duplicate days',
      },
    },
    /**
     * Doctor approval status:
     *  pending  — applied, waiting for admin review
     *  approved — can be seen by patients and accept appointments
     *  rejected — application denied
     */
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast searches by specialization or name
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ location: 1 });
doctorSchema.index({ name: 'text', specialization: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
