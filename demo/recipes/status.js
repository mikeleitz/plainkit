import { DataProvider } from '../../src/provider.js';
import { bindHidden, bindText } from '../../src/bind.js';

let failNext = false;

const item = new DataProvider({
  name: 'item',
  load: () =>
    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (failNext) {
          reject(new Error('Could not load this item.'));
          return;
        }
        resolve({ title: 'Widget', notes: 'In stock.' });
      }, 400);
    }),
});

bindHidden('#cover-loading', item, (e) => e.status === 'ready' || e.status === 'error');
bindHidden('#cover-error', item, (e) => e.status !== 'error');
bindHidden('#ready', item, (e) => e.status !== 'ready');
bindText('#item-title', item, (e) => (e.data && e.data.title) || 'Item');
bindText('#item-notes', item, (e) => (e.data && e.data.notes) || '');
bindText('#error-detail', item, (e) => {
  const err = e.error;
  if (!err) return 'Could not load this item.';
  return err.message || String(err);
});

function paintCover(e) {
  document.body.classList.toggle('pk-cover', e.status !== 'ready');
}

item.subscribe(paintCover);
paintCover({ status: item.status() });

function loadOk() {
  failNext = false;
  item.load().catch(() => {});
}

function loadFail() {
  failNext = true;
  item.load().catch(() => {});
}

document.getElementById('retry').addEventListener('click', loadOk);
document.getElementById('reload').addEventListener('click', loadOk);
document.getElementById('reload-fail').addEventListener('click', loadFail);

if (new URLSearchParams(location.search).get('fail') === '1') loadFail();
else loadOk();
