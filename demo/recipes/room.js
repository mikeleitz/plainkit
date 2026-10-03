import { LiveProvider } from '../../src/live.js';
import {
  bindText,
  bindList,
  bindClass,
  bindHidden,
} from '../../src/bind.js';

function initialRoom() {
  return {
    title: 'Sprint planning',
    status: 'selecting',
    seconds: 42,
    selected: null,
    options: [
      { id: 'o1', title: 'Unknown domain', category: 'knowledge', cost: '1' },
      { id: 'o2', title: 'Many services', category: 'size', cost: '2' },
      { id: 'o3', title: 'Hard rollback', category: 'risk', cost: '3' },
    ],
    people: [
      { id: 'a', name: 'Ada', role: 'lead', state: 'selecting' },
      { id: 'b', name: 'Bela', role: 'voter', state: 'voted' },
      { id: 'c', name: 'Cy', role: 'voter', state: 'selecting' },
    ],
  };
}

/**
 * Stand-in socket so this page runs without a server.
 * An app omits `ws` and passes a real `url`.
 */
function DemoSocket(_url) {
  const listeners = { open: [], message: [], close: [], error: [] };
  let readyState = 0;
  const room = initialRoom();

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
    send(raw) {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }
      if (msg.type === 'ping') {
        emit('message', { data: JSON.stringify({ type: 'pong' }) });
        return;
      }
      if (msg.type === 'vote' && msg.optionId) {
        room.selected = msg.optionId;
        room.people = room.people.map((p) =>
          p.id === 'a' ? { ...p, state: 'voted' } : p
        );
      }
    },
    close() {
      readyState = 3;
      emit('close');
    },
  };

  queueMicrotask(() => {
    readyState = 1;
    emit('open');
    emit('message', {
      data: JSON.stringify({ type: 'snapshot', data: room }),
    });
  });
  return ws;
}

const live = new LiveProvider({
  name: 'room',
  url: 'wss://example.test/rooms/1',
  ws: DemoSocket,
  tick: 'seconds',
});

bindText('#live-status', live, (e) => e.status);
bindText('#live-meta', live, (e) => (e.meta && e.meta.source) || 'none');
bindText('#room-title', live, (e) => (e.data && e.data.title) || 'Room');
bindText('#room-pill', live, (e) => (e.data && e.data.status) || e.status);
bindClass('#room-pill', live, 'pk-pill-ok', (e) => e.status === 'open');
bindClass('#room-pill', live, 'pk-pill-warn', (e) => e.status !== 'open');
bindText('#room-timer', live, (e) => formatSeconds(e.data && e.data.seconds));
bindHidden('#dropped', live, (e) => !e.meta || e.meta.source !== 'send-dropped');

bindList('#option-grid', live, {
  template: '#tpl-option',
  items: (e) => (e.data && e.data.options) || [],
  apply(frag, item, evt) {
    const btn = frag.querySelector('.pk-selectable');
    btn.dataset.id = item.id;
    btn.setAttribute(
      'aria-pressed',
      evt.data && evt.data.selected === item.id ? 'true' : 'false'
    );
    frag.querySelector('.pk-selectable-cat').textContent = item.category;
    frag.querySelector('.pk-selectable-title').textContent = item.title;
    frag.querySelector('.pk-selectable-cost').textContent = 'cost ' + item.cost;
  },
});

bindList('#roster', live, {
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

document.getElementById('option-grid').addEventListener('click', (evt) => {
  const btn = evt.target.closest('.pk-selectable');
  if (!btn) return;
  const optionId = btn.dataset.id;
  const sent = live.send({ type: 'vote', optionId });
  if (!sent) return;
  const data = live.get();
  if (!data) return;
  live.set({
    ...data,
    selected: optionId,
    people: (data.people || []).map((p) =>
      p.id === 'a' ? { ...p, state: 'voted' } : p
    ),
  });
});

document.getElementById('connect').addEventListener('click', () => {
  if (live.status() === 'open' || live.status() === 'connecting') return;
  live.connect();
});
document.getElementById('disconnect').addEventListener('click', () => {
  live.close();
});
document.getElementById('send-down').addEventListener('click', () => {
  live.send({ type: 'vote', optionId: 'o1' });
});

live.connect();

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
