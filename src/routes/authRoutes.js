const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');

// Firebase Auth Sync
router.post('/sync', authenticateToken, authController.syncUser);

module.exports = router;
