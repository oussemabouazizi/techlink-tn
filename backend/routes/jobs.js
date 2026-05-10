const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { jobValidation } = require('../middleware/validation');
const jobController = require('../controllers/jobController');

router.post('/', auth, jobValidation, jobController.createJob);
router.get('/', jobController.getJobs);               // public
router.get('/my', auth, jobController.getMyJobs);     // NEW: my jobs
router.get('/:id', jobController.getJob);             // public
router.put('/:id', auth, jobController.updateJob);
router.delete('/:id', auth, jobController.deleteJob);

module.exports = router;