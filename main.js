import { API_URL } from './api-config.js';

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

const adminUnlockKey = 'swordMastersAdminUnlocked';
let settings = { ...defaultSettings };
let launchDate = getLaunchTime(settings.launchDate);
let adminCode = '';

const apiBase = () => API_URL.replace(/\/$/, '');
const apiReady = () => API_URL && !API_URL.includes('PASTE_YOUR_API_URL_HERE');

async function apiGetSettings() {
  if (!apiReady()) throw new Error('API is not connected. Check api-config.js.');
  const res = await fetch(`${apiBase()}/settings`, { cache: 'no-store' });
  if (!res.ok) throw new Error('API read failed.');
  return await res.json();
}

async function apiVerifyCode(code) {
  if (!apiReady()) throw new Error('API is not connected. Check api-config.js.');
  const res = await fetch(`${apiBase()}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || 'Wrong staff code.');
  return data;
}

async function apiSaveSettings(code, newSettings) {
  if (!apiReady()) throw new Error('API is not connected. Check api-config.js.');
  const res = await fetch(`${apiBase()}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, settings: newSettings })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || 'API save failed.');
  return data;
}

async function loadGlobalSettings(showErrors = false) {
  try {
    const globalSettings = await apiGetSettings();
    delete globalSettings.updatedAt;
    settings = { ...defaultSettings, ...globalSettings };
    applySettings(false);
    setStatus('Connected to secure API. Changes are global for everyone.');
  } catch (error) {
    if (showErrors) setStatus(error.message);
  }
}

function getLaunchTime(value) {
  if (!value) return NaN;
  const fixed = String(value).length === 16 ? `${value}:00` : String(value);
  return new Date(fixed).getTime();
}

function isAdminUnlocked() { return sessionStorage.getItem(adminUnlockKey) === 'true' && adminCode; }
function setAdminUnlocked(unlocked) {
  if (unlocked) sessionStorage.setItem(adminUnlockKey, 'true');
  else { sessionStorage.removeItem(adminUnlockKey); adminCode = ''; }
  updateAdminGate();
}

function updateAdminGate() {
  const form = document.getElementById('adminForm');
  const modal = document.getElementById('adminCodeModal');
  const adminOpen = document.getElementById('tab-admin')?.classList.contains('active');
  const unlocked = isAdminUnlocked();
  if (form) form.classList.toggle('admin-locked', !unlocked);
  if (modal) modal.classList.toggle('open', !unlocked && adminOpen);
}

async function tryUnlockAdmin() {
  const input = document.getElementById('adminAccessCode');
  const message = document.getElementById('adminGateMessage');
  const code = (input?.value || '').trim();
  if (!code) return;
  try {
    await apiVerifyCode(code);
    adminCode = code;
    setAdminUnlocked(true);
    if (message) message.textContent = '';
    if (input) input.value = '';
    setStatus('Admin unlocked. Staff code is checked by Cloudflare.');
  } catch (error) {
    if (message) message.textContent = 'Wrong staff code or API not connected.';
    if (input) input.value = '';
  }
}

function closeAdminModal() {
  document.getElementById('adminCodeModal')?.classList.remove('open');
  document.querySelector('[data-target="tab-home"]')?.click();
}

function safeText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function setStatus(text) { const el = document.getElementById('adminMessage'); if (el && text) el.textContent = text; }

function applySettings(fillForm = true) {
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
    (settings.extraLinks || []).forEach(link => {
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
  if (fillForm) fillAdminForm();
  updateCountdown();
}

function fillAdminForm() {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = value || '';
  };
  setValue('adminSiteTitle', settings.siteTitle);
  setValue('adminSubtitle', settings.subtitle);
  setValue('adminCountdownTitle', settings.countdownTitle);
  setValue('adminLaunchDate', settings.launchDate);
  setValue('adminPlayUrl', settings.playUrl);
  setValue('adminGroupUrl', settings.groupUrl);
  setValue('adminDiscordUrl', settings.discordUrl);
  setValue('adminExtraLinks', (settings.extraLinks || []).map(link => `${link.label} | ${link.url}`).join('\n'));
}

function parseExtraLinks(text) {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const [label, ...urlParts] = line.split('|');
    return { label: label.trim(), url: urlParts.join('|').trim() };
  }).filter(link => link.label && link.url);
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

function pad(number) { return String(number).padStart(2, '0'); }
function updateCountdown() {
  const remaining = launchDate - Date.now();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!launchDate || Number.isNaN(launchDate) || remaining <= 0) {
    if (daysEl) daysEl.textContent = '00';
    if (hoursEl) hoursEl.textContent = '00';
    if (minutesEl) minutesEl.textContent = '00';
    if (secondsEl) secondsEl.textContent = '00';
    return;
  }
  if (daysEl) daysEl.textContent = pad(Math.floor(remaining / 86400000));
  if (hoursEl) hoursEl.textContent = pad(Math.floor((remaining / 3600000) % 24));
  if (minutesEl) minutesEl.textContent = pad(Math.floor((remaining / 60000) % 60));
  if (secondsEl) secondsEl.textContent = pad(Math.floor((remaining / 1000) % 60));
}

document.querySelectorAll('.tab-item').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const target = document.getElementById(btn.dataset.target);
  if (target) target.classList.add('active');
  updateAdminGate();
}));

document.getElementById('unlockAdmin')?.addEventListener('click', tryUnlockAdmin);
document.getElementById('closeAdminModal')?.addEventListener('click', closeAdminModal);
document.getElementById('adminAccessCode')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); tryUnlockAdmin(); }
});
document.getElementById('lockAdmin')?.addEventListener('click', () => setAdminUnlocked(false));

document.querySelectorAll('.copy-btn').forEach(btn => btn.addEventListener('click', e => {
  const code = e.currentTarget.parentElement.querySelector('h3').innerText;
  navigator.clipboard.writeText(code);
  const originalText = e.currentTarget.innerText;
  e.currentTarget.innerText = 'Copied!';
  setTimeout(() => { e.currentTarget.innerText = originalText; }, 2000);
}));

document.querySelectorAll('.faq-summary').forEach(btn => btn.addEventListener('click', () => btn.parentElement.classList.toggle('open')));

const adminForm = document.getElementById('adminForm');
if (adminForm) {
  adminForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!isAdminUnlocked()) { setStatus('Unlock admin first.'); return; }
    settings = getFormSettings();
    applySettings(false);
    try {
      await apiSaveSettings(adminCode, settings);
      setStatus('Saved globally through Cloudflare API. Everyone will see the update.');
      fillAdminForm();
    } catch (error) { setStatus(error.message); }
  });
}

document.getElementById('resetAdmin')?.addEventListener('click', async () => {
  if (!isAdminUnlocked()) { setStatus('Unlock admin first.'); return; }
  settings = { ...defaultSettings };
  try {
    await apiSaveSettings(adminCode, settings);
    applySettings();
    setStatus('Reset globally.');
  } catch (error) { setStatus(error.message); }
});

document.getElementById('copyShareLink')?.addEventListener('click', async () => {
  await navigator.clipboard.writeText(location.origin + location.pathname);
  setStatus('Site link copied. This link reads live API settings.');
});

applySettings();
updateAdminGate();
loadGlobalSettings(true);
setInterval(updateCountdown, 1000);
setInterval(() => loadGlobalSettings(false), 5000);
console.log('Sword Masters loaded with secure Cloudflare API settings.');
