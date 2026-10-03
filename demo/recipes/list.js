import { DataProvider } from '../../src/provider.js';
import { bindList, bindHidden, bindText } from '../../src/bind.js';

const CATALOG = [
  { id: '1', title: 'Atlas plan', meta: 'standard', state: 'active' },
  { id: '2', title: 'Beacon plan', meta: 'standard', state: 'active' },
  { id: '3', title: 'Cedar trial', meta: 'trial', state: 'draft' },
  { id: '4', title: 'Dune notes', meta: 'standard', state: 'active' },
  { id: '5', title: 'Ember item', meta: 'standard', state: 'draft' },
  { id: '6', title: 'Flint seat', meta: 'trial', state: 'active' },
  { id: '7', title: 'Grove list', meta: 'standard', state: 'active' },
  { id: '8', title: 'Harbor invite', meta: 'standard', state: 'draft' },
  { id: '9', title: 'Inlet vote', meta: 'trial', state: 'active' },
  { id: '10', title: 'Jasper room', meta: 'standard', state: 'active' },
];

const PAGE_SIZE = 4;

const params = new URLSearchParams(location.search);
const q = params.get('q') || '';
const pageParam = params.get('page') || '1';

const search = document.querySelector('[name="q"]');
if (search) search.value = q;

function hrefFor(page, query) {
  const next = new URLSearchParams();
  if (query) next.set('q', query);
  if (page && Number(page) > 1) next.set('page', String(page));
  const s = next.toString();
  return s ? '?' + s : './list.html';
}

const items = new DataProvider({
  name: 'items',
  load(_provider, query) {
    const term = String((query && query.q) || '').trim().toLowerCase();
    const requested = Math.max(1, Number(query && query.page) || 1);
    const matched = CATALOG.filter((it) => {
      if (!term) return true;
      return (
        it.title.toLowerCase().includes(term) ||
        it.meta.toLowerCase().includes(term)
      );
    });
    const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE) || 1);
    const current = Math.min(requested, pages);
    const start = (current - 1) * PAGE_SIZE;
    return {
      q: (query && query.q) || '',
      page: current,
      pages: matched.length ? pages : 0,
      total: matched.length,
      items: matched.slice(start, start + PAGE_SIZE),
    };
  },
});

bindHidden('#empty', items, (e) => {
  if (e.status !== 'ready') return true;
  return ((e.data && e.data.items) || []).length > 0;
});
bindHidden('#list-card', items, (e) => {
  if (e.status !== 'ready') return true;
  return !((e.data && e.data.items) || []).length;
});
bindHidden('#pager', items, (e) => {
  if (e.status !== 'ready') return true;
  return !((e.data && e.data.items) || []).length;
});
bindText('#empty-title', items, (e) =>
  e.data && e.data.q ? 'No items match' : 'No items yet'
);
bindText('#empty-copy', items, (e) =>
  e.data && e.data.q
    ? 'Try a different search.'
    : 'Create an item when you are ready to track it.'
);

bindList('#item-list', items, {
  template: '#tpl-item',
  items: (e) => (e.data && e.data.items) || [],
  apply(frag, item) {
    frag.querySelector('.pk-list-title').textContent = item.title;
    frag.querySelector('.pk-list-meta').textContent = item.meta;
    const pill = frag.querySelector('.pk-pill');
    pill.textContent = item.state;
    pill.classList.toggle('pk-pill-ok', item.state === 'active');
    pill.classList.toggle('pk-pill-warn', item.state === 'draft');
  },
});

bindList('#pager', items, {
  template: '#tpl-page',
  items: (e) => pagesOf(e.data),
  apply: applyPagerItem,
});

function applyPagerItem(frag, item) {
  const a = frag.querySelector('a');
  if (item.step) {
    if (item.disabled) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.disabled = true;
      btn.textContent = item.glyph;
      btn.title = item.word;
      btn.setAttribute('aria-label', item.word);
      a.replaceWith(btn);
      return;
    }
    a.href = item.href;
    a.textContent = item.glyph;
    a.title = item.word;
    a.setAttribute('aria-label', item.word);
    return;
  }
  a.href = item.href;
  a.textContent = item.label;
  if (item.current) a.setAttribute('aria-current', 'page');
  else a.removeAttribute('aria-current');
}

function pagesOf(data) {
  if (!data || !data.pages) return [];
  const query = data.q || '';
  const page = data.page || 1;
  const pages = data.pages;
  const out = [];
  const hasPrev = page > 1;
  out.push({
    step: 'prev',
    word: 'Previous',
    glyph: '\u2039',
    href: hasPrev ? hrefFor(page - 1, query) : '',
    disabled: !hasPrev,
  });
  for (let n = 1; n <= pages; n++) {
    out.push({
      href: hrefFor(n, query),
      label: String(n),
      current: n === page,
    });
  }
  const hasNext = page < pages;
  out.push({
    step: 'next',
    word: 'Next',
    glyph: '\u203A',
    href: hasNext ? hrefFor(page + 1, query) : '',
    disabled: !hasNext,
  });
  return out;
}

items.load({ q, page: pageParam }).catch(() => {});
