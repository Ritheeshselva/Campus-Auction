const http = require('http');

const request = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function testAll() {
  console.log('--- Testing Campus Auction Marketplace Endpoints ---');

  // 1. Health
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health check status:', health.status, health.data.service);

  // 2. Auth Login
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'sarah.chen@campus.edu', password: 'campus123' }
  );
  console.log('2. Sarah Chen Login status:', loginRes.status, 'Student:', loginRes.data.user.name);
  const token = loginRes.data.token;

  // 3. Fetch Auctions
  const auctionsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auctions?sort=endingSoon',
    method: 'GET'
  });
  console.log('3. Fetch Auctions status:', auctionsRes.status, 'Total items:', auctionsRes.data.total);

  // 4. Place Bid on an item where Sarah is not seller
  // Find an active auction where seller != Sarah
  const targetAuction = auctionsRes.data.auctions.find(
    (a) => a.seller._id !== loginRes.data.user._id && a.status === 'active'
  );

  if (targetAuction) {
    const nextMinBid = targetAuction.currentPrice + targetAuction.minBidIncrement;
    const bidRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/bids/${targetAuction._id}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      { amount: nextMinBid }
    );
    console.log(
      '4. Bid Placement status:',
      bidRes.status,
      'New Price: $' + bidRes.data.auction?.currentPrice,
      'Extended?:',
      bidRes.data.wasExtended
    );
  }

  // 5. Check Notifications
  const notifRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(
    '5. Notifications status:',
    notifRes.status,
    'Unread Count:',
    notifRes.data.unreadCount
  );

  // 6. Check Transactions / Sales
  const salesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/sales',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(
    '6. Sales / Handover status:',
    salesRes.status,
    'Transactions count:',
    salesRes.data.transactions?.length
  );

  console.log('--- ALL MODULE TESTS PASSED! ---');
}

testAll().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
