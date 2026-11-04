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

    const normalizedHeaders = { host: 'localhost:3000' };
    Object.keys(headers).forEach(k => {
      normalizedHeaders[k.toLowerCase()] = headers[k];
    });

    req.method = method;
    req.url = url;
    req.headers = normalizedHeaders;

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
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  assert.strictEqual(config.monthlyContributionPerMember, 100, 'Monthly contribution per member must be 100');
  console.log('  ✅ JSON Data files are valid and configured.\n');

  // Test 2: Crypto Password Hashing and Verification
  console.log('Test 2: Verifying Cryptographic Security (scrypt 256-bit)...');
  const testHash = hashPassword('callisto123');
  assert.ok(verifyPassword('callisto123', testHash), 'Password must verify with generated hash');
  assert.ok(!verifyPassword('wrongpassword', testHash), 'Invalid password must be rejected');
  console.log('  ✅ Cryptographic password authentication verified.\n');

  // Test 3: Session Token Generation and HMAC Tamper Verification
  console.log('Test 3: Testing Session Tokens (HMAC-SHA256)...');
  const dummyUser = { id: 'usr_01', username: 'kehan', role: 'super_admin' };
  const token = createSessionToken(dummyUser);
  const session = verifySessionToken(token);
  assert.ok(session, 'Valid token must decode session');
  assert.strictEqual(session.userId, 'usr_01');
  assert.strictEqual(session.username, 'kehan');
  assert.strictEqual(session.role, 'super_admin');

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

  // Test 6: API Login Success (Admin Mode)
  console.log('Test 6: Testing POST /api/auth/login in Admin Mode (kehan / callisto123)...');
  const loginRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { identifier: 'kehan', password: 'callisto123', mode: 'admin' }
  });
  assert.strictEqual(loginRes.statusCode, 200);
  assert.strictEqual(loginRes.body.success, true);
  assert.strictEqual(loginRes.body.user.username, 'kehan');
  assert.strictEqual(loginRes.body.user.role, 'super_admin');
  assert.ok(loginRes.body.token, 'Response must include session token');
  console.log('  ✅ Successful Super Admin login returned user payload and token.\n');

  // Test 7: API GET /api/auth/me with Bearer Token
  console.log('Test 7: Testing GET /api/auth/me with Bearer token...');
  const meRes = await dispatchMockRequest({
    url: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${loginRes.body.token}` }
  });
  assert.strictEqual(meRes.statusCode, 200);
  assert.strictEqual(meRes.body.user.username, 'kehan');
  assert.strictEqual(meRes.body.user.role, 'super_admin');
  console.log('  ✅ Session authenticated user info returned.\n');

  // Test 8: API GET /api/members
  console.log('Test 8: Testing GET /api/members...');
  const membersRes = await dispatchMockRequest({ url: '/api/members', method: 'GET' });
  assert.strictEqual(membersRes.statusCode, 200);
  assert.ok(membersRes.body.members.length >= 6, 'Must list all squad members');
  membersRes.body.members.forEach(m => {
    assert.strictEqual(m.password, undefined, 'Member objects must never leak passwords');
    assert.ok(m.nic, 'Every member must have a registered NIC');
    assert.ok(['super_admin', 'admin', 'member'].includes(m.role), 'Role must be valid type');
  });
  console.log('  ✅ All members returned with sanitized payloads and roles.\n');

  // Test 9: Single-Field NIC Authentication
  console.log('Test 9: Testing Single-Field NIC Authentication (POST /api/auth/login with nic)...');
  const nicLoginRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: '200213800593' }
  });
  assert.strictEqual(nicLoginRes.statusCode, 200);
  assert.strictEqual(nicLoginRes.body.success, true);
  assert.strictEqual(nicLoginRes.body.user.username, 'kehan');
  assert.strictEqual(nicLoginRes.body.user.nic, '200213800593');
  assert.ok(nicLoginRes.body.token, 'Must return session token for valid NIC');

  // Test invalid NIC
  const badNicRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: '000000000000' }
  });
  assert.strictEqual(badNicRes.statusCode, 401);
  assert.strictEqual(badNicRes.body.success, false);
  console.log('  ✅ Single-field NIC clearance verified successfully.\n');

  // Test 10: Unauthorized Member attempting Admin Mode
  console.log('Test 10: Testing Member attempting Admin Mode Login (should reject with 403)...');
  const memberAdminAttempt = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { identifier: 'nimesha', password: 'callisto123', mode: 'admin' }
  });
  assert.strictEqual(memberAdminAttempt.statusCode, 403, 'Member must be rejected from Admin mode with 403');
  assert.strictEqual(memberAdminAttempt.body.success, false);
  console.log('  ✅ Role security verified: Non-admin rejected with 403.\n');

  // Test 11: Register New Specialist via Admin Endpoint and Instant Login
  console.log('Test 11: Registering New Specialist with NIC and verifying instant clearance login...');
  const adminToken = loginRes.body.token;
  const newSpecialistNic = `2003${Math.floor(10000000 + Math.random() * 90000000)}`;
  const regRes = await dispatchMockRequest({
    url: '/api/admin/members',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      name: 'Kaveen Test Specialist',
      nic: newSpecialistNic,
      role: 'member',
      username: 'kaveentest',
      title: 'Security Researcher'
    }
  });
  assert.strictEqual(regRes.statusCode, 201);
  assert.strictEqual(regRes.body.success, true);
  assert.strictEqual(regRes.body.member.nic, newSpecialistNic);

  // Verify that the newly registered specialist can immediately log in with single-field NIC!
  const newNicLoginRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: newSpecialistNic }
  });
  assert.strictEqual(newNicLoginRes.statusCode, 200);
  assert.strictEqual(newNicLoginRes.body.success, true);
  assert.strictEqual(newNicLoginRes.body.user.name, 'Kaveen Test Specialist');
  console.log(`  ✅ New specialist registered with NIC (${newSpecialistNic}) and authenticated immediately.\n`);

  // Test 12: Updating Specialist NIC & Role via PUT /api/admin/members/:id
  console.log('Test 12: Testing Specialist NIC & Role Update...');
  const updatedNic = `2004${Math.floor(10000000 + Math.random() * 90000000)}`;
  const updateRes = await dispatchMockRequest({
    url: `/api/admin/members/${regRes.body.member.id}`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      name: 'Kaveen Promoted',
      nic: updatedNic,
      role: 'admin',
      title: 'Promoted Squad Administrator'
    }
  });
  assert.strictEqual(updateRes.statusCode, 200);
  assert.strictEqual(updateRes.body.success, true);
  assert.strictEqual(updateRes.body.member.role, 'admin');

  // Verify updated NIC login works
  const updatedNicLogin = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: updatedNic }
  });
  assert.strictEqual(updatedNicLogin.statusCode, 200);
  assert.strictEqual(updatedNicLogin.body.user.role, 'admin');
  console.log('  ✅ Specialist NIC and Role update verified successfully.\n');

  // Cleanup: Reset test user from data/users.json to keep pristine state
  const cleanUsers = JSON.parse(fs.readFileSync(usersPath, 'utf8')).filter(u => u.id !== regRes.body.member.id);
  fs.writeFileSync(usersPath, JSON.stringify(cleanUsers, null, 2), 'utf8');
  const cleanConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  cleanConfig.totalMembers = cleanUsers.length;
  cleanConfig.monthlyTarget = cleanUsers.length * 100;
  fs.writeFileSync(configPath, JSON.stringify(cleanConfig, null, 2), 'utf8');

  // Test 13: Static UI Files Check
  console.log('Test 13: Testing UI Assets Existence...');
  const indexHtml = path.join(__dirname, '../public/index.html');
  const loginHtml = path.join(__dirname, '../public/login.html');
  const dashHtml = path.join(__dirname, '../public/dashboard.html');
  const cssFile = path.join(__dirname, '../public/assets/css/style.css');
  const authJs = path.join(__dirname, '../public/assets/js/auth.js');
  const phoenixJs = path.join(__dirname, '../public/assets/js/phoenix.js');
  const portalLoaderJs = path.join(__dirname, '../public/assets/js/portal-loader.js');
  const dashJs = path.join(__dirname, '../public/assets/js/dashboard.js');
  const logoFile = path.join(__dirname, '../public/assets/images/callisto-logo.jpg');
  const phoenixFile = path.join(__dirname, '../public/assets/images/callisto-phoenix.jpg');

  assert.ok(fs.existsSync(indexHtml), 'index.html must exist');
  assert.ok(fs.existsSync(loginHtml), 'login.html must exist');
  assert.ok(fs.existsSync(dashHtml), 'dashboard.html must exist');
  assert.ok(fs.existsSync(cssFile), 'style.css must exist');
  assert.ok(fs.existsSync(authJs), 'auth.js must exist');
  assert.ok(fs.existsSync(phoenixJs), 'phoenix.js must exist');
  assert.ok(fs.existsSync(portalLoaderJs), 'portal-loader.js must exist');
  assert.ok(fs.existsSync(dashJs), 'dashboard.js must exist');
  assert.ok(fs.existsSync(logoFile), 'callisto-logo.jpg must exist');
  assert.ok(fs.existsSync(phoenixFile), 'callisto-phoenix.jpg must exist');
  console.log('  ✅ All UI and asset files verified.\n');

  console.log('🎉 ==============================================');
  console.log('🎉 ALL CALLISTO-ORBIT TESTS PASSED SUCCESSFULLY! ');
  console.log('🎉 ==============================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
