import { SessionProvider } from '../src/session.js';

const session = new SessionProvider({
  denyHref: '../pages/403.html',
  load: async () => ({ name: 'Ada', roles: ['member'] }),
});

session.guard('admin');
session.load();
