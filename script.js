const cards = document.querySelectorAll('.card, .step, .feature-row, .game-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

cards.forEach((card) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(18px)';
  card.style.transition = 'opacity .55s ease, transform .55s ease, border-color .25s ease';
  observer.observe(card);
});
