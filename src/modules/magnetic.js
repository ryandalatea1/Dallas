import { gsap } from 'gsap';

/** Botões magnéticos: puxam levemente o cursor quando ele se aproxima. */
export function initMagnetic() {
  const items = Array.from(document.querySelectorAll('[data-magnetic]'));
  if (!items.length) return;

  window.addEventListener(
    'pointermove',
    (event) => {
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        if (!rect.width) continue;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const radius = Math.max(rect.width, rect.height) * 0.9;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const pull = 1 - dist / radius;
          gsap.to(el, { x: dx * 0.35 * pull, y: dy * 0.35 * pull, duration: 0.5, ease: 'power3.out' });
          el.dataset.magnetOn = '1';
        } else if (el.dataset.magnetOn) {
          delete el.dataset.magnetOn;
          gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)' });
        }
      }
    },
    { passive: true }
  );
}
