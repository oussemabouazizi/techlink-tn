const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { proposalValidation } = require('../middleware/validation');
const proposalController = require('../controllers/proposalController');

router.post('/', auth, proposalValidation, proposalController.createProposal);
router.get('/my', auth, proposalController.getMyProposals);
router.get('/job/:job_id', auth, proposalController.getJobProposals);
router.put('/:id/status', auth, proposalController.updateProposalStatus);

module.exports = router;