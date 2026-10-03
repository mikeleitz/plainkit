// Full bound-table recipe. Copy list.html or accounts.html when that is closer.
import { DataProvider } from '../../src/provider.js';
import { bindList, bindHidden, bindText, bindAttr, setFieldError } from '../../src/bind.js';
import { openDialog, closeDialog } from '../../src/dialog.js';

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

const PAGE_SIZE = 4;

const params = new URLSearchParams(location.search);
const q = params.get('q') || '';
const pageParam = params.get('page') || '1';

let query = { q, page: pageParam };
const selected = new Set();

const search = document.querySelector('[name="q"]');
if (search) search.value = q;

const editBtn = document.getElementById('edit');
const removeBtn = document.getElementById('remove');
const selectAll = document.getElementById('select-all');
const rowBody = document.getElementById('item-rows');

function rowBoxes() {
  return rowBody.querySelectorAll('input[type="checkbox"][data-id]');
}

function syncToolbar() {
  const n = selected.size;
  editBtn.disabled = n !== 1;
  removeBtn.disabled = n < 1;
}

function syncSelectAll() {
  const boxes = rowBoxes();
  let n = 0;
  for (const box of boxes) {
    if (box.checked) n += 1;
  }
  selectAll.checked = boxes.length > 0 && n === boxes.length;
  selectAll.indeterminate = n > 0 && n < boxes.length;
}

function clearSelection() {
  selected.clear();
  syncToolbar();
}

function hrefFor(page, query) {
  const next = new URLSearchParams();
  if (query) next.set('q', query);
  if (page && Number(page) > 1) next.set('page', String(page));
  const s = next.toString();
  return s ? '?' + s : './table.html';
}

const items = new DataProvider({
  name: 'items',
  load(_provider, query) {
    const term = String((query && query.q) || '').trim().toLowerCase();
    const requested = Math.max(1, Number(query && query.page) || 1);
    const matched = CATALOG.filter((it) => {
      if (!term) return true;
      return (
        it.name.toLowerCase().includes(term) ||
        it.plan.toLowerCase().includes(term) ||
        it.state.toLowerCase().includes(term)
      );
    });
    const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE) || 1);
    const current = Math.min(requested, pages);
    const start = (current - 1) * PAGE_SIZE;
    const rows = matched.slice(start, start + PAGE_SIZE);
    return {
      q: (query && query.q) || '',
      page: current,
      pages: matched.length ? pages : 0,
      total: matched.length,
      items: rows,
    };
  },
});

function seatsOf(data) {
  const rows = (data && data.items) || [];
  return rows.reduce((sum, it) => sum + (Number(it.seats) || 0), 0);
}

function hasRows(e) {
  return ((e.data && e.data.items) || []).length > 0;
}

bindHidden('#empty', items, (e) => {
  if (e.status === 'loading' && e.data) return hasRows(e);
  if (e.status !== 'ready') return true;
  return hasRows(e);
});
bindHidden('#table-wrap', items, (e) => {
  if (e.status === 'loading' && e.data) return !hasRows(e);
  if (e.status !== 'ready') return true;
  return !hasRows(e);
});
bindHidden('#pager', items, (e) => {
  if (e.status === 'loading' && e.data) return !hasRows(e);
  if (e.status !== 'ready') return true;
  return !hasRows(e);
});

bindText('#empty-title', items, (e) =>
  e.data && e.data.q ? 'No items match' : 'No items yet'
);
bindText('#empty-copy', items, (e) =>
  e.data && e.data.q
    ? 'Try a different search.'
    : 'Create an item when you are ready to track it.'
);
bindText('#table-caption', items, (e) => {
  const total = e.data && e.data.total;
  if (!total) return 'Items';
  const noun = total === 1 ? 'item' : 'items';
  if (e.data.q) return total + ' ' + noun + ' match';
  return total + ' ' + noun;
});
bindText('#table-seats', items, (e) => String(seatsOf(e.data)));
bindAttr('#items-table', items, 'aria-busy', (e) =>
  e.status === 'loading' ? 'true' : false
);
bindAttr('#pager', items, 'aria-disabled', (e) =>
  e.status === 'loading' ? 'true' : false
);

bindList('#item-rows', items, {
  template: '#tpl-row',
  items: (e) => (e.data && e.data.items) || [],
  apply(frag, item) {
    const box = frag.querySelector('[data-id]');
    box.setAttribute('data-id', item.id);
    box.setAttribute('aria-label', 'Select ' + item.name);
    box.checked = selected.has(item.id);
    frag.querySelector('[data-name]').textContent = item.name;
    frag.querySelector('[data-plan]').textContent = item.plan;
    frag.querySelector('[data-seats]').textContent = String(item.seats);
    frag.querySelector('[data-state]').textContent = item.state;
  },
});

items.subscribe(() => {
  syncSelectAll();
  syncToolbar();
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

function reload() {
  clearSelection();
  items.load(query).catch(() => {});
}

function go(next) {
  query = {
    q: next.q || '',
    page: next.page || '1',
  };
  if (search) search.value = query.q;
  history.replaceState(null, '', hrefFor(query.page, query.q));
  reload();
}

const form = document.getElementById('table-search');
form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  go({ q: String(form.q.value || '').trim(), page: 1 });
});

document.getElementById('refresh').addEventListener('click', () => {
  reload();
});

rowBody.addEventListener('change', (evt) => {
  const box = evt.target.closest('input[type="checkbox"][data-id]');
  if (!box) return;
  const id = box.getAttribute('data-id');
  if (!id) return;
  if (box.checked) selected.add(id);
  else selected.delete(id);
  syncSelectAll();
  syncToolbar();
});

selectAll.addEventListener('change', () => {
  const on = selectAll.checked;
  selected.clear();
  for (const box of rowBoxes()) {
    box.checked = on;
    if (on) selected.add(box.getAttribute('data-id'));
  }
  selectAll.indeterminate = false;
  syncToolbar();
});

document.getElementById('pager').addEventListener('click', (evt) => {
  const a = evt.target.closest('a');
  if (!a) return;
  if (a.getAttribute('aria-disabled') === 'true') return;
  if (evt.button !== 0) return;
  if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) return;
  evt.preventDefault();
  if (items.status() === 'loading') return;
  const url = new URL(a.getAttribute('href'), location.href);
  go({
    q: url.searchParams.get('q') || '',
    page: url.searchParams.get('page') || '1',
  });
});

function catalogById(id) {
  for (const it of CATALOG) {
    if (it.id === id) return it;
  }
  return null;
}

function nextId() {
  let max = 0;
  for (const it of CATALOG) {
    const n = Number(it.id);
    if (n > max) max = n;
  }
  return String(max + 1);
}

function selectedRows() {
  const rows = [];
  for (const id of selected) {
    const row = catalogById(id);
    if (row) rows.push(row);
  }
  return rows;
}

let itemMode = 'create';
let editId = '';
const itemForm = document.getElementById('item-form');
const itemTitle = document.getElementById('item-dialog-title');
const itemSave = document.getElementById('item-save');

function clearItemErrors() {
  setFieldError('#field-name', '');
  setFieldError('#field-seats', '');
}

function itemField(name) {
  return itemForm.elements.namedItem(name);
}

function openCreate() {
  itemMode = 'create';
  editId = '';
  itemTitle.textContent = 'New item';
  itemSave.textContent = 'Create';
  itemForm.reset();
  itemField('seats').value = '1';
  itemField('plan').value = 'standard';
  itemField('state').value = 'draft';
  clearItemErrors();
  openDialog('#item-dialog');
  itemField('name').focus();
}

function openEdit() {
  if (selected.size !== 1) return;
  const id = [...selected][0];
  const row = catalogById(id);
  if (!row) return;
  itemMode = 'edit';
  editId = id;
  itemTitle.textContent = 'Edit item';
  itemSave.textContent = 'Save';
  itemField('name').value = row.name;
  itemField('plan').value = row.plan;
  itemField('seats').value = String(row.seats);
  itemField('state').value = row.state;
  clearItemErrors();
  openDialog('#item-dialog');
  itemField('name').focus();
}

function openDelete() {
  if (selected.size < 1) return;
  const rows = selectedRows();
  const copy = document.getElementById('delete-copy');
  const title = document.getElementById('delete-title');
  if (rows.length === 1) {
    title.textContent = 'Remove item';
    copy.textContent = 'Remove ' + rows[0].name + ' from the list?';
  } else {
    title.textContent = 'Remove items';
    copy.textContent = 'Remove ' + rows.length + ' items from the list?';
  }
  openDialog('#delete-dialog');
}

document.getElementById('create').addEventListener('click', openCreate);
document.getElementById('create-empty').addEventListener('click', openCreate);
document.getElementById('edit').addEventListener('click', openEdit);
document.getElementById('remove').addEventListener('click', openDelete);

document.getElementById('cancel-item').addEventListener('click', () => {
  closeDialog('#item-dialog');
});

itemForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const name = String(itemField('name').value || '').trim();
  const plan = itemField('plan').value === 'trial' ? 'trial' : 'standard';
  const seats = Number(itemField('seats').value);
  const state = itemField('state').value === 'active' ? 'active' : 'draft';
  let bad = false;
  if (!name) {
    setFieldError('#field-name', 'Name is required.');
    bad = true;
  } else {
    setFieldError('#field-name', '');
  }
  if (!Number.isFinite(seats) || seats < 1 || Math.floor(seats) !== seats) {
    setFieldError('#field-seats', 'Seats must be a whole number of 1 or more.');
    bad = true;
  } else {
    setFieldError('#field-seats', '');
  }
  if (bad) return;

  if (itemMode === 'create') {
    CATALOG.unshift({
      id: nextId(),
      name,
      plan,
      seats,
      state,
    });
    query = { q: query.q, page: 1 };
    if (search) search.value = query.q;
    history.replaceState(null, '', hrefFor(query.page, query.q));
  } else {
    const row = catalogById(editId);
    if (row) {
      row.name = name;
      row.plan = plan;
      row.seats = seats;
      row.state = state;
    }
  }
  closeDialog('#item-dialog');
  itemForm.reset();
  reload();
});

document.getElementById('cancel-delete').addEventListener('click', () => {
  closeDialog('#delete-dialog');
});

document.getElementById('confirm-delete').addEventListener('click', () => {
  const ids = new Set(selected);
  for (let i = CATALOG.length - 1; i >= 0; i -= 1) {
    if (ids.has(CATALOG[i].id)) CATALOG.splice(i, 1);
  }
  closeDialog('#delete-dialog');
  reload();
});

reload();
