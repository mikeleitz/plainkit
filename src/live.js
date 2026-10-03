import { PubSub } from './pubsub.js';

/**
 * LiveProvider owns the WebSocket. UI binds via subscribe() and never
 * constructs a socket.
 *
 * Handshake (app owns the JSON schema):
 *   1. Connect. Token is access_token on the URL, or send authMessage first.
 *   2. Server sends { type: "snapshot", data }.
 *   3. Client send({ type: "vote", ... }) JSON commands.
 *   4. Heartbeat: { type: "ping" } / { type: "pong" } every heartbeatMs.
 *   5. On drop, reconnect with backoff and expect a new snapshot.
 */

function resolveToken(token) {
  if (typeof token === 'function') return token();
  return token || null;
}

function withAccessToken(url, token) {
  if (!token) return url;
  const base =
    typeof window !== 'undefined' && window.location
      ? window.location.href
      : 'http://localhost/';
  const u = new URL(url, base);
  if (!u.searchParams.has('access_token')) {
    u.searchParams.set('access_token', token);
  }
  return u.toString();
}

function backoffMs(attempt) {
  const ms = 500 * Math.pow(2, attempt);
  return Math.min(15000, ms);
}

export class LiveProvider {
  constructor(options = {}) {
    this.url = options.url || null;
    this.name = options.name || 'live';
    this.bus = options.bus || new PubSub();
    this._token = options.token != null ? options.token : null;
    this._authMessage = options.authMessage || null;
    this._heartbeatMs =
      options.heartbeatMs != null ? options.heartbeatMs : 25000;
    this._tickKey = options.tick || null;
    this._wsFactory =
      options.ws || (typeof WebSocket !== 'undefined' ? WebSocket : null);
    this._data = options.data !== undefined ? options.data : null;
    this._status = 'idle';
    this._error = null;
    this._socket = null;
    this._closed = true;
    this._attempt = 0;
    this._heartbeat = null;
    this._tickTimer = null;
    this._reconnectTimer = null;
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
    this._notify(meta);
    return this._data;
  }

  connect() {
    this._closed = false;
    this._open();
    return this;
  }

  close() {
    this._closed = true;
    this._clearTimers();
    if (this._socket) {
      const ws = this._socket;
      this._socket = null;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    }
    this._status = 'closed';
    this._notify({ source: 'close' });
  }

  /**
   * Send a command. If the socket is not open the message is dropped
   * (return false, meta.source send-dropped). There is no outbox.
   * Connect first, or wait for status open.
   */
  send(obj) {
    if (!this._socket || this._socket.readyState !== 1) {
      this._error = new Error('socket not open');
      this._notify({ source: 'send-dropped' });
      return false;
    }
    this._socket.send(JSON.stringify(obj));
    return true;
  }

  _open() {
    if (this._closed) return;
    if (!this.url || !this._wsFactory) {
      this._status = 'idle';
      this._notify({ source: 'idle' });
      return;
    }
    this._clearReconnect();
    this._status = 'connecting';
    this._error = null;
    this._notify({ source: 'connecting' });

    const token = resolveToken(this._token);
    const url = withAccessToken(this.url, token);
    let ws;
    try {
      ws = new this._wsFactory(url);
    } catch (err) {
      this._fail(err);
      this._scheduleReconnect();
      return;
    }
    this._socket = ws;

    ws.addEventListener('open', () => {
      if (this._socket !== ws) return;
      this._attempt = 0;
      this._status = 'open';
      this._error = null;
      this._notify({ source: 'open' });
      if (this._authMessage) {
        const msg =
          typeof this._authMessage === 'function'
            ? this._authMessage(token)
            : this._authMessage;
        if (msg) ws.send(JSON.stringify(msg));
      }
      this._startHeartbeat(ws);
      this._startTick();
    });

    ws.addEventListener('message', (ev) => {
      if (this._socket !== ws) return;
      this._onMessage(ev.data);
    });

    ws.addEventListener('close', () => {
      if (this._socket !== ws) return;
      this._socket = null;
      this._stopHeartbeat();
      this._stopTick();
      if (this._closed) return;
      this._status = 'closed';
      this._notify({ source: 'disconnect' });
      this._scheduleReconnect();
    });

    ws.addEventListener('error', () => {
      if (this._socket !== ws) return;
      this._fail(new Error('socket error'));
    });
  }

  _onMessage(raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'ping') {
      this.send({ type: 'pong' });
      return;
    }
    if (msg.type === 'pong') return;
    if (msg.type === 'error') {
      this._error = new Error(msg.error || 'live error');
      this._status = 'error';
      this._notify({ source: 'error', message: msg });
      return;
    }
    if (msg.data !== undefined) {
      if (msg.type === 'snapshot') this._attempt = 0;
      this._status = 'open';
      this._error = null;
      this._data = msg.data;
      this._notify({ source: msg.type || 'event', message: msg });
    }
  }

  _fail(err) {
    this._error = err;
    this._status = 'error';
    this._notify({ source: 'error' });
  }

  _startHeartbeat(ws) {
    this._stopHeartbeat();
    if (!this._heartbeatMs) return;
    this._heartbeat = setInterval(() => {
      if (!this._socket || this._socket !== ws || ws.readyState !== 1) return;
      ws.send(JSON.stringify({ type: 'ping' }));
    }, this._heartbeatMs);
  }

  _stopHeartbeat() {
    if (this._heartbeat) {
      clearInterval(this._heartbeat);
      this._heartbeat = null;
    }
  }

  _startTick() {
    this._stopTick();
    if (!this._tickKey) return;
    this._tickTimer = setInterval(() => {
      if (this._status !== 'open' || !this._data || typeof this._data !== 'object') {
        return;
      }
      const n = this._data[this._tickKey];
      if (typeof n !== 'number' || n <= 0) return;
      this._data = { ...this._data, [this._tickKey]: n - 1 };
      this._notify({ source: 'tick' });
    }, 1000);
  }

  _stopTick() {
    if (this._tickTimer) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }
  }

  _scheduleReconnect() {
    if (this._closed || !this.url) return;
    this._clearReconnect();
    const wait = backoffMs(this._attempt);
    this._attempt += 1;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this._closed) return;
      this._open();
    }, wait);
  }

  _clearReconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  _clearTimers() {
    this._stopHeartbeat();
    this._stopTick();
    this._clearReconnect();
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
