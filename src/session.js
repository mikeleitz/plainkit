import { DataProvider } from './provider.js';

export function rolesOf(data) {
  if (!data || !Array.isArray(data.roles)) return [];
  return data.roles.map(String);
}

export function hasRole(role) {
  const want = String(role);
  return (evt) => rolesOf(evt && evt.data).includes(want);
}

export function lacksRole(role) {
  const want = String(role);
  return (evt) => !rolesOf(evt && evt.data).includes(want);
}

/**
 * Session is a DataProvider. Default payload is { name, roles: [] }.
 * Hide controls with lacksRole. Deny a page with guard().
 * Client hide is UX. The server still enforces access.
 */
export class SessionProvider extends DataProvider {
  constructor(options = {}) {
    super({
      ...options,
      name: options.name || 'session',
    });
    this.denyHref = options.denyHref || '403.html';
    if (options.data != null) this._status = 'ready';
  }

  roles() {
    return rolesOf(this.get());
  }

  has(role) {
    return this.roles().includes(String(role));
  }

  /**
   * Redirect when session failed to load, or when it is known and the
   * role is missing. Does nothing while load is still in flight.
   */
  guard(role, href) {
    const dest = href || this.denyHref;
    const check = (e) => {
      if (e.status === 'loading') return;
      if (e.status === 'idle' && e.data == null) return;
      if (e.status === 'error') {
        go(dest);
        return;
      }
      if (role != null && role !== '' && !rolesOf(e.data).includes(String(role))) {
        go(dest);
      }
    };
    check({
      data: this.get(),
      status: this.status(),
      error: this.error(),
    });
    return this.subscribe(check);
  }
}

function go(href) {
  if (typeof location === 'undefined' || !href) return;
  if (typeof location.replace === 'function') location.replace(href);
  else location.href = href;
}
