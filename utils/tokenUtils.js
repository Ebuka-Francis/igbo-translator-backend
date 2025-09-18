// utils/tokenUtils.js
const jwt = require('jsonwebtoken');

// Helper function to generate access token
const generateAccessToken = (userId) => {
   return jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
   });
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
   return jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
   );
};

module.exports = {
   generateAccessToken,
   generateRefreshToken,
};
