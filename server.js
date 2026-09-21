/**
 * MD TARIQUL ISLAM — Personal Portfolio
 * Zero-dependency Node.js server: serves the published site, and hosts the
 * content admin that edits content/site.json and rebuilds the site.
 *
 *   node server.js                     -> http://localhost:4900
 *   PORT=8080 node server.js
 *   ADMIN_PASSWORD=... node server.js  -> admin at /admin
 *
 * public/ stays a plain static folder, so it still publishes to GitHub Pages
 * as-is. The admin only runs where Node runs.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { build } = require('./build');

const PORT = Number(process.env.PORT) || 4900;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.join(__dirname, 'public');
const ADMIN = path.join(__dirname, 'admin');
const CONTENT = path.join(__dirname, 'content/site.json');
const BACKUPS = path.join(__dirname, 'content/backups');
const PASSWORD = process.env.ADMIN_PASSWORD || 'tariqul';
const UPLOAD_DIR = path.join(ROOT, 'assets/gallery');
const MAX_UPLOAD = 8 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.pdf': 'application/pdf'
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'X-Content-Type-Options': 'nosniff' }, headers || {}));
  if (body && body.pipe) body.pipe(res); else res.end(body);
}
const json = (res, status, obj, extra) =>
  send(res, status, JSON.stringify(obj), Object.assign({ 'Content-Type': MIME['.json'] }, extra || {}));

/* ---------- auth ----------
   A signed-in session is a random token in an HttpOnly cookie. Tokens live in
   memory, so restarting the server signs everyone out. */
const SESSIONS = new Map();
const SESSION_MS = 12 * 60 * 60 * 1000;

const cookies = req => {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
};

function authorised(req) {
  const token = cookies(req).admin;
  if (!token) return false;
  const expires = SESSIONS.get(token);
  if (!expires) return false;
  if (expires < Date.now()) { SESSIONS.delete(token); return false; }
  return true;
}

function passwordMatches(given) {
  const a = Buffer.from(String(given ?? ''));
  const b = Buffer.from(PASSWORD);
  // Compare a fixed-length digest so the check does not leak the length.
  return crypto.timingSafeEqual(crypto.createHash('sha256').update(a).digest(),
                                crypto.createHash('sha256').update(b).digest());
}

function startSession(res) {
  const token = crypto.randomBytes(32).toString('hex');
  SESSIONS.set(token, Date.now() + SESSION_MS);
  for (const [t, exp] of SESSIONS) if (exp < Date.now()) SESSIONS.delete(t);
  json(res, 200, { ok: true }, {
    'Set-Cookie': `admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}`
  });
}

/* ---------- request body ---------- */
function readBody(req, limit, cb) {
  const chunks = [];
  let size = 0, done = false;
  const fail = msg => { if (!done) { done = true; cb(new Error(msg)); req.destroy(); } };
  req.on('data', c => {
    size += c.length;
    if (size > limit) return fail('too large');
    chunks.push(c);
  });
  req.on('error', () => fail('read error'));
  req.on('end', () => { if (!done) { done = true; cb(null, Buffer.concat(chunks)); } });
}

/* ---------- admin API ---------- */
function saveContent(buf, cb) {
  let parsed;
  try { parsed = JSON.parse(buf.toString('utf8')); }
  catch (e) { return cb({ status: 400, error: 'That is not valid JSON: ' + e.message }); }
  if (!parsed || !parsed.sections || !parsed.meta) {
    return cb({ status: 400, error: 'Content is missing its meta or sections block — not saving.' });
  }
  // Keep the previous version so a bad edit is never final.
  try {
    fs.mkdirSync(BACKUPS, { recursive: true });
    if (fs.existsSync(CONTENT)) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(CONTENT, path.join(BACKUPS, `site-${stamp}.json`));
      const old = fs.readdirSync(BACKUPS).filter(f => f.startsWith('site-')).sort();
      old.slice(0, Math.max(0, old.length - 20)).forEach(f => fs.unlinkSync(path.join(BACKUPS, f)));
    }
  } catch (e) { /* a failed backup must not block the save */ }

  fs.writeFileSync(CONTENT, JSON.stringify(parsed, null, 2) + '\n');
  try {
    const result = build();
    cb(null, result);
  } catch (e) {
    cb({ status: 500, error: 'Saved, but the rebuild failed: ' + e.message });
  }
}

const FOLDERS = { gallery: 'assets/gallery', assets: 'assets' };

function saveUpload(req, res) {
  const name = String(req.headers['x-filename'] || '').replace(/[^A-Za-z0-9._-]/g, '');
  const folder = FOLDERS[String(req.headers['x-folder'] || 'gallery')];
  if (!folder) return json(res, 400, { error: 'Unknown upload folder' });
  if (!name || !/\.(jpe?g|png|webp|avif|gif)$/i.test(name)) {
    return json(res, 400, { error: 'Give the file a name ending in .jpg, .png, .webp, .avif or .gif' });
  }
  readBody(req, MAX_UPLOAD, (err, buf) => {
    if (err) return json(res, 413, { error: 'File is larger than 8 MB' });
    const dir = path.join(ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buf);
    json(res, 200, { src: folder + '/' + name, bytes: buf.length });
  });
}

const listBackups = () => {
  try {
    return fs.readdirSync(BACKUPS).filter(f => /^site-.*\.json$/.test(f)).sort().reverse();
  } catch (e) { return []; }
};

const listGallery = () => {
  try {
    return fs.readdirSync(UPLOAD_DIR)
      .filter(f => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
      .map(f => 'assets/gallery/' + f).sort();
  } catch (e) { return []; }
};

/* ---------- static ---------- */
function serveStatic(req, res, baseDir, pathname) {
  const filePath = path.join(baseDir, path.normalize(pathname));
  if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
    return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (!path.extname(filePath)) {
        return fs.stat(filePath + '.html', (e2, s2) =>
          (e2 || !s2.isFile()) ? notFound(res) : stream(filePath + '.html', s2));
      }
      return notFound(res);
    }
    stream(filePath, stat);
  });

  function stream(file, stat) {
    const ext = path.extname(file).toLowerCase();
    const etag = '"' + stat.size.toString(16) + '-' + stat.mtimeMs.toString(16) + '"';
    if (req.headers['if-none-match'] === etag) return send(res, 304, null, { ETag: etag });
    const LONG = ['.png','.jpg','.jpeg','.webp','.avif','.gif','.mp4','.webm','.mp3','.m4a','.woff','.woff2','.ttf','.pdf'];
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': LONG.indexOf(ext) !== -1 ? 'public, max-age=604800' : 'no-cache',
      ETag: etag, 'Last-Modified': stat.mtime.toUTCString()
    };
    if (req.method === 'HEAD') return send(res, 200, null, headers);
    send(res, 200, fs.createReadStream(file), headers);
  }
}

function notFound(res) {
  fs.readFile(path.join(ROOT, '404.html'), (err, buf) =>
    err ? send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' })
        : send(res, 404, buf, { 'Content-Type': MIME['.html'] }));
}

/* ---------- router ---------- */
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (e) { return send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' }); }

  /* --- admin --- */
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/')) {

    /* the sign-in page and its stylesheet are the only things served signed-out */
    if (pathname === '/api/login' && req.method === 'POST') {
      return readBody(req, 2048, (err, buf) => {
        let given = null;
        try { given = JSON.parse(buf.toString('utf8')).password; } catch (e) {}
        if (!passwordMatches(given)) return json(res, 401, { error: 'That password is not right.' });
        startSession(res);
      });
    }
    if (pathname === '/api/logout' && req.method === 'POST') {
      SESSIONS.delete(cookies(req).admin);
      return json(res, 200, { ok: true }, { 'Set-Cookie': 'admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
    }
    if (pathname === '/admin/admin.css') return serveStatic(req, res, ADMIN, '/admin.css');

    if (!authorised(req)) {
      if (pathname.startsWith('/api/')) return json(res, 401, { error: 'Signed out' });
      return serveStatic(req, res, ADMIN, '/login.html');
    }

    if (pathname === '/api/content' && req.method === 'GET') {
      return send(res, 200, fs.readFileSync(CONTENT), { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
    }
    if (pathname === '/api/content' && req.method === 'POST') {
      return readBody(req, 4 * 1024 * 1024, (err, buf) => {
        if (err) return json(res, 413, { error: 'Content is too large' });
        saveContent(buf, (bad, result) =>
          bad ? json(res, bad.status, { error: bad.error }) : json(res, 200, { ok: true, ...result }));
      });
    }
    if (pathname === '/api/upload' && req.method === 'POST') return saveUpload(req, res);
    if (pathname === '/api/backups' && req.method === 'GET') return json(res, 200, { files: listBackups() });
    if (pathname === '/api/restore' && req.method === 'POST') {
      return readBody(req, 4096, (err, buf) => {
        let name;
        try { name = JSON.parse(buf.toString('utf8')).file; } catch (e) { name = null; }
        if (!name || !listBackups().includes(name)) return json(res, 400, { error: 'No such backup' });
        const content = fs.readFileSync(path.join(BACKUPS, name));
        saveContent(content, (bad, result) =>
          bad ? json(res, bad.status, { error: bad.error }) : json(res, 200, { ok: true, restored: name, ...result }));
      });
    }
    if (pathname === '/api/gallery-files' && req.method === 'GET') return json(res, 200, { files: listGallery() });

    if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin/index.html';
    return serveStatic(req, res, ADMIN, pathname.replace(/^\/admin/, '') || '/index.html');
  }

  /* --- published site --- */
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  serveStatic(req, res, ROOT, pathname);
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  MD TARIQUL ISLAM — Portfolio');
  console.log('  ──────────────────────────────────────────');
  console.log('  Site:    http://localhost:' + PORT);
  console.log('  Admin:   http://localhost:' + PORT + '/admin');
  console.log('  Sign in with any username and the password' +
              (process.env.ADMIN_PASSWORD ? ' from ADMIN_PASSWORD.' : ' "tariqul".'));
  if (!process.env.ADMIN_PASSWORD) {
    console.log('  Set your own:  ADMIN_PASSWORD="…" node server.js');
  }
  console.log('');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error('\n  Port ' + PORT + ' is already in use. Try:  PORT=4901 node server.js\n');
    process.exit(1);
  }
  throw err;
});
