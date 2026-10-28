const express = require('express');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { requireAuth, sellerOnly } = require('../middleware/auth');
const { createId } = require('../utils/ids');
const { decorateAuction, decorateBid } = require('../utils/formatters');
const { closeExpiredAuctions } = require('../services/auctionService');

const router = express.Router();

router.get('/', requireAuth(false), async (req, res) => {
  await closeExpiredAuctions();
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.condition) filter.condition = { $in: req.query.condition.split(',') };
  if (req.query.minPrice || req.query.maxPrice) {
    filter.currentPrice = {};
    if (req.query.minPrice) filter.currentPrice.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.currentPrice.$lte = Number(req.query.maxPrice);
  }
  if (req.query.search) filter.$or = [
    { title: new RegExp(req.query.search, 'i') },
    { description: new RegExp(req.query.search, 'i') }
  ];

  let sort = { createdAt: -1 };
  if (req.query.sort === 'endingSoon') sort = { endTime: 1 };
  if (req.query.sort === 'priceLow') sort = { currentPrice: 1 };
  if (req.query.sort === 'priceHigh') sort = { currentPrice: -1 };

  const auctions = await Auction.find(filter).sort(sort);
  const formattedAuctions = await Promise.all(auctions.map(decorateAuction));
  res.json({ auctions: formattedAuctions, total: formattedAuctions.length, page: 1, pages: 1 });
});

router.get('/my-listings', requireAuth(), sellerOnly, async (req, res) => {
  await closeExpiredAuctions();
  const auctions = await Auction.find({ seller: req.user._id });
  res.json({ auctions: await Promise.all(auctions.map(decorateAuction)) });
});

router.get('/:id', requireAuth(false), async (req, res) => {
  await closeExpiredAuctions();
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found.' });
  const bids = await Bid.find({ auction: auction._id }).sort({ timestamp: -1 });
  res.json({
    auction: await decorateAuction(auction),
    bids: await Promise.all(bids.map(decorateBid))
  });
});

router.post('/', requireAuth(), sellerOnly, async (req, res) => {
  const startingPrice = Number(req.body.startingPrice);
  const endTime = req.body.endTime
    ? new Date(req.body.endTime)
    : new Date(Date.now() + Number(req.body.durationHours || 24) * 3600000);
  if (!req.body.title || !Number.isFinite(startingPrice) || startingPrice < 0 || endTime <= new Date()) {
    return res.status(400).json({ message: 'Title, valid starting price, and future closing time are required.' });
  }

  const auction = await Auction.create({
    _id: createId('auction'),
    title: req.body.title.trim(),
    category: req.body.category || 'Other',
    description: req.body.description || '',
    condition: req.body.condition || 'Good',
    images: req.body.images || [],
    startingPrice,
    currentPrice: startingPrice,
    minBidIncrement: Number(req.body.minBidIncrement) || 5,
    seller: req.user._id,
    endTime,
    createdAt: new Date()
  });
  res.status(201).json({ auction: await decorateAuction(auction) });
});

router.put('/:id', requireAuth(), sellerOnly, async (req, res) => {
  const auction = await Auction.findOne({ _id: req.params.id, seller: req.user._id, status: 'active' });
  if (!auction) return res.status(404).json({ message: 'Active listing not found.' });
  ['title', 'category', 'description', 'condition', 'images', 'minBidIncrement', 'endTime'].forEach((key) => {
    if (req.body[key] !== undefined) auction[key] = key === 'endTime' ? new Date(req.body[key]) : req.body[key];
  });
  await auction.save();
  res.json({ auction: await decorateAuction(auction) });
});

router.delete('/:id', requireAuth(), sellerOnly, async (req, res) => {
  const auction = await Auction.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    { status: 'cancelled' },
    { new: true }
  );
  if (!auction) return res.status(404).json({ message: 'Listing not found.' });
  res.json({ auction: await decorateAuction(auction) });
});

module.exports = router;
