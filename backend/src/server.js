const app = require('./app');
const { port } = require('./config');

if (require.main === module) {
  app.listen(port, () => console.log(`Campus Auction demo API listening on port ${port}`));
}

module.exports = app;
