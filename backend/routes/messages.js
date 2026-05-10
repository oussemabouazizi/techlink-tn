const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/conversations', auth, messageController.getConversations);
router.get('/:userId', auth, messageController.getMessages);
router.post('/', auth, messageController.sendMessage);

module.exports = router;