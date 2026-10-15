'use strict';
const categories = window.VITAL_MENU;
const productDialog = document.querySelector('#product-dialog');
const aboutDialog = document.querySelector('#about-dialog');
const labelToggle = document.querySelector('#labels');
const tray = document.querySelector('#category-tray');
let opener;
function openDialog(dialog, trigger) { opener = trigger; dialog.showModal(); }
categories.forEach((category, index) => {
  const button = document.createElement('button');
  button.className = `product category-${category.id}`;
  button.type = 'button'; button.dataset.category = category.id;
  button.setAttribute('aria-label', `Explorar ${category.name}`);
  button.setAttribute('aria-haspopup', 'dialog');
  const art = new Image(260, 420);
  art.src = category.art; art.alt = ''; art.draggable = false;
  if (index > 2) art.loading = 'lazy';
  const label = document.createElement('span');
  label.className = 'product-name'; label.textContent = category.name;
  const hint = document.createElement('span');
  hint.className = 'touch-hint'; hint.textContent = '+'; hint.setAttribute('aria-hidden', 'true');
  button.append(art, label, hint); tray.append(button);
  button.addEventListener('click', () => {
    document.querySelector('#product-title').textContent = category.name;
    document.querySelector('#detail-art').src = category.art;
    const menu = document.querySelector('#menu-items'); menu.replaceChildren();
    category.groups.forEach(group => {
      const section = document.createElement('section'); section.className = 'menu-group';
      if (group.name) { const title = document.createElement('h3'); title.textContent = group.name; section.append(title); }
      const list = document.createElement('ul');
      group.items.forEach(item => { const li = document.createElement('li'); li.textContent = item; list.append(li); });
      section.append(list); menu.append(section);
    });
    document.querySelector('#category-note').textContent = (category.note ? category.note + ' ' : '') + 'Precios y tamaños pendientes de confirmar. Ilustración representativa, no receta exacta.';
    productDialog.querySelector('details').open = false;
    productDialog.scrollTop = 0;
    openDialog(productDialog, button);
  });
});
labelToggle.addEventListener('click', () => {
  const show = labelToggle.getAttribute('aria-pressed') !== 'true';
  labelToggle.setAttribute('aria-pressed', String(show));
  labelToggle.setAttribute('aria-label', `${show ? 'Ocultar' : 'Mostrar'} nombres de las categorías`);
  labelToggle.title = `${show ? 'Ocultar' : 'Mostrar'} nombres`;
  document.body.classList.toggle('show-labels', show);
});
['about', 'details'].forEach(id => { const trigger = document.getElementById(id); trigger.addEventListener('click', () => openDialog(aboutDialog, trigger)); });
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
});
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
function updateTray() { previous.disabled = tray.scrollLeft <= 4; next.disabled = tray.scrollLeft + tray.clientWidth >= tray.scrollWidth - 4; }
function shiftTray(direction) { tray.scrollBy({ left: direction * tray.clientWidth * .76, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
previous.addEventListener('click', () => shiftTray(-1)); next.addEventListener('click', () => shiftTray(1));
tray.addEventListener('scroll', updateTray, { passive: true }); window.addEventListener('resize', updateTray); updateTray();
