const express = require('express');
const { auctions, transactions } = require('../data/store');
const { requireAuth, sellerOnly } = require('../middleware/auth');
const { createId, timestamp } = require('../utils/ids');
const { decorateAuction, decorateTransaction } = require('../utils/formatters');

const router = express.Router();

router.get('/', requireAuth(), sellerOnly, (req, res) => res.json({ transactions: transactions.filter((item) => item.seller === req.user._id).map(decorateTransaction) }));
router.post('/:id/approve', requireAuth(), sellerOnly, (req, res) => {
  const auction = auctions.find((item) => item._id === req.params.id && item.seller === req.user._id);
  if (!auction || auction.status !== 'pending_approval') return res.status(400).json({ message: 'Auction is not awaiting approval.' });
  auction.status = 'reserved';
  const transaction = { _id: createId('sale'), auction: auction._id, seller: auction.seller, buyer: auction.highestBidder, status: 'reserved', createdAt: timestamp() };
  transactions.push(transaction);
  res.json({ transaction: decorateTransaction(transaction) });
});
router.post('/:id/reject', requireAuth(), sellerOnly, (req, res) => {
  const auction = auctions.find((item) => item._id === req.params.id && item.seller === req.user._id);
  if (!auction || auction.status !== 'pending_approval') return res.status(400).json({ message: 'Auction is not awaiting approval.' });
  auction.status = 'rejected';
  res.json({ auction: decorateAuction(auction) });
});
router.post('/:id/confirm-handover', requireAuth(), (req, res) => {
  const transaction = transactions.find((item) => item._id === req.params.id && (item.seller === req.user._id || item.buyer === req.user._id));
  if (!transaction) return res.status(404).json({ message: 'Sale not found.' });
  transaction.status = 'completed';
  res.json({ transaction: decorateTransaction(transaction) });
});
router.post('/:id/cancel', requireAuth(), sellerOnly, (req, res) => {
  const transaction = transactions.find((item) => item._id === req.params.id && item.seller === req.user._id);
  if (!transaction) return res.status(404).json({ message: 'Sale not found.' });
  transaction.status = 'cancelled';
  res.json({ transaction: decorateTransaction(transaction) });
});
router.post('/:id/rate', requireAuth(), (req, res) => res.json({ message: 'Rating recorded.' }));

module.exports = router;
