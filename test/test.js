const { Readable, Writable } = require('node:stream');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const { handleRequest, hashPassword, verifyPassword, createSessionToken, verifySessionToken } = require('../server.js');

// In-Memory HTTP Mock Dispatcher
function dispatchMockRequest({ method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    // Mock req stream
    const req = new Readable({
      read() {
        if (body) {
          this.push(typeof body === 'string' ? body : JSON.stringify(body));
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:3000', ...headers };

    // Mock res stream
    let statusCode = 200;
    const responseHeaders = {};
    const chunks = [];

    const res = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    res.writeHead = (status, hdrs = {}) => {
      statusCode = status;
      Object.assign(responseHeaders, hdrs);
    };

    res.setHeader = (key, val) => {
      responseHeaders[key.toLowerCase()] = val;
    };

    res.on('finish', () => {
      const rawBody = Buffer.concat(chunks).toString('utf8');
      let parsedBody = rawBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {}
      resolve({ statusCode, headers: responseHeaders, body: parsedBody, raw: rawBody });
    });

    res.on('error', reject);
    req.on('error', reject);

    handleRequest(req, res).catch(reject);
  });
}

async function runTests() {
  console.log('🧪 Starting Callisto-Orbit automated test suite...\n');

  // Test 1: JSON Data Files Validation
  console.log('Test 1: Validating JSON Data Storage Architecture...');
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
  console.log('Test 2: Verifying Cryptographic Security (scrypt 256-bit)...');
  const testHash = hashPassword('callisto123');
  assert.ok(verifyPassword('callisto123', testHash), 'Password must verify with generated hash');
  assert.ok(!verifyPassword('wrongpassword', testHash), 'Invalid password must be rejected');
  console.log('  ✅ Cryptographic password authentication verified.\n');

  // Test 3: Session Token Generation and HMAC Tamper Verification
  console.log('Test 3: Testing Session Tokens (HMAC-SHA256)...');
  const dummyUser = { id: 'usr_01', username: 'kehan', role: 'admin' };
  const token = createSessionToken(dummyUser);
  const session = verifySessionToken(token);
  assert.ok(session, 'Valid token must decode session');
  assert.strictEqual(session.userId, 'usr_01');
  assert.strictEqual(session.username, 'kehan');

  // Test Tampered Token
  const tamperedToken = token.slice(0, -4) + 'abcd';
  assert.strictEqual(verifySessionToken(tamperedToken), null, 'Tampered token must be rejected');
  console.log('  ✅ Tamper-proof token validation verified.\n');

  // Test 4: API GET /api/config
  console.log('Test 4: Testing GET /api/config...');
  const configRes = await dispatchMockRequest({ url: '/api/config', method: 'GET' });
  assert.strictEqual(configRes.statusCode, 200);
  assert.strictEqual(configRes.body.config.systemName, 'Callisto-Orbit');
  assert.strictEqual(configRes.body.config.monthlyContributionPerMember, 100);
  console.log('  ✅ GET /api/config returned valid configuration.\n');

  // Test 5: API Login Failure
  console.log('Test 5: Testing POST /api/auth/login with invalid password...');
  const failRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { identifier: 'kehan', password: 'wrongpassword' }
  });
  assert.strictEqual(failRes.statusCode, 401);
  assert.strictEqual(failRes.body.success, false);
  console.log('  ✅ Rejected invalid credentials with HTTP 401.\n');

  // Test 6: API Login Success
  console.log('Test 6: Testing POST /api/auth/login with valid admin credentials (kehan / callisto123)...');
  const loginRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { identifier: 'kehan', password: 'callisto123' }
  });
  assert.strictEqual(loginRes.statusCode, 200);
  assert.strictEqual(loginRes.body.success, true);
  assert.strictEqual(loginRes.body.user.username, 'kehan');
  assert.ok(loginRes.body.token, 'Response must include session token');
  console.log('  ✅ Successful login returned user payload and token.\n');

  // Test 7: API GET /api/auth/me with Bearer Token
  console.log('Test 7: Testing GET /api/auth/me with Bearer token...');
  const meRes = await dispatchMockRequest({
    url: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${loginRes.body.token}` }
  });
  assert.strictEqual(meRes.statusCode, 200);
  assert.strictEqual(meRes.body.user.username, 'kehan');
  console.log('  ✅ Session authenticated user info returned.\n');

  // Test 8: API GET /api/members
  console.log('Test 8: Testing GET /api/members...');
  const membersRes = await dispatchMockRequest({ url: '/api/members', method: 'GET' });
  assert.strictEqual(membersRes.statusCode, 200);
  assert.strictEqual(membersRes.body.members.length, 6, 'Must list all 6 squad members');
  // Passwords must never be exposed
  membersRes.body.members.forEach(m => {
    assert.strictEqual(m.password, undefined, 'Member objects must never leak passwords');
  });
  console.log('  ✅ All 6 members returned with sanitized payloads.\n');

  // Test 9: Static UI Files Check
  console.log('Test 9: Testing UI Assets Existence...');
  const indexHtml = path.join(__dirname, '../public/index.html');
  const dashHtml = path.join(__dirname, '../public/dashboard.html');
  const cssFile = path.join(__dirname, '../public/assets/css/style.css');
  const authJs = path.join(__dirname, '../public/assets/js/auth.js');
  const dashJs = path.join(__dirname, '../public/assets/js/dashboard.js');
  const logoFile = path.join(__dirname, '../public/assets/images/callisto-logo.jpg');

  assert.ok(fs.existsSync(indexHtml), 'index.html must exist');
  assert.ok(fs.existsSync(dashHtml), 'dashboard.html must exist');
  assert.ok(fs.existsSync(cssFile), 'style.css must exist');
  assert.ok(fs.existsSync(authJs), 'auth.js must exist');
  assert.ok(fs.existsSync(dashJs), 'dashboard.js must exist');
  assert.ok(fs.existsSync(logoFile), 'callisto-logo.jpg must exist');
  console.log('  ✅ All UI and asset files verified.\n');

  console.log('🎉 ==============================================');
  console.log('🎉 ALL CALLISTO-ORBIT TESTS PASSED SUCCESSFULLY! ');
  console.log('🎉 ==============================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
