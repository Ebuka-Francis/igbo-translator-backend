// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
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

      const user = new User({ name, email, password, role });
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
         expiresIn: '7d',
      });

      res.status(201).json({
         token,
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

// Login
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

      // Generate JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
         expiresIn: '7d',
      });

      res.json({
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
         },
      });
   } catch (error) {
      res.status(500).json({ error: 'Login failed' });
   }
};

// Get current user
const getMe = async (req, res) => {
   try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
   } catch (error) {
      res.status(500).json({ error: 'Failed to get user data' });
   }
};

module.exports = {
   register,
   getMe,
   login,
};
