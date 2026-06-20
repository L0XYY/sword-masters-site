// Cloudflare Worker API for Sword Masters.
// Keeps the staff code off the public website.
// Required Worker bindings:
// 1) KV namespace binding named SETTINGS
// 2) Secret named STAFF_CODE with value: swordmastersontop

const DEFAULT_SETTINGS = {
  siteTitle: 'SWORD MASTERS',
  subtitle: 'Grind for insanely rare blades, hatch mythic pets, and flex on the server!',
  countdownTitle: 'Launching Soon!',
  launchDate: '2026-12-31T18:00',
  playUrl: 'https://www.roblox.com',
  groupUrl: 'https://www.roblox.com/communities/1009227802/5-CCU#!/about',
  discordUrl: 'https://discord.gg/8G3V29ftJb',
  extraLinks: []
};

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

function cleanSettings(input) {
  const s = input && typeof input === 'object' ? input : {};
  return {
    siteTitle: String(s.siteTitle || DEFAULT_SETTINGS.siteTitle).slice(0, 80),
    subtitle: String(s.subtitle || DEFAULT_SETTINGS.subtitle).slice(0, 180),
    countdownTitle: String(s.countdownTitle || DEFAULT_SETTINGS.countdownTitle).slice(0, 80),
    launchDate: String(s.launchDate || DEFAULT_SETTINGS.launchDate).slice(0, 30),
    playUrl: String(s.playUrl || DEFAULT_SETTINGS.playUrl).slice(0, 500),
    groupUrl: String(s.groupUrl || DEFAULT_SETTINGS.groupUrl).slice(0, 500),
    discordUrl: String(s.discordUrl || DEFAULT_SETTINGS.discordUrl).slice(0, 500),
    extraLinks: Array.isArray(s.extraLinks) ? s.extraLinks.slice(0, 8).map(link => ({
      label: String(link.label || '').slice(0, 40),
      url: String(link.url || '').slice(0, 500)
    })).filter(link => link.label && link.url) : []
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });

    if (url.pathname !== '/settings') {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: cors(origin) });
    }

    if (request.method === 'GET') {
      const saved = await env.SETTINGS.get('swordmasters-settings', 'json');
      return new Response(JSON.stringify(saved || DEFAULT_SETTINGS), { headers: cors(origin) });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body || body.code !== env.STAFF_CODE) {
        return new Response(JSON.stringify({ error: 'Wrong staff code.' }), { status: 401, headers: cors(origin) });
      }
      const settings = cleanSettings(body.settings);
      await env.SETTINGS.put('swordmasters-settings', JSON.stringify({ ...settings, updatedAt: Date.now() }));
      return new Response(JSON.stringify({ ok: true }), { headers: cors(origin) });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors(origin) });
  }
};
