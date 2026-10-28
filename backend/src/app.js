const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { uploadDir } = require('./config');
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const saleRoutes = require('./routes/saleRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
fs.mkdirSync(uploadDir, { recursive: true });

// Basic middleware used by every route.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Campus Auction Demo',
    timestamp: new Date().toISOString()
  });
});

// Each feature has its own route file.
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/upload', uploadRoutes);
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

module.exports = app;
