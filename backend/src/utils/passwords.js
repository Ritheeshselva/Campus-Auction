const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

function isHashedPassword(password) {
  return typeof password === 'string' && password.startsWith('$2');
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function passwordMatches(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  isHashedPassword,
  passwordMatches
};
