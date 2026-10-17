import http from 'node:http';
import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await fsp.realpath(path.dirname(fileURLToPath(import.meta.url)));
const previewPrefix = '/opendesign/mockups/three-hud-preview/';
const previousPrefix = '/opendesign/mockups/p0-command-preview/';
const previousRoot = await fsp.realpath(path.join(root, '../p0-command-preview')).catch(() => null);
const publicFiles = new Set(['index.html', 'preview.js', 'preview.css']);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Preview-App': 'galactic-three-hud-preview',
  'X-Preview-Pid': String(process.pid),
};

function fail(req, res, status = 404) {
  res.writeHead(status, {
    ...headers, 'Content-Type': 'text/plain; charset=utf-8',
    ...(status === 405 ? { Allow: 'GET, HEAD' } : {}),
  });
  res.end(req.method === 'HEAD' ? undefined : status === 405 ? 'Method not allowed' : 'Not found');
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return fail(req, res, 405);
  let pathname;
  try { pathname = decodeURIComponent((req.url || '').split('?')[0]); }
  catch { return fail(req, res); }
  if (!pathname.startsWith('/') || /[\\\0%:]/.test(pathname) || pathname.split('/').some(part => part === '..' || part === '.')) return fail(req, res);
  let relative;
  let servingRoot = root;
  if (previousRoot && (pathname.startsWith(previousPrefix) || pathname === previousPrefix.slice(0, -1))) {
    servingRoot = previousRoot;
    relative = pathname.slice(previousPrefix.length) || 'index.html';
  }
  else if (pathname === '/' || pathname === previewPrefix.slice(0, -1)) relative = 'index.html';
  else if (pathname.startsWith(previewPrefix)) relative = pathname.slice(previewPrefix.length) || 'index.html';
  else relative = pathname.slice(1);
  const extension = path.extname(relative).toLowerCase();
  if (!publicFiles.has(relative) && !(relative.startsWith('assets/') && mimeTypes[extension] && extension !== '.html')) return fail(req, res);
  try {
    const file = await fsp.realpath(path.resolve(servingRoot, relative));
    if (!file.startsWith(servingRoot + path.sep)) return fail(req, res);
    const stat = await fsp.stat(file);
    if (!stat.isFile()) return fail(req, res);
    res.writeHead(200, {
      ...headers, 'Content-Type': mimeTypes[extension], 'Content-Length': stat.size,
    });
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch { fail(req, res); }
});

server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(8390, '127.0.0.1', () => {
  console.log(`Three HUD preview: http://127.0.0.1:8390${previewPrefix}index.html`);
  console.log(`PID ${process.pid}; static preview files only`);
});
