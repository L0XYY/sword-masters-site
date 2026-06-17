const launchDate = new Date("2026-12-31T18:00:00").getTime();

const ids = ["days", "hours", "minutes", "seconds"];
const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const dateText = document.getElementById("countdownDateText");

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const remaining = launchDate - Date.now();

  if (remaining <= 0) {
    els.days.textContent = "00";
    els.hours.textContent = "00";
    els.minutes.textContent = "00";
    els.seconds.textContent = "00";
    dateText.textContent = "Sword Masters is live.";
    return;
  }

  els.days.textContent = pad(Math.floor(remaining / (1000 * 60 * 60 * 24)));
  els.hours.textContent = pad(Math.floor((remaining / (1000 * 60 * 60)) % 24));
  els.minutes.textContent = pad(Math.floor((remaining / (1000 * 60)) % 60));
  els.seconds.textContent = pad(Math.floor((remaining / 1000) % 60));
}

updateCountdown();
setInterval(updateCountdown, 1000);

const sections = document.querySelectorAll(".hero, .section, footer");

sections.forEach(section => section.classList.add("reveal"));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.12 });

sections.forEach(section => observer.observe(section));
