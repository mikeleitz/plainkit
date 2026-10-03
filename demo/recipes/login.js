import { DataProvider } from '../../src/provider.js';
import { setFieldError } from '../../src/bind.js';

const account = new DataProvider({
  name: 'account',
  data: { email: '', status: 'signed-out' },
});

const form = document.getElementById('login-form');
const bannerErr = document.getElementById('banner-err');
const bannerOk = document.getElementById('banner-ok');
const bannerInfo = document.getElementById('banner-info');

form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  bannerErr.hidden = true;
  bannerOk.hidden = true;
  bannerInfo.hidden = true;

  const email = form.email.value.trim();
  const password = form.password.value;
  let bad = false;
  if (!email) {
    setFieldError('#field-email', 'Email is required.');
    bad = true;
  } else {
    setFieldError('#field-email', '');
  }
  if (!password) {
    setFieldError('#field-password', 'Password is required.');
    bad = true;
  } else {
    setFieldError('#field-password', '');
  }
  if (bad) return;

  if (password === 'bad') {
    bannerErr.hidden = false;
    return;
  }

  account.set({ email, status: 'signed-in' });
  form.hidden = true;
  bannerOk.hidden = false;
});

document.getElementById('other').addEventListener('click', () => {
  bannerErr.hidden = true;
  bannerOk.hidden = true;
  bannerInfo.hidden = false;
});
