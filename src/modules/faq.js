import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Perguntas: uma aberta por vez, abrindo e fechando com altura animada. */
export function initFaq({ reduceMotion = false } = {}) {
  const list = document.getElementById('faq');
  if (!list) return;
  const items = [...list.querySelectorAll('.qa')];

  const set = (item, open, instant) => {
    const a = item.querySelector('.qa__a');
    const q = item.querySelector('.qa__q');
    item.classList.toggle('is-open', open);
    q.setAttribute('aria-expanded', String(open));
    if (instant || reduceMotion) {
      gsap.set(a, { height: open ? 'auto' : 0 });
      return;
    }
    gsap.fromTo(
      a,
      { height: a.offsetHeight },
      {
        height: open ? 'auto' : 0,
        duration: open ? 0.6 : 0.45,
        ease: 'power3.inOut',
        overwrite: true,
        onComplete: () => ScrollTrigger.refresh(),
      }
    );
  };

  items.forEach((item, i) => {
    set(item, i === 0, true);
    item.querySelector('.qa__q').addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) set(other, false);
      });
      set(item, open);
    });
  });

  if (!reduceMotion) {
    gsap.from(items, {
      opacity: 0,
      y: 18,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.07,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true },
    });
  }
}
