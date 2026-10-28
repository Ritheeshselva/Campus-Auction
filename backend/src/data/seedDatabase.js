const User = require('../models/User');
const Auction = require('../models/Auction');
const {
  demoSellerEmail,
  demoSellerPassword,
  demoUserEmail,
  demoUserPassword
} = require('../config');
const { hashPassword, isHashedPassword } = require('../utils/passwords');

async function seedDatabase() {
  if (await User.countDocuments() === 0) {
    await User.insertMany([
      {
        _id: 'seller_1',
        name: 'Demo Seller',
        email: demoSellerEmail,
        password: await hashPassword(demoSellerPassword),
        role: 'seller'
      },
      {
        _id: 'user_1',
        name: 'Demo User',
        email: demoUserEmail,
        password: await hashPassword(demoUserPassword),
        role: 'user'
      }
    ]);
  }

  await upgradePlainTextPasswords();

  if (await Auction.countDocuments() === 0) {
    await Auction.insertMany([
      {
        _id: 'auction_cycle',
        title: 'Campus Bicycle',
        category: 'Cycle',
        description: 'A practical bicycle for getting around campus.',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800'],
        startingPrice: 90,
        currentPrice: 90,
        minBidIncrement: 10,
        seller: 'seller_1',
        endTime: new Date(Date.now() + 3 * 86400000),
        createdAt: new Date()
      },
      {
        _id: 'auction_calculator',
        title: 'Scientific Calculator',
        category: 'Calculator',
        description: 'Clean calculator suitable for maths and engineering classes.',
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800'],
        startingPrice: 25,
        currentPrice: 25,
        minBidIncrement: 5,
        seller: 'seller_1',
        endTime: new Date(Date.now() + 6 * 86400000),
        createdAt: new Date()
      }
    ]);
  }
}

async function upgradePlainTextPasswords() {
  const users = await User.find({}, 'password');

  for (const user of users) {
    if (!isHashedPassword(user.password)) {
      user.password = await hashPassword(user.password);
      await user.save();
    }
  }
}

module.exports = { seedDatabase };
