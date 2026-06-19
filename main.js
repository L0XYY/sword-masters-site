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

const storageKey = 'swordMastersAdminSettings';
const adminUnlockKey = 'swordMastersAdminUnlocked';
const adminStaffCode = 'swordmastersontop';
let settings = loadSettings();
let launchDate = getLaunchTime(settings.launchDate);
let lastStaffCode = '';
let globalApiAvailable = false;

function encodeSettings(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

function decodeSettings(value) {
  return JSON.parse(decodeURIComponent(escape(atob(value))));
}

function getSettingsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shared = params.get('settings');
  if (!shared) return null;
  try {
    return decodeSettings(shared);
  } catch {
    return null;
  }
}

function loadSettings() {
  const urlSettings = getSettingsFromUrl();
  if (urlSettings) {
    const merged = { ...defaultSettings, ...urlSettings };
    localStorage.setItem(storageKey, JSON.stringify(merged));
    return merged;
  }

  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings() {
  localStorage.setItem(storageKey, JSON.stringify(settings));
}

async function loadGlobalSettings() {
  try {
    const response = await fetch('/api/settings', { cache: 'no-store' });
    if (!response.ok) throw new Error('No global API');
    const globalSettings = await response.json();
    globalApiAvailable = true;
    settings = { ...defaultSettings, ...globalSettings };
    saveSettings();
    applySettings();
  } catch {
    globalApiAvailable = false;
  }
}

async function saveGlobalSettings(code) {
  const response = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, settings })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Could not save global settings.');
  }
  settings = { ...defaultSettings, ...(await response.json()) };
  saveSettings();
  applySettings();
}

function getLaunchTime(value) {
  if (!value) return NaN;
  const date = new Date(value);
  return date.getTime();
}


function isAdminUnlocked() {
  return sessionStorage.getItem(adminUnlockKey) === 'true';
}

function setAdminUnlocked(unlocked) {
  if (unlocked) {
    sessionStorage.setItem(adminUnlockKey, 'true');
  } else {
    sessionStorage.removeItem(adminUnlockKey);
    lastStaffCode = '';
  }
  updateAdminGate();
}

function updateAdminGate() {
  const gate = document.getElementById('adminGate');
  const form = document.getElementById('adminForm');
  const modal = document.getElementById('adminCodeModal');
  const unlocked = isAdminUnlocked();
  if (gate) gate.style.display = 'none';
  if (form) form.classList.toggle('admin-locked', !unlocked);
  if (modal) modal.classList.toggle('open', !unlocked && document.getElementById('tab-admin')?.classList.contains('active'));
}

function tryUnlockAdmin() {
  const input = document.getElementById('adminAccessCode');
  const message = document.getElementById('adminGateMessage');
  const code = (input?.value || '').trim();

  if (code === adminStaffCode) {
    lastStaffCode = code;
    setAdminUnlocked(true);
    if (adminMessage) adminMessage.textContent = globalApiAvailable ? 'Admin unlocked. Saves will update everyone globally.' : 'Admin unlocked. For true global updates, run with npm start on a Node host.';
    if (message) message.textContent = '';
    if (input) input.value = '';
    return;
  }

  if (message) message.textContent = 'Wrong staff code.';
  if (input) input.value = '';
}

function safeText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function applySettings() {
  safeText('siteTitle', settings.siteTitle);
  safeText('siteSubtitle', settings.subtitle);
  safeText('countdownTitle', settings.countdownTitle);

  document.querySelectorAll('.managed-link').forEach(link => {
    const key = link.dataset.linkKey;
    if (settings[key]) link.href = settings[key];
  });

  const extraLinks = document.getElementById('extraLinks');
  if (extraLinks) {
    extraLinks.innerHTML = '';
    settings.extraLinks.forEach(link => {
      if (!link.label || !link.url) return;
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'play-btn-big extra-btn';
      a.textContent = link.label;
      extraLinks.appendChild(a);
    });
  }

  launchDate = getLaunchTime(settings.launchDate);
  fillAdminForm();
  updateCountdown();
}

function fillAdminForm() {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  };

  setValue('adminSiteTitle', settings.siteTitle);
  setValue('adminSubtitle', settings.subtitle);
  setValue('adminCountdownTitle', settings.countdownTitle);
  setValue('adminLaunchDate', settings.launchDate);
  setValue('adminPlayUrl', settings.playUrl);
  setValue('adminGroupUrl', settings.groupUrl);
  setValue('adminDiscordUrl', settings.discordUrl);
  setValue('adminExtraLinks', settings.extraLinks.map(link => `${link.label} | ${link.url}`).join('\n'));
}

function parseExtraLinks(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [label, ...urlParts] = line.split('|');
      return { label: label.trim(), url: urlParts.join('|').trim() };
    })
    .filter(link => link.label && link.url);
}

function getFormSettings() {
  return {
    siteTitle: document.getElementById('adminSiteTitle').value.trim() || defaultSettings.siteTitle,
    subtitle: document.getElementById('adminSubtitle').value.trim() || defaultSettings.subtitle,
    countdownTitle: document.getElementById('adminCountdownTitle').value.trim() || defaultSettings.countdownTitle,
    launchDate: document.getElementById('adminLaunchDate').value || defaultSettings.launchDate,
    playUrl: document.getElementById('adminPlayUrl').value.trim() || defaultSettings.playUrl,
    groupUrl: document.getElementById('adminGroupUrl').value.trim() || defaultSettings.groupUrl,
    discordUrl: document.getElementById('adminDiscordUrl').value.trim() || defaultSettings.discordUrl,
    extraLinks: parseExtraLinks(document.getElementById('adminExtraLinks').value)
  };
}

function makePublishLink() {
  const url = new URL(window.location.href);
  url.searchParams.set('settings', encodeSettings(settings));
  return url.toString();
}

document.querySelectorAll('.tab-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.add('active');
    updateAdminGate();
  });
});


const unlockAdmin = document.getElementById('unlockAdmin');
if (unlockAdmin) {
  unlockAdmin.addEventListener('click', tryUnlockAdmin);
}

const adminAccessCode = document.getElementById('adminAccessCode');
if (adminAccessCode) {
  adminAccessCode.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      tryUnlockAdmin();
    }
  });
}

const lockAdmin = document.getElementById('lockAdmin');
if (lockAdmin) {
  lockAdmin.addEventListener('click', () => {
    setAdminUnlocked(false);
    const message = document.getElementById('adminGateMessage');
    if (message) message.textContent = 'Admin locked.';
  });
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const code = e.currentTarget.parentElement.querySelector('h3').innerText;
    navigator.clipboard.writeText(code);
    const originalText = e.currentTarget.innerText;
    e.currentTarget.innerText = 'Copied!';
    setTimeout(() => { e.currentTarget.innerText = originalText; }, 2000);
  });
});

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function pad(number) {
  return String(number).padStart(2, '0');
}

function updateCountdown() {
  const remaining = launchDate - Date.now();
  if (!launchDate || Number.isNaN(launchDate) || remaining <= 0) {
    if (daysEl) daysEl.textContent = '00';
    if (hoursEl) hoursEl.textContent = '00';
    if (minutesEl) minutesEl.textContent = '00';
    if (secondsEl) secondsEl.textContent = '00';
    return;
  }
  if (daysEl) daysEl.textContent = pad(Math.floor(remaining / (1000 * 60 * 60 * 24)));
  if (hoursEl) hoursEl.textContent = pad(Math.floor((remaining / (1000 * 60 * 60)) % 24));
  if (minutesEl) minutesEl.textContent = pad(Math.floor((remaining / (1000 * 60)) % 60));
  if (secondsEl) secondsEl.textContent = pad(Math.floor((remaining / 1000) % 60));
}

document.querySelectorAll('.faq-summary').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentElement.classList.toggle('open');
  });
});

const adminForm = document.getElementById('adminForm');
const adminMessage = document.getElementById('adminMessage');

if (adminForm) {
  adminForm.addEventListener('submit', (event) => {
    event.preventDefault();
    settings = getFormSettings();
    saveSettings();
    applySettings();
    if (globalApiAvailable) {
      try {
        await saveGlobalSettings(lastStaffCode);
        if (adminMessage) adminMessage.textContent = 'Saved globally. Everyone will see the update after refresh.';
      } catch (error) {
        if (adminMessage) adminMessage.textContent = error.message;
      }
    } else {
      if (adminMessage) adminMessage.textContent = 'Saved on this browser only. Deploy with npm start for global updates.';
    }
  });
}

const copyShareLink = document.getElementById('copyShareLink');
if (copyShareLink) {
  copyShareLink.addEventListener('click', async () => {
    settings = getFormSettings();
    saveSettings();
    applySettings();
    const link = makePublishLink();
    try {
      await navigator.clipboard.writeText(link);
      if (adminMessage) adminMessage.textContent = 'Publish link copied. Open that link on mobile to use the updated countdown.';
    } catch {
      if (adminMessage) adminMessage.textContent = link;
    }
  });
}

const resetAdmin = document.getElementById('resetAdmin');
if (resetAdmin) {
  resetAdmin.addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    settings = { ...defaultSettings };
    applySettings();
    if (adminMessage) adminMessage.textContent = 'Reset back to the original settings.';
  });
}

applySettings();
loadGlobalSettings();
updateAdminGate();
setInterval(updateCountdown, 1000);
setInterval(loadGlobalSettings, 30000);
console.log('Sword Masters loaded.');
