const express = require('express');
const { notifications } = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth(), (req, res) => {
  const list = notifications.filter((item) => item.recipient === req.user._id);
  res.json({ notifications: list, unreadCount: list.filter((item) => !item.isRead).length });
});
router.put('/:id/read', requireAuth(), (req, res) => {
  const notification = notifications.find((item) => item._id === req.params.id && item.recipient === req.user._id);
  if (!notification) return res.status(404).json({ message: 'Notification not found.' });
  notification.isRead = true;
  res.json({ notification });
});
router.put('/read-all', requireAuth(), (req, res) => {
  notifications.filter((item) => item.recipient === req.user._id).forEach((item) => { item.isRead = true; });
  res.json({ message: 'Notifications marked as read.' });
});

module.exports = router;
