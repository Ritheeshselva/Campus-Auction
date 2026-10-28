const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const User = require('../models/User');

// Find one of the two demo users by ID or email address.
async function findUser(value) {
  const searchValue = String(value).toLowerCase();
  return User.findOne({
    $or: [{ _id: searchValue }, { email: searchValue }]
  });
}

// Check the login token sent by the frontend.
// Some routes allow guests, so "required" can be set to false.
function requireAuth(required = true) {
  return async function checkLogin(req, res, next) {
    const header = req.headers.authorization;

    if (!header && !required) {
      return next();
    }

    if (!header || !header.startsWith('Bearer ')) {
      if (!required) return next();
      return res.status(401).json({ message: 'Please log in.' });
    }

    try {
      const token = header.slice(7);
      const tokenData = jwt.verify(token, secret);
      const user = await findUser(tokenData.id);

      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired login.' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired login.' });
    }
  }
}

function loginToken(user) {
  return jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });
}

function sellerOnly(req, res, next) {
  if (req.user.role !== 'seller') {
    return res.status(403).json({
      message: 'Only the seller account can perform this action.'
    });
  }

  next();
}

function userOnly(req, res, next) {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      message: 'Only the user account can perform this action.'
    });
  }

  next();
}

module.exports = { findUser, loginToken, requireAuth, sellerOnly, userOnly };
