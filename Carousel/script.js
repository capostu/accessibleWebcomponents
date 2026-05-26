const TOTAL    = 5;
const INTERVAL = 4000;  // Millisekunden pro Folie

let current  = 0;
let paused   = false;
let timer    = null;

const track    = document.getElementById('slide-track');
const btnPause = document.getElementById('btn-pause');
const btnPrev  = document.getElementById('btn-prev');
const btnNext  = document.getElementById('btn-next');
const dots     = document.querySelectorAll('.dot-group [role="tab"]');
const status   = document.getElementById('slide-status');
const progBar  = document.getElementById('progress-bar');

const slideLabels = [
  'Barrierefreiheit im Web',
  'Semantisches HTML',
  'Tastaturnavigation',
  'ARIA-Rollen und -Attribute',
  'Farbkontrast und Lesbarkeit'
];


function goTo(index, announce = true) {
  current = (index + TOTAL) % TOTAL;

  // Slide-Track verschieben
  track.style.transform = `translateX(-${current * 100}%)`;

  // Dots aktualisieren
  dots.forEach((d, i) =>
    d.setAttribute('aria-selected', i === current ? 'true' : 'false')
  );

  // Screenreader-Ansage über die Live-Region
  if (announce) {
    status.textContent =
      `Folie ${current + 1} von ${TOTAL}: ${slideLabels[current]}`;
  }

  resetProgress();
}


function resetProgress() {
  // Animation zurücksetzen, dann neu starten
  progBar.style.transition = 'none';
  progBar.style.width = '0%';

  if (!paused) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progBar.style.transition = `width ${INTERVAL}ms linear`;
        progBar.style.width = '100%';
      });
    });
  }
}


function startAuto() {
  clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), INTERVAL);
  resetProgress();
}

function stopAuto() {
  clearInterval(timer);
  // Fortschrittsbalken einfrieren
  progBar.style.transition = 'none';
  progBar.style.width = '0%';
}


function togglePause() {
  paused = !paused;

  if (paused) {
    stopAuto();
    btnPause.setAttribute('aria-label', 'Automatische Wiedergabe starten');
    btnPause.textContent = '▶';
    status.textContent = 'Automatische Wiedergabe pausiert.';
  } else {
    startAuto();
    btnPause.setAttribute('aria-label', 'Automatische Wiedergabe pausieren');
    btnPause.textContent = '⏸';
    status.textContent = 'Automatische Wiedergabe gestartet.';
  }
}


btnPause.addEventListener('click', togglePause);

btnPrev.addEventListener('click', () => {
  goTo(current - 1);
  if (!paused) startAuto();
});

btnNext.addEventListener('click', () => {
  goTo(current + 1);
  if (!paused) startAuto();
});

// Dot-Navigation: Klick und Pfeiltasten (Roving Tabindex per tablist-Pattern)
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    goTo(i);
    if (!paused) startAuto();
  });

  dot.addEventListener('keydown', (e) => {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % TOTAL;
    if (e.key === 'ArrowLeft')  next = (i - 1 + TOTAL) % TOTAL;
    if (e.key === 'Home')       next = 0;
    if (e.key === 'End')        next = TOTAL - 1;

    if (next !== i) {
      e.preventDefault();
      dots[next].focus();
      goTo(next);
      if (!paused) startAuto();
    }
  });
});

// Autoplay pausieren bei Hover und Fokus (WCAG 2.1 – Bewegung)
const carousel = document.getElementById('carousel');

carousel.addEventListener('mouseenter', () => { if (!paused) stopAuto(); });
carousel.addEventListener('mouseleave', () => { if (!paused) startAuto(); });

carousel.addEventListener('focusin', () => { if (!paused) stopAuto(); });
carousel.addEventListener('focusout', (e) => {
  // Nur neu starten, wenn der Fokus das Karussell wirklich verlässt
  if (!carousel.contains(e.relatedTarget) && !paused) startAuto();
});

//initialize
goTo(0, false);
startAuto();