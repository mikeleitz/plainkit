import { DataProvider } from '../../src/provider.js';
import { bindList, bindHidden, bindText } from '../../src/bind.js';

const CATALOG = {
  widget: {
    title: 'Widget',
    owner: 'Account',
    status: 'Open',
    path: [
      { href: '../', title: 'Recipes' },
      { href: './related.html?id=account', title: 'Account' },
      { title: 'Widget' },
    ],
    items: [
      { href: './related.html?id=gadget', title: 'Gadget', meta: 'Related item' },
      { href: './related.html?id=sprocket', title: 'Sprocket', meta: 'Related item' },
    ],
    accounts: [
      { href: './related.html?id=account', title: 'Account', meta: 'Owner' },
    ],
  },
  gadget: {
    title: 'Gadget',
    owner: 'Account',
    status: 'Open',
    path: [
      { href: '../', title: 'Recipes' },
      { href: './related.html?id=account', title: 'Account' },
      { href: './related.html?id=widget', title: 'Widget' },
      { title: 'Gadget' },
    ],
    items: [
      { href: './related.html?id=widget', title: 'Widget', meta: 'Also related' },
    ],
    accounts: [],
  },
  sprocket: {
    title: 'Sprocket',
    owner: 'Account',
    status: 'Open',
    path: [
      { href: '../', title: 'Recipes' },
      { href: './related.html?id=account', title: 'Account' },
      { href: './related.html?id=widget', title: 'Widget' },
      { title: 'Sprocket' },
    ],
    items: [
      { href: './related.html?id=widget', title: 'Widget', meta: 'Related item' },
    ],
    accounts: [
      { href: './related.html?id=account', title: 'Account', meta: 'Owner' },
    ],
  },
  account: {
    title: 'Account',
    owner: 'Account',
    status: 'Active',
    path: [
      { href: '../', title: 'Recipes' },
      { title: 'Account' },
    ],
    items: [
      { href: './related.html?id=widget', title: 'Widget', meta: 'Related item' },
      { href: './related.html?id=gadget', title: 'Gadget', meta: 'Related item' },
      { href: './related.html?id=sprocket', title: 'Sprocket', meta: 'Related item' },
    ],
    accounts: [],
  },
};

const params = new URLSearchParams(location.search);
const requested = params.get('id');
const id = CATALOG[requested] ? requested : 'widget';
const empty = params.get('empty') === '1';
const record = CATALOG[id];

const item = new DataProvider({
  name: 'item',
  data: {
    title: record.title,
    owner: record.owner,
    status: record.status,
    path: record.path,
    items: empty ? [] : record.items,
    accounts: empty ? [] : record.accounts,
  },
});

function listOf(e, key) {
  return (e.data && e.data[key]) || [];
}

function hasItems(e) {
  return listOf(e, 'items').length > 0;
}

function hasAccounts(e) {
  return listOf(e, 'accounts').length > 0;
}

function hasRelated(e) {
  return hasItems(e) || hasAccounts(e);
}

function applyRelated(frag, row) {
  const link = frag.querySelector('a');
  link.href = row.href || '';
  frag.querySelector('.pk-list-title').textContent = row.title || '';
  frag.querySelector('.pk-list-meta').textContent = row.meta || '';
}

bindText('#page-title', item, (e) => (e.data && e.data.title) || 'Item');
bindText('#item-title', item, (e) => (e.data && e.data.title) || 'Item');
bindText('#item-owner', item, (e) => (e.data && e.data.owner) || 'Account');
bindText('#item-status', item, (e) => (e.data && e.data.status) || '');
bindHidden('#empty', item, hasRelated);
bindHidden('#items-card', item, (e) => !hasItems(e));
bindHidden('#accounts-card', item, (e) => !hasAccounts(e));

bindList('#item-path', item, {
  template: '#tpl-crumb',
  items: (e) => listOf(e, 'path'),
  apply(frag, step) {
    const a = frag.querySelector('a');
    if (step.href) {
      a.href = step.href;
      a.textContent = step.title || '';
      return;
    }
    const span = document.createElement('span');
    span.setAttribute('aria-current', 'page');
    span.textContent = step.title || '';
    a.replaceWith(span);
  },
});

bindList('#related-items', item, {
  template: '#tpl-related',
  items: (e) => listOf(e, 'items'),
  apply: applyRelated,
});

bindList('#related-accounts', item, {
  template: '#tpl-related',
  items: (e) => listOf(e, 'accounts'),
  apply: applyRelated,
});

function paintTitle(e) {
  const title = (e.data && e.data.title) || 'Item';
  document.title = title + ' · plainkit';
}

item.subscribe(paintTitle);
paintTitle({ data: item.get() });
