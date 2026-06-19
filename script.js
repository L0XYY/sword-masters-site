const STORAGE_KEY = "swordMastersSiteConfig";

function getConfig() {
  const defaults = window.DEFAULT_SITE_CONFIG || {};
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

const config = getConfig();

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

document.querySelectorAll(".play-link").forEach(link => {
  link.href = config.playLink || "https://www.roblox.com";
});

const homeDescription = document.getElementById("homeDescription");
if (homeDescription && config.homeDescription) {
  homeDescription.textContent = config.homeDescription;
}

const updateMessage = document.getElementById("updateMessage");
if (updateMessage) {
  updateMessage.textContent = config.updateMessage || "No updates posted yet.";
}

const codeList = document.getElementById("codeList");
const codesIntro = document.getElementById("codesIntro");

if (codeList) {
  const codes = Array.isArray(config.codes) ? config.codes.filter(code => code.trim()) : [];

  if (codes.length) {
    codesIntro.textContent = "Redeem these active codes in game.";
    codeList.innerHTML = codes.map(code => `
      <div class="code-box">
        <span>${escapeHTML(code)}</span>
        <p>Active reward code.</p>
      </div>
    `).join("");
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const launchDate = new Date(config.countdownDate || "2026-12-31T18:00").getTime();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const dateText = document.getElementById("countdownDateText");
const countdownHeading = document.getElementById("countdownHeading");

function pad(number) {
  return String(number).padStart(2, "0");
}

function updateCountdown() {
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const remaining = launchDate - Date.now();

  if (Number.isNaN(launchDate)) {
    dateText.textContent = "Countdown date is not set correctly.";
    return;
  }

  if (remaining <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    dateText.textContent = "Sword Masters is live!";
    if (countdownHeading) countdownHeading.textContent = "Released!";
    return;
  }

  daysEl.textContent = pad(Math.floor(remaining / (1000 * 60 * 60 * 24)));
  hoursEl.textContent = pad(Math.floor((remaining / (1000 * 60 * 60)) % 24));
  minutesEl.textContent = pad(Math.floor((remaining / (1000 * 60)) % 60));
  secondsEl.textContent = pad(Math.floor((remaining / 1000) % 60));

  if (dateText) {
    const readableDate = new Date(launchDate).toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    dateText.textContent = `Target launch: ${readableDate}`;
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}
