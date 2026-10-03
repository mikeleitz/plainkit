const ATTR_OK = {
  placeholder: true,
  title: true,
  'aria-label': true,
};

function resolveRoot(root) {
  if (root == null) {
    return typeof document !== 'undefined' ? document.body : null;
  }
  if (typeof root === 'string') {
    return typeof document !== 'undefined' ? document.querySelector(root) : null;
  }
  return root;
}

function textFor(catalog, key) {
  if (!catalog || key == null || key === '') return null;
  if (!Object.prototype.hasOwnProperty.call(catalog, key)) return null;
  const value = catalog[key];
  return value == null ? null : String(value);
}

function interpolate(text, vars) {
  if (!vars || typeof text !== 'string') return text;
  return text.replace(/\{([A-Za-z0-9_.]+)\}/g, (all, name) => {
    if (vars[name] == null) return all;
    return String(vars[name]);
  });
}

function collect(root, attr) {
  const out = [];
  if (root && typeof root.hasAttribute === 'function' && root.hasAttribute(attr)) {
    out.push(root);
  }
  if (root && typeof root.querySelectorAll === 'function') {
    out.push(...root.querySelectorAll('[' + attr + ']'));
  }
  return out;
}

/**
 * Overlay catalog strings onto English already in the DOM.
 * Missing keys keep the markup. Does not auto-load English.
 */
export function applyLocale(root, catalog, options = {}) {
  const node = resolveRoot(root);
  if (!node || !catalog || typeof catalog !== 'object') return;
  const vars = options.vars || null;

  for (const el of collect(node, 'data-pk-i18n')) {
    const value = textFor(catalog, el.getAttribute('data-pk-i18n'));
    if (value != null) el.textContent = interpolate(value, vars);
  }

  for (const el of collect(node, 'data-pk-i18n-attr')) {
    const spec = el.getAttribute('data-pk-i18n-attr') || '';
    for (const part of spec.split(/\s+/)) {
      if (!part) continue;
      const cut = part.indexOf(':');
      if (cut < 1) continue;
      const attr = part.slice(0, cut);
      const key = part.slice(cut + 1);
      if (!ATTR_OK[attr] || !key) continue;
      const value = textFor(catalog, key);
      if (value != null) el.setAttribute(attr, interpolate(value, vars));
    }
  }

  if (options.lang && typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = options.lang;
  }
}
