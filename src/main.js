import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { siteConfig } from './config.js';
import { initContact } from './modules/contact.js';
import { runIntro } from './modules/intro.js';
import { initNav } from './modules/nav.js';
import { initHeroNet } from './modules/hero-net.js';
import { initReveals } from './modules/reveals.js';
import { initCompare } from './modules/compare.js';
import { initAdPhone } from './modules/ad-phone.js';
import { initLost } from './modules/lost.js';
import { initWatch } from './modules/watch.js';
import { initKanban } from './modules/kanban.js';
import { initStormSection } from './modules/storm-section.js';
import { initMethod } from './modules/method.js';
import { initFaq } from './modules/faq.js';
import { initFinal } from './modules/final.js';
import { initFloating } from './modules/floating.js';
import { initDiag } from './modules/diag.js';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 900px)').matches;
const lowPower = mobile || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
const opts = { reduceMotion, lowPower };

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash || location.hash === '#diagnostico') window.scrollTo(0, 0);

initContact(siteConfig);
initNav();
initDiag(siteConfig, opts);
initFloating(opts);

// foto que ainda não está no site: fica o monograma
document.querySelectorAll('.team__photo img').forEach((img) => {
  const hide = () => {
    img.style.display = 'none';
  };
  if (img.complete && !img.naturalWidth) hide();
  img.addEventListener('error', hide);
});

const net = initHeroNet(opts);
runIntro(opts).then(() => {
  if (net) net.showChips();
});

document.fonts.ready.then(() => {
  initReveals(opts);
  initCompare(opts);
  initAdPhone(opts);
  initLost(opts);
  initWatch(opts);
  initKanban(opts);
  initStormSection({ ...opts, media: siteConfig.media });
  initMethod(opts);
  initFaq(opts);
  initFinal(opts);
  ScrollTrigger.refresh();
});
window.addEventListener('load', () => ScrollTrigger.refresh());
