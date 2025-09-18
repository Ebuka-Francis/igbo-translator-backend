const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isTokenBlacklisted } = require('../routes/auth');

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

const auth = async (req, res, next) => {
   try {
      const accessToken = req.header('Authorization')?.replace('Bearer ', '');
      const refreshToken =
         req.header('X-Refresh-Token') || req.cookies?.refreshToken;

      if (!accessToken) {
         return res
            .status(401)
            .json({ error: 'No access token, authorization denied' });
      }

      // Check if access token is blacklisted
      if (isTokenBlacklisted(accessToken)) {
         return res
            .status(401)
            .json({ error: 'Access token has been invalidated' });
      }

      try {
         // Try to verify access token first
         const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

         // Ensure it's an access token
         if (decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
         }

         const user = await User.findById(decoded.id).select('-password');
         if (!user) {
            return res.status(401).json({ error: 'User not found' });
         }

         req.user = user;
         return next();
      } catch (accessTokenError) {
         // Access token is invalid/expired, try refresh token
         if (!refreshToken) {
            return res.status(401).json({
               error: 'Access token expired and no refresh token provided',
            });
         }

         // Check if refresh token is blacklisted
         if (isTokenBlacklisted(refreshToken)) {
            return res
               .status(401)
               .json({ error: 'Refresh token has been invalidated' });
         }

         try {
            // Verify refresh token
            const refreshDecoded = jwt.verify(
               refreshToken,
               process.env.JWT_REFRESH_SECRET
            );

            // Ensure it's a refresh token
            if (refreshDecoded.type !== 'refresh') {
               return res
                  .status(401)
                  .json({ error: 'Invalid refresh token type' });
            }

            const user = await User.findById(refreshDecoded.id).select(
               '-password'
            );
            if (!user) {
               return res.status(401).json({ error: 'User not found' });
            }

            // Generate new access token
            const newAccessToken = generateAccessToken(user._id);

            // Optionally generate new refresh token (refresh token rotation)
            const newRefreshToken = generateRefreshToken(user._id);

            // Add new tokens to response headers
            res.setHeader('X-New-Access-Token', newAccessToken);
            res.setHeader('X-New-Refresh-Token', newRefreshToken);

            req.user = user;
            req.tokenRefreshed = true; // Flag to indicate token was refreshed

            return next();
         } catch (refreshTokenError) {
            return res.status(401).json({
               error: 'Both access and refresh tokens are invalid. Please login again.',
            });
         }
      }
   } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
   }
};

// Optional: Middleware specifically for refresh token endpoints
const refreshAuth = async (req, res, next) => {
   try {
      const refreshToken =
         req.header('X-Refresh-Token') ||
         req.body.refreshToken ||
         req.cookies?.refreshToken;

      if (!refreshToken) {
         return res.status(401).json({ error: 'No refresh token provided' });
      }

      if (isTokenBlacklisted(refreshToken)) {
         return res
            .status(401)
            .json({ error: 'Refresh token has been invalidated' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      if (decoded.type !== 'refresh') {
         return res.status(401).json({ error: 'Invalid token type' });
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
         return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      req.refreshToken = refreshToken;
      next();
   } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
   }
};

module.exports = {
   auth,
   refreshAuth,
   generateAccessToken,
   generateRefreshToken,
};
