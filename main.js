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
const adminStaffCode = 'swordmastersontop';
let settings = { ...defaultSettings };
let launchDate = getLaunchTime(settings.launchDate);
let lastStaffCode = '';
let globalApiAvailable = false;
let serverOffsetMs = 0;

function getLaunchTime(value) {
  if (!value) return NaN;
  const fixed = String(value).length === 16 ? `${value}:00` : String(value);
  return new Date(fixed).getTime();
}

function serverNow() {
  return Date.now() + serverOffsetMs;
}

async function loadGlobalSettings() {
  try {
    const response = await fetch('/api/settings?t=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('No global API');
    const globalSettings = await response.json();
    if (globalSettings.serverNow) serverOffsetMs = globalSettings.serverNow - Date.now();
    delete globalSettings.serverNow;
    globalApiAvailable = true;
    settings = { ...defaultSettings, ...globalSettings };
    applySettings(false);
    setStatus('Connected to global server.');
  } catch {
    globalApiAvailable = false;
    setStatus('Global server is not connected. If this is on static hosting, other devices cannot receive admin changes.');
  }
}

async function saveGlobalSettings(code) {
  const response = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ code, settings })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not save global settings. Make sure npm start is running on your host.');
  if (data.serverNow) serverOffsetMs = data.serverNow - Date.now();
  delete data.serverNow;
  settings = { ...defaultSettings, ...data };
  applySettings(false);
}

function isAdminUnlocked() {
  return sessionStorage.getItem(adminUnlockKey) === 'true';
}

function setAdminUnlocked(unlocked) {
  if (unlocked) sessionStorage.setItem(adminUnlockKey, 'true');
  else {
    sessionStorage.removeItem(adminUnlockKey);
    lastStaffCode = '';
  }
  updateAdminGate();
}

function updateAdminGate() {
  const form = document.getElementById('adminForm');
  const modal = document.getElementById('adminCodeModal');
  const unlocked = isAdminUnlocked();
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
    if (message) message.textContent = '';
    if (input) input.value = '';
    setStatus(globalApiAvailable ? 'Admin unlocked. Saves will update everyone globally.' : 'Admin unlocked, but global server is not connected.');
    return;
  }
  if (message) message.textContent = 'Wrong staff code.';
  if (input) input.value = '';
}

function safeText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setStatus(text) {
  const adminMessage = document.getElementById('adminMessage');
  if (adminMessage && text) adminMessage.textContent = text;
}

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
if (unlockAdmin) unlockAdmin.addEventListener('click', tryUnlockAdmin);
const adminAccessCode = document.getElementById('adminAccessCode');
if (adminAccessCode) adminAccessCode.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); tryUnlockAdmin(); } });
const lockAdmin = document.getElementById('lockAdmin');
if (lockAdmin) lockAdmin.addEventListener('click', () => setAdminUnlocked(false));

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', e => {
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
function pad(number) { return String(number).padStart(2, '0'); }
function updateCountdown() {
  const remaining = launchDate - serverNow();
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

document.querySelectorAll('.faq-summary').forEach(btn => btn.addEventListener('click', () => btn.parentElement.classList.toggle('open')));

const adminForm = document.getElementById('adminForm');
if (adminForm) {
  adminForm.addEventListener('submit', async event => {
    event.preventDefault();
    settings = getFormSettings();
    applySettings(false);
    if (!globalApiAvailable) {
      setStatus('Not saved: global API is not connected. You must deploy/run with npm start, not static hosting.');
      return;
    }
    try {
      await saveGlobalSettings(lastStaffCode || adminStaffCode);
      setStatus('Saved globally. Other devices and networks update automatically within a few seconds.');
      fillAdminForm();
    } catch (error) {
      setStatus(error.message);
    }
  });
}

const resetAdmin = document.getElementById('resetAdmin');
if (resetAdmin) {
  resetAdmin.addEventListener('click', async () => {
    settings = { ...defaultSettings };
    try {
      if (globalApiAvailable) await saveGlobalSettings(lastStaffCode || adminStaffCode);
      applySettings();
      setStatus('Reset globally.');
    } catch (error) { setStatus(error.message); }
  });
}

applySettings();
loadGlobalSettings();
updateAdminGate();
setInterval(updateCountdown, 1000);
setInterval(loadGlobalSettings, 3000);
console.log('Sword Masters loaded with server-authoritative global settings.');
