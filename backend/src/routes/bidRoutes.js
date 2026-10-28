const express = require('express');
const { auctions, bids, notifications } = require('../data/store');
const { requireAuth, userOnly } = require('../middleware/auth');
const { createId, timestamp } = require('../utils/ids');
const { decorateAuction, decorateBid } = require('../utils/formatters');
const { closeExpiredAuctions } = require('../services/auctionService');

const router = express.Router();

router.post('/:id', requireAuth(), userOnly, (req, res) => {
  closeExpiredAuctions();
  const auction = auctions.find((item) => item._id === req.params.id);
  const amount = Number(req.body.amount);
  const previousBids = bids.filter((bid) => bid.auction === auction?._id).length;
  const minimum = previousBids === 0 ? auction?.startingPrice : auction?.currentPrice + auction?.minBidIncrement;
  if (!auction || auction.status !== 'active') return res.status(400).json({ message: 'This auction is closed.' });
  if (!Number.isFinite(amount) || amount < minimum) return res.status(400).json({ message: `Bid must be at least ₹${minimum.toFixed(2)}.` });
  const bid = { _id: createId('bid'), auction: auction._id, bidder: req.user._id, amount, timestamp: timestamp() };
  bids.push(bid);
  auction.currentPrice = amount;
  auction.highestBidder = req.user._id;
  notifications.push({ _id: createId('notification'), recipient: auction.seller, auction: auction._id, title: 'New bid received', message: `${req.user.name} bid ₹${amount.toFixed(2)}.`, isRead: false, createdAt: timestamp() });
  res.status(201).json({ auction: decorateAuction(auction), bid: decorateBid(bid) });
});

router.get('/my/history', requireAuth(), userOnly, (req, res) => {
  res.json({ myBids: bids.filter((bid) => bid.bidder === req.user._id).map((bid) => {
    const auction = auctions.find((item) => item._id === bid.auction);
    return { auction: decorateAuction(auction), myHighestBid: bid.amount, isLeading: auction.highestBidder === req.user._id };
  }) });
});

router.get('/:id', (req, res) => res.json({ bids: bids.filter((bid) => bid.auction === req.params.id).map(decorateBid) }));

module.exports = router;
