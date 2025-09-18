const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const {
   auth,
   refreshAuth,
   generateAccessToken,
   generateRefreshToken,
} = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (authentication required)
router.get('/getUser', auth, authController.getMe);
router.post('/logout', auth, authController.logout);

// Token refresh route (uses refresh token middleware)
router.post('/refresh', refreshAuth, (req, res) => {
   try {
      const newAccessToken = generateAccessToken(req.user._id);
      const newRefreshToken = generateRefreshToken(req.user._id);

      res.json({
         success: true,
         accessToken: newAccessToken,
         refreshToken: newRefreshToken,
         user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
         },
      });
   } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
         success: false,
         error: 'Failed to refresh tokens',
      });
   }
});

module.exports = router;
