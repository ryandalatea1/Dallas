import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Site comum x Site Dalas: os três pontos acendem com o scroll e o celular
 * troca de um site genérico para um site de verdade, que rola sozinho.
 */
export function initCompare({ reduceMotion = false } = {}) {
  const section = document.getElementById('diferenca');
  if (!section) return;

  section.querySelectorAll('#points li').forEach((li) => {
    ScrollTrigger.create({
      trigger: li,
      start: 'top 74%',
      onEnter: () => li.classList.add('is-on'),
      onLeaveBack: () => li.classList.remove('is-on'),
    });
  });

  const buttons = [...section.querySelectorAll('[data-cmp-btn]')];
  const screens = [...section.querySelectorAll('[data-cmp]')];
  const pill = section.querySelector('.toggle__pill');
  const cap = document.getElementById('compare-cap');
  const img = section.querySelector('.cmp--pro img');
  const captions = {
    plain: 'Site comum · o que todo mundo já faz',
    pro: 'Site Dalas · feito para virar conversa',
  };
  let touched = false;
  let scroller = null;

  function scrollSite(on) {
    if (scroller) {
      scroller.kill();
      scroller = null;
    }
    if (!on || reduceMotion || !img) return;
    const screen = img.parentElement;
    const run = () => {
      const dist = Math.max(0, img.offsetHeight - screen.offsetHeight);
      gsap.set(img, { y: 0 });
      scroller = gsap.to(img, { y: -dist * 0.72, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1.2, delay: 0.8 });
    };
    if (img.complete) run();
    else img.addEventListener('load', run, { once: true });
  }

  function select(key) {
    buttons.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.cmpBtn === key)));
    screens.forEach((s) => s.classList.toggle('is-on', s.dataset.cmp === key));
    const active = buttons.find((b) => b.dataset.cmpBtn === key);
    if (pill && active) {
      pill.style.setProperty('--x', `${active.offsetLeft - 5}px`);
      pill.style.setProperty('--w', `${active.offsetWidth}px`);
    }
    if (cap) cap.textContent = captions[key];
    scrollSite(key === 'pro');
  }

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      touched = true;
      select(b.dataset.cmpBtn);
    })
  );
  select('plain');
  window.addEventListener('resize', () => select(buttons.find((b) => b.getAttribute('aria-selected') === 'true').dataset.cmpBtn));
  document.fonts.ready.then(() => select(buttons.find((b) => b.getAttribute('aria-selected') === 'true').dataset.cmpBtn));

  // quando o visitante chega no celular, ele vê a diferença sozinho
  ScrollTrigger.create({
    trigger: '#compare-phone',
    start: 'top 45%',
    once: true,
    onEnter: () => {
      if (!touched) select('pro');
    },
  });
}
