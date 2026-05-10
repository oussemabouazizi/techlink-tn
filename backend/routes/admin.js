const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/dashboard', auth, adminOnly, adminController.getDashboardStats);
router.get('/users', auth, adminOnly, adminController.getUsers);
router.put('/users/:id/ban', auth, adminOnly, adminController.banUser);
router.get('/jobs', auth, adminOnly, adminController.getJobsForModeration);

module.exports = router;