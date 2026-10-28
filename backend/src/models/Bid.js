const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  _id: String,
  auction: String,
  bidder: String,
  amount: Number,
  timestamp: Date
});

module.exports = mongoose.model('Bid', bidSchema);
