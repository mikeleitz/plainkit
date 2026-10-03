import { defaultInterceptor } from './interceptor.js';
import { PubSub } from './pubsub.js';

function cloneValue(value) {
  if (value == null) return value;
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

async function readBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Holds one resource. UI binds via subscribe(). Network only through interceptor,
 * or via custom load/save (cookie, memory). create() POSTs. save() PUTs.
 */
export class DataProvider {
  constructor(options = {}) {
    this.url = options.url || null;
    this.interceptor = options.interceptor || defaultInterceptor;
    this.bus = options.bus || new PubSub();
    this.name = options.name || 'data';
    this._customLoad = options.load || null;
    this._customSave = options.save || null;
    this._data = options.data !== undefined ? options.data : null;
    this._status = 'idle';
    this._error = null;
    this._snapshot = cloneValue(this._data);
  }

  get() {
    return this._data;
  }

  status() {
    return this._status;
  }

  error() {
    return this._error;
  }

  subscribe(fn) {
    return this.bus.on(this.name + ':change', fn);
  }

  set(data, meta = {}) {
    this._data = data;
    this._status = 'ready';
    this._error = null;
    this._notify(meta);
    return this._data;
  }

  reset() {
    this._data = cloneValue(this._snapshot);
    this._status = 'ready';
    this._error = null;
    this._notify({ source: 'reset' });
    return this._data;
  }

  _urlWithQuery(query) {
    if (!query || typeof query !== 'object') return this.url;
    const base =
      typeof window !== 'undefined' && window.location
        ? window.location.href
        : 'http://localhost/';
    const u = new URL(this.url, base);
    for (const [key, value] of Object.entries(query)) {
      if (value == null || value === '') u.searchParams.delete(key);
      else u.searchParams.set(key, String(value));
    }
    return u.toString();
  }

  async load(query) {
    this._status = 'loading';
    this._notify({ source: 'loading' });
    try {
      let data;
      if (this._customLoad) {
        data = await this._customLoad(this, query);
      } else if (this.url) {
        const res = await this.interceptor.fetch(this._urlWithQuery(query));
        data = await readBody(res);
      } else {
        data = this._data;
      }
      this._snapshot = cloneValue(data);
      this.set(data, { source: 'load' });
      return data;
    } catch (err) {
      this._status = 'error';
      this._error = err;
      this._notify({ source: 'error' });
      throw err;
    }
  }

  async save() {
    this._status = 'loading';
    this._notify({ source: 'saving' });
    try {
      if (this._customSave) {
        const saved = await this._customSave(this);
        if (saved !== undefined) {
          this._snapshot = cloneValue(saved);
          this.set(saved, { source: 'save' });
        } else {
          this._snapshot = cloneValue(this._data);
          this._status = 'ready';
          this._error = null;
          this._notify({ source: 'save' });
        }
        return this._data;
      }
      if (!this.url) {
        this._snapshot = cloneValue(this._data);
        this._status = 'ready';
        this._error = null;
        this._notify({ source: 'save' });
        return this._data;
      }
      const res = await this.interceptor.fetch(this.url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this._data),
      });
      const data = await readBody(res);
      const next = data == null ? this._data : data;
      this._snapshot = cloneValue(next);
      this.set(next, { source: 'save' });
      return this._data;
    } catch (err) {
      this._status = 'error';
      this._error = err;
      this._notify({ source: 'error' });
      throw err;
    }
  }

  /**
   * POST a new record through Interceptor. Pass the new item.
   * If current data is an array, the created record is prepended.
   * If the server returns an array, that list replaces the data.
   * Do not use save() for create. save() is PUT.
   */
  async create(body) {
    const payload = body !== undefined ? body : this._data;
    this._status = 'loading';
    this._notify({ source: 'creating' });
    try {
      let created = payload;
      if (this.url) {
        const res = await this.interceptor.fetch(this.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await readBody(res);
        if (data != null) created = data;
      }
      const current = this._data;
      let next;
      if (Array.isArray(created)) next = created;
      else if (Array.isArray(current)) next = [created, ...current];
      else next = created;
      this._snapshot = cloneValue(next);
      this.set(next, { source: 'create' });
      return this._data;
    } catch (err) {
      this._status = 'error';
      this._error = err;
      this._notify({ source: 'error' });
      throw err;
    }
  }

  async remove() {
    this._status = 'loading';
    this._notify({ source: 'removing' });
    try {
      if (this.url) {
        await this.interceptor.fetch(this.url, { method: 'DELETE' });
      }
      this.set(null, { source: 'remove' });
      return this._data;
    } catch (err) {
      this._status = 'error';
      this._error = err;
      this._notify({ source: 'error' });
      throw err;
    }
  }

  _notify(meta) {
    this.bus.emit(this.name + ':change', {
      data: this._data,
      status: this._status,
      error: this._error,
      meta: meta || {},
      provider: this,
    });
  }
}
