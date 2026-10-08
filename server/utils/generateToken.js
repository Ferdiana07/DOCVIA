const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 *
 * The token contains:
 *  - userId: so the backend knows who is making requests
 *  - role: so the backend can check permissions quickly
 *
 * The token does NOT contain the password or other sensitive data.
 * It expires in 7 days, after which the user must login again.
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
