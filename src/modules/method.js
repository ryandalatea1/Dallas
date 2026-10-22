import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Método: a linha central se preenche com o scroll e cada etapa acende quando a ponta chega nela. */
export function initMethod({ reduceMotion = false } = {}) {
  const root = document.getElementById('mtl');
  if (!root) return;
  const fill = document.getElementById('mtl-fill');
  const tip = document.getElementById('mtl-tip');
  const line = root.querySelector('.mtl__line');
  const steps = [...root.querySelectorAll('.mstep')];

  if (reduceMotion) {
    gsap.set(fill, { scaleY: 1 });
    steps.forEach((s) => s.classList.add('is-on'));
    return;
  }

  ScrollTrigger.create({
    trigger: root,
    start: 'top 60%',
    end: 'bottom 75%',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;
      fill.style.transform = `scaleY(${p})`;
      tip.style.transform = `translateY(${p * line.offsetHeight}px)`;
    },
  });
  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 62%',
      onEnter: () => step.classList.add('is-on'),
      onLeaveBack: () => step.classList.remove('is-on'),
    });
  });
}
