import { DataProvider } from '../../src/provider.js';
import { bindList, bindHidden, bindText } from '../../src/bind.js';
import { formatTime, paintTimes, timeZone, noteZone } from '../../src/time.js';

const EVENTS = [
  {
    at: '2026-03-12T16:00:00Z',
    title: 'Saved the item.',
    meta: 'Account',
  },
  {
    at: '2026-03-12T11:30:00Z',
    title: 'Assigned the item.',
    meta: 'Account',
  },
  {
    at: '2026-03-11T09:15:00Z',
    title: 'Created the item.',
    meta: 'Account',
  },
];

const STEPS = ['created', 'assigned', 'review', 'closed'];
const params = new URLSearchParams(location.search);
const empty = params.get('empty') === '1';
const statusParam = params.get('status');
const status = STEPS.includes(statusParam) ? statusParam : 'review';

let zone = timeZone();

const item = new DataProvider({
  name: 'item',
  data: {
    title: 'Widget',
    status,
    events: empty ? [] : EVENTS,
  },
});

function eventsOf(e) {
  return (e.data && e.data.events) || [];
}

function setZone(next, note) {
  zone = timeZone(next);
  const localBtn = document.getElementById('zone-local');
  const utcBtn = document.getElementById('zone-utc');
  if (localBtn) localBtn.setAttribute('aria-pressed', zone === 'local' ? 'true' : 'false');
  if (utcBtn) utcBtn.setAttribute('aria-pressed', zone === 'utc' ? 'true' : 'false');
  paintTimes(document.getElementById('activity'), zone);
  if (note) noteZone('#zone-note', zone);
}

bindText('#item-title', item, (e) => (e.data && e.data.title) || 'Item');
bindHidden('#empty', item, (e) => eventsOf(e).length > 0);
bindHidden('#log-card', item, (e) => eventsOf(e).length === 0);
bindList('#activity', item, {
  template: '#tpl-event',
  items: eventsOf,
  apply(frag, event) {
    const time = frag.querySelector('time');
    const at = event.at || '';
    time.setAttribute('datetime', at);
    time.textContent = formatTime(at, zone) || at;
    frag.querySelector('.pk-timeline-title').textContent = event.title || '';
    frag.querySelector('.pk-timeline-meta').textContent = event.meta || '';
  },
});

function paintSteps(e) {
  const current = e.data && e.data.status;
  const idx = STEPS.indexOf(current);
  const root = document.getElementById('item-steps');
  if (!root) return;
  root.querySelectorAll('[data-step]').forEach((li) => {
    const i = STEPS.indexOf(li.getAttribute('data-step'));
    const now = i === idx && idx >= 0;
    li.classList.toggle('pk-steps-done', i >= 0 && i < idx);
    li.classList.toggle('pk-steps-now', now);
    if (now) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
}

item.subscribe(paintSteps);
paintSteps({ data: item.get() });

const localBtn = document.getElementById('zone-local');
const utcBtn = document.getElementById('zone-utc');
if (localBtn) localBtn.addEventListener('click', () => setZone('local', true));
if (utcBtn) utcBtn.addEventListener('click', () => setZone('utc', true));
setZone(zone);
