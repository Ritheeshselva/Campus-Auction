const express = require('express');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const { requireAuth, userOnly } = require('../middleware/auth');
const { createId } = require('../utils/ids');
const { decorateAuction, decorateBid } = require('../utils/formatters');
const { closeExpiredAuctions } = require('../services/auctionService');

const router = express.Router();

router.post('/:id', requireAuth(), userOnly, async (req, res) => {
  await closeExpiredAuctions();
  const auction = await Auction.findById(req.params.id);
  const amount = Number(req.body.amount);
  if (!auction || auction.status !== 'active') return res.status(400).json({ message: 'This auction is closed.' });

  const previousBids = await Bid.countDocuments({ auction: auction._id });
  const minimum = previousBids === 0
    ? auction.startingPrice
    : auction.currentPrice + auction.minBidIncrement;
  if (!Number.isFinite(amount) || amount < minimum) {
    return res.status(400).json({ message: `Bid must be at least ₹${minimum.toFixed(2)}.` });
  }

  const bid = await Bid.create({
    _id: createId('bid'),
    auction: auction._id,
    bidder: req.user._id,
    amount,
    timestamp: new Date()
  });
  auction.currentPrice = amount;
  auction.highestBidder = req.user._id;
  await auction.save();
  await Notification.create({
    _id: createId('notification'),
    recipient: auction.seller,
    auction: auction._id,
    title: 'New bid received',
    message: `${req.user.name} bid ₹${amount.toFixed(2)}.`,
    createdAt: new Date()
  });

  res.status(201).json({ auction: await decorateAuction(auction), bid: await decorateBid(bid) });
});

router.get('/my/history', requireAuth(), userOnly, async (req, res) => {
  const bids = await Bid.find({ bidder: req.user._id }).sort({ timestamp: -1 });
  const history = [];
  for (const bid of bids) {
    const auction = await Auction.findById(bid.auction);
    if (!auction || history.some((item) => item.auction._id === auction._id)) continue;
    history.push({
      auction: await decorateAuction(auction),
      myHighestBid: bid.amount,
      isLeading: auction.highestBidder === req.user._id
    });
  }
  res.json({ myBids: history });
});

router.get('/:id', async (req, res) => {
  const bids = await Bid.find({ auction: req.params.id }).sort({ timestamp: -1 });
  res.json({ bids: await Promise.all(bids.map(decorateBid)) });
});

module.exports = router;
