const launchDate = new Date("2026-12-31T18:00:00").getTime();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const dateText = document.getElementById("countdownDateText");
const launchStatus = document.getElementById("launchStatus");

function pad(number) {
  return String(number).padStart(2, "0");
}

function updateCountdown() {
  const remaining = launchDate - Date.now();

  if (remaining <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    dateText.textContent = "Sword Masters is live.";
    launchStatus.textContent = "Released";
    return;
  }

  daysEl.textContent = pad(Math.floor(remaining / (1000 * 60 * 60 * 24)));
  hoursEl.textContent = pad(Math.floor((remaining / (1000 * 60 * 60)) % 24));
  minutesEl.textContent = pad(Math.floor((remaining / (1000 * 60)) % 60));
  secondsEl.textContent = pad(Math.floor((remaining / 1000) % 60));
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealItems = document.querySelectorAll(".section-reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

document.querySelectorAll(".feature-card, .countdown-grid div, .status-panel").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(56,189,248,0.14), transparent 32%), rgba(12,17,29,0.72)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.background = "";
  });
});
