const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  _id: String,
  recipient: String,
  auction: String,
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: Date
});

module.exports = mongoose.model('Notification', notificationSchema);
