import { gsap } from 'gsap';

/** CRM: três telas empilhadas em perspectiva que se abrem lado a lado conforme a seção sobe. */
export function initStack({ reduceMotion = false } = {}) {
  const stack = document.getElementById('stack');
  if (!stack) return;
  const cards = [...stack.querySelectorAll('.stack__card')];
  const wide = window.matchMedia('(min-width: 901px)');
  let tl = null;

  function build() {
    if (tl) {
      tl.scrollTrigger.kill();
      tl.kill();
      tl = null;
    }
    gsap.set(cards, { clearProps: 'all' });
    if (!wide.matches || reduceMotion) return;
    const gap = 24;
    const w = cards[0].offsetWidth;
    cards.forEach((c, i) => {
      gsap.set(c, { x: 0, y: i * -22, z: -i * 140, rotateX: 30, scale: 1 - i * 0.04, zIndex: 10 - i, transformOrigin: '50% 100%' });
    });
    tl = gsap.timeline({ scrollTrigger: { trigger: stack, start: 'top 85%', end: 'top 25%', scrub: 0.6 } });
    cards.forEach((c, i) => {
      tl.to(c, { x: (i - 1) * (w + gap), y: 0, z: 0, rotateX: 0, scale: 1, ease: 'power2.inOut', duration: 1 }, 0);
    });
  }
  build();
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(build, 160);
  });
}
