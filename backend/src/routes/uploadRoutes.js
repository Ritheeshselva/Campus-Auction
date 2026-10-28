const express = require('express');
const multer = require('multer');
const { uploadDir } = require('../config');
const { requireAuth, sellerOnly } = require('../middleware/auth');

const router = express.Router();
router.post('/', requireAuth(), sellerOnly, multer({ dest: uploadDir }).single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No photo uploaded.' });
  res.status(201).json({ imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;
