const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be less than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: { type: Date, default: null },
    gender: {
      type: String,
      enum: ['', 'female', 'male', 'other', 'prefer_not_to_say'],
      default: '',
    },
    address: { type: String, trim: true, default: '', maxlength: 300 },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      relationship: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    medicalProfile: {
      bloodType: { type: String, trim: true, default: '' },
      allergies: { type: String, trim: true, default: '', maxlength: 1000 },
      chronicConditions: { type: String, trim: true, default: '', maxlength: 1000 },
      currentMedications: { type: String, trim: true, default: '', maxlength: 1000 },
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    profilePicture: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Hash password before saving — this runs automatically on save/create
// Note: In Mongoose 7+, async pre-hooks should NOT use the `next` parameter.
// Simply return a promise (async/await) and Mongoose handles it automatically.
userSchema.pre('save', async function () {
  // Only hash if password was actually modified (not on every save)
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare a plain-text password against the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
