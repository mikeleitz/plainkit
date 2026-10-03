import { DataProvider } from '../src/provider.js';
import { LiveProvider } from '../src/live.js';
import {
  bindText,
  bindAttr,
  bindList,
  bindClass,
  setFieldError,
} from '../src/bind.js';
import { openDialog, closeDialog } from '../src/dialog.js';
import { initTabs } from '../src/tabs.js';
import { paintTimes, timeZone, noteZone } from '../src/time.js';

const rooms = new DataProvider({
  name: 'rooms',
  data: [
    { id: '1', title: 'Sprint 14 planning', meta: 'Team Atlas', state: 'live' },
    { id: '2', title: 'Design review', meta: 'Team Atlas', state: 'draft' },
  ],
});

const room = new DataProvider({
  name: 'room',
  data: {
    status: 'selecting',
    seconds: 42,
    people: [
      { id: 'a', name: 'Ada', role: 'lead', state: 'voted' },
      { id: 'b', name: 'Bela', role: 'voter', state: 'selecting' },
      { id: 'c', name: 'Cy', role: 'voter', state: 'voted' },
    ],
    options: [
      { id: 'o1', title: 'Unknown domain', category: 'knowledge', cost: '1' },
      { id: 'o2', title: 'Many services', category: 'size', cost: '2' },
      { id: 'o3', title: 'Hard rollback', category: 'risk', cost: '3' },
      { id: 'o4', title: 'New API', category: 'knowledge', cost: '1' },
    ],
    selected: ['o2'],
    choice: null,
    revealed: false,
    faces: [
      { value: '5', caption: 'Ada' },
      { value: '8', caption: 'Bela' },
      { value: '5', caption: 'Cy' },
    ],
  },
});

const invite = new DataProvider({
  name: 'invite',
  data: {
    url: 'https://example.test/join?code=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    qr: './invite-qr.svg',
  },
});

bindAttr('#invite-qr', invite, 'src', (e) => e.data && e.data.qr);
bindText('#invite-url', invite, (e) => (e.data && e.data.url) || '');

// No server: idle live catalogs send-dropped; timer needs a stand-in so tick can run.
const live = new LiveProvider({ name: 'room-socket' });

bindText('#live-status', live, (e) => e.status);
bindText('#live-meta', live, (e) => (e.meta && e.meta.source) || 'none');

bindList('#room-list', rooms, {
  template: '#tpl-room-row',
  items: (e) => e.data || [],
  apply(frag, item) {
    frag.querySelector('.pk-list-title').textContent = item.title;
    frag.querySelector('.pk-list-meta').textContent = item.meta;
    const pill = frag.querySelector('.pk-pill');
    pill.textContent = item.state;
    pill.classList.toggle('pk-pill-ok', item.state === 'live');
  },
});

/**
 * Stand-in socket so LiveProvider tick can run in the catalog.
 * An app omits `ws` and passes a real `url`.
 */
function DemoTimerSocket(_url) {
  const listeners = { open: [], message: [], close: [], error: [] };
  let readyState = 0;

  function emit(type, ev) {
    for (const fn of listeners[type] || []) fn(ev || {});
  }

  const ws = {
    get readyState() {
      return readyState;
    },
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    send() {},
    close() {
      readyState = 3;
      emit('close');
    },
  };

  queueMicrotask(() => {
    readyState = 1;
    emit('open');
    emit('message', {
      data: JSON.stringify({ type: 'snapshot', data: { seconds: 42 } }),
    });
  });
  return ws;
}

const timer = new LiveProvider({
  name: 'timer',
  url: 'wss://example.test/timer',
  ws: DemoTimerSocket,
  tick: 'seconds',
  data: { seconds: 42 },
});
timer.connect();

bindText('#room-status', room, (e) => (e.data && e.data.status) || '');
bindText('#room-pill', room, (e) => (e.data && e.data.status) || '');
bindClass('#room-pill', room, 'pk-pill-ok', (e) => e.data && e.data.status === 'revealed');
bindClass('#room-pill', room, 'pk-pill-warn', (e) => e.data && e.data.status === 'selecting');
bindText('#room-timer', timer, (e) => formatSeconds(e.data && e.data.seconds));

bindList('#roster', room, {
  template: '#tpl-person',
  items: (e) => (e.data && e.data.people) || [],
  apply(frag, item) {
    frag.querySelector('.pk-person-avatar').textContent = initial(item.name);
    frag.querySelector('.pk-person-name').textContent = item.name;
    frag.querySelector('.pk-person-role').textContent = item.role;
    const pill = frag.querySelector('.pk-pill');
    pill.textContent = item.state;
    pill.classList.toggle('pk-pill-ok', item.state === 'voted');
    pill.classList.toggle('pk-pill-warn', item.state === 'selecting');
  },
});

bindList('#option-grid', room, {
  template: '#tpl-option',
  items: (e) => (e.data && e.data.options) || [],
  apply(frag, item, evt) {
    const btn = frag.querySelector('.pk-selectable');
    const selected = ((evt.data && evt.data.selected) || []).includes(item.id);
    btn.dataset.id = item.id;
    btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    frag.querySelector('.pk-selectable-cat').textContent = item.category;
    frag.querySelector('.pk-selectable-title').textContent = item.title;
    frag.querySelector('.pk-selectable-cost').textContent = 'cost ' + item.cost;
  },
});

bindList('#choice-row', room, {
  template: '#tpl-choice',
  items: () => [
    { id: '0', label: '0' },
    { id: '?', label: '?' },
    { id: 'break', label: 'break' },
    { id: 'inf', label: 'inf' },
  ],
  apply(frag, item, evt) {
    const btn = frag.querySelector('.pk-choice');
    btn.dataset.id = item.id;
    btn.textContent = item.label;
    btn.setAttribute(
      'aria-pressed',
      evt.data && evt.data.choice === item.id ? 'true' : 'false'
    );
  },
});

bindList('#face-row', room, {
  template: '#tpl-face',
  items: (e) =>
    e.data && e.data.revealed ? e.data.faces : [],
  apply(frag, item) {
    frag.querySelector('.pk-face-value').textContent = item.value;
    frag.querySelector('.pk-face-caption').textContent = item.caption;
  },
});

initTabs('#demo-tabs');

const sheet = document.getElementById('sheet-menu');
const openSheet = document.getElementById('open-sheet');
if (sheet && openSheet) {
  openSheet.addEventListener('click', () => {
    openDialog(sheet);
    openSheet.setAttribute('aria-expanded', 'true');
  });
  document.getElementById('close-sheet').addEventListener('click', () => {
    closeDialog(sheet);
  });
  sheet.addEventListener('close', () => {
    openSheet.setAttribute('aria-expanded', 'false');
  });
  sheet.addEventListener('click', (evt) => {
    const box = sheet.getBoundingClientRect();
    const x = evt.clientX;
    const y = evt.clientY;
    if (x < box.left || x > box.right || y < box.top || y > box.bottom) {
      closeDialog(sheet);
    }
  });
  document.getElementById('sheet-new').addEventListener('click', () => {
    closeDialog(sheet);
    openDialog('#create-dialog');
  });
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const on = root.classList.toggle('pk-theme-light');
  document.getElementById('theme-toggle').textContent = on
    ? 'Dark theme'
    : 'Light theme';
});

document.getElementById('density-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const on = root.classList.toggle('pk-density-compact');
  document.getElementById('density-toggle').textContent = on
    ? 'Roomy'
    : 'Compact';
});

function setSinkZone(next, noteId) {
  const zone = timeZone(next);
  const pairs = [
    ['sink-zone-local', 'sink-zone-utc'],
    ['sheet-zone-local', 'sheet-zone-utc'],
  ];
  for (const [localId, utcId] of pairs) {
    const localBtn = document.getElementById(localId);
    const utcBtn = document.getElementById(utcId);
    if (localBtn) localBtn.setAttribute('aria-pressed', zone === 'local' ? 'true' : 'false');
    if (utcBtn) utcBtn.setAttribute('aria-pressed', zone === 'utc' ? 'true' : 'false');
  }
  paintTimes('#sink-activity', zone);
  if (noteId) noteZone(noteId, zone);
}
const sinkLocal = document.getElementById('sink-zone-local');
const sinkUtc = document.getElementById('sink-zone-utc');
const sheetLocal = document.getElementById('sheet-zone-local');
const sheetUtc = document.getElementById('sheet-zone-utc');
if (sinkLocal) sinkLocal.addEventListener('click', () => setSinkZone('local', '#sink-zone-note'));
if (sinkUtc) sinkUtc.addEventListener('click', () => setSinkZone('utc', '#sink-zone-note'));
if (sheetLocal) sheetLocal.addEventListener('click', () => setSinkZone('local', '#sheet-zone-note'));
if (sheetUtc) sheetUtc.addEventListener('click', () => setSinkZone('utc', '#sheet-zone-note'));
setSinkZone(timeZone());

document.getElementById('live-send-btn').addEventListener('click', () => {
  live.send({ type: 'vote', optionId: 'a1' });
});

document.getElementById('join-form').addEventListener('submit', (evt) => {
  evt.preventDefault();
  const field = document.getElementById('field-name');
  const name = evt.target.elements['name'].value.trim();
  if (!name) {
    setFieldError(field, 'Display name is required.');
    return;
  }
  setFieldError(field, '');
});

document.getElementById('dismiss-err').addEventListener('click', () => {
  document.getElementById('banner-err').hidden = true;
});

document.getElementById('open-create').addEventListener('click', () => {
  openDialog('#create-dialog');
});
document.getElementById('cancel-create').addEventListener('click', () => {
  closeDialog('#create-dialog');
});
document.getElementById('create-form').addEventListener('submit', (evt) => {
  evt.preventDefault();
  const title = evt.target.title.value.trim();
  if (!title) return;
  const list = (rooms.get() || []).slice();
  list.unshift({
    id: String(Date.now()),
    title,
    meta: 'Team Atlas',
    state: 'draft',
  });
  rooms.set(list);
  evt.target.reset();
  closeDialog('#create-dialog');
});

document.getElementById('option-grid').addEventListener('click', (evt) => {
  const btn = evt.target.closest('.pk-selectable');
  if (!btn) return;
  const data = { ...room.get() };
  const selected = new Set(data.selected || []);
  if (selected.has(btn.dataset.id)) selected.delete(btn.dataset.id);
  else selected.add(btn.dataset.id);
  data.selected = [...selected];
  room.set(data);
});

document.getElementById('choice-row').addEventListener('click', (evt) => {
  const btn = evt.target.closest('.pk-choice');
  if (!btn) return;
  const data = { ...room.get() };
  data.choice = data.choice === btn.dataset.id ? null : btn.dataset.id;
  room.set(data);
});

document.getElementById('reveal-btn').addEventListener('click', () => {
  const data = { ...room.get() };
  data.revealed = true;
  data.status = 'revealed';
  room.set(data);
});

document.getElementById('reset-room').addEventListener('click', () => {
  const data = { ...room.get() };
  data.revealed = false;
  data.status = 'selecting';
  data.selected = [];
  data.choice = null;
  room.set(data);
  timer.set({ seconds: 42 });
});

function formatSeconds(n) {
  const sec = typeof n === 'number' ? n : 0;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function initial(name) {
  const text = String(name || '?').trim();
  return text ? text[0].toUpperCase() : '?';
}
