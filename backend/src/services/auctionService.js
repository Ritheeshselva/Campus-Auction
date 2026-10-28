const Auction = require('../models/Auction');
const Notification = require('../models/Notification');
const { createId } = require('../utils/ids');

async function closeExpiredAuctions() {
  const expiredAuctions = await Auction.find({
    status: 'active',
    endTime: { $lte: new Date() }
  });

  for (const auction of expiredAuctions) {
    auction.status = auction.highestBidder ? 'pending_approval' : 'unsold';
    await auction.save();

    if (auction.highestBidder) {
      await Notification.create({
        _id: createId('notification'),
        recipient: auction.seller,
        auction: auction._id,
        title: 'Auction closed',
        message: 'A winning bid is ready for your approval.',
        createdAt: new Date()
      });
    }
  }
}

module.exports = { closeExpiredAuctions };
