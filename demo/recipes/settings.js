import { DataProvider } from '../../src/provider.js';
import { bindField, bindText, setFieldError } from '../../src/bind.js';
import { paintTimes, timeZone, noteZone } from '../../src/time.js';

const account = new DataProvider({
  name: 'account',
  data: {
    name: 'Ada',
    'given-name': 'Ada',
    'family-name': 'Lovelace',
    email: 'ada@example.test',
    tel: '+1 555 0100',
    'street-address': '1 Example Way',
    'address-level2': 'Springfield',
    'address-level1': 'IL',
    'postal-code': '62701',
    country: 'US',
    notices: true,
    plan: 'standard',
    seats: '3',
    status: 'active',
  },
});

const form = document.getElementById('settings-form');
const bannerOk = document.getElementById('banner-ok');

bindField(form.elements['name'], account, 'name');
bindField(form.elements['given-name'], account, 'given-name');
bindField(form.elements['family-name'], account, 'family-name');
bindField(form.email, account, 'email');
bindField(form.tel, account, 'tel');
bindField(form.elements['street-address'], account, 'street-address');
bindField(form.elements['address-level2'], account, 'address-level2');
bindField(form.elements['address-level1'], account, 'address-level1');
bindField(form.elements['postal-code'], account, 'postal-code');
bindField(form.country, account, 'country');
bindField(form.notices, account, 'notices');
bindText('#plan-name', account, (e) => (e.data && e.data.plan) || '');
bindText('#plan-seats', account, (e) => (e.data && e.data.seats) || '');
bindText('#plan-status', account, (e) => (e.data && e.data.status) || '');

function setZone(next, note) {
  const zone = timeZone(next);
  const localBtn = document.getElementById('zone-local');
  const utcBtn = document.getElementById('zone-utc');
  if (localBtn) localBtn.setAttribute('aria-pressed', zone === 'local' ? 'true' : 'false');
  if (utcBtn) utcBtn.setAttribute('aria-pressed', zone === 'utc' ? 'true' : 'false');
  paintTimes('#times-card', zone);
  if (note) noteZone('#zone-note', zone);
}

const localBtn = document.getElementById('zone-local');
const utcBtn = document.getElementById('zone-utc');
if (localBtn) localBtn.addEventListener('click', () => setZone('local', true));
if (utcBtn) utcBtn.addEventListener('click', () => setZone('utc', true));
setZone(timeZone());

form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  bannerOk.hidden = true;
  const name = form.elements['name'].value.trim();
  if (!name) {
    setFieldError('#field-name', 'Display name is required.');
    return;
  }
  setFieldError('#field-name', '');
  const current = account.get() || {};
  account.set(
    {
      ...current,
      name,
      'given-name': form.elements['given-name'].value.trim(),
      'family-name': form.elements['family-name'].value.trim(),
      email: form.email.value.trim(),
      tel: form.tel.value.trim(),
      'street-address': form.elements['street-address'].value.trim(),
      'address-level2': form.elements['address-level2'].value.trim(),
      'address-level1': form.elements['address-level1'].value.trim(),
      'postal-code': form.elements['postal-code'].value.trim(),
      country: form.country.value,
      notices: form.notices.checked,
    },
    { source: 'save' }
  );
  bannerOk.hidden = false;
});
