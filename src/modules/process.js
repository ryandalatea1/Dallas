import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Linha do processo que se preenche com o scroll e acende cada etapa ao passar. */
export function initProcess() {
  const steps = document.getElementById('steps');
  if (!steps) return;

  gsap.to('.steps__progress', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: steps, start: 'top 62%', end: 'bottom 62%', scrub: 0.6 },
  });

  steps.querySelectorAll('.step').forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 62%',
      onEnter: () => step.classList.add('is-active'),
      onLeaveBack: () => step.classList.remove('is-active'),
    });
  });
}
