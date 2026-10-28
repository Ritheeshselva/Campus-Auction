const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  secret: process.env.JWT_SECRET || 'campus-auction-demo',
  uploadDir: path.join(__dirname, '../uploads')
};
