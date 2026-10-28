const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  _id: String,
  auction: String,
  seller: String,
  buyer: String,
  status: String,
  createdAt: Date
});

module.exports = mongoose.model('Transaction', transactionSchema);
