require('dotenv').config();

const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  secret: process.env.JWT_SECRET,
  databaseUrl: process.env.MONGODB_URI,
  demoSellerEmail: process.env.DEMO_SELLER_EMAIL,
  demoSellerPassword: process.env.DEMO_SELLER_PASSWORD,
  demoUserEmail: process.env.DEMO_USER_EMAIL,
  demoUserPassword: process.env.DEMO_USER_PASSWORD,
  uploadDir: path.join(__dirname, '../uploads')
};
