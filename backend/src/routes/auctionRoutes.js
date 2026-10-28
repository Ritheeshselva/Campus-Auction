const express = require('express');
const { auctions, bids } = require('../data/store');
const { requireAuth, sellerOnly } = require('../middleware/auth');
const { createId, timestamp } = require('../utils/ids');
const { decorateAuction, decorateBid } = require('../utils/formatters');
const { closeExpiredAuctions } = require('../services/auctionService');

const router = express.Router();

router.get('/', requireAuth(false), (req, res) => {
  closeExpiredAuctions();
  let result = auctions.filter((auction) => !req.query.status || auction.status === req.query.status);
  if (req.query.search) result = result.filter((auction) => `${auction.title} ${auction.description}`.toLowerCase().includes(req.query.search.toLowerCase()));
  if (req.query.category && req.query.category !== 'All') result = result.filter((auction) => auction.category === req.query.category);
  if (req.query.condition) result = result.filter((auction) => req.query.condition.split(',').includes(auction.condition));
  if (req.query.minPrice) result = result.filter((auction) => auction.currentPrice >= Number(req.query.minPrice));
  if (req.query.maxPrice) result = result.filter((auction) => auction.currentPrice <= Number(req.query.maxPrice));
  if (req.query.sort === 'endingSoon') result.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
  if (req.query.sort === 'priceLow') result.sort((a, b) => a.currentPrice - b.currentPrice);
  if (req.query.sort === 'priceHigh') result.sort((a, b) => b.currentPrice - a.currentPrice);
  res.json({ auctions: result.map(decorateAuction), total: result.length, page: 1, pages: 1 });
});

router.get('/my-listings', requireAuth(), sellerOnly, (req, res) => {
  closeExpiredAuctions();
  res.json({ auctions: auctions.filter((auction) => auction.seller === req.user._id).map(decorateAuction) });
});

router.get('/:id', requireAuth(false), (req, res) => {
  closeExpiredAuctions();
  const auction = auctions.find((item) => item._id === req.params.id);
  if (!auction) return res.status(404).json({ message: 'Auction not found.' });
  res.json({ auction: decorateAuction(auction), bids: bids.filter((bid) => bid.auction === auction._id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(decorateBid) });
});

router.post('/', requireAuth(), sellerOnly, (req, res) => {
  const startingPrice = Number(req.body.startingPrice);
  const endTime = req.body.endTime || new Date(Date.now() + Number(req.body.durationHours || 24) * 3600000).toISOString();
  if (!req.body.title || !Number.isFinite(startingPrice) || startingPrice < 0 || new Date(endTime) <= new Date()) return res.status(400).json({ message: 'Title, valid starting price, and future closing time are required.' });
  const auction = { _id: createId('auction'), title: req.body.title.trim(), category: req.body.category || 'Other', description: req.body.description || '', condition: req.body.condition || 'Good', images: req.body.images || [], startingPrice, currentPrice: startingPrice, minBidIncrement: Number(req.body.minBidIncrement) || 5, seller: req.user._id, highestBidder: null, status: 'active', endTime, createdAt: timestamp() };
  auctions.push(auction);
  res.status(201).json({ auction: decorateAuction(auction) });
});

router.put('/:id', requireAuth(), sellerOnly, (req, res) => {
  const auction = auctions.find((item) => item._id === req.params.id && item.seller === req.user._id);
  if (!auction || auction.status !== 'active') return res.status(404).json({ message: 'Active listing not found.' });
  ['title', 'category', 'description', 'condition', 'images', 'minBidIncrement', 'endTime'].forEach((key) => {
    if (req.body[key] !== undefined) auction[key] = key === 'minBidIncrement' ? Number(req.body[key]) : req.body[key];
  });
  res.json({ auction: decorateAuction(auction) });
});

router.delete('/:id', requireAuth(), sellerOnly, (req, res) => {
  const auction = auctions.find((item) => item._id === req.params.id && item.seller === req.user._id);
  if (!auction) return res.status(404).json({ message: 'Listing not found.' });
  auction.status = 'cancelled';
  res.json({ auction: decorateAuction(auction) });
});

module.exports = router;
