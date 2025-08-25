const express = require('express');
const router = express.Router();
const { register, login, verifyToken, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateLogin } = require('../utils/validation');

router.post('/register', validateUserRegistration, register);


router.post('/login', validateLogin, login);


router.get('/verify', authenticateToken, verifyToken);


router.post('/logout', authenticateToken, logout);

module.exports = router;