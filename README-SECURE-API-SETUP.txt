SWORD MASTERS - SECURE CLOUDFLARE WORKER API VERSION

GITHUB PAGES FILES TO UPLOAD:
- index.html
- main.js
- style.css
- logo.png
- api-config.js
- CNAME (keep your existing one if you use swordmasters.lol)

DO NOT upload worker.js to GitHub Pages. Paste worker.js into Cloudflare Worker instead.

CLOUDFLARE WORKER:
1. Open Cloudflare > Workers & Pages > swordmasters-api > Edit code.
2. Paste the included worker.js.
3. Deploy.

WORKER VARIABLES:
Set these in Worker Settings > Variables and Secrets:
ADMIN_CODE = swordmastersontop
FIREBASE_DATABASE_URL = https://ccu-c1c53-default-rtdb.europe-west1.firebasedatabase.app

API URL:
api-config.js is already set to:
https://swordmasters-api.zacdshotmail-com.workers.dev

FIREBASE RULES:
Because writes now go through your Worker, keep rules as restricted as your setup allows. For simple testing, this works:
{
  "rules": {
    "swordmasters": {
      "settings": {
        ".read": true,
        ".write": true
      }
    }
  }
}

SECURITY NOTE:
The admin code is no longer stored in main.js or GitHub files. It is checked by the Cloudflare Worker.
