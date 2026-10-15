import './styles/main.css';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { siteConfig } from './config.js';
import { initForest } from './modules/forest.js';
import { initWolfVideo } from './modules/wolf-video.js';
import { initAmbience } from './modules/ambience.js';
import { initNav } from './modules/nav.js';
import { initReveals } from './modules/reveals.js';
import { initCards } from './modules/cards.js';
import { initEdge } from './modules/edge.js';
import { initPortfolio } from './modules/portfolio.js';
import { initProcess } from './modules/process.js';
import { initMagnetic } from './modules/magnetic.js';
import { initSpotlight } from './modules/spotlight.js';
import { initContact } from './modules/contact.js';
import { initConstellation } from './modules/constellation.js';
import { mountMocks } from './modules/mocks.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const isMobile = window.matchMedia('(max-width: 900px)').matches;
const lowPower = isMobile || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;

// ---------- scroll suave ----------
const lenis = new Lenis({ lerp: 0.085, smoothWheel: !reduceMotion });
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
initSpotlight();
if (finePointer) initMagnetic();

// ---------- abertura: floresta + lobo ----------
const hero = document.querySelector('.hero');
const video = document.getElementById('wolf-video');
const black = document.getElementById('hero-black');
const curtain = document.getElementById('hero-curtain');
const forest = initForest(document.getElementById('forest'), {
  withBackground: true,
  quality: lowPower ? 'low' : 'high',
  reduceMotion,
  finePointer,
});
if (!forest) hero.classList.add('no-webgl');

const brandChars = new SplitText('#hero-brand .w', { type: 'chars', charsClass: 'char' }).chars;
gsap.set(['#hero-tagline', '#hero-text', '#hero-actions > *', '.hero__kicker span'], { opacity: 0, y: 22 });
gsap.set(brandChars, { opacity: 0, y: 30, filter: 'blur(10px)' });
gsap.set('#hero-hint', { opacity: 0 });
gsap.set('.nav__bar', { opacity: 0, y: -16 });

let brandShown = false;
function revealBrand() {
  if (brandShown) return;
  brandShown = true;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.hero__bars i', { scaleY: 0, duration: 1.4, ease: 'power3.inOut' }, 0)
    .to(brandChars, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, stagger: { each: 0.05, from: 'start' } }, 0.1)
    .to('.hero__kicker span', { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.9)
    .to('#hero-tagline', { opacity: 1, y: 0, duration: 1.2 }, 1.1)
    .to('#hero-text', { opacity: 1, y: 0, duration: 1.2 }, 1.4)
    .to('#hero-actions > *', { opacity: 1, y: 0, duration: 1, stagger: 0.14 }, 1.7)
    .to('.nav__bar', { opacity: 1, y: 0, duration: 1.2 }, 1.2)
    .to('#hero-hint', { opacity: 1, duration: 1 }, 2.4)
    .call(() => lenis.start(), null, 1.2);
}

// cena 01: a floresta desperta
const opening = gsap.timeline({ paused: true });
opening.to(black, { opacity: 0, duration: 2.6, ease: 'power2.inOut' }, 0.2);
if (forest) opening.add(forest.intro(5), 0);

// o vídeo do lobo (se existir) assume o fundo; o WebGL fica só com o primeiro plano
initWolfVideo(video, {
  desktop: siteConfig.media.wolfDesktop,
  mobile: siteConfig.media.wolfMobile,
  poster: siteConfig.media.wolfPoster,
  loop: siteConfig.timeline.breathLoop,
  onTime: (t) => {
    if (t >= siteConfig.timeline.brandAt) revealBrand();
  },
}).then(({ ok }) => {
  if (ok && !reduceMotion) {
    hero.classList.add('has-video');
    if (forest) forest.setVideoMode(true);
    video.currentTime = 0;
    video.play().catch(() => {
      hero.classList.remove('has-video');
      if (forest) forest.setVideoMode(false);
      gsap.delayedCall(3.2, revealBrand);
    });
  } else {
    hero.classList.remove('has-video');
    if (forest) forest.setVideoMode(false);
    gsap.delayedCall(reduceMotion ? 0.3 : 3.2, revealBrand);
  }
  opening.play();
  if (reduceMotion) {
    opening.progress(1);
    if (forest) forest.state.intro = 1;
  }
});

initAmbience(document.getElementById('sound'), siteConfig.media.ambience);

// chamada final: usa a foto do lobo parado, se existir; senão, os olhos na névoa
if (siteConfig.media.wolfStill) {
  fetch(siteConfig.media.wolfStill, { method: 'HEAD' })
    .then((r) => {
      if (r.ok && (r.headers.get('content-type') || '').startsWith('image')) {
        const wolf = document.getElementById('finale-wolf');
        wolf.classList.add('has-still');
        wolf.style.backgroundImage = `url("${siteConfig.media.wolfStill}")`;
      }
    })
    .catch(() => {});
}

// ---------- travessia: o scroll atravessa a floresta até a luz verde ----------
const pinLength = isMobile ? 130 : 170;
const travel = gsap.timeline({
  scrollTrigger: {
    trigger: hero,
    start: 'top top',
    end: `+=${pinLength}%`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    onUpdate: (self) => forest && forest.setProgress(self.progress),
    onToggle: (self) => {
      if (forest) forest.setRunning(self.isActive);
      if (!self.isActive && hero.classList.contains('has-video')) video.pause();
      else if (self.isActive && hero.classList.contains('has-video') && brandShown) video.play().catch(() => {});
    },
  },
});
travel
  .to('#hero-content', { yPercent: -18, opacity: 0, ease: 'power1.in', duration: 0.3 }, 0)
  .to(['#hero-hint', '#sound'], { opacity: 0, duration: 0.15 }, 0)
  .to(video, { scale: 1.42, xPercent: -14, ease: 'power1.inOut', duration: 0.9 }, 0)
  .to(video, { opacity: 0, duration: 0.3 }, 0.55)
  .to('.hero__grade', { opacity: 0.4, duration: 0.5 }, 0.4)
  .to(curtain, { opacity: 1, duration: 0.3 }, 0.72);

// ---------- demais seções ----------
document.fonts.ready.then(() => {
  initReveals();
  initCards();
  initEdge();
  initPortfolio();
  initProcess();
  const net = document.getElementById('about-net');
  if (net) {
    const about = initConstellation(net, { reduceMotion, finePointer, rgb: '32,232,154', count: lowPower ? 50 : 80, full: true });
    about.state.reveal = 0.55;
    ScrollTrigger.create({ trigger: '#sobre', start: 'top bottom', end: 'bottom top', onToggle: (self) => about.setRunning(self.isActive) });
  }
  ScrollTrigger.refresh();
});

window.addEventListener('load', () => ScrollTrigger.refresh());
