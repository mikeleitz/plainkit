import { openDialog, closeDialog } from '../../src/dialog.js';
import { setFieldError } from '../../src/bind.js';
import { timeZone, noteZone } from '../../src/time.js';

const menu = document.getElementById('menu');
const openBtn = document.getElementById('open-menu');
const banner = document.getElementById('banner-ok');
const bannerCopy = document.getElementById('banner-ok-copy');

function setExpanded(on) {
  openBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
}

function setZone(next, note) {
  const zone = timeZone(next);
  const localBtn = document.getElementById('menu-zone-local');
  const utcBtn = document.getElementById('menu-zone-utc');
  if (localBtn) localBtn.setAttribute('aria-pressed', zone === 'local' ? 'true' : 'false');
  if (utcBtn) utcBtn.setAttribute('aria-pressed', zone === 'utc' ? 'true' : 'false');
  if (note) noteZone('#menu-zone-note', zone);
}

const menuLocal = document.getElementById('menu-zone-local');
const menuUtc = document.getElementById('menu-zone-utc');
if (menuLocal) menuLocal.addEventListener('click', () => setZone('local', true));
if (menuUtc) menuUtc.addEventListener('click', () => setZone('utc', true));
setZone(timeZone());

openBtn.addEventListener('click', () => {
  openDialog(menu);
  setExpanded(true);
});

document.getElementById('close-menu').addEventListener('click', () => {
  closeDialog(menu);
});

menu.addEventListener('close', () => {
  setExpanded(false);
});

menu.addEventListener('click', (evt) => {
  const box = menu.getBoundingClientRect();
  const x = evt.clientX;
  const y = evt.clientY;
  if (x < box.left || x > box.right || y < box.top || y > box.bottom) {
    closeDialog(menu);
  }
});

document.getElementById('menu-new').addEventListener('click', () => {
  closeDialog(menu);
  setFieldError('#field-title', '');
  openDialog('#create-dialog');
  const input = document.querySelector('#create-form [name="title"]');
  if (input) input.focus();
});

document.getElementById('cancel-create').addEventListener('click', () => {
  closeDialog('#create-dialog');
});

document.getElementById('create-form').addEventListener('submit', (evt) => {
  evt.preventDefault();
  const title = evt.target.title.value.trim();
  if (!title) {
    setFieldError('#field-title', 'Title is required.');
    return;
  }
  setFieldError('#field-title', '');
  bannerCopy.textContent = 'Created ' + title + '. The items page would list it.';
  banner.hidden = false;
  evt.target.reset();
  closeDialog('#create-dialog');
});
