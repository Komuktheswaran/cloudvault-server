const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/config', userController.updateConfig);
router.get('/config', userController.getConfig);

module.exports = router;
