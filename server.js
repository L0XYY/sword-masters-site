import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORT = process.env.PORT || 3000;
const STAFF_CODE = process.env.STAFF_CODE || 'swordmastersontop';
const SETTINGS_FILE = join(process.cwd(), 'settings.json');

const defaultSettings = {
  siteTitle: 'SWORD MASTERS',
  subtitle: 'Grind for insanely rare blades, hatch mythic pets, and flex on the server!',
  countdownTitle: 'Launching Soon!',
  launchDate: '2026-12-31T18:00',
  playUrl: 'https://www.roblox.com',
  groupUrl: 'https://www.roblox.com/communities/1009227802/5-CCU#!/about',
  discordUrl: 'https://discord.gg/8G3V29ftJb',
  extraLinks: []
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

async function readSettings() {
  if (!existsSync(SETTINGS_FILE)) return defaultSettings;
  try {
    const data = JSON.parse(await readFile(SETTINGS_FILE, 'utf8'));
    return { ...defaultSettings, ...data };
  } catch {
    return defaultSettings;
  }
}

async function saveSettings(settings) {
  const cleaned = { ...defaultSettings, ...settings };
  await writeFile(SETTINGS_FILE, JSON.stringify(cleaned, null, 2));
  return cleaned;
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/api/settings' && req.method === 'GET') {
      return sendJson(res, 200, await readSettings());
    }

    if (url.pathname === '/api/settings' && req.method === 'POST') {
      const body = await readBody(req);
      if (body.code !== STAFF_CODE) return sendJson(res, 403, { error: 'Wrong staff code.' });
      const saved = await saveSettings(body.settings || {});
      return sendJson(res, 200, saved);
    }

    let path = normalize(decodeURIComponent(url.pathname));
    if (path === '/' || path === '') path = '/index.html';
    if (path.includes('..')) return sendJson(res, 400, { error: 'Bad path' });

    const filePath = join(process.cwd(), path);
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      return res.end('Not found');
    }

    res.writeHead(200, { 'content-type': mime[extname(filePath)] || 'application/octet-stream', 'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'pragma': 'no-cache', 'expires': '0' });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    sendJson(res, 500, { error: 'Server error' });
  }
}).listen(PORT, () => {
  console.log(`Sword Masters running on http://localhost:${PORT}`);
});
