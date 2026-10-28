const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  _id: String,
  title: String,
  category: String,
  description: String,
  condition: String,
  images: [String],
  startingPrice: Number,
  currentPrice: Number,
  minBidIncrement: Number,
  seller: String,
  highestBidder: { type: String, default: null },
  status: { type: String, default: 'active' },
  endTime: Date,
  createdAt: Date
});

module.exports = mongoose.model('Auction', auctionSchema);
