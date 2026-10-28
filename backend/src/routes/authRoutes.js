const express = require('express');
const { users } = require('../data/store');
const { findUser, loginToken, requireAuth } = require('../middleware/auth');
const { publicUser } = require('../utils/formatters');

const router = express.Router();

// Login for the two fixed demo accounts.
router.post('/login', (req, res) => {
  const user = findUser(req.body.email);

  if (!user || user.password !== req.body.password) return res.status(401).json({ message: 'Invalid email or password.' });

  res.json({ token: loginToken(user), user: publicUser(user) });
});

// Used when the frontend reloads and already has a token.
router.get('/me', requireAuth(), (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
