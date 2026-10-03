import { DataProvider } from '../src/provider.js';
import { applyLocale } from '../src/locale.js';

const locale = new DataProvider({
  name: 'locale',
  url: './locales/de.json',
});

locale.subscribe((e) => {
  if (!e.data) return;
  applyLocale(document.body, e.data, {
    lang: 'de',
    vars: { name: 'Ada' },
  });
});

document.getElementById('load-de').addEventListener('click', () => {
  locale.load();
});
