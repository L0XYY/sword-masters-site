import './style.css';

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
let settings = loadSettings();
let launchDate = new Date(settings.launchDate).getTime();

function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings() {
  localStorage.setItem(storageKey, JSON.stringify(settings));
}

function applySettings() {
  document.getElementById('siteTitle').textContent = settings.siteTitle;
  document.getElementById('siteSubtitle').textContent = settings.subtitle;
  document.getElementById('countdownTitle').textContent = settings.countdownTitle;

  document.querySelectorAll('.managed-link').forEach(link => {
    const key = link.dataset.linkKey;
    if (settings[key]) link.href = settings[key];
  });

  const extraLinks = document.getElementById('extraLinks');
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

  launchDate = new Date(settings.launchDate).getTime();
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

const tabBtns = document.querySelectorAll('.tab-item');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-target');
    document.getElementById(targetId).classList.add('active');
  });
});

const copyBtns = document.querySelectorAll('.copy-btn');
copyBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const code = e.target.parentElement.querySelector('h3').innerText;
    navigator.clipboard.writeText(code);
    const originalText = e.target.innerText;
    e.target.innerText = 'Copied!';
    setTimeout(() => {
      e.target.innerText = originalText;
    }, 2000);
  });
});

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const launchStatus = document.getElementById('launchStatus');

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
    if (launchStatus) {
      launchStatus.textContent = 'Online';
      launchStatus.classList.add('text-green');
    }
    return;
  }

  if (daysEl) daysEl.textContent = pad(Math.floor(remaining / (1000 * 60 * 60 * 24)));
  if (hoursEl) hoursEl.textContent = pad(Math.floor((remaining / (1000 * 60 * 60)) % 24));
  if (minutesEl) minutesEl.textContent = pad(Math.floor((remaining / (1000 * 60)) % 60));
  if (secondsEl) secondsEl.textContent = pad(Math.floor((remaining / 1000) % 60));
}

const faqBtns = document.querySelectorAll('.faq-summary');
faqBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentElement.classList.toggle('open');
  });
});

const adminForm = document.getElementById('adminForm');
const adminMessage = document.getElementById('adminMessage');

if (adminForm) {
  adminForm.addEventListener('submit', (event) => {
    event.preventDefault();

    settings = {
      siteTitle: document.getElementById('adminSiteTitle').value.trim() || defaultSettings.siteTitle,
      subtitle: document.getElementById('adminSubtitle').value.trim() || defaultSettings.subtitle,
      countdownTitle: document.getElementById('adminCountdownTitle').value.trim() || defaultSettings.countdownTitle,
      launchDate: document.getElementById('adminLaunchDate').value || defaultSettings.launchDate,
      playUrl: document.getElementById('adminPlayUrl').value.trim() || defaultSettings.playUrl,
      groupUrl: document.getElementById('adminGroupUrl').value.trim() || defaultSettings.groupUrl,
      discordUrl: document.getElementById('adminDiscordUrl').value.trim() || defaultSettings.discordUrl,
      extraLinks: parseExtraLinks(document.getElementById('adminExtraLinks').value)
    };

    saveSettings();
    applySettings();
    adminMessage.textContent = 'Saved! Your changes are live on this browser.';
  });
}

const resetAdmin = document.getElementById('resetAdmin');
if (resetAdmin) {
  resetAdmin.addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    settings = { ...defaultSettings };
    applySettings();
    adminMessage.textContent = 'Reset back to the original settings.';
  });
}

applySettings();
setInterval(updateCountdown, 1000);

console.log('Sword Masters Repository Loaded.');
