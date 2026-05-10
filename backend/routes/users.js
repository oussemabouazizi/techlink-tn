const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Public
router.get('/freelancers', userController.listFreelancers);
router.get('/freelancers/:id', userController.getFreelancerProfile);

// Authenticated
router.put('/freelancer-profile', auth, userController.updateFreelancerProfile);
router.post('/saved-jobs', auth, userController.saveJob);
router.delete('/saved-jobs/:jobId', auth, userController.unsaveJob);

module.exports = router;