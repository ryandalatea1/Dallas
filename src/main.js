import './styles/main.css';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { siteConfig } from './config.js';
import { initWolfVideo } from './modules/wolf-video.js';
import { initStorm } from './modules/storm.js';
import { initVapor } from './modules/vapor.js';
import { initAmbience } from './modules/ambience.js';
import { initNav } from './modules/nav.js';
import { initReveals } from './modules/reveals.js';
import { initProcess } from './modules/process.js';
import { initSpotlight } from './modules/spotlight.js';
import { initContact } from './modules/contact.js';
import { initLiving } from './modules/living.js';
import { initSmoke } from './modules/smoke.js';
import { initJourney } from './modules/journey.js';
import { initFaq } from './modules/faq.js';
import { initCrmDemo } from './modules/crm-demo.js';
import { initTicker } from './modules/ticker.js';
import { initLight } from './modules/light.js';
import { initSolutions } from './modules/solutions.js';
import { initMotes } from './modules/motes.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const isMobile = window.matchMedia('(max-width: 900px)').matches;
const lowPower = isMobile || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
const { timeline: T, media } = siteConfig;
const pick = (o) => (isMobile ? o.mobile : o.desktop);

// ---------- scroll suave ----------
const lenis = new Lenis({ lerp: 0.12, smoothWheel: !reduceMotion, wheelMultiplier: 1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ---------- estrutura ----------
initContact(siteConfig);
initNav(lenis);
initTicker();
initSpotlight();
initLight(lenis);

// ---------- abertura ----------
const hero = document.querySelector('.hero');
const film = document.getElementById('hero-film');
const zoomEl = document.getElementById('hero-zoom');
const video = document.getElementById('wolf-video');
const black = document.getElementById('hero-black');
const dim = document.getElementById('hero-dim');
const hint = document.getElementById('hero-hint');
const soundBtn = document.getElementById('sound');

const face = pick(T.hold.face);
const muzzle = pick(T.hold.muzzle);
const stormOrigin = pick(T.storm.origin);
zoomEl.style.setProperty('--face-x', `${face[0] * 100}%`);
zoomEl.style.setProperty('--face-y', `${face[1] * 100}%`);

const smoke = initSmoke(document.getElementById('hero-smoke'), { count: lowPower ? 12 : 32, zone: [0.44, 1.08], reduceMotion, dprMax: lowPower ? 1 : 1.5 });
// no celular a névoa espera o vídeo engatar: a abertura fica mais fluida
if (lowPower) {
  smoke.setRunning(false);
  gsap.delayedCall(2.2, () => heroActive && smoke.setRunning(true));
}
const storm = initStorm(document.getElementById('hero-storm'), {
  flash: document.getElementById('hero-flash'),
  shake: film,
  origin: stormOrigin,
  every: T.storm.every,
  meteors: true,
  onStrike: (i) => smoke.flash(i),
  reduceMotion,
  dprMax: lowPower ? 1.25 : 2,
});
const livingCanvas = document.getElementById('hero-living');
const living = reduceMotion
  ? null
  : initLiving(livingCanvas, { video, wolf: pick(T.hold.wolfMask), quality: lowPower ? 'low' : 'high' });
const vapor = initVapor(document.getElementById('hero-vapor'), { every: T.hold.breathEvery, reduceMotion });

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

// O site aparece na hora: nada de esperar o vídeo.
const brandChars = new SplitText('#hero-brand .w', { type: 'chars', charsClass: 'char' }).chars;
gsap.set(['#hero-tagline', '#hero-lede', '#hero-actions > *', '.hero__chip'], { opacity: 0, y: 18 });
gsap.set(brandChars, { opacity: 0, y: 22 });
gsap.set([hint, '.nav__bar'], { opacity: 0 });

const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
intro
  .to(black, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 0)
  .to('.nav__bar', { opacity: 1, duration: 0.8 }, 0.2)
  .to(brandChars, { opacity: 1, y: 0, duration: 1, stagger: 0.03 }, 0.25)
  .to('.hero__chip', { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.5)
  .to('#hero-tagline', { opacity: 1, y: 0, duration: 0.8 }, 0.7)
  .to('#hero-lede', { opacity: 1, y: 0, duration: 0.8 }, 0.85)
  .to('#hero-actions > *', { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 1)
  .to(hint, { opacity: 1, duration: 0.8 }, 1.4);
if (reduceMotion) intro.progress(1);

// Cena final: o vídeo termina no olhar. A câmera avança devagar no rosto do
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
  // o último frame vira um quadro vivo: pelos, árvores, nuvens e estrelas em movimento
  if (living && living.capture()) {
    livingCanvas.classList.add('is-live');
    living.start();
  }
  gsap.delayedCall(0.5, () => vapor.start());
  storm.start();
}

// Sem vídeo: a floresta em WebGL assume (carregada só nesse caso).
let forest = null;
function fallback(hasVideo) {
  if (hasVideo && reduceMotion) {
    hero.classList.add('has-video');
    video.currentTime = Math.max(0, (video.duration || 5) - 0.05);
    return;
  }
  hero.classList.remove('has-video');
  const canvas = document.getElementById('forest');
  canvas.hidden = false;
  import('./modules/forest.js')
    .then(({ initForest }) => {
      forest = initForest(canvas, { withBackground: true, quality: lowPower ? 'low' : 'high', reduceMotion, finePointer });
      if (!forest) {
        hero.classList.add('no-webgl');
        return;
      }
      hero.classList.add('has-forest');
      forest.intro(4);
      if (!reduceMotion) gsap.delayedCall(2.5, () => storm.start());
      window.__dalas.forest = forest;
    })
    .catch(() => hero.classList.add('no-webgl'));
}

let firstStrike = false;
const videoReady = initWolfVideo(video, {
  desktop: media.wolfDesktop,
  desktopHd: media.wolfDesktopHd,
  desktop4k: media.wolfDesktop4k,
  lowPower,
  mobile: media.wolfMobile,
  desktopWebm: media.wolfDesktopWebm,
  mobileWebm: media.wolfMobileWebm,
  poster: media.wolfPoster,
  posterMobile: media.wolfPosterMobile,
  loop: T.breathLoop,
  onTime: (t) => {
    if (!firstStrike && t >= T.storm.firstStrikeAt) {
      firstStrike = true;
      storm.strike({ x: stormOrigin[0], y: stormOrigin[1], intensity: 1 });
    }
  },
  onEnded: hold,
});
videoReady.then(({ ok }) => {
  if (ok && !reduceMotion) {
    hero.classList.add('has-video');
    video.play().catch(() => fallback(false));
  } else {
    fallback(ok);
  }
});

initAmbience(soundBtn, media.ambience);

// chamada final: a foto do lobo encarando vira um quadro vivo (pelos, árvores,
// nuvens e estrelas), com a respiração no focinho e os olhos acendendo
const finaleWolf = document.getElementById('finale-wolf');
const finaleLivingCanvas = document.getElementById('finale-living');
const finaleVapor = initVapor(document.getElementById('finale-vapor'), { every: 4.6, reduceMotion });
let finaleLiving = null;
let finaleActive = false;
const FINALE_MUZZLE = [0.592, 0.305];
function placeFinaleVapor() {
  finaleVapor.setAnchor(finaleWolf.clientWidth * FINALE_MUZZLE[0], finaleWolf.clientHeight * FINALE_MUZZLE[1], 1);
}
placeFinaleVapor();
window.addEventListener('resize', placeFinaleVapor);
function loadFinaleStill() {
  if (!media.wolfStill || finaleWolf.classList.contains('has-still')) return;
  const img = new Image();
  img.onload = () => {
    finaleWolf.classList.add('has-still');
    finaleWolf.style.backgroundImage = `url("${media.wolfStill}")`;
    if (reduceMotion) return;
    finaleLiving = initLiving(finaleLivingCanvas, { image: img, wolf: [0.48, 0.47, 0.2, 0.34], quality: lowPower ? 'low' : 'high' });
    if (finaleLiving && finaleLiving.capture(img)) {
      finaleLivingCanvas.classList.add('is-live');
      finaleLiving.state.amount = 1;
      finaleLiving.setRunning(finaleActive);
    } else {
      finaleLiving = null;
    }
  };
  img.src = media.wolfStill;
}
// a foto só baixa depois que o vídeo da abertura já engatou
let stillTimer = setTimeout(loadFinaleStill, 6000);
videoReady.then(() => {
  clearTimeout(stillTimer);
  gsap.delayedCall(1.5, loadFinaleStill);
});

// ---------- a página desliza por cima do lobo ----------
// O hero é "sticky"; enquanto o conteúdo sobe, o lobo aproxima e escurece.
let heroActive = true;
function setHeroActive(active) {
  if (active === heroActive) return;
  heroActive = active;
  storm.setRunning(active);
  vapor.setRunning(active);
  smoke.setRunning(active);
  if (forest) forest.setRunning(active);
  if (living) living.setRunning(active && holding);
  if (!active) {
    video.pause();
    storm.stop();
    vapor.stop();
  } else if (holding) {
    storm.start();
    vapor.start();
  } else if (hero.classList.contains('has-video') && !video.ended) {
    video.play().catch(() => {});
  }
}
gsap
  .timeline({
    scrollTrigger: {
      trigger: '.page',
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => {
        const gone = self.progress > 0.03;
        hint.classList.toggle('is-gone', gone);
        soundBtn.classList.toggle('is-gone', gone);
        if (forest) forest.setProgress(self.progress);
        setHeroActive(self.progress < 0.98);
      },
    },
  })
  .to(film, { scale: 1.14, yPercent: -6, ease: 'none', duration: 1 }, 0)
  .to(dim, { opacity: 0.92, ease: 'power1.in', duration: 1 }, 0)
  .to('#hero-content', { yPercent: -16, opacity: 0, ease: 'power1.in', duration: 0.6 }, 0);

// chamada final: tempestade ao longe, névoa, partículas de luz e parallax leve no lobo
const finaleSmoke = initSmoke(document.getElementById('finale-smoke'), { count: lowPower ? 10 : 18, zone: [0.55, 1.05], opacity: 0.55, reduceMotion, dprMax: lowPower ? 1 : 1.5 });
finaleSmoke.setRunning(false);
const finaleMotes = initMotes(document.getElementById('finale-motes'), { count: lowPower ? 16 : 36, reduceMotion });
const finaleEyes = document.querySelectorAll('.finale__eye');
const footerBig = document.getElementById('footer-big');
const finaleStorm = initStorm(document.getElementById('finale-storm'), {
  flash: document.getElementById('finale-flash'),
  origin: [0.86, 0.5],
  every: [6, 12],
  dprMax: lowPower ? 1.25 : 2,
  onStrike: (i) => {
    finaleSmoke.flash(i);
    finaleMotes.flash(i);
    finaleEyes.forEach((eye) => {
      eye.classList.remove('is-lit');
      void eye.offsetWidth;
      eye.classList.add('is-lit');
    });
    if (footerBig) gsap.fromTo(footerBig, { '--flash': 1 }, { '--flash': 0, duration: 1.2, ease: 'power2.out', overwrite: true });
  },
  reduceMotion,
});
finaleStorm.setRunning(false);
ScrollTrigger.create({
  trigger: '#contato',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: (self) => {
    finaleActive = self.isActive;
    finaleStorm.setRunning(finaleActive);
    finaleSmoke.setRunning(finaleActive);
    finaleMotes.setRunning(finaleActive);
    finaleVapor.setRunning(finaleActive);
    if (finaleLiving) finaleLiving.setRunning(finaleActive);
    if (finaleActive) {
      finaleStorm.start();
      placeFinaleVapor();
      finaleVapor.start();
    } else {
      finaleStorm.stop();
      finaleVapor.stop();
    }
  },
  onEnter: () => gsap.delayedCall(1.2, () => finaleStorm.strike({ intensity: 0.9 })),
});
// os olhos acendem de vez em quando, mesmo sem raio
if (!reduceMotion) {
  const blink = () => {
    finaleEyes.forEach((eye) => {
      eye.classList.remove('is-lit');
      void eye.offsetWidth;
      eye.classList.add('is-lit');
    });
    gsap.delayedCall(5 + Math.random() * 6, blink);
  };
  gsap.delayedCall(3, blink);
}
if (!reduceMotion) {
  gsap.to('#finale-wolf', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '#contato', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('#statement-mark', { yPercent: 28, rotate: 6, ease: 'none', scrollTrigger: { trigger: '#sobre', start: 'top bottom', end: 'bottom top', scrub: true } });
  // o "Dalas" gigante do rodapé se preenche conforme a página chega ao fim
  if (footerBig) {
    gsap.fromTo(footerBig, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: '#footer', start: 'top 95%', end: 'bottom bottom', scrub: 0.4 } });
  }
}

// ---------- demais seções ----------
document.fonts.ready.then(() => {
  initReveals();
  initProcess();
  initJourney();
  initFaq();
  initSolutions({ reduceMotion });
  initCrmDemo();
  ScrollTrigger.refresh();
});
window.addEventListener('load', () => ScrollTrigger.refresh());
window.__dalas = { storm, vapor, living, forest: null };
