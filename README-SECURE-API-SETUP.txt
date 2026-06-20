SWORD MASTERS - SAFER ADMIN API SETUP

This version removes the staff code from your public GitHub Pages files.
The website calls a private API. The API checks the staff code and saves global settings.

WHAT CHANGED
- Staff code is NOT in main.js anymore.
- Admin popup has a Close button.
- Countdown and links are global for everyone.
- Uses a Cloudflare Worker + KV storage as the backend.

FILES FOR GITHUB PAGES
Upload these to GitHub Pages:
- index.html
- style.css
- main.js
- api-config.js
- logo.png
Keep your CNAME file if you use a custom domain.

FILES FOR CLOUDFLARE WORKER
Use worker.js for your API.

CLOUDFLARE SETUP
1. Go to https://dash.cloudflare.com
2. Workers & Pages > Create > Worker
3. Paste the contents of worker.js and deploy.
4. Go to Worker Settings > Variables.
5. Add a secret variable:
   Name: STAFF_CODE
   Value: swordmastersontop
6. Go to Storage & Databases > KV > Create namespace.
   Name it: swordmasters-settings
7. Go back to your Worker > Settings > Bindings.
8. Add KV namespace binding:
   Variable name: SETTINGS
   KV namespace: swordmasters-settings
9. Deploy again.
10. Copy your Worker URL, for example:
    https://swordmasters-api.yourname.workers.dev
11. Open api-config.js and replace PASTE_YOUR_API_URL_HERE with that URL.
12. Upload api-config.js to GitHub and commit.

TEST
1. Open your GitHub Pages site.
2. Click Admin.
3. Enter staff code: swordmastersontop
4. Save the countdown/links.
5. Test in incognito or on mobile data.

IMPORTANT
This is much safer than putting the staff code in the frontend, but anyone with the staff code can still edit the site.
For maximum security, use real accounts/login later.
