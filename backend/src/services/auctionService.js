const { auctions, bids, notifications } = require('../data/store');
const { createId, timestamp } = require('../utils/ids');

function closeExpiredAuctions() {
  const currentTime = new Date();

  auctions.forEach((auction) => {
    const closingTime = new Date(auction.endTime);
    const hasEnded = auction.status === 'active' && closingTime <= currentTime;

    if (!hasEnded) {
      return;
    }

    if (auction.highestBidder) {
      auction.status = 'pending_approval';
      notifications.push({
        _id: createId('notification'),
        recipient: auction.seller,
        auction: auction._id,
        title: 'Auction closed',
        message: 'A winning bid is ready for your approval.',
        isRead: false,
        createdAt: timestamp()
      });
    } else {
      auction.status = 'unsold';
    }
  });
}

module.exports = { closeExpiredAuctions };
