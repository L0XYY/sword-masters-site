const ADMIN_CODE = "hallofevolutionsontop";

const defaultCountdown = {
  title: "Sword Masters Launch",
  subtitle: "Countdown updates every second for all visitors.",
  target: "2026-06-20T16:00"
};

function getCountdownSettings() {
  const saved = localStorage.getItem("swordmastersCountdown");
  if (!saved) return defaultCountdown;

  try {
    return { ...defaultCountdown, ...JSON.parse(saved) };
  } catch {
    return defaultCountdown;
  }
}

function saveCountdownSettings(settings) {
  localStorage.setItem("swordmastersCountdown", JSON.stringify(settings));
}

function updateCountdown() {
  const settings = getCountdownSettings();
  const targetDate = new Date(settings.target);
  const now = new Date();
  const difference = targetDate - now;

  const title = document.getElementById("countdownTitle");
  const subtitle = document.getElementById("countdownSubtitle");
  const dateText = document.getElementById("countdownDateText");
  const launchStatus = document.getElementById("launchStatus");

  if (title) title.textContent = settings.title;
  if (subtitle) subtitle.textContent = settings.subtitle;
  if (dateText) dateText.textContent = "Target: " + targetDate.toLocaleString();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  if (difference <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    if (launchStatus) launchStatus.textContent = "Live";
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

function unlockAdmin() {
  const code = document.getElementById("adminCode").value.trim();
  const error = document.getElementById("adminError");

  if (code !== ADMIN_CODE) {
    error.textContent = "Wrong admin code.";
    return;
  }

  document.getElementById("lockedPanel").classList.add("hidden");
  document.getElementById("settingsPanel").classList.remove("hidden");
  loadAdminSettings();
}

function loadAdminSettings() {
  const settings = getCountdownSettings();

  const titleInput = document.getElementById("titleInput");
  const dateInput = document.getElementById("dateInput");
  const subtitleInput = document.getElementById("subtitleInput");
  const currentSettings = document.getElementById("currentSettings");

  if (titleInput) titleInput.value = settings.title;
  if (dateInput) dateInput.value = settings.target;
  if (subtitleInput) subtitleInput.value = settings.subtitle;
  if (currentSettings) {
    currentSettings.textContent = `${settings.title} — ${new Date(settings.target).toLocaleString()}`;
  }
}

function saveCountdown() {
  const title = document.getElementById("titleInput").value.trim() || defaultCountdown.title;
  const target = document.getElementById("dateInput").value || defaultCountdown.target;
  const subtitle = document.getElementById("subtitleInput").value.trim() || defaultCountdown.subtitle;

  saveCountdownSettings({ title, target, subtitle });
  loadAdminSettings();
  alert("Countdown saved in this browser.");
}

function resetCountdown() {
  localStorage.removeItem("swordmastersCountdown");
  loadAdminSettings();
  alert("Countdown reset.");
}

const cards = document.querySelectorAll(".card, .step, .feature-row, .game-card, .countdown-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.15 });

cards.forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(18px)";
  card.style.transition = "opacity .55s ease, transform .55s ease, border-color .25s ease";
  observer.observe(card);
});

updateCountdown();
setInterval(updateCountdown, 1000);

if (document.getElementById("currentSettings")) {
  loadAdminSettings();
}
