/** Borda e brilho que acompanham o cursor nos cartões (data-spot). */
export function initSpotlight() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('[data-spot]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - r.left}px`);
      el.style.setProperty('--my', `${event.clientY - r.top}px`);
    });
  });
}
