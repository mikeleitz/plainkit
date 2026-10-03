/**
 * Tiny named-event bus. Keep event names documented at the call site.
 */
export class PubSub {
  constructor() {
    this._subs = new Map();
  }

  on(name, fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('PubSub.on requires a function');
    }
    if (!this._subs.has(name)) this._subs.set(name, new Set());
    this._subs.get(name).add(fn);
    return () => this.off(name, fn);
  }

  off(name, fn) {
    const set = this._subs.get(name);
    if (set) set.delete(fn);
  }

  emit(name, payload) {
    const set = this._subs.get(name);
    if (!set) return;
    for (const fn of [...set]) fn(payload);
  }
}
