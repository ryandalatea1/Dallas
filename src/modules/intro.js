import { gsap } from 'gsap';

/** Abertura: a asa, o nome DALAS letra por letra e um risco de luz. Uma vez por visita. */
export function runIntro({ reduceMotion }) {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  const ready = () => {
    root.classList.add('is-ready');
    try {
      sessionStorage.setItem('dalas-intro', '1');
    } catch (error) {
      /* sem storage: a abertura volta na próxima visita */
    }
  };
  if (!intro || root.classList.contains('no-intro') || reduceMotion) {
    if (intro) intro.remove();
    ready();
    return Promise.resolve();
  }
  document.body.style.overflow = 'hidden';
  return new Promise((resolve) => {
    const finish = () => {
      intro.remove();
      document.body.style.overflow = '';
      resolve();
    };
    gsap
      .timeline({ onComplete: finish })
      .fromTo('.intro__mark', { opacity: 0, y: 18, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' })
      .fromTo('.intro__name span', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, 0.3)
      .to('.intro__sub', { opacity: 1, duration: 0.6 }, 0.75)
      .to('.intro__streak', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.55)
      .to('.intro__streak', { opacity: 0, duration: 0.4 }, 1.35)
      .add(ready, 1.55)
      .to(intro, { opacity: 0, duration: 0.65, ease: 'power2.inOut' }, 1.6);
  });
}
