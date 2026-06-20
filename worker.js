export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "https://swordmasters.lol",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    const firebaseBase = env.FIREBASE_DATABASE_URL;

    if (!firebaseBase) {
      return json({ ok: false, error: "Missing FIREBASE_DATABASE_URL secret" }, 500, cors);
    }

    if (url.pathname === "/verify" && request.method === "POST") {
      const body = await safeJson(request);
      if (!env.ADMIN_CODE || body.code !== env.ADMIN_CODE) {
        return json({ ok: false, error: "Invalid code" }, 403, cors);
      }
      return json({ ok: true }, 200, cors);
    }

    if (url.pathname === "/settings" && request.method === "GET") {
      const res = await fetch(`${firebaseBase}/swordmasters/settings.json`, {
        headers: { "Cache-Control": "no-cache" }
      });
      const data = await res.json().catch(() => null);
      return json(data || {}, 200, cors);
    }

    if (url.pathname === "/settings" && request.method === "POST") {
      const body = await safeJson(request);

      if (!env.ADMIN_CODE || body.code !== env.ADMIN_CODE) {
        return json({ ok: false, error: "Invalid code" }, 403, cors);
      }

      const newSettings = body.settings || {};

      await fetch(`${firebaseBase}/swordmasters/settings.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSettings, updatedAt: Date.now() })
      });

      return json({ ok: true }, 200, cors);
    }

    return json({ ok: true, api: "Sword Masters API Online" }, 200, cors);
  }
};

async function safeJson(request) {
  try { return await request.json(); } catch { return {}; }
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}
