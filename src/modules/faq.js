/** Dúvidas: abre uma por vez, com altura animada. */
export function initFaq() {
  const items = Array.from(document.querySelectorAll('.faq__item'));
  items.forEach((item) => {
    const head = item.querySelector('.faq__q');
    head.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      items.forEach((i) => {
        i.classList.remove('is-open');
        i.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
