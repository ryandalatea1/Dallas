import './styles/main.css';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { siteConfig } from './config.js';
import { initPreloader } from './modules/preloader.js';
import { initConstellation } from './modules/constellation.js';
import { initFloaters } from './modules/floaters.js';
import { initNav } from './modules/nav.js';
import { initMarquee } from './modules/marquee.js';
import { initProcess } from './modules/process.js';
import { initManifesto } from './modules/manifesto.js';
import { initProjects } from './modules/projects.js';
import { initMagnetic } from './modules/magnetic.js';
import { initReveals } from './modules/reveals.js';
import { initContact } from './modules/contact.js';
import { initSpotlight } from './modules/spotlight.js';
import { mountMocks } from './modules/mocks.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ---------- scroll suave ----------
const lenis = new Lenis({ lerp: 0.09, smoothWheel: !reduceMotion });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ---------- estrutura ----------
mountMocks();
initContact(siteConfig);
initNav(lenis);
initMarquee();
initSpotlight();
if (finePointer) initMagnetic();

// ---------- hero ----------
const heroEl = document.querySelector('.hero');
const chips = gsap.utils.toArray('.chip');
const net = initConstellation(document.getElementById('hero-net'), { chips, reduceMotion, finePointer });
const floaters = initFloaters(document.getElementById('hero-3d'), { preset: 'hero', reduceMotion, finePointer });
const ctaFloaters = initFloaters(document.getElementById('cta-3d'), { preset: 'cta', reduceMotion, finePointer });
if (ctaFloaters) ctaFloaters.setRunning(false);
window.__dalas = { net, floaters, ctaFloaters };

const chars = gsap.utils
  .toArray('.hero__title .line')
  .flatMap((line) => new SplitText(line, { type: 'chars', charsClass: 'char' }).chars);

gsap.set(chips, { xPercent: -50, yPercent: -50 });

const intro = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
intro
  .to(net.state, { reveal: 1, duration: 2.4, ease: 'power2.out' }, 0)
  .call(() => floaters && floaters.reveal(), null, 0.3)
  .from('.nav__bar', { y: -24, opacity: 0, duration: 1.2 }, 0.1)
  .from(chars, { yPercent: 115, rotate: 3, duration: 1.2, stagger: { each: 0.03 } }, 0.2)
  .from('.hero__lede', { y: 22, opacity: 0, duration: 1.1 }, 0.8)
  .from('.hero__actions > *', { y: 18, opacity: 0, duration: 1, stagger: 0.1 }, 0.95)
  .from(chips, { scale: 0.7, opacity: 0, duration: 0.9, stagger: 0.16, ease: 'back.out(1.6)' }, 0.9);

if (!reduceMotion) {
  chips.forEach((chip, i) => {
    gsap.to(chip, { y: i % 2 ? 7 : -7, duration: 2.6 + i * 0.35, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });
  });
}

ScrollTrigger.create({
  trigger: heroEl,
  start: 'top top',
  end: 'bottom top',
  onUpdate: (self) => {
    if (floaters) floaters.state.scroll = self.progress;
  },
  onToggle: (self) => {
    net.setRunning(self.isActive);
    if (floaters) floaters.setRunning(self.isActive);
  },
});
if (ctaFloaters) {
  // só renderiza (e só aparece) quando a seção de contato está na tela
  const watcher = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        ctaFloaters.setRunning(entry.isIntersecting);
        if (entry.isIntersecting) ctaFloaters.reveal();
      });
    },
    { rootMargin: '15% 0px' }
  );
  watcher.observe(document.getElementById('contato'));
}
gsap.to('.hero__content, .hero__chips', {
  yPercent: 22,
  opacity: 0,
  ease: 'none',
  scrollTrigger: { trigger: heroEl, start: 'top top', end: '85% top', scrub: true },
});

// ---------- seções ----------
document.fonts.ready.then(() => {
  initReveals();
  initProcess();
  initManifesto();
  initProjects();
  ScrollTrigger.refresh();
});

// ---------- abertura ----------
initPreloader({ waitFor: [document.fonts.ready], reduceMotion }).then(() => {
  lenis.start();
  if (reduceMotion) {
    intro.progress(1);
    if (floaters) floaters.reveal();
  } else intro.play();
  ScrollTrigger.refresh();
});
