/**
 * Soluções em lista tipográfica: cada linha abre uma frase e um botão.
 * No desktop, abre ao passar o mouse; em qualquer tela, abre ao clicar.
 */
export function initSolutions() {
  const items = Array.from(document.querySelectorAll('.acc__item'));
  if (!items.length) return;
  const fine = window.matchMedia('(pointer: fine)').matches;

  function open(target) {
    items.forEach((item) => {
      const on = item === target;
      item.classList.toggle('is-open', on);
      item.querySelector('.acc__head').setAttribute('aria-expanded', String(on));
    });
  }

  items.forEach((item) => {
    const head = item.querySelector('.acc__head');
    head.addEventListener('click', () => open(item.classList.contains('is-open') ? null : item));
    if (fine) item.addEventListener('pointerenter', () => open(item));
  });
  open(items[0]);
}
