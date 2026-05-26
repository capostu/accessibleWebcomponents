// Initialisierung: Alle Menüleisten auf der Seite einrichten
window.addEventListener('load', function () {
  const menubars = document.querySelectorAll('.menubar');
  menubars.forEach((menubar) => new MenuBar(menubar));
});

class MenuBar {
  constructor(rootNode) {
    this.root      = rootNode;
    this.openIndex = null;  // Index des aktuell geöffneten Untermenüs
    this.useArrows = true;  // Pfeiltasten-Navigation aktiv?

    // Alle Top-Level-Elemente: sowohl Links als auch Buttons mit Untermenü
    this.topItems = [
      ...this.root.querySelectorAll('.nav-link, button[aria-expanded][aria-controls]'),
    ];

    // Parallel-Array: enthält das zugehörige <ul>-Untermenü oder null (bei Links)
    this.submenus = [];

    this.topItems.forEach((item) => {
      const isButton =
        item.tagName.toLowerCase() === 'button' &&
        item.hasAttribute('aria-controls');

      if (isButton) {
        const submenu = item.parentNode.querySelector('ul');

        if (submenu) {
          this.submenus.push(submenu);

          // Untermenü initial schließen
          item.setAttribute('aria-expanded', 'false');
          this.setSubmenuVisibility(submenu, false);

          // Klick, Tastatur und Hover am Button
          item.addEventListener('click',      this.onButtonClick.bind(this));
          item.addEventListener('keydown',    this.onButtonKeyDown.bind(this));
          item.addEventListener('mouseenter', this.onButtonHover.bind(this));
          item.addEventListener('mouseleave', this.onButtonHoverLeave.bind(this));

          // Tastatur innerhalb des Untermenüs
          submenu.addEventListener('keydown', this.onSubmenuKeyDown.bind(this));

          // Untermenü schließen, wenn Maus es verlässt ohne zum Button zurückzukehren
          submenu.addEventListener('mouseleave', (event) => {
            if (!item.contains(event.relatedTarget)) {
              this.toggleSubmenu(this.openIndex, false);
            }
          });
        }
      } else {
        // Einfacher Link – kein Untermenü
        this.submenus.push(null);
        item.addEventListener('keydown', this.onLinkKeyDown.bind(this));
      }
    });

    // Menü schließen, wenn der Fokus die gesamte Menüleiste verlässt
    this.root.addEventListener('focusout', this.onFocusLeave.bind(this));
  }

  // Bewegt den Fokus per Pfeiltaste innerhalb einer Liste von Elementen
  moveFocusByKey(event, items, currentIndex) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        if (currentIndex > -1) {
          items[Math.max(0, currentIndex - 1)].focus();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        if (currentIndex > -1) {
          items[Math.min(items.length - 1, currentIndex + 1)].focus();
        }
        break;
      case 'Home':
        event.preventDefault();
        items[0].focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1].focus();
        break;
    }
  }

  // Fokus hat die Menüleiste verlassen → offenes Untermenü schließen
  onFocusLeave(event) {
    const focusStillInMenu = this.root.contains(event.relatedTarget);
    if (!focusStillInMenu && this.openIndex !== null) {
      this.toggleSubmenu(this.openIndex, false);
    }
  }

  // Klick auf einen Top-Level-Button → Untermenü öffnen/schließen,
  // beim Öffnen direkt erstes Element fokussieren
  onButtonClick(event) {
    const button      = event.target;
    const buttonIndex = this.topItems.indexOf(button);
    const isOpen      = button.getAttribute('aria-expanded') === 'true';

    this.toggleSubmenu(buttonIndex, !isOpen);

    if (!isOpen) {
      this.submenus[buttonIndex]?.querySelector('a')?.focus();
    }
  }

  // Tastatur am Top-Level-Button
  onButtonKeyDown(event) {
    const currentIndex = this.topItems.indexOf(document.activeElement);

    if (event.key === 'Escape') {
      // Untermenü schließen
      this.toggleSubmenu(this.openIndex, false);
    } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      // Untermenü öffnen und direkt erstes Element fokussieren
      event.preventDefault();
      this.toggleSubmenu(currentIndex, true);
      this.submenus[currentIndex]?.querySelector('a')?.focus();
    } else if (this.useArrows) {
      // Navigation zwischen Top-Level-Einträgen
      this.moveFocusByKey(event, this.topItems, currentIndex);
    }
  }

  // Tastatur an einem Top-Level-Link (ohne Untermenü)
  onLinkKeyDown(event) {
    const currentIndex = this.topItems.indexOf(document.activeElement);
    if (this.useArrows) {
      this.moveFocusByKey(event, this.topItems, currentIndex);
    }
  }

  // Tastatur innerhalb eines geöffneten Untermenüs
  onSubmenuKeyDown(event) {
    if (this.openIndex === null) return;

    const submenuLinks = [...this.submenus[this.openIndex].querySelectorAll('a')];
    const currentIndex = submenuLinks.indexOf(document.activeElement);

    if (event.key === 'Escape') {
      // Fokus zurück auf den auslösenden Button
      this.topItems[this.openIndex].focus();
      this.toggleSubmenu(this.openIndex, false);
    } else if (this.useArrows) {
      this.moveFocusByKey(event, submenuLinks, currentIndex);
    }
  }

  // Hover öffnet das Untermenü – Fokus bleibt auf dem Button,
  // damit Screenreader den aria-expanded-Wechsel korrekt ansagen
  onButtonHover(event) {
    const buttonIndex = this.topItems.indexOf(event.target);
    this.toggleSubmenu(buttonIndex, true);
  }

  // Hover verlässt den Button → nur schließen, wenn der Cursor
  // nicht direkt ins Untermenü wandert
  onButtonHoverLeave(event) {
    const submenu = this.submenus[this.topItems.indexOf(event.target)];
    if (submenu && !submenu.contains(event.relatedTarget)) {
      this.toggleSubmenu(this.openIndex, false);
    }
  }

  // Öffnet oder schließt das Untermenü am angegebenen Index
  toggleSubmenu(index, open) {
    // Zuerst das aktuell offene Untermenü schließen (falls ein anderes geöffnet werden soll)
    if (this.openIndex !== index) {
      this.toggleSubmenu(this.openIndex, false);
    }

    if (this.topItems[index]) {
      this.openIndex = open ? index : null;
      this.topItems[index].setAttribute('aria-expanded', open);
      this.setSubmenuVisibility(this.submenus[index], open);
    }
  }

  // Zeigt oder versteckt ein Untermenü-Element
  setSubmenuVisibility(submenu, visible) {
    if (submenu) {
      submenu.style.display = visible ? 'block' : 'none';
    }
  }

  // Schließt das aktuell offene Untermenü (z.B. von außen aufrufbar)
  close() {
    this.toggleSubmenu(this.openIndex, false);
  }

  // Pfeiltasten-Navigation ein- oder ausschalten
  setArrowKeyNavigation(enabled) {
    this.useArrows = enabled;
  }
} 