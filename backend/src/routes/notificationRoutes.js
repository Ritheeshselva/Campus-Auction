const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.json({
    notifications,
    unreadCount: notifications.filter((item) => !item.isRead).length
  });
});

router.put('/:id/read', requireAuth(), async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ notification });
});

router.put('/read-all', requireAuth(), async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
  res.json({ message: 'Notifications marked as read.' });
});

module.exports = router;
