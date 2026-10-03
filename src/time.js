const STORAGE_KEY = 'pk-time-zone';

function resolveRoot(root) {
  if (root == null) {
    return typeof document !== 'undefined' ? document.body : null;
  }
  if (typeof root === 'string') {
    return typeof document !== 'undefined' ? document.querySelector(root) : null;
  }
  return root;
}

function readZone() {
  try {
    if (typeof sessionStorage === 'undefined') return 'local';
    return sessionStorage.getItem(STORAGE_KEY) === 'utc' ? 'utc' : 'local';
  } catch {
    return 'local';
  }
}

function writeZone(zone) {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, zone);
  } catch {
    /* private mode */
  }
}

/**
 * Read or write the Local/UTC choice. sessionStorage key pk-time-zone.
 * Missing or blocked storage is local. Not a provider.
 */
export function timeZone(next) {
  if (next === 'utc' || next === 'local') {
    writeZone(next);
    return next;
  }
  return readZone();
}

function isUtc(zone) {
  return String(zone || '').toLowerCase() === 'utc';
}

function ianaName(zone) {
  if (isUtc(zone)) return 'UTC';
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function offsetLabel(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
      hour: 'numeric',
    }).formatToParts(new Date());
    const raw = ((parts.find((p) => p.type === 'timeZoneName') || {}).value || '');
    const m = raw.match(/([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (m) {
      const hour = String(Number(m[2]));
      const mins = m[3] && m[3] !== '00' ? ':' + m[3] : '';
      return 'UTC' + m[1] + hour + mins;
    }
    if (/GMT|UTC/i.test(raw)) return 'UTC+0';
  } catch {
    /* fall through */
  }
  if (timeZone === 'UTC') return 'UTC+0';
  const min = -new Date().getTimezoneOffset();
  const sign = min >= 0 ? '+' : '-';
  const abs = Math.abs(min);
  const hour = String(Math.floor(abs / 60));
  const mins = abs % 60;
  return 'UTC' + sign + hour + (mins ? ':' + String(mins).padStart(2, '0') : '');
}

/**
 * IANA name and UTC offset for a Local/UTC choice. Example:
 * America/Chicago, UTC-5
 */
export function zoneLabel(zone) {
  const tz = ianaName(zone);
  return tz + ', ' + offsetLabel(tz);
}

const NOTE_MS = 3500;
const noteTimers = new WeakMap();

function fillNote(node, zone) {
  const tz = ianaName(zone);
  const name = document.createElement('strong');
  name.textContent = tz;
  const off = document.createElement('span');
  off.textContent = offsetLabel(tz);
  node.replaceChildren(name, off);
}

function isPopoverOpen(node) {
  try {
    return typeof node.matches === 'function' && node.matches(':popover-open');
  } catch {
    return false;
  }
}

function placeNote(node) {
  if (typeof document === 'undefined') return;
  const id = node.getAttribute('anchor');
  const target = id ? document.getElementById(id) : null;
  node.style.position = 'fixed';
  node.style.inset = 'auto';
  node.style.margin = '0';
  node.style.right = 'auto';
  node.style.bottom = 'auto';
  node.style.transform = 'none';
  const gap = 12;
  const pad = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const nw = node.offsetWidth || 280;
  const nh = node.offsetHeight || 80;
  let left;
  let top;
  if (target) {
    const box = target.getBoundingClientRect();
    left = box.left;
    top = box.bottom + gap;
    if (top + nh > vh - pad) top = Math.max(pad, box.top - nh - gap);
    if (left + nw > vw - pad) left = Math.max(pad, vw - nw - pad);
    if (left < pad) left = pad;
  } else {
    left = Math.max(pad, (vw - nw) / 2);
    top = Math.max(pad, Math.round(vh * 0.18));
  }
  node.style.left = Math.round(left) + 'px';
  node.style.top = Math.round(top) + 'px';
}

function showNote(node) {
  node.removeAttribute('hidden');
  node.classList.remove('pk-note-open');
  if (typeof node.showPopover === 'function') {
    try {
      node.showPopover();
    } catch {
      /* already open */
    }
  }
  if (!isPopoverOpen(node)) {
    node.classList.add('pk-note-open');
  }
  placeNote(node);
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => placeNote(node));
  }
}

function hideNote(node) {
  node.classList.remove('pk-note-open');
  if (typeof node.hidePopover === 'function') {
    try {
      node.hidePopover();
    } catch {
      /* already closed */
    }
  }
  node.setAttribute('hidden', '');
}

/**
 * Show a zone note for 3.5 seconds. Places with JS so Safari can see it.
 * Native popover when the browser has it. Not a toast stack.
 */
export function noteZone(el, zone) {
  const node = resolveRoot(el);
  if (!node || typeof document === 'undefined') return;
  fillNote(node, zone);
  const prev = noteTimers.get(node);
  if (prev) clearTimeout(prev);
  showNote(node);
  const timer = setTimeout(() => {
    hideNote(node);
    noteTimers.delete(node);
  }, NOTE_MS);
  noteTimers.set(node, timer);
}

function timesIn(root) {
  const out = [];
  if (!root) return out;
  if (
    typeof root.tagName === 'string' &&
    root.tagName.toLowerCase() === 'time' &&
    root.hasAttribute('datetime')
  ) {
    out.push(root);
  }
  if (typeof root.querySelectorAll === 'function') {
    out.push(...root.querySelectorAll('time[datetime]'));
  }
  return out;
}

/**
 * Visible text for an ISO-8601 instant. zone is "local" or "utc".
 * Uses Intl.DateTimeFormat. Not a timezone widget.
 */
export function formatTime(iso, zone) {
  if (iso == null || iso === '') return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: isUtc(zone == null ? timeZone() : zone) ? 'UTC' : undefined,
  }).format(date);
}

/**
 * Paint visible text of <time datetime> from the attribute.
 * Missing or invalid values keep the ISO string already in markup.
 */
export function paintTimes(root, zone) {
  const node = resolveRoot(root);
  if (!node) return;
  const use = zone == null ? timeZone() : zone;
  for (const el of timesIn(node)) {
    const iso = el.getAttribute('datetime') || '';
    const text = formatTime(iso, use);
    el.textContent = text || iso;
  }
}
