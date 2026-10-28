const User = require('../models/User');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

function publicUser(user) {
  if (!user) return null;
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
}

async function decorateAuction(auction) {
  if (!auction) return null;
  const bidCount = await Bid.countDocuments({ auction: auction._id });
  const seller = await User.findById(auction.seller);
  const highestBidder = auction.highestBidder
    ? await User.findById(auction.highestBidder)
    : null;

  return {
    ...auction.toObject(),
    seller: publicUser(seller),
    highestBidder: publicUser(highestBidder),
    totalBids: bidCount
  };
}

async function decorateBid(bid) {
  const bidder = await User.findById(bid.bidder);
  return { ...bid.toObject(), bidder: publicUser(bidder) };
}

async function decorateTransaction(transaction) {
  const seller = await User.findById(transaction.seller);
  const buyer = await User.findById(transaction.buyer);
  const auction = await Auction.findById(transaction.auction);

  return {
    ...transaction.toObject(),
    seller: publicUser(seller),
    buyer: publicUser(buyer),
    auction: await decorateAuction(auction)
  };
}

module.exports = { publicUser, decorateAuction, decorateBid, decorateTransaction };
