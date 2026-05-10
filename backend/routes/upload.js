const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;