import './styles/main.css';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { siteConfig } from './config.js';
import { initPreloader } from './modules/preloader.js';
import { initCursor } from './modules/cursor.js';
import { initHeroGL } from './modules/hero-gl.js';
import { initParticles } from './modules/particles.js';
import { initNav } from './modules/nav.js';
import { initMarquee } from './modules/marquee.js';
import { initProcess } from './modules/process.js';
import { initServices } from './modules/services.js';
import { initManifesto } from './modules/manifesto.js';
import { initProjects } from './modules/projects.js';
import { initMagnetic } from './modules/magnetic.js';
import { initReveals } from './modules/reveals.js';
import { initContact } from './modules/contact.js';
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
if (finePointer) {
  initCursor();
  initMagnetic();
}

// ---------- hero ----------
const heroEl = document.querySelector('.hero');
const gl = initHeroGL(document.getElementById('hero-gl'), {
  src: `${import.meta.env.BASE_URL}images/hero.webp`,
  reduceMotion,
  finePointer,
});
if (!gl) heroEl.classList.add('no-gl');
const particles = initParticles(document.getElementById('hero-particles'), { reduceMotion });

const chars = gsap.utils
  .toArray('.hero__title .line')
  .flatMap((line) => new SplitText(line, { type: 'chars', charsClass: 'char' }).chars);

const intro = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
if (gl) intro.to(gl.state, { reveal: 1, duration: 2.6, ease: 'power3.out' }, 0);
intro
  .from(chars, { yPercent: 115, rotate: 4, duration: 1.3, stagger: { each: 0.028 } }, 0.2)
  .from('.hero__captions li', { x: 26, opacity: 0, duration: 1.1, stagger: 0.14 }, 0.75)
  .from('.hero__lede', { y: 24, opacity: 0, duration: 1.1 }, 0.95)
  .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.15)
  .from('.nav > *', { y: -18, opacity: 0, duration: 1.1, stagger: 0.1 }, 0.55);

// O hero só renderiza enquanto está na tela; o conteúdo sobe mais devagar que a página.
ScrollTrigger.create({
  trigger: heroEl,
  start: 'top top',
  end: 'bottom top',
  onUpdate: (self) => {
    if (gl) gl.state.scroll = self.progress;
  },
  onToggle: (self) => {
    if (gl) gl.setRunning(self.isActive);
    particles.setRunning(self.isActive);
  },
});
gsap.to('.hero__content', {
  yPercent: 28,
  opacity: 0,
  ease: 'none',
  scrollTrigger: { trigger: heroEl, start: 'top top', end: '85% top', scrub: true },
});

// ---------- seções (depois das fontes, para as quebras de linha ficarem certas) ----------
document.fonts.ready.then(() => {
  initReveals();
  initProcess();
  initManifesto();
  initProjects();
  initServices();
  ScrollTrigger.refresh();
});

// ---------- abertura ----------
initPreloader({ waitFor: [gl ? gl.ready : Promise.resolve(), document.fonts.ready], reduceMotion }).then(() => {
  lenis.start();
  if (reduceMotion) intro.progress(1);
  else intro.play();
  ScrollTrigger.refresh();
});
