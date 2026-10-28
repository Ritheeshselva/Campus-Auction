const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seller', 'user'], required: true }
});

module.exports = mongoose.model('User', userSchema);
