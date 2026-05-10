const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const authController = require('../controllers/authController');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;