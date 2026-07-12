const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  refresh,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
