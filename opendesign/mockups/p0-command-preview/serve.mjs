import http from 'node:http';
import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await fsp.realpath(path.dirname(fileURLToPath(import.meta.url)));
const prefix = '/opendesign/mockups/p0-command-preview/';
const publicFiles = new Set(['index.html', 'preview.css', 'preview.js']);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.glb': 'model/gltf-binary',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function fail(res, status = 404) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(status === 404 ? 'Not found' : 'Method not allowed');
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405);
  const rawPath = (req.url || '').split('?')[0];
  let pathname;
  try { pathname = decodeURIComponent(rawPath); } catch { return fail(res); }
  if (!pathname.startsWith('/') || /[\\\0%]/.test(pathname) || pathname.split('/').some(s => s === '..' || s === '.')) return fail(res);
  if (pathname === '/' || pathname === prefix.slice(0, -1)) {
    res.writeHead(302, { Location: prefix + 'index.html', 'Cache-Control': 'no-store' });
    return res.end();
  }
  if (!pathname.startsWith(prefix)) return fail(res);
  const relative = pathname.slice(prefix.length) || 'index.html';
  const extension = path.extname(relative).toLowerCase();
  if (!publicFiles.has(relative) && !(relative.startsWith('assets/') && mimeTypes[extension])) return fail(res);
  try {
    const file = await fsp.realpath(path.resolve(root, relative));
    if (!file.startsWith(root + path.sep)) return fail(res);
    const stat = await fsp.stat(file);
    if (!stat.isFile()) return fail(res);
    res.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch { return fail(res); }
});

server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(8390, '127.0.0.1', () => {
  console.log(`Independent P0 preview: http://127.0.0.1:8390${prefix}index.html`);
  console.log(`PID ${process.pid}; serving only preview files and assets from ${root}`);
});
