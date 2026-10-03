import { DataProvider } from '../../src/provider.js';
import { bindList, bindHidden, setFieldError } from '../../src/bind.js';
import { openDialog, closeDialog } from '../../src/dialog.js';

const items = new DataProvider({
  name: 'items',
  data: [],
});

bindHidden('#empty', items, (e) => ((e.data && e.data.length) || 0) > 0);
bindHidden('#list-card', items, (e) => !((e.data && e.data.length) || 0));
bindList('#item-list', items, {
  template: '#tpl-item',
  items: (e) => e.data || [],
  apply(frag, item) {
    frag.querySelector('.pk-list-title').textContent = item.title;
    frag.querySelector('.pk-list-meta').textContent = item.meta;
    frag.querySelector('[data-remove]').setAttribute('data-remove', item.id);
  },
});

function openCreate() {
  setFieldError('#field-title', '');
  openDialog('#create-dialog');
  const input = document.querySelector('#create-form [name="title"]');
  if (input) input.focus();
}

document.getElementById('open-create').addEventListener('click', openCreate);
document.getElementById('open-create-empty').addEventListener('click', openCreate);
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
  items.create({
    id: String(Date.now()),
    title,
    meta: 'Draft',
  });
  evt.target.reset();
  closeDialog('#create-dialog');
});

let pendingId = '';

document.getElementById('item-list').addEventListener('click', (evt) => {
  const btn = evt.target.closest('[data-remove]');
  if (!btn) return;
  pendingId = btn.getAttribute('data-remove') || '';
  const row = (items.get() || []).find((it) => it.id === pendingId);
  const copy = document.getElementById('delete-copy');
  if (copy) {
    copy.textContent = row && row.title
      ? 'Remove ' + row.title + ' from the list?'
      : 'This item will be removed from the list.';
  }
  openDialog('#delete-dialog');
});

document.getElementById('cancel-delete').addEventListener('click', () => {
  pendingId = '';
  closeDialog('#delete-dialog');
});

document.getElementById('confirm-delete').addEventListener('click', () => {
  if (pendingId) {
    items.set((items.get() || []).filter((it) => it.id !== pendingId));
  }
  pendingId = '';
  closeDialog('#delete-dialog');
});
