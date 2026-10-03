const more = document.getElementById('item-more');
const openBtn = document.getElementById('open-more');
const banner = document.getElementById('banner-ok');

more.addEventListener('toggle', (evt) => {
  const open = evt.newState === 'open';
  openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

document.getElementById('copy-link').addEventListener('click', () => {
  const url = location.href.split('#')[0];
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).catch(() => {});
  }
  banner.hidden = false;
});
