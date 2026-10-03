import { SessionProvider, lacksRole } from '../src/session.js';
import { bindText, bindHidden, bindDisabled } from '../src/bind.js';

const session = new SessionProvider({
  data: { name: 'Ada', roles: ['member'] },
});

bindText('#who', session, (e) => (e.data && e.data.name) || '');
bindText('#role-list', session, (e) => {
  const roles = (e.data && e.data.roles) || [];
  return roles.length ? roles.join(', ') : 'none';
});
bindHidden('#admin-save', session, lacksRole('admin'));
bindDisabled('#admin-export', session, lacksRole('admin'));
bindText('#admin-hint', session, (e) =>
  session.has('admin')
    ? 'Admin tools are visible. Export is enabled.'
    : 'Admin tools stay hidden without the admin role.'
);

document.getElementById('toggle-admin').addEventListener('click', () => {
  const data = { ...(session.get() || {}), roles: (session.get() && session.get().roles.slice()) || [] };
  const i = data.roles.indexOf('admin');
  if (i >= 0) data.roles.splice(i, 1);
  else data.roles.push('admin');
  session.set(data);
  document.getElementById('toggle-admin').textContent = session.has('admin')
    ? 'Revoke admin'
    : 'Grant admin';
});
