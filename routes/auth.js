const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

// If this router is mounted at /api, use:
router.post('/api/register', authController.register);
router.post('/api/login', authController.login);
router.get('/api/getUser', authController.getMe);

// OR if not mounted with prefix, use:
// router.post('/api/register', authController.register);
// router.post('/api/login', authController.login);
// router.get('/api/getUser', authController.getMe);

module.exports = router;
