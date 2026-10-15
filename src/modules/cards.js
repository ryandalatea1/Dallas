import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Cards de soluções: entram em sequência e inclinam levemente com o mouse. */
export function initCards() {
  const cards = gsap.utils.toArray('.card');
  if (!cards.length) return;

  ScrollTrigger.batch(cards, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(batch, { y: 64, opacity: 0, rotateX: 6 }, { y: 0, opacity: 1, rotateX: 0, duration: 1.3, ease: 'power3.out', stagger: 0.12, overwrite: true }),
  });

  if (!window.matchMedia('(pointer: fine)').matches) return;
  cards.forEach((card) => {
    const rx = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3.out' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(py * -5);
      ry(px * 6);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}
