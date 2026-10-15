import './styles/main.css';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { siteConfig } from './config.js';
import { initForest } from './modules/forest.js';
import { initWolfVideo } from './modules/wolf-video.js';
import { initStorm } from './modules/storm.js';
import { initVapor } from './modules/vapor.js';
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
import { initShowcase } from './modules/showcase.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const isMobile = window.matchMedia('(max-width: 900px)').matches;
const lowPower = isMobile || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
const { timeline: T, media } = siteConfig;
const pick = (o) => (isMobile ? o.mobile : o.desktop);

// ---------- scroll suave ----------
const lenis = new Lenis({ lerp: 0.085, smoothWheel: !reduceMotion });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ---------- estrutura ----------
initContact(siteConfig);
initNav(lenis);
initSpotlight();
if (finePointer) initMagnetic();

// ---------- abertura: a floresta, o lobo, a tempestade ----------
const hero = document.querySelector('.hero');
const film = document.getElementById('hero-film');
const zoomEl = document.getElementById('hero-zoom');
const video = document.getElementById('wolf-video');
const black = document.getElementById('hero-black');
const curtain = document.getElementById('hero-curtain');

const face = pick(T.hold.face);
const muzzle = pick(T.hold.muzzle);
const stormOrigin = pick(T.storm.origin);
zoomEl.style.setProperty('--face-x', `${face[0] * 100}%`);
zoomEl.style.setProperty('--face-y', `${face[1] * 100}%`);

const forest = initForest(document.getElementById('forest'), {
  withBackground: true,
  quality: lowPower ? 'low' : 'high',
  reduceMotion,
  finePointer,
});
if (!forest) hero.classList.add('no-webgl');

const storm = initStorm(document.getElementById('hero-storm'), {
  flash: document.getElementById('hero-flash'),
  shake: film,
  origin: stormOrigin,
  every: T.storm.every,
  reduceMotion,
});
const vapor = initVapor(document.getElementById('hero-vapor'), { every: T.hold.breathEvery, reduceMotion });

// um ponto do vídeo (fração) convertido para a tela, respeitando o object-fit: cover
function coverPoint(fx, fy) {
  const w = zoomEl.clientWidth;
  const h = zoomEl.clientHeight;
  const videoAspect = isMobile ? 9 / 16 : 16 / 9;
  let dw;
  let dh;
  let ox = 0;
  let oy = 0;
  if (w / h > videoAspect) {
    dw = w;
    dh = w / videoAspect;
    oy = (h - dh) / 2;
  } else {
    dh = h;
    dw = h * videoAspect;
    ox = (w - dw) / 2;
  }
  return [ox + fx * dw, oy + fy * dh];
}
function placeVapor() {
  const [x, y] = coverPoint(muzzle[0], muzzle[1]);
  vapor.setAnchor(x, y, T.hold.facing || 1);
}
placeVapor();
window.addEventListener('resize', placeVapor);

// textos escondidos até a marca aparecer
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
opening.to(black, { opacity: 0, duration: 2.2, ease: 'power2.inOut' }, 0.15);
if (forest) opening.add(forest.intro(5), 0);

// cena final: o vídeo termina no olhar. A câmera avança devagar na cara do
// lobo, ele respira soltando vapor e a tempestade continua ao fundo.
let holding = false;
function hold() {
  if (holding) return;
  holding = true;
  video.pause();
  const tl = gsap.timeline();
  tl.to(zoomEl, { scale: T.hold.zoom, duration: T.hold.duration, ease: 'power1.inOut' }).to(zoomEl, {
    scale: T.hold.zoom * 1.012,
    duration: 2.6,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
  if (reduceMotion) tl.progress(1).pause();
  gsap.delayedCall(0.5, () => vapor.start());
  storm.start();
}

function fallback(hasVideo) {
  if (hasVideo && reduceMotion) {
    // movimento reduzido: só o frame final, parado, e a marca
    hero.classList.add('has-video');
    if (forest) forest.setVideoMode(true);
    video.currentTime = Math.max(0, (video.duration || 5) - 0.05);
    gsap.delayedCall(0.3, revealBrand);
    return;
  }
  hero.classList.remove('has-video');
  if (forest) forest.setVideoMode(false);
  gsap.delayedCall(reduceMotion ? 0.3 : 3.2, revealBrand);
  if (!reduceMotion) gsap.delayedCall(4, () => storm.start());
}

let firstStrike = false;
initWolfVideo(video, {
  desktop: media.wolfDesktop,
  mobile: media.wolfMobile,
  desktopWebm: media.wolfDesktopWebm,
  mobileWebm: media.wolfMobileWebm,
  poster: media.wolfPoster,
  posterMobile: media.wolfPosterMobile,
  loop: T.breathLoop,
  onTime: (t) => {
    if (t >= T.brandAt) revealBrand();
    if (!firstStrike && t >= T.storm.firstStrikeAt) {
      firstStrike = true;
      storm.strike({ x: stormOrigin[0], y: stormOrigin[1], intensity: 1 });
    }
  },
  onEnded: hold,
}).then(({ ok }) => {
  if (ok && !reduceMotion) {
    hero.classList.add('has-video');
    if (forest) forest.setVideoMode(true);
    video.currentTime = 0;
    video.play().catch(() => fallback(false));
  } else {
    fallback(ok);
  }
  opening.play();
  if (reduceMotion) {
    opening.progress(1);
    if (forest) forest.state.intro = 1;
  }
});

initAmbience(document.getElementById('sound'), media.ambience);

// chamada final: usa a foto do lobo parado, se existir; senão, os olhos na névoa
if (media.wolfStill) {
  fetch(media.wolfStill, { method: 'HEAD' })
    .then((r) => {
      if (r.ok && (r.headers.get('content-type') || '').startsWith('image')) {
        const wolf = document.getElementById('finale-wolf');
        wolf.classList.add('has-still');
        wolf.style.backgroundImage = `url("${media.wolfStill}")`;
      }
    })
    .catch(() => {});
}

// chamada final: a tempestade continua ao longe, atrás do lobo parado
const finaleStorm = initStorm(document.getElementById('finale-storm'), {
  flash: document.getElementById('finale-flash'),
  origin: [0.86, 0.5],
  every: [7, 14],
  reduceMotion,
});
finaleStorm.setRunning(false);
ScrollTrigger.create({
  trigger: '#contato',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: (self) => {
    finaleStorm.setRunning(self.isActive);
    if (self.isActive) finaleStorm.start();
    else finaleStorm.stop();
  },
  onEnter: () => gsap.delayedCall(1.2, () => finaleStorm.strike({ intensity: 0.9 })),
});

// ---------- travessia: o scroll atravessa a floresta até a clareira ----------
const pinLength = isMobile ? 140 : 180;
const travel = gsap.timeline({
  scrollTrigger: {
    trigger: hero,
    start: 'top top',
    end: `+=${pinLength}%`,
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    onUpdate: (self) => {
      if (forest) forest.setProgress(self.progress);
      const gone = self.progress > 0.04;
      document.getElementById('hero-hint').classList.toggle('is-gone', gone);
      document.getElementById('sound').classList.toggle('is-gone', gone);
    },
    onToggle: (self) => {
      if (forest) forest.setRunning(self.isActive);
      storm.setRunning(self.isActive);
      vapor.setRunning(self.isActive);
      if (!self.isActive) {
        video.pause();
        storm.stop();
        vapor.stop();
      } else if (holding) {
        storm.start();
        vapor.start();
      } else if (brandShown && hero.classList.contains('has-video') && !video.ended) {
        video.play().catch(() => {});
      }
    },
  },
});
gsap.set('#hero-clearing', { opacity: 0, scale: 0.94, yPercent: 6 });
travel
  .to('#hero-content', { yPercent: -18, opacity: 0, ease: 'power1.in', duration: 0.28 }, 0)
  .to(film, { scale: 1.3, xPercent: -10, ease: 'power1.inOut', duration: 0.9 }, 0)
  .to(film, { opacity: 0, duration: 0.3 }, 0.5)
  .to('.hero__grade', { opacity: 0.5, duration: 0.5 }, 0.4)
  .to(curtain, { opacity: 0.72, duration: 0.4 }, 0.55)
  .to('#hero-clearing', { opacity: 1, scale: 1, yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.6);

// ---------- demais seções ----------
document.fonts.ready.then(() => {
  initReveals();
  initCards();
  initEdge();
  initPortfolio();
  initProcess();
  initShowcase(document.getElementById('showcase'), { reduceMotion, finePointer, quality: lowPower ? 'low' : 'high' });
  const net = document.getElementById('about-net');
  if (net) {
    const about = initConstellation(net, { reduceMotion, finePointer, rgb: '32,232,154', count: lowPower ? 50 : 80, full: true });
    about.state.reveal = 0.55;
    ScrollTrigger.create({ trigger: '#sobre', start: 'top bottom', end: 'bottom top', onToggle: (self) => about.setRunning(self.isActive) });
  }
  ScrollTrigger.refresh();
});

window.addEventListener('load', () => ScrollTrigger.refresh());
window.__dalas = { storm, vapor, forest };
