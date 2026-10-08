const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authenticateUser
 * ----------------
 * Reads the JWT from the Authorization header (Bearer <token>),
 * verifies it, and attaches the decoded user to req.user.
 *
 * Think of it as: the user shows their ID card (token) at the door,
 * and we verify it is genuine before letting them in.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user to make sure they still exist in the database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User no longer exists or is inactive.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
    }
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
};

/**
 * requireRole(...roles)
 * ----------------------
 * A factory that returns middleware to check whether the logged-in
 * user has the required role. Must be used after authenticateUser.
 *
 * Example: router.get('/admin', authenticateUser, requireRole('admin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

// Convenience shortcuts
const requirePatient = requireRole('patient');
const requireDoctor = requireRole('doctor');
const requireAdmin = requireRole('admin');
const requireDoctorOrAdmin = requireRole('doctor', 'admin');

module.exports = {
  authenticateUser,
  requireRole,
  requirePatient,
  requireDoctor,
  requireAdmin,
  requireDoctorOrAdmin,
};
