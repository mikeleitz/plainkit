// Full dashboard recipe. Copy table.html, list.html, or settings.html when that is closer.
import { DataProvider } from '../../src/provider.js';
import {
  bindList,
  bindHidden,
  bindText,
  bindClass,
  bindAttr,
} from '../../src/bind.js';
import { initTabs } from '../../src/tabs.js';

const CATALOG = [
  { id: '1', name: 'Atlas', plan: 'standard', seats: 3, state: 'active' },
  { id: '2', name: 'Beacon', plan: 'standard', seats: 12, state: 'active' },
  { id: '3', name: 'Cedar', plan: 'trial', seats: 1, state: 'draft' },
  { id: '4', name: 'Dune', plan: 'standard', seats: 6, state: 'active' },
  { id: '5', name: 'Ember', plan: 'standard', seats: 2, state: 'draft' },
  { id: '6', name: 'Flint', plan: 'trial', seats: 4, state: 'active' },
  { id: '7', name: 'Grove', plan: 'standard', seats: 8, state: 'active' },
  { id: '8', name: 'Harbor', plan: 'standard', seats: 5, state: 'draft' },
  { id: '9', name: 'Inlet', plan: 'trial', seats: 2, state: 'active' },
  { id: '10', name: 'Jasper', plan: 'standard', seats: 9, state: 'active' },
];

const SEATS_CAP = 80;

const params = new URLSearchParams(location.search);
const q = params.get('q') || '';
const trial = params.get('trial') !== '0';
const draft = params.get('draft') !== '0';

let query = { q, trial, draft };

const search = document.querySelector('[name="q"]');
if (search) search.value = q;
const trialBox = document.querySelector('[name="trial"]');
if (trialBox) trialBox.checked = trial;
const draftBox = document.querySelector('[name="draft"]');
if (draftBox) draftBox.checked = draft;

function hrefFor(next) {
  const params = new URLSearchParams();
  if (next.q) params.set('q', next.q);
  params.set('trial', next.trial ? '1' : '0');
  params.set('draft', next.draft ? '1' : '0');
  const s = params.toString();
  return s ? '?' + s : './dashboard.html';
}

function matchRows(query) {
  const term = String((query && query.q) || '').trim().toLowerCase();
  const includeTrial = !query || query.trial !== false;
  const includeDraft = !query || query.draft !== false;
  return CATALOG.filter((it) => {
    if (!includeTrial && it.plan === 'trial') return false;
    if (!includeDraft && it.state === 'draft') return false;
    if (!term) return true;
    return (
      it.name.toLowerCase().includes(term) ||
      it.plan.toLowerCase().includes(term) ||
      it.state.toLowerCase().includes(term)
    );
  });
}

const dash = new DataProvider({
  name: 'dashboard',
  load(_provider, query) {
    const rows = matchRows(query);
    const seats = rows.reduce((sum, it) => sum + (Number(it.seats) || 0), 0);
    const active = rows.filter((it) => it.state === 'active').length;
    const standard = rows.filter((it) => it.plan === 'standard').length;
    const trialCount = rows.filter((it) => it.plan === 'trial').length;
    const ranks = rows.slice().sort((a, b) => b.seats - a.seats);
    const total = rows.length;
    const meters = total
      ? [
          { label: 'Standard', value: standard, max: total },
          { label: 'Trial', value: trialCount, max: total },
          { label: 'Seats', value: seats, max: SEATS_CAP },
        ]
      : [];
    return {
      q: (query && query.q) || '',
      trial: !query || query.trial !== false,
      draft: !query || query.draft !== false,
      accounts: total,
      seats,
      active,
      seatsCap: SEATS_CAP,
      accountsTrend: '+2 this week',
      accountsDir: 'up',
      seatsTrend: '+4 this week',
      seatsDir: 'up',
      activeTrend: '-1 this week',
      activeDir: 'down',
      ranks,
      rows,
      meters,
    };
  },
});

function hasRows(e) {
  return ((e.data && e.data.rows) || []).length > 0;
}

function ready(e) {
  return e.status === 'ready' || (e.status === 'loading' && e.data);
}

bindHidden('#banner-err', dash, (e) => e.status !== 'error');
bindText('#banner-err-copy', dash, (e) =>
  e.error ? String(e.error) : 'The account summary is not available.'
);
bindHidden('#board-work', dash, (e) => !ready(e) || e.status === 'error');
bindHidden('#empty', dash, (e) => {
  if (!ready(e) || e.status === 'error') return true;
  return hasRows(e);
});
bindHidden('#board-tabs', dash, (e) => {
  if (!ready(e) || e.status === 'error') return true;
  return !hasRows(e);
});

bindText('#stat-accounts', dash, (e) =>
  String((e.data && e.data.accounts) || 0)
);
bindText('#stat-seats', dash, (e) => String((e.data && e.data.seats) || 0));
bindText('#stat-active', dash, (e) => String((e.data && e.data.active) || 0));
bindText('#stat-accounts-trend', dash, (e) =>
  (e.data && e.data.accountsTrend) || ''
);
bindText('#stat-seats-trend', dash, (e) =>
  (e.data && e.data.seatsTrend) || ''
);
bindText('#stat-active-trend', dash, (e) =>
  (e.data && e.data.activeTrend) || ''
);
bindClass(
  '#stat-accounts-trend',
  dash,
  'pk-stat-up',
  (e) => e.data && e.data.accountsDir === 'up'
);
bindClass(
  '#stat-accounts-trend',
  dash,
  'pk-stat-down',
  (e) => e.data && e.data.accountsDir === 'down'
);
bindClass(
  '#stat-seats-trend',
  dash,
  'pk-stat-up',
  (e) => e.data && e.data.seatsDir === 'up'
);
bindClass(
  '#stat-seats-trend',
  dash,
  'pk-stat-down',
  (e) => e.data && e.data.seatsDir === 'down'
);
bindClass(
  '#stat-active-trend',
  dash,
  'pk-stat-up',
  (e) => e.data && e.data.activeDir === 'up'
);
bindClass(
  '#stat-active-trend',
  dash,
  'pk-stat-down',
  (e) => e.data && e.data.activeDir === 'down'
);

bindAttr('#stat-seats-bar', dash, 'max', (e) =>
  e.data && e.data.seatsCap != null ? String(e.data.seatsCap) : '80'
);
bindAttr('#stat-seats-bar', dash, 'value', (e) =>
  String((e.data && e.data.seats) || 0)
);
bindText('#stat-seats-bar', dash, (e) => {
  const used = (e.data && e.data.seats) || 0;
  const cap = (e.data && e.data.seatsCap) || SEATS_CAP;
  return used + ' of ' + cap;
});

bindText('#empty-title', dash, (e) =>
  e.data && e.data.q ? 'No accounts match' : 'No accounts yet'
);
bindText('#empty-copy', dash, (e) =>
  e.data && e.data.q
    ? 'Try a different search.'
    : 'Create an account when you are ready to track it.'
);
bindText('#table-caption', dash, (e) => {
  const total = e.data && e.data.accounts;
  if (!total) return 'Accounts';
  const noun = total === 1 ? 'account' : 'accounts';
  if (e.data.q) return total + ' ' + noun + ' match';
  return total + ' ' + noun;
});
bindText('#table-seats', dash, (e) => String((e.data && e.data.seats) || 0));

bindList('#rank-list', dash, {
  template: '#tpl-rank',
  items: (e) => (e.data && e.data.ranks) || [],
  apply(frag, item) {
    frag.querySelector('.pk-list-title').textContent = item.name;
    frag.querySelector('.pk-list-meta').textContent = item.plan;
    frag.querySelector('.pk-num').textContent = String(item.seats);
  },
});

bindList('#meter-list', dash, {
  template: '#tpl-meter',
  items: (e) => (e.data && e.data.meters) || [],
  apply(frag, item) {
    const label = frag.querySelector('.pk-field-label');
    label.textContent = item.label;
    const bar = frag.querySelector('progress');
    bar.max = item.max;
    bar.value = item.value;
    bar.textContent = item.value + ' of ' + item.max;
  },
});

bindList('#account-rows', dash, {
  template: '#tpl-row',
  items: (e) => (e.data && e.data.rows) || [],
  apply(frag, item) {
    frag.querySelector('[data-name]').textContent = item.name;
    frag.querySelector('[data-plan]').textContent = item.plan;
    frag.querySelector('[data-seats]').textContent = String(item.seats);
    frag.querySelector('[data-state]').textContent = item.state;
  },
});

initTabs('#board-tabs');

function readForm(form) {
  return {
    q: String(form.q.value || '').trim(),
    trial: !!form.trial.checked,
    draft: !!form.draft.checked,
  };
}

function go(next) {
  query = {
    q: next.q || '',
    trial: next.trial !== false,
    draft: next.draft !== false,
  };
  if (search) search.value = query.q;
  if (trialBox) trialBox.checked = query.trial;
  if (draftBox) draftBox.checked = query.draft;
  history.replaceState(null, '', hrefFor(query));
  dash.load(query).catch(() => {});
}

const form = document.getElementById('board-filter');
form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  go(readForm(form));
});

dash.load(query).catch(() => {});
