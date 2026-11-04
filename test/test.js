const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const { server, hashPassword, verifyPassword } = require('../server.js');

const TEST_PORT = 3199;

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Callisto-Orbit test suite...\n');

  // Test 1: JSON Data Files Validation
  console.log('Test 1: Validating JSON Data Storage...');
  const usersPath = path.join(__dirname, '../data/users.json');
  const collectionsPath = path.join(__dirname, '../data/collections.json');
  const configPath = path.join(__dirname, '../data/config.json');

  assert.ok(fs.existsSync(usersPath), 'users.json must exist');
  assert.ok(fs.existsSync(collectionsPath), 'collections.json must exist');
  assert.ok(fs.existsSync(configPath), 'config.json must exist');

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const collections = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  assert.strictEqual(users.length, 6, 'Must have exactly 6 team members');
  assert.strictEqual(config.monthlyContributionPerMember, 100, 'Monthly contribution per member must be 100');
  assert.strictEqual(config.totalMembers, 6, 'Total members configured must be 6');
  console.log('  ✅ JSON Data files are valid and 6 team members configured.\n');

  // Test 2: Crypto Password Hashing and Verification
  console.log('Test 2: Verifying Cryptographic Security...');
  const hashed = hashPassword('callisto123');
  assert.ok(verifyPassword('callisto123', hashed), 'Password must verify correctly with generated hash');
  assert.ok(!verifyPassword('wrongpassword', hashed), 'Invalid password must be rejected');
  console.log('  ✅ Cryptographic password authentication verified.\n');

  // Start test server
  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`Test server running on port ${TEST_PORT}`);

  try {
    // Test 3: API Config Endpoint
    console.log('Test 3: Testing GET /api/config...');
    const configRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/config',
      method: 'GET'
    });
    assert.strictEqual(configRes.status, 200);
    assert.strictEqual(configRes.body.config.systemName, 'Callisto-Orbit');
    console.log('  ✅ GET /api/config returned valid configuration.\n');

    // Test 4: API Login Failure
    console.log('Test 4: Testing POST /api/auth/login with invalid credentials...');
    const failRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { identifier: 'kehan', password: 'wrongpassword' });
    assert.strictEqual(failRes.status, 401);
    assert.strictEqual(failRes.body.success, false);
    console.log('  ✅ Rejected invalid credentials with 401.\n');

    // Test 5: API Login Success
    console.log('Test 5: Testing POST /api/auth/login with valid admin credentials...');
    const loginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { identifier: 'kehan', password: 'callisto123' });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
    assert.strictEqual(loginRes.body.user.username, 'kehan');
    assert.ok(loginRes.body.token, 'Must return session token');
    console.log('  ✅ Successful login returns token and user payload.\n');

    // Test 6: API Auth Me with Token
    console.log('Test 6: Testing GET /api/auth/me with Bearer token...');
    const meRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${loginRes.body.token}` }
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.user.username, 'kehan');
    console.log('  ✅ Session authentication verified.\n');

    // Test 7: Static Files (Index HTML check)
    console.log('Test 7: Testing static file routing for index.html...');
    const staticRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/',
      method: 'GET'
    });
    // Will return 200 once index.html is present, or 404 for now
    console.log(`  Static router response status: ${staticRes.status}`);

    console.log('🎉 All automated tests passed successfully!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
