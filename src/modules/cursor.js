import { gsap } from 'gsap';

/** Cursor próprio: ponto preciso + anel que segue com atraso e cresce sobre links. */
export function initCursor() {
  const el = document.getElementById('cursor');
  if (!el) return;
  const dot = el.querySelector('.cursor__dot');
  const ring = el.querySelector('.cursor__ring');
  document.body.classList.add('has-cursor');

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { ...pos };
  const setDotX = gsap.quickSetter(dot, 'x', 'px');
  const setDotY = gsap.quickSetter(dot, 'y', 'px');
  const setRingX = gsap.quickSetter(ring, 'x', 'px');
  const setRingY = gsap.quickSetter(ring, 'y', 'px');
  let visible = false;

  window.addEventListener(
    'pointermove',
    (event) => {
      pos.x = event.clientX;
      pos.y = event.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        gsap.to(el, { opacity: 1, duration: 0.4 });
      }
    },
    { passive: true }
  );

  document.documentElement.addEventListener('mouseleave', () => {
    visible = false;
    gsap.to(el, { opacity: 0, duration: 0.3 });
  });

  gsap.ticker.add((_t, deltaTime) => {
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    const k = 1 - Math.pow(0.0005, dt);
    ringPos.x += (pos.x - ringPos.x) * k;
    ringPos.y += (pos.y - ringPos.y) * k;
    setDotX(pos.x);
    setDotY(pos.y);
    setRingX(ringPos.x);
    setRingY(ringPos.y);
  });

  const interactive = 'a, button, [data-cursor]';
  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest(interactive);
    if (!target) return;
    const label = target.getAttribute('data-cursor');
    if (label) {
      ring.textContent = label;
      el.classList.add('is-label');
    } else {
      el.classList.add('is-hover');
    }
  });
  document.addEventListener('pointerout', (event) => {
    const target = event.target.closest(interactive);
    if (!target) return;
    el.classList.remove('is-hover', 'is-label');
    ring.textContent = '';
  });
}
