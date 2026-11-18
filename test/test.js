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

  const usersPath = path.join(__dirname, '../data/users.json');
  const collectionsPath = path.join(__dirname, '../data/collections.json');
  const configPath = path.join(__dirname, '../data/config.json');
  const paymentsPath = path.join(__dirname, '../data/payments.json');

  // Preserve pristine state to restore after test run
  const originalUsersContent = fs.readFileSync(usersPath, 'utf8');
  const originalConfigContent = fs.readFileSync(configPath, 'utf8');
  const originalCollectionsContent = fs.readFileSync(collectionsPath, 'utf8');
  const originalPaymentsContent = fs.existsSync(paymentsPath) ? fs.readFileSync(paymentsPath, 'utf8') : JSON.stringify({ payments: [] });

  try {
    // Seed temporary test members if roster has been pruned by user
    const currentUsers = JSON.parse(originalUsersContent);
    if (!currentUsers.some(u => u.username === 'nimesha')) {
      currentUsers.push({
        id: 'usr_03_test',
        name: 'Nimesha Perera',
        username: 'nimesha',
        nic: '199912345672',
        email: 'nimesha@callisto.io',
        password: hashPassword('callisto123'),
        role: 'member',
        title: 'Cyber Security Engineer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nimesha',
        joinedDate: '2026-01-01',
        active: true
      });
      fs.writeFileSync(usersPath, JSON.stringify(currentUsers, null, 2), 'utf8');
    }

    // Test 1: JSON Data Files Validation
    console.log('Test 1: Validating JSON Data Storage Architecture...');
    assert.ok(fs.existsSync(usersPath), 'users.json must exist');
    assert.ok(fs.existsSync(collectionsPath), 'collections.json must exist');
    assert.ok(fs.existsSync(configPath), 'config.json must exist');

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
  console.log('Test 5: Testing POST /api/auth/login in Admin Mode with invalid password...');
  const failRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { identifier: 'kehan', password: 'wrongpassword', mode: 'admin' }
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
  assert.ok(membersRes.body.members.length >= 2, 'Must list squad members');
  membersRes.body.members.forEach(m => {
    assert.strictEqual(m.password, undefined, 'Member objects must never leak passwords');
    assert.ok(m.nic, 'Every member must have a registered NIC');
    assert.ok(['super_admin', 'admin', 'member'].includes(m.role), 'Role must be valid type');
  });
  console.log('  ✅ All members returned with sanitized payloads and roles.\n');

  // Test 9: Single-Field NIC Authentication for Member
  console.log('Test 9: Testing Single-Field NIC Authentication for Member (POST /api/auth/login with nic)...');
  const nicLoginRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: '199912345672' }
  });
  assert.strictEqual(nicLoginRes.statusCode, 200);
  assert.strictEqual(nicLoginRes.body.success, true);
  assert.strictEqual(nicLoginRes.body.user.username, 'nimesha');
  assert.strictEqual(nicLoginRes.body.user.nic, '199912345672');
  assert.ok(nicLoginRes.body.token, 'Must return session token for valid NIC');

  // Test invalid NIC
  const badNicRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: '000000000000' }
  });
  assert.strictEqual(badNicRes.statusCode, 401);
  assert.strictEqual(badNicRes.body.success, false);
  console.log('  ✅ Single-field NIC clearance verified successfully for member.\n');

  // Test 10: Super Admin attempting Member Access mode (MUST reject with 403)
  console.log('Test 10: Testing Super Admin attempting Member Access mode (should reject with 403)...');
  const superAdminMemberAttempt = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: '200213800593', mode: 'member' }
  });
  assert.strictEqual(superAdminMemberAttempt.statusCode, 403, 'Super Admin must be rejected from Member Access with 403');
  assert.strictEqual(superAdminMemberAttempt.body.success, false);
  assert.ok(superAdminMemberAttempt.body.message.includes('Super Admin clearance detected'));
  console.log('  ✅ Security verified: Super Admin rejected from Member Access with 403.\n');

  // Test 11: Unauthorized Member attempting Admin Mode
  console.log('Test 11: Testing Member attempting Admin Mode Login (should reject with 403)...');
  const memberAdminAttempt = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { identifier: 'nimesha', password: 'callisto123', mode: 'admin' }
  });
  assert.strictEqual(memberAdminAttempt.statusCode, 403, 'Member must be rejected from Admin mode with 403');
  assert.strictEqual(memberAdminAttempt.body.success, false);
  console.log('  ✅ Role security verified: Non-admin rejected with 403.\n');

  // Test 12: Register New Specialist via Admin Endpoint and Instant Login
  console.log('Test 12: Registering New Specialist with NIC and verifying instant clearance login...');
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

  // Test 13: Updating Specialist NIC & Role via PUT /api/admin/members/:id
  console.log('Test 13: Testing Specialist NIC & Role Update with Admin Password...');
  const updatedNic = `2004${Math.floor(10000000 + Math.random() * 90000000)}`;
  const updateRes = await dispatchMockRequest({
    url: `/api/admin/members/${regRes.body.member.id}`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      name: 'Kaveen Promoted',
      nic: updatedNic,
      role: 'admin',
      title: 'Promoted Squad Administrator',
      password: 'callisto123'
    }
  });
  assert.strictEqual(updateRes.statusCode, 200);
  assert.strictEqual(updateRes.body.success, true);
  assert.strictEqual(updateRes.body.member.role, 'admin');

  // Verify updated NIC login works
  const updatedNicLogin = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: updatedNic, mode: 'admin', password: 'callisto123' }
  });
  assert.strictEqual(updatedNicLogin.statusCode, 200);
  assert.strictEqual(updatedNicLogin.body.user.role, 'admin');
  console.log('  ✅ Specialist NIC and Role update verified successfully.\n');

  // Test 13B: Registering Admin with & without password validation
  console.log('Test 13B: Verifying Admin Password Requirement during Registration...');
  const adminTestNic = `2005${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  // Attempt to create admin without password -> should fail with 400
  const failAdminRes = await dispatchMockRequest({
    url: '/api/admin/members',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      name: 'Admin Without Password',
      nic: adminTestNic,
      role: 'admin'
    }
  });
  assert.strictEqual(failAdminRes.statusCode, 400);
  assert.strictEqual(failAdminRes.body.success, false);

  // Now create admin with password -> should succeed with 201
  const successAdminRes = await dispatchMockRequest({
    url: '/api/admin/members',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      name: 'New Admin Specialist',
      nic: adminTestNic,
      role: 'admin',
      password: 'adminSecretPass123'
    }
  });
  assert.strictEqual(successAdminRes.statusCode, 201);
  assert.strictEqual(successAdminRes.body.success, true);
  assert.strictEqual(successAdminRes.body.member.role, 'admin');

  // Verify new admin can log in with their created password
  const newAdminLoginRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: adminTestNic, mode: 'admin', password: 'adminSecretPass123' }
  });
  assert.strictEqual(newAdminLoginRes.statusCode, 200);
  assert.strictEqual(newAdminLoginRes.body.user.role, 'admin');
  console.log('  ✅ Admin password validation and authentication verified successfully.\n');

  // Test 13C: Rigorous Role Hierarchy & Security Governance Checks
  console.log('Test 13C: Testing Role Hierarchy & Security Governance Checks...');
  const memberToken = newNicLoginRes.body.token;
  const normalAdminToken = newAdminLoginRes.body.token;
  const normalAdminId = successAdminRes.body.member.id;
  const superAdminToken = loginRes.body.token;
  const superAdminId = loginRes.body.user.id;
  const testMemberId = regRes.body.member.id;

  // 1. Regular Member attempting to delete specialist -> 403 Forbidden
  const memberDelRes = await dispatchMockRequest({
    url: `/api/admin/members/${normalAdminId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${memberToken}` }
  });
  assert.strictEqual(memberDelRes.statusCode, 403, 'Member must be rejected from deleting specialists');

  // 2. Normal Admin attempting to delete a regular member -> 403 Forbidden
  const adminDelMemberRes = await dispatchMockRequest({
    url: `/api/admin/members/${testMemberId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${normalAdminToken}` }
  });
  assert.strictEqual(adminDelMemberRes.statusCode, 403, 'Normal Admin cannot delete regular members');

  // 3. Normal Admin attempting to delete Super Admin -> 403 Forbidden
  const adminDelSuperAdminRes = await dispatchMockRequest({
    url: `/api/admin/members/${superAdminId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${normalAdminToken}` }
  });
  assert.strictEqual(adminDelSuperAdminRes.statusCode, 403, 'Normal Admin cannot delete Super Admin');

  // 4. Normal Admin attempting to edit a Super Admin -> 403 Forbidden
  const adminEditSuperAdminRes = await dispatchMockRequest({
    url: `/api/admin/members/${superAdminId}`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${normalAdminToken}` },
    body: { name: 'Attempted Hijack', nic: '200213800593' }
  });
  assert.strictEqual(adminEditSuperAdminRes.statusCode, 403, 'Normal Admin cannot edit Super Admin');

  // 5. Normal Admin attempting to register a Super Admin -> 403 Forbidden
  const adminCreateSuperAdminRes = await dispatchMockRequest({
    url: '/api/admin/members',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${normalAdminToken}` },
    body: {
      name: 'Rogue Super Admin',
      nic: '200912345678',
      role: 'super_admin',
      password: 'roguePassword123'
    }
  });
  assert.strictEqual(adminCreateSuperAdminRes.statusCode, 403, 'Normal Admin cannot create Super Admin');

  // 6. Admin attempting to modify their own clearance role -> 403 Forbidden
  const adminSelfRoleRes = await dispatchMockRequest({
    url: `/api/admin/members/${normalAdminId}`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${normalAdminToken}` },
    body: {
      name: 'Promoted Self',
      nic: adminTestNic,
      role: 'super_admin'
    }
  });
  assert.strictEqual(adminSelfRoleRes.statusCode, 403, 'Admin cannot modify their own clearance role');

  // 7. Super Admin attempting to delete own active account -> 400 Bad Request
  const selfDelRes = await dispatchMockRequest({
    url: `/api/admin/members/${superAdminId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });
  assert.strictEqual(selfDelRes.statusCode, 400, 'Self-deletion must be blocked with 400');

  // 8. Super Admin successfully deleting the registered member -> 200 OK
  const deleteMemberRes = await dispatchMockRequest({
    url: `/api/admin/members/${testMemberId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });
  assert.strictEqual(deleteMemberRes.statusCode, 200, 'Super Admin must be able to delete members');
  assert.strictEqual(deleteMemberRes.body.success, true);

  // 9. Super Admin successfully deleting the test admin specialist -> 200 OK
  const deleteAdminRes = await dispatchMockRequest({
    url: `/api/admin/members/${normalAdminId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });
  assert.strictEqual(deleteAdminRes.statusCode, 200, 'Super Admin must be able to delete admin specialists');
  assert.strictEqual(deleteAdminRes.body.success, true);

  // 10. Confirm deleted admin specialist cannot authenticate anymore -> 401
  const deletedLoginRes = await dispatchMockRequest({
    url: '/api/auth/login',
    method: 'POST',
    body: { nic: adminTestNic, mode: 'admin', password: 'adminSecretPass123' }
  });
  assert.strictEqual(deletedLoginRes.statusCode, 401, 'Deleted user cannot authenticate');
  console.log('  ✅ Specialist deletion and role hierarchy security governance verified successfully.\n');

  // Test 14: Static UI Files Check
  console.log('Test 14: Testing UI Assets Existence...');
  const indexHtml = path.join(__dirname, '../public/index.html');
  const loginHtml = path.join(__dirname, '../public/login.html');
  const dashHtml = path.join(__dirname, '../public/dashboard.html');
  const specialistsHtml = path.join(__dirname, '../public/specialists.html');
  const paymentsHtml = path.join(__dirname, '../public/payments.html');
  const cssFile = path.join(__dirname, '../public/assets/css/style.css');
  const authJs = path.join(__dirname, '../public/assets/js/auth.js');
  const phoenixJs = path.join(__dirname, '../public/assets/js/phoenix.js');
  const portalLoaderJs = path.join(__dirname, '../public/assets/js/portal-loader.js');
  const dashJs = path.join(__dirname, '../public/assets/js/dashboard.js');
  const specialistsJs = path.join(__dirname, '../public/assets/js/specialists.js');
  const paymentsJs = path.join(__dirname, '../public/assets/js/payments.js');
  const logoFile = path.join(__dirname, '../public/assets/images/callisto-logo.jpg');
  const phoenixFile = path.join(__dirname, '../public/assets/images/callisto-phoenix.jpg');

  assert.ok(fs.existsSync(indexHtml), 'index.html must exist');
  assert.ok(fs.existsSync(loginHtml), 'login.html must exist');
  assert.ok(fs.existsSync(dashHtml), 'dashboard.html must exist');
  assert.ok(fs.existsSync(specialistsHtml), 'specialists.html must exist');
  assert.ok(fs.existsSync(paymentsHtml), 'payments.html must exist');
  assert.ok(fs.existsSync(cssFile), 'style.css must exist');
  assert.ok(fs.existsSync(authJs), 'auth.js must exist');
  assert.ok(fs.existsSync(phoenixJs), 'phoenix.js must exist');
  assert.ok(fs.existsSync(portalLoaderJs), 'portal-loader.js must exist');
  assert.ok(fs.existsSync(dashJs), 'dashboard.js must exist');
  assert.ok(fs.existsSync(specialistsJs), 'specialists.js must exist');
  assert.ok(fs.existsSync(paymentsJs), 'payments.js must exist');
  assert.ok(fs.existsSync(logoFile), 'callisto-logo.jpg must exist');
  assert.ok(fs.existsSync(phoenixFile), 'callisto-phoenix.jpg must exist');
  console.log('  ✅ All UI and asset files verified.\n');

  // Test 15: Payment Verification Vault API
  console.log('Test 15: Testing Payment Verification Vault API...');
  
  // 1. Pending count endpoint
  const pendingCountRes = await dispatchMockRequest({
    url: '/api/payments/pending-count',
    method: 'GET',
    headers: { Authorization: `Bearer ${superAdminToken}` }
  });
  assert.strictEqual(pendingCountRes.statusCode, 200);
  assert.ok(typeof pendingCountRes.body.pendingCount === 'number');

  // 2. Submit payment (as member or admin)
  const submitPayRes = await dispatchMockRequest({
    url: '/api/payments',
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminToken}` },
    body: {
      userId: 'usr_03_test',
      month: '2026-02',
      amount: 100,
      method: 'Bank Transfer',
      txRef: 'TEST-TX-99881',
      paidDate: '2026-02-15',
      notes: 'Automated test payment',
      autoVerify: false
    }
  });
  assert.strictEqual(submitPayRes.statusCode, 201, 'Payment submission should return 201');
  assert.ok(submitPayRes.body.payment && submitPayRes.body.payment.id);
  const createdPayId = submitPayRes.body.payment.id;
  assert.strictEqual(submitPayRes.body.payment.status, 'pending_verification');

  // 3. Member status endpoint
  const memStatusRes = await dispatchMockRequest({
    url: '/api/payments/member-status?month=2026-02',
    method: 'GET',
    headers: { Authorization: `Bearer ${superAdminToken}` }
  });
  assert.strictEqual(memStatusRes.statusCode, 200);
  assert.ok(memStatusRes.body.statusMap['usr_03_test']);
  assert.strictEqual(memStatusRes.body.statusMap['usr_03_test'].status, 'pending_verification');

  // 4. Admin verify payment
  const verifyRes = await dispatchMockRequest({
    url: `/api/payments/${createdPayId}/verify`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${superAdminToken}` },
    body: { notes: 'Verified in test' }
  });
  assert.strictEqual(verifyRes.statusCode, 200, 'Verification should return 200');
  assert.strictEqual(verifyRes.body.payment.status, 'verified');

  // 5. Admin reject payment
  const rejectRes = await dispatchMockRequest({
    url: `/api/payments/${createdPayId}/reject`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${superAdminToken}` },
    body: { reason: 'Test rejection flow' }
  });
  assert.strictEqual(rejectRes.statusCode, 200, 'Rejection should return 200');
  assert.strictEqual(rejectRes.body.payment.status, 'rejected');

  // 6. Super Admin delete payment
  const deletePayRes = await dispatchMockRequest({
    url: `/api/payments/${createdPayId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${superAdminToken}` }
  });
  assert.strictEqual(deletePayRes.statusCode, 200, 'Super admin delete should return 200');
  console.log('  ✅ Payment verification, status mapping, and audit trail lifecycle verified successfully.\n');

  console.log('🎉 ==============================================');
  console.log('🎉 ALL CALLISTO-ORBIT TESTS PASSED SUCCESSFULLY! ');
  console.log('🎉 ==============================================\n');
  } finally {
    fs.writeFileSync(usersPath, originalUsersContent, 'utf8');
    fs.writeFileSync(configPath, originalConfigContent, 'utf8');
    fs.writeFileSync(collectionsPath, originalCollectionsContent, 'utf8');
    fs.writeFileSync(paymentsPath, originalPaymentsContent, 'utf8');
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
