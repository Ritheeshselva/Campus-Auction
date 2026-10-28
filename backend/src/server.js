const app = require('./app');
const { port } = require('./config');
const { connectToDatabase } = require('./db');
const { seedDatabase } = require('./data/seedDatabase');

if (require.main === module) {
  connectToDatabase()
    .then(seedDatabase)
    .then(() => app.listen(port, () => console.log(`Campus Auction demo API listening on port ${port}`)))
    .catch((error) => {
      console.error('Could not start the server:', error.message);
      process.exit(1);
    });
}

module.exports = app;
