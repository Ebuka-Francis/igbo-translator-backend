// Updated controllers/auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Import token generation functions from middleware
const {
   generateAccessToken,
   generateRefreshToken,
} = require('../utils/tokenUtils');

// In-memory token blacklist (for production, use Redis or database)
const tokenBlacklist = new Set();

// Register - Keep existing code
const register = async (req, res) => {
   try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
         return res.status(400).json({ error: 'All fields are required' });
      }

      const allowedRoles = ['student', 'teacher'];
      if (!allowedRoles.includes(role)) {
         return res.status(400).json({ error: 'Invalid role' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(400).json({ error: 'User already exists' });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
         name,
         email,
         password: hashedPassword,
         role,
      });

      await user.save(); // ← YOU'RE MISSING THIS LINE!

      // Generate both tokens for registration too
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.status(201).json({
         success: true,
         accessToken,
         refreshToken,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
         },
      });
   } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
   }
};

// UPDATED Login function with dual tokens
const login = async (req, res) => {
   try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
         return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate both access and refresh tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.json({
         success: true,
         accessToken,
         refreshToken,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
         },
      });
   } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
   }
};

// Logout - Keep existing code
const logout = async (req, res) => {
   try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
         return res.status(401).json({ error: 'No token provided' });
      }

      // Add token to blacklist
      tokenBlacklist.add(token);

      res.json({ message: 'Logged out successfully' });
   } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
   }
};

// Get current user - Keep existing code
const getMe = async (req, res) => {
   try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
   } catch (error) {
      res.status(500).json({ error: 'Failed to get user data' });
   }
};

// Helper function to check if token is blacklisted
const isTokenBlacklisted = (token) => {
   return tokenBlacklist.has(token);
};

module.exports = {
   register,
   getMe,
   login,
   logout,
   isTokenBlacklisted,
};
