const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'collections.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Secret key for HMAC token signing
const JWT_SECRET = process.env.JWT_SECRET || 'callisto-orbit-cyber-ai-secret-2026';

// Active sessions memory map (token -> { userId, expiresAt })
const activeSessions = new Map();

// Helper to hash passwords using scrypt
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Helper to verify password
function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!stored.includes(':')) {
    // If plaintext fallback
    return password === stored;
  }
  const [salt, key] = stored.split(':');
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

// Generate secure session token
function createSessionToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  const token = `${payloadB64}.${signature}`;
  activeSessions.set(token, payload);
  return token;
}

// Validate session token
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.expiresAt < Date.now()) {
      activeSessions.delete(token);
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// JSON file readers & writers
function readJson(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
}

// Parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Parse cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(c => {
    const [name, val] = c.trim().split('=');
    if (name && val) {
      cookies[name] = decodeURIComponent(val);
    }
  });
  return cookies;
}

// Send JSON response
function sendJson(res, statusCode, data, headers = {}) {
  const responseData = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(responseData),
    ...headers
  });
  res.end(responseData);
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Serve static files safely
function serveStaticFile(req, res, filePath) {
  // Normalize & security check
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(PUBLIC_DIR))) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 handler
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 Not Found - Callisto-Orbit</h1>');
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(resolvedPath);
    stream.pipe(res);
  });
}

// Extract auth token
function getAuthToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.callisto_token) return cookies.callisto_token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Main HTTP Request Handler
async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers for development/flexibility
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API ROUTING
  if (pathname.startsWith('/api/')) {
    try {
      // 1. LOGIN: POST /api/auth/login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseBody(req);
        const { identifier, password } = body;

        if (!identifier || !password) {
          return sendJson(res, 400, {
            success: false,
            message: 'Please provide both username/email and password'
          });
        }

        const users = readJson(USERS_FILE, []);
        const cleanId = identifier.trim().toLowerCase();
        const user = users.find(u => 
          (u.username && u.username.toLowerCase() === cleanId) || 
          (u.email && u.email.toLowerCase() === cleanId)
        );

        if (!user || !user.active) {
          return sendJson(res, 401, {
            success: false,
            message: 'Invalid username, email, or account is disabled'
          });
        }

        const isValid = verifyPassword(password, user.password);
        if (!isValid) {
          return sendJson(res, 401, {
            success: false,
            message: 'Incorrect password. Try callisto123 or check team credentials'
          });
        }

        const token = createSessionToken(user);
        const safeUser = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          title: user.title,
          avatar: user.avatar,
          joinedDate: user.joinedDate
        };

        // Set HttpOnly cookie
        const cookieVal = `callisto_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;

        return sendJson(res, 200, {
          success: true,
          message: `Welcome back, ${user.name}!`,
          token,
          user: safeUser
        }, {
          'Set-Cookie': cookieVal
        });
      }

      // 2. CHECK ME: GET /api/auth/me
      if (pathname === '/api/auth/me' && method === 'GET') {
        const token = getAuthToken(req);
        const session = verifySessionToken(token);

        if (!session) {
          return sendJson(res, 401, { success: false, message: 'Unauthenticated' });
        }

        const users = readJson(USERS_FILE, []);
        const user = users.find(u => u.id === session.userId);
        if (!user) {
          return sendJson(res, 401, { success: false, message: 'User not found' });
        }

        return sendJson(res, 200, {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            title: user.title,
            avatar: user.avatar,
            joinedDate: user.joinedDate
          }
        });
      }

      // 3. LOGOUT: POST /api/auth/logout
      if (pathname === '/api/auth/logout' && method === 'POST') {
        const token = getAuthToken(req);
        if (token) {
          activeSessions.delete(token);
        }
        const clearCookie = 'callisto_token=; Path=/; HttpOnly; Max-Age=0';
        return sendJson(res, 200, { success: true, message: 'Logged out successfully' }, {
          'Set-Cookie': clearCookie
        });
      }

      // 4. CONFIG: GET /api/config
      if (pathname === '/api/config' && method === 'GET') {
        const config = readJson(CONFIG_FILE, {});
        return sendJson(res, 200, { success: true, config });
      }

      // 5. MEMBERS LIST: GET /api/members
      if (pathname === '/api/members' && method === 'GET') {
        const users = readJson(USERS_FILE, []);
        const safeMembers = users.map(u => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          role: u.role,
          title: u.title,
          avatar: u.avatar,
          joinedDate: u.joinedDate,
          active: u.active
        }));
        return sendJson(res, 200, { success: true, members: safeMembers });
      }

      // 6. COLLECTIONS: GET /api/collections
      if (pathname === '/api/collections' && method === 'GET') {
        const collections = readJson(COLLECTIONS_FILE, []);
        const config = readJson(CONFIG_FILE, {});
        
        let totalCollected = 0;
        let totalExpected = 0;
        collections.forEach(c => {
          totalCollected += (c.collected || 0);
          totalExpected += (c.target || 0);
        });

        return sendJson(res, 200, {
          success: true,
          stats: {
            totalCollected,
            totalExpected,
            monthlyTarget: config.monthlyTarget || 600,
            perMember: config.monthlyContributionPerMember || 100,
            currency: config.currency || '$'
          },
          collections
        });
      }

      return sendJson(res, 404, { success: false, message: 'API endpoint not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 500, { success: false, message: 'Internal Server Error' });
    }
  }

  // STATIC FILE ROUTING
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  serveStaticFile(req, res, filePath);
}

// Create HTTP Server
const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Callisto-Orbit] Server running at http://localhost:${PORT}`);
  });
}

module.exports = { server, handleRequest, hashPassword, verifyPassword, createSessionToken, verifySessionToken };
