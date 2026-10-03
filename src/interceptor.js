/**
 * Every outbound HTTP call from a DataProvider goes through Interceptor.fetch.
 * Hooks: request, response, error.
 */
export class Interceptor {
  constructor(options = {}) {
    this.hooks = {
      request: options.request ? options.request.slice() : [],
      response: options.response ? options.response.slice() : [],
      error: options.error ? options.error.slice() : [],
    };
  }

  use(type, fn) {
    if (!this.hooks[type]) {
      throw new Error('unknown interceptor hook: ' + type);
    }
    this.hooks[type].push(fn);
    return this;
  }

  async fetch(input, init = {}) {
    let url = input;
    let opts = {
      ...init,
      headers: new Headers(init.headers || {}),
    };
    for (const fn of this.hooks.request) {
      const out = await fn({ url, opts });
      if (out) {
        if (out.url != null) url = out.url;
        if (out.opts != null) opts = out.opts;
      }
    }

    let res;
    try {
      res = await fetch(url, opts);
    } catch (err) {
      for (const fn of this.hooks.error) await fn(err);
      throw err;
    }

    for (const fn of this.hooks.response) {
      const next = await fn(res);
      if (next) res = next;
    }

    if (!res.ok) {
      const err = new Error('HTTP ' + res.status);
      err.response = res;
      err.url = String(url);
      for (const fn of this.hooks.error) await fn(err);
      throw err;
    }
    return res;
  }
}

/**
 * Opt-in error hook. Map HTTP status to a page. The page must register it.
 * Do not attach this on every interceptor by default.
 */
export function redirectOnStatus(map) {
  return (err) => {
    const status = err && err.response && err.response.status;
    const href = map && status != null ? map[status] : null;
    if (href) location.replace(href);
  };
}

export const defaultInterceptor = new Interceptor();
