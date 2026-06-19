import './style.css';


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
    e.target.innerText = "Copied!";
    setTimeout(() => {
      e.target.innerText = originalText;
    }, 2000);
  });
});


const launchDate = new Date("2026-12-31T18:00:00").getTime();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const launchStatus = document.getElementById("launchStatus");

function pad(number) {
  return String(number).padStart(2, "0");
}

function updateCountdown() {
  const remaining = launchDate - Date.now();

  if (remaining <= 0) {
    if(daysEl) daysEl.textContent = "00";
    if(hoursEl) hoursEl.textContent = "00";
    if(minutesEl) minutesEl.textContent = "00";
    if(secondsEl) secondsEl.textContent = "00";
    if(launchStatus) {
      launchStatus.textContent = "Online";
      launchStatus.classList.add("text-green");
    }
    return;
  }

  if(daysEl) daysEl.textContent = pad(Math.floor(remaining / (1000 * 60 * 60 * 24)));
  if(hoursEl) hoursEl.textContent = pad(Math.floor((remaining / (1000 * 60 * 60)) % 24));
  if(minutesEl) minutesEl.textContent = pad(Math.floor((remaining / (1000 * 60)) % 60));
  if(secondsEl) secondsEl.textContent = pad(Math.floor((remaining / 1000) % 60));
}


updateCountdown();
setInterval(updateCountdown, 1000);


const faqBtns = document.querySelectorAll('.faq-summary');
faqBtns.forEach(btn => {
  btn.addEventListener('click', () => {

    btn.parentElement.classList.toggle('open');
  });
});

console.log("Sword Masters Repository Loaded.");
