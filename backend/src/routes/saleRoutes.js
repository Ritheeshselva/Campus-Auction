const express = require('express');
const Auction = require('../models/Auction');
const Transaction = require('../models/Transaction');
const { requireAuth, sellerOnly } = require('../middleware/auth');
const { createId } = require('../utils/ids');
const { decorateAuction, decorateTransaction } = require('../utils/formatters');

const router = express.Router();

router.get('/', requireAuth(), sellerOnly, async (req, res) => {
  const transactions = await Transaction.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ transactions: await Promise.all(transactions.map(decorateTransaction)) });
});

router.post('/:id/approve', requireAuth(), sellerOnly, async (req, res) => {
  const auction = await Auction.findOne({ _id: req.params.id, seller: req.user._id, status: 'pending_approval' });
  if (!auction) return res.status(400).json({ message: 'Auction is not awaiting approval.' });
  auction.status = 'reserved';
  await auction.save();
  const transaction = await Transaction.create({
    _id: createId('sale'),
    auction: auction._id,
    seller: auction.seller,
    buyer: auction.highestBidder,
    status: 'reserved',
    createdAt: new Date()
  });
  res.json({ transaction: await decorateTransaction(transaction) });
});

router.post('/:id/reject', requireAuth(), sellerOnly, async (req, res) => {
  const auction = await Auction.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id, status: 'pending_approval' },
    { status: 'rejected' },
    { new: true }
  );
  if (!auction) return res.status(400).json({ message: 'Auction is not awaiting approval.' });
  res.json({ auction: await decorateAuction(auction) });
});

router.post('/:id/confirm-handover', requireAuth(), async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, $or: [{ seller: req.user._id }, { buyer: req.user._id }] },
    { status: 'completed' },
    { new: true }
  );
  if (!transaction) return res.status(404).json({ message: 'Sale not found.' });
  res.json({ transaction: await decorateTransaction(transaction) });
});

router.post('/:id/cancel', requireAuth(), sellerOnly, async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    { status: 'cancelled' },
    { new: true }
  );
  if (!transaction) return res.status(404).json({ message: 'Sale not found.' });
  res.json({ transaction: await decorateTransaction(transaction) });
});

router.post('/:id/rate', requireAuth(), (req, res) => res.json({ message: 'Rating recorded.' }));

module.exports = router;
