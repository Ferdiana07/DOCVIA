const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient by default)
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // Basic validation
    if (!normalizedName || !normalizedEmail || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Only allow patient self-registration (doctors apply separately; admin is seeded)
    const allowedRoles = ['patient'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Only patients can self-register.',
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user — password is hashed automatically by the User model's pre-save hook
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      phone: phone || '',
      role: 'patient',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Explicitly select password because it has select:false in the schema
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently logged-in user's profile
 * @access  Private (any authenticated user)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by authenticateUser middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        emergencyContact: user.emergencyContact,
        medicalProfile: user.medicalProfile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user's profile
 * @access  Private (any authenticated user)
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      name, phone, dateOfBirth, gender, address,
      emergencyContact = {}, medicalProfile = {},
    } = req.body;

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must contain at least 2 characters.' });
    }

    const updates = {
      name: name.trim(),
      phone,
      dateOfBirth: dateOfBirth || null,
      gender: gender || '',
      address: address || '',
      emergencyContact: {
        name: emergencyContact.name || '',
        relationship: emergencyContact.relationship || '',
        phone: emergencyContact.phone || '',
      },
      medicalProfile: {
        bloodType: medicalProfile.bloodType || '',
        allergies: medicalProfile.allergies || '',
        chronicConditions: medicalProfile.chronicConditions || '',
        currentMedications: medicalProfile.currentMedications || '',
      },
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        address: updatedUser.address,
        emergencyContact: updatedUser.emergencyContact,
        medicalProfile: updatedUser.medicalProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change current user's password
 * @access  Private (any authenticated user)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
