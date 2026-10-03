function resolveEl(el) {
  return typeof el === 'string' ? document.querySelector(el) : el;
}

export function openDialog(el) {
  const node = resolveEl(el);
  if (!node || typeof node.showModal !== 'function') return;
  if (!node.open) node.showModal();
}

export function closeDialog(el) {
  const node = resolveEl(el);
  if (!node || typeof node.close !== 'function') return;
  if (node.open) node.close();
}
