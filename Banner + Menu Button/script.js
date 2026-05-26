const dialog = document.getElementById("cookieDialog");
const accBtn = document.getElementById("acceptBtn");
const decBtn = document.getElementById("declineBtn");

/*  Modal Dialog */
//Zeit-intervall zur Simulation
setTimeout(() => dialog.showModal(), 600);

accBtn.addEventListener("click", () => {
//Anweisung A, bei Annahme der Richtlinien
  dialog.close();
});

decBtn.addEventListener("click", () => {
//Anweisung B, bei Ablehnung der Richtlinien
dialog.close();
  });

//suche aller Elemente innerhalb des Dialoges die per Tastatur fokussierbar sind
const focusableElements = dialog.querySelectorAll(
"button, [href], input, select, textarea, [tabindex]:not([tabindex=’-1’])"
);

//Festellung erstes & letztes Element in der Fokusreihenfolge des Dialoges
const firstElement = focusableElements[0];
const lastElement = focusableElements[focusableElements.length - 1];

//lauscht auf jeden Tastendruck innerhalb des Dialogs
dialog.addEventListener("keydown", (event) => {
  //überprüfe ob Tab gedrückt wurde
  if (event.key !== "Tab") return; 
  //Element, auf dem der Fokus aktuell sein muss, damit überhaupt etwas passiert
  const focusTarget = event.shiftKey ? firstElement : lastElement;
  // Element, das als nächstes den Fokus bekommen soll
  const activeTarget = event.shiftKey ? lastElement : firstElement;

  //wenn der Nutzer am Ende der Fokusreihenfolge gelangt
  if (document.activeElement === focusTarget) {
    event.preventDefault(); //verhindere Browser-Standardverhalten
    activeTarget.focus(); //setzt Fokus auf den Anfang der Fokusreihenfolge
  }
});

                  
/* Menu Button */
const btn   = document.getElementById('menu-btn');
const menu  = document.getElementById('menu');
const items = () => Array.from(menu.querySelectorAll('[role="menuitem"]'));

function openMenu() {
  menu.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
  const first = items()[0];
  items().forEach((el, i) => el.tabIndex = i === 0 ? 0 : -1);
  first?.focus();
}

function closeMenu(returnFocus = true) {
  menu.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
  items().forEach(el => el.tabIndex = -1);
  if (returnFocus) btn.focus();
}

function moveFocus(dir) {
  const list = items();
  const next = (list.indexOf(document.activeElement) + dir + list.length) % list.length;
  list.forEach(el => el.tabIndex = -1);
  list[next].tabIndex = 0;
  list[next].focus();
}

btn.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
btn.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); openMenu(); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); openMenu(); setTimeout(() => moveFocus(-1), 0); }
});
menu.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); moveFocus(-1); }
  if (e.key === 'Home')      { e.preventDefault(); moveFocus(-items().indexOf(document.activeElement)); }
  if (e.key === 'End')       { e.preventDefault(); moveFocus(items().length - 1 - items().indexOf(document.activeElement)); }
  if (e.key === 'Escape')    { closeMenu(); }
  if (e.key === 'Tab')       { closeMenu(false); }
});
document.addEventListener('click', e => {
  if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu(false);
});