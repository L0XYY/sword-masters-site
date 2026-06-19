SWORD MASTERS - GITHUB PAGES + FIREBASE SETUP

1. Go to https://console.firebase.google.com and create a project.
2. In Firebase, go to Build > Realtime Database.
3. Create a database. Start in test mode for quick setup.
4. Go to Project settings > Your apps > Web app.
5. Register a web app, then copy the Firebase config.
6. Open firebase-config.js in this folder and paste your config.
7. Upload these files to GitHub Pages.
8. Open the site, click Admin, enter staff code:
   swordmastersontop
9. Save the countdown/links. Other devices and networks will update globally.

Optional Realtime Database rules for a simple public website:
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

Note: this is a lightweight client-side staff-code setup. For serious security,
use Firebase Authentication or Cloud Functions so the admin code is not visible
inside the website files.
