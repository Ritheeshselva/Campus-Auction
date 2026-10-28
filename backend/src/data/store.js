const { timestamp } = require('../utils/ids');

const users = [
  { _id: 'seller_1', name: 'Demo Seller', email: 'seller@gmail.com', password: 'seller', role: 'seller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Seller' },
  { _id: 'user_1', name: 'Demo User', email: 'user@gmail.com', password: 'user', role: 'user', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=User' }
];

const auctions = [
  { _id: 'auction_cycle', title: 'Campus Bicycle', category: 'Cycle', description: 'A practical bicycle for getting around campus.', condition: 'Good', images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800'], startingPrice: 90, currentPrice: 90, minBidIncrement: 10, seller: 'seller_1', highestBidder: null, status: 'active', endTime: new Date(Date.now() + 3 * 86400000).toISOString(), createdAt: timestamp() },
  { _id: 'auction_calculator', title: 'Scientific Calculator', category: 'Calculator', description: 'Clean calculator suitable for maths and engineering classes.', condition: 'Like New', images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800'], startingPrice: 25, currentPrice: 25, minBidIncrement: 5, seller: 'seller_1', highestBidder: null, status: 'active', endTime: new Date(Date.now() + 6 * 86400000).toISOString(), createdAt: timestamp() }
];

module.exports = {
  users,
  auctions,
  bids: [],
  notifications: [],
  transactions: []
};
