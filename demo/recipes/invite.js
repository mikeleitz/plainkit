import { DataProvider } from '../../src/provider.js';
import { bindText, bindAttr } from '../../src/bind.js';

const invite = new DataProvider({
  name: 'invite',
  data: {
    url: 'https://example.test/join?code=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    qr: '../invite-qr.svg',
  },
});

bindAttr('#invite-qr', invite, 'src', (e) => e.data && e.data.qr);
bindText('#invite-url', invite, (e) => (e.data && e.data.url) || '');
