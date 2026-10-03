function resolveEl(el) {
  return typeof el === 'string' ? document.querySelector(el) : el;
}

function snapshot(provider) {
  return {
    data: provider.get(),
    status: provider.status(),
    error: provider.error(),
    meta: {},
    provider,
  };
}

/**
 * Keep a DOM node in sync with a provider. `apply(el, event)` runs now and on change.
 */
export function bind(el, provider, apply) {
  const run = (evt) => {
    const node = resolveEl(el);
    if (!node) return;
    apply(node, evt);
  };
  run(snapshot(provider));
  return provider.subscribe(run);
}

export function bindText(el, provider, map) {
  return bind(el, provider, (node, evt) => {
    const value = typeof map === 'function' ? map(evt) : evt.data;
    node.textContent = value == null ? '' : String(value);
  });
}

export function bindHidden(el, provider, pred) {
  return bind(el, provider, (node, evt) => {
    node.hidden = !!pred(evt);
  });
}

export function bindDisabled(el, provider, pred) {
  return bind(el, provider, (node, evt) => {
    node.disabled = !!pred(evt);
  });
}

export function bindClass(el, provider, className, pred) {
  return bind(el, provider, (node, evt) => {
    node.classList.toggle(className, !!pred(evt));
  });
}

export function bindAttr(el, provider, attr, map) {
  return bind(el, provider, (node, evt) => {
    const value = typeof map === 'function' ? map(evt) : evt.data;
    if (value == null || value === false) {
      node.removeAttribute(attr);
    } else {
      node.setAttribute(attr, value === true ? '' : String(value));
    }
  });
}

function fieldKey(keyOrOpts) {
  if (typeof keyOrOpts === 'string') return keyOrOpts;
  if (keyOrOpts && typeof keyOrOpts.key === 'string') return keyOrOpts.key;
  return '';
}

function fieldRecord(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) return data;
  return {};
}

/**
 * Paint one input, textarea, or select from a provider key, write back on
 * input and change (Autofill often fires change without a prior input).
 * Checkbox uses checked. Top-level keys only. Not a form framework.
 */
export function bindField(el, provider, keyOrOpts) {
  const key = fieldKey(keyOrOpts);
  if (!key) return () => {};

  let writing = false;
  const unsub = bind(el, provider, (node, evt) => {
    if (writing) return;
    const value = fieldRecord(evt.data)[key];
    if (node.type === 'checkbox') {
      node.checked = !!value;
      return;
    }
    const next = value == null ? '' : String(value);
    if (node.value !== next) node.value = next;
  });

  const node = resolveEl(el);
  if (!node) return unsub;

  const onInput = () => {
    const data = fieldRecord(provider.get());
    const next =
      node.type === 'checkbox'
        ? { ...data, [key]: node.checked }
        : { ...data, [key]: node.value };
    writing = true;
    provider.set(next, { source: 'field' });
    writing = false;
  };
  node.addEventListener('input', onInput);
  node.addEventListener('change', onInput);
  return () => {
    node.removeEventListener('input', onInput);
    node.removeEventListener('change', onInput);
    unsub();
  };
}

/**
 * Repeat a <template> for each item. Replaces children each time.
 * Small lists only. Focus in a row does not survive an update.
 * A tbody is a valid target. Use a template of <tr>.
 * options.items(evt) -> array
 * options.template: selector or <template>
 * options.apply(fragment, item, evt)
 */
export function bindList(el, provider, options = {}) {
  return bind(el, provider, (node, evt) => {
    const raw =
      typeof options.items === 'function' ? options.items(evt) : evt.data;
    const items = Array.isArray(raw) ? raw : [];
    const tpl =
      typeof options.template === 'string'
        ? document.querySelector(options.template)
        : options.template;
    node.replaceChildren();
    for (const item of items) {
      let clone;
      if (tpl && tpl.content) {
        clone = tpl.content.cloneNode(true);
      } else {
        clone = document.createDocumentFragment();
        clone.appendChild(document.createElement('div'));
      }
      if (typeof options.apply === 'function') options.apply(clone, item, evt);
      node.appendChild(clone);
    }
  });
}

export function setFieldError(fieldEl, message) {
  const field = resolveEl(fieldEl);
  if (!field) return;
  const error = field.querySelector('.pk-field-error');
  const control = field.querySelector('input, textarea, select');
  const text = message == null || message === '' ? '' : String(message);
  if (error) {
    error.textContent = text;
    error.hidden = !text;
  }
  if (control) {
    if (text) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }
}
