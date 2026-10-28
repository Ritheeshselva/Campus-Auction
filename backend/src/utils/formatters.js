const { users, auctions, bids } = require('../data/store');

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function getUserById(id) {
  return users.find((user) => user._id === id);
}

function decorateAuction(auction) {
  const auctionBids = bids.filter((bid) => bid.auction === auction._id);

  return {
    ...auction,
    seller: publicUser(getUserById(auction.seller)),
    highestBidder: publicUser(getUserById(auction.highestBidder)),
    totalBids: auctionBids.length
  };
}

function decorateBid(bid) {
  return {
    ...bid,
    bidder: publicUser(getUserById(bid.bidder))
  };
}

function decorateTransaction(transaction) {
  const auction = auctions.find((item) => item._id === transaction.auction);

  return {
    ...transaction,
    seller: publicUser(getUserById(transaction.seller)),
    buyer: publicUser(getUserById(transaction.buyer)),
    auction: decorateAuction(auction)
  };
}

module.exports = { publicUser, decorateAuction, decorateBid, decorateTransaction };
