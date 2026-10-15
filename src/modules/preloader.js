import { gsap } from 'gsap';

/**
 * Abertura: logo surge, contador 0→100 e a cortina sobe.
 * Espera os recursos reais (foto do hero, fontes) antes de fechar.
 * Resolve um pouco antes da cortina terminar, para o hero já começar a aparecer.
 */
export function initPreloader({ waitFor = [], reduceMotion = false } = {}) {
  const el = document.getElementById('preloader');
  const logo = document.getElementById('preloader-logo');
  const count = document.getElementById('preloader-count');
  const bar = document.getElementById('preloader-bar');
  if (!el) return Promise.resolve();

  const revisit = (() => {
    try {
      return sessionStorage.getItem('dalas:visited') === '1';
    } catch (error) {
      return false;
    }
  })();
  const quick = revisit || reduceMotion;
  const progress = { value: 0 };

  const update = () => {
    const v = Math.round(progress.value);
    count.textContent = String(v);
    bar.style.transform = `scaleX(${progress.value / 100})`;
  };

  return new Promise((resolve) => {
    const warmup = gsap.timeline();
    warmup.to(logo, { opacity: 1, scale: 1, duration: quick ? 0.5 : 1.1, ease: 'power3.out' }, 0);
    warmup.to(progress, { value: 84, duration: quick ? 0.5 : 1.6, ease: 'power2.out', onUpdate: update }, 0);

    const assets = Promise.all(waitFor).catch(() => null);
    const warm = new Promise((done) => warmup.eventCallback('onComplete', done));

    Promise.all([assets, warm]).then(() => {
      gsap.to(progress, {
        value: 100,
        duration: quick ? 0.25 : 0.5,
        ease: 'power2.inOut',
        onUpdate: update,
        onComplete: () => {
          try {
            sessionStorage.setItem('dalas:visited', '1');
          } catch (error) {
            /* modo privado: sem problema */
          }
          const out = gsap.timeline({ onComplete: () => el.remove() });
          out.to([count, bar], { opacity: 0, duration: 0.3 }, 0);
          out.to(logo, { scale: 1.08, opacity: 0, filter: 'blur(12px)', duration: 0.6, ease: 'power2.in' }, 0);
          out.to(
            el,
            {
              clipPath: 'inset(0 0 100% 0)',
              duration: 1.1,
              ease: 'power4.inOut',
              onStart: () => setTimeout(resolve, 250),
            },
            0.35
          );
        },
      });
    });
  });
}
