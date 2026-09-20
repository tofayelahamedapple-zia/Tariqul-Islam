/**
 * MD TARIQUL ISLAM — Personal Portfolio
 * Zero-dependency Node.js static server.
 *
 * Everything the site needs lives in ./public, which means the exact same
 * folder can be published as-is to GitHub Pages / Netlify / Vercel.
 * This server is only for local development and for self-hosting.
 *
 *   node server.js            -> http://localhost:4900
 *   PORT=8080 node server.js  -> http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.PORT) || 4900;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf'
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'X-Content-Type-Options': 'nosniff' }, headers || {}));
  if (body && body.pipe) body.pipe(res);
  else res.end(body);
}

function notFound(res) {
  const page = path.join(ROOT, '404.html');
  fs.readFile(page, (err, buf) => {
    if (err) return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
    send(res, 404, buf, { 'Content-Type': MIME['.html'] });
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.parse(req.url).pathname);
  } catch (e) {
    return send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  if (pathname.endsWith('/')) pathname += 'index.html';

  // Resolve inside ROOT only — blocks ../ traversal.
  const filePath = path.join(ROOT, path.normalize(pathname));
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Allow extension-less pretty URLs: /about -> /about.html
      if (!path.extname(filePath)) {
        return fs.stat(filePath + '.html', (e2, s2) => {
          if (e2 || !s2.isFile()) return notFound(res);
          stream(filePath + '.html', s2);
        });
      }
      return notFound(res);
    }
    stream(filePath, stat);
  });

  function stream(file, stat) {
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const etag = '"' + stat.size.toString(16) + '-' + stat.mtimeMs.toString(16) + '"';

    if (req.headers['if-none-match'] === etag) return send(res, 304, null, { ETag: etag });

    // Code + copy revalidate every request (cheap 304s via ETag) so an edit or
    // a new translation is picked up immediately. Media is safe to cache hard.
    const LONG_CACHE = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.mp4',
                        '.webm', '.mp3', '.m4a', '.woff', '.woff2', '.ttf', '.pdf'];
    const cache = LONG_CACHE.indexOf(ext) !== -1
      ? 'public, max-age=604800'
      : 'no-cache';

    const headers = {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Cache-Control': cache,
      ETag: etag,
      'Last-Modified': stat.mtime.toUTCString()
    };

    if (req.method === 'HEAD') return send(res, 200, null, headers);
    send(res, 200, fs.createReadStream(file), headers);
  }
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  MD TARIQUL ISLAM — Portfolio');
  console.log('  ──────────────────────────────────────────');
  console.log('  Local:   http://localhost:' + PORT);
  console.log('  Serving: ' + ROOT);
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\n  Port ' + PORT + ' is already in use. Try:  PORT=4901 node server.js\n');
    process.exit(1);
  }
  throw err;
});
