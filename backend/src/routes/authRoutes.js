const express = require('express');
const { users } = require('../data/store');
const { findUser, loginToken, requireAuth } = require('../middleware/auth');
const { publicUser } = require('../utils/formatters');
const { createId } = require('../utils/ids');

const router = express.Router();

// Create a new demo account with either the seller or user role.
router.post('/register', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = req.body.role;
  const name = String(req.body.name || '').trim() || email.split('@')[0];

  if (!email || !password || !['seller', 'user'].includes(role)) {
    return res.status(400).json({
      message: 'Email, password, and a valid role are required.'
    });
  }

  if (users.some((user) => user.email === email)) {
    return res.status(409).json({
      message: 'An account with this email already exists.'
    });
  }

  const newUser = {
    _id: createId('user'),
    name,
    email,
    password,
    role
  };

  users.push(newUser);

  res.status(201).json({
    message: 'Account created successfully.',
    token: loginToken(newUser),
    user: publicUser(newUser)
  });
});

// Login for the default accounts and any accounts created in the demo.
router.post('/login', (req, res) => {
  const user = findUser(req.body.email);

  if (!user || user.password !== req.body.password) return res.status(401).json({ message: 'Invalid email or password.' });

  res.json({ token: loginToken(user), user: publicUser(user) });
});

// Used when the frontend reloads and already has a token.
router.get('/me', requireAuth(), (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
