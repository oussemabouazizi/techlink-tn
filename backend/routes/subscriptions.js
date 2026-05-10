const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

router.post('/checkout', auth, subscriptionController.createCheckoutSession);
router.post('/portal', auth, subscriptionController.createPortalSession);
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.webhook);

module.exports = router;