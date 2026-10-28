const mongoose = require('mongoose');
const { databaseUrl } = require('./config');

async function connectToDatabase() {
  if (!databaseUrl) {
    throw new Error('MONGODB_URI is missing from the backend .env file.');
  }

  await mongoose.connect(databaseUrl);
  console.log('Connected to MongoDB');
}

module.exports = { connectToDatabase };
