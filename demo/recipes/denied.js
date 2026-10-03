import { DataProvider } from '../../src/provider.js';
import {
  defaultInterceptor,
  redirectOnStatus,
} from '../../src/interceptor.js';

const raw = Number(new URLSearchParams(location.search).get('status') || '403');
const status = raw === 401 || raw === 403 ? raw : 403;

defaultInterceptor.use(
  'error',
  redirectOnStatus({
    401: './login.html',
    403: '../../pages/403.html',
  })
);

// Preview serves files as 200. A real API returns 401 or 403.
defaultInterceptor.use('response', () => new Response('', { status }));

const item = new DataProvider({
  name: 'item',
  url: './denied.html',
});
item.load().catch(() => {});
