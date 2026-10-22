import { gsap } from 'gsap';

/**
 * "O cliente que esfriou": no desktop a cena fica presa na tela e o scroll
 * conta a história (mensagem às 22h, ninguém responde, o relógio corre,
 * resposta às 9h, cliente já fechou com outro). No celular vira uma linha
 * vertical que aparece aos poucos.
 */
export function initLost({ reduceMotion = false } = {}) {
  const root = document.getElementById('lost');
  if (!root) return;
  const b1 = document.getElementById('lost-1');
  const b2 = document.getElementById('lost-2');
  const b3 = document.getElementById('lost-3');
  const wait = document.getElementById('lost-wait');
  const fill = document.getElementById('lost-fill');
  const hours = document.getElementById('lost-hours');
  const clock = document.getElementById('lost-time');
  const dots = [...root.querySelectorAll('.lost__dot')];
  const START = 22 * 60 + 7; // 22:07
  const END = 9 * 60 + 14 + 24 * 60; // 09:14 do dia seguinte

  const fmt = (m) => {
    const t = Math.round(m) % (24 * 60);
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  };
  const setClock = (k) => {
    const m = START + (END - START) * k;
    clock.textContent = `22:07 → ${fmt(m)}`;
    const elapsed = m - START;
    hours.textContent = elapsed < 60 ? `${Math.round(elapsed)} min sem resposta` : `${Math.floor(elapsed / 60)} ${Math.floor(elapsed / 60) === 1 ? 'hora' : 'horas'} sem resposta`;
  };

  const mobile = window.matchMedia('(max-width: 900px)').matches;
  if (reduceMotion) {
    gsap.set([b1, b2, b3, wait], { opacity: 1, y: 0 });
    gsap.set(fill, mobile ? { scaleY: 1 } : { scaleX: 1 });
    setClock(1);
    dots.forEach((d) => d.classList.add('is-on'));
    return;
  }

  if (mobile) {
    setClock(1);
    gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top 70%', end: 'bottom 70%', scrub: true } });
    [b1, wait, b2, b3].forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
    });
    return;
  }

  setClock(0);
  const counter = { k: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  });
  tl.to(b1, { opacity: 1, y: 0, duration: 0.08 }, 0.02)
    .to(wait, { opacity: 1, duration: 0.06 }, 0.12)
    .to(fill, { scaleX: 0.42, duration: 0.3, ease: 'none' }, 0.1)
    .to(counter, { k: 1, duration: 0.3, ease: 'none', onUpdate: () => setClock(counter.k) }, 0.1)
    .to(b2, { opacity: 1, y: 0, duration: 0.08 }, 0.42)
    .to(fill, { scaleX: 0.9, duration: 0.3, ease: 'none' }, 0.45)
    .to(b3, { opacity: 1, y: 0, duration: 0.08 }, 0.74)
    .to(fill, { scaleX: 1, duration: 0.1, ease: 'none' }, 0.8)
    .to({}, { duration: 0.1 }, 0.9);
  // pontos acendem conforme a linha passa por eles
  tl.eventCallback('onUpdate', () => {
    const p = tl.progress();
    dots[0].classList.toggle('is-on', p > 0.02);
    dots[1].classList.toggle('is-on', p > 0.42);
    dots[2].classList.toggle('is-on', p > 0.74);
  });
}
