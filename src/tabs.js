function resolveEl(el) {
  return typeof el === 'string' ? document.querySelector(el) : el;
}

export function initTabs(root) {
  const el = resolveEl(root);
  if (!el) return () => {};

  const tabs = [...el.querySelectorAll('[role="tab"]')];
  const panels = [...el.querySelectorAll('[role="tabpanel"]')];

  function activate(tab) {
    const id = tab.getAttribute('aria-controls');
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    }
    for (const p of panels) {
      p.hidden = p.id !== id;
    }
  }

  function onClick(evt) {
    const tab = evt.target.closest('[role="tab"]');
    if (!tab || !el.contains(tab)) return;
    activate(tab);
  }

  function onKey(evt) {
    const tab = evt.target.closest('[role="tab"]');
    if (!tab || !el.contains(tab)) return;
    const i = tabs.indexOf(tab);
    if (i < 0) return;
    let next = -1;
    if (evt.key === 'ArrowRight' || evt.key === 'ArrowDown') next = (i + 1) % tabs.length;
    if (evt.key === 'ArrowLeft' || evt.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
    if (evt.key === 'Home') next = 0;
    if (evt.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    evt.preventDefault();
    tabs[next].focus();
    activate(tabs[next]);
  }

  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);
  const current =
    tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if (current) activate(current);
  return () => {
    el.removeEventListener('click', onClick);
    el.removeEventListener('keydown', onKey);
  };
}
