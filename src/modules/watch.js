import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
const NS = 'http://www.w3.org/2000/svg';
const CX = 200;
const CY = 370;

function el(tag, attrs) {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

/**
 * O relógio de bolso: preso na tela enquanto o texto passa por quatro
 * momentos. Primeiro marca a hora certa; em "Segundos" dispara; em
 * "Minutos" corre; no fim os ponteiros se alinham no 12 e ele acende.
 */
export function initWatch({ reduceMotion = false } = {}) {
  const section = document.getElementById('tempo');
  const svg = document.getElementById('watch-svg');
  if (!section || !svg) return;

  // marcações, números, corrente
  const ticks = document.getElementById('watch-ticks');
  for (let i = 0; i < 60; i += 1) {
    const a = (i * 6 * Math.PI) / 180;
    const major = i % 5 === 0;
    const r1 = 131;
    const r2 = major ? 118 : 125;
    ticks.appendChild(
      el('line', {
        x1: CX + Math.sin(a) * r1,
        y1: CY - Math.cos(a) * r1,
        x2: CX + Math.sin(a) * r2,
        y2: CY - Math.cos(a) * r2,
        'stroke-width': major ? 2.4 : 1,
        opacity: major ? 1 : 0.55,
      })
    );
  }
  const nums = document.getElementById('watch-nums');
  ROMAN.forEach((r, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const t = el('text', { x: CX + Math.sin(a) * 100, y: CY - Math.cos(a) * 100 });
    t.textContent = r;
    nums.appendChild(t);
  });
  const sub = document.getElementById('watch-subticks');
  for (let i = 0; i < 12; i += 1) {
    const a = (i * 30 * Math.PI) / 180;
    sub.appendChild(el('line', { x1: CX + Math.sin(a) * 21, y1: 432 - Math.cos(a) * 21, x2: CX + Math.sin(a) * 17, y2: 432 - Math.cos(a) * 17, 'stroke-width': 1 }));
  }
  const chain = document.getElementById('watch-chain');
  for (let y = -460, i = 0; y < 146; y += 13, i += 1) {
    if (i % 2 === 0) chain.appendChild(el('ellipse', { cx: CX, cy: y, rx: 5.2, ry: 8.4, 'stroke-width': 2.4 }));
    else chain.appendChild(el('line', { x1: CX, y1: y - 7, x2: CX, y2: y + 7, 'stroke-width': 3.4, 'stroke-linecap': 'round' }));
  }

  const hourH = document.getElementById('watch-hour');
  const minH = document.getElementById('watch-min');
  const secH = document.getElementById('watch-sec');
  const subH = document.getElementById('watch-sub');
  const swing = document.getElementById('watch-swing');
  const halo = document.getElementById('watch-halo');
  const gears = svg.querySelector('.watch__gears');
  const steps = [...section.querySelectorAll('[data-wstep]')];
  const ghosts = [...section.querySelectorAll('[data-ghost]')];
  const railDots = [...section.querySelectorAll('.watch__rail b')];
  const railFill = document.getElementById('watch-rail');

  const now = new Date();
  let sim = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let speed = 1;
  let mode = 'real'; // real | fast | medium | fixed
  const hands = { h: 0, m: 0, s: 0 };
  let step = -1;
  let running = false;

  function anglesFromSim() {
    const secs = mode === 'real' ? Math.floor(sim) : sim;
    hands.s = (secs % 60) * 6;
    hands.m = ((secs / 60) % 60) * 6;
    hands.h = ((secs / 3600) % 12) * 30;
  }
  function paint() {
    hourH.setAttribute('transform', `rotate(${hands.h} ${CX} ${CY})`);
    minH.setAttribute('transform', `rotate(${hands.m} ${CX} ${CY})`);
    secH.setAttribute('transform', `rotate(${hands.s} ${CX} ${CY})`);
    subH.setAttribute('transform', `rotate(${hands.s * 2} ${CX} 432)`);
  }

  function setStep(n) {
    if (n === step) return;
    step = n;
    steps.forEach((s, i) => s.classList.toggle('is-on', i === n));
    ghosts.forEach((g, i) => g.classList.toggle('is-on', i === n));
    railDots.forEach((d, i) => d.classList.toggle('is-on', i <= n));
    gsap.killTweensOf(hands);
    gsap.killTweensOf(halo);
    if (n === 3) {
      mode = 'fixed';
      // todos os ponteiros sobem para o 12: o momento certo
      const up = (a) => Math.ceil(a / 360 + 0.0001) * 360;
      gsap.to(hands, { h: up(hands.h), m: up(hands.m), s: up(hands.s), duration: 1.6, ease: 'power3.inOut', onUpdate: paint });
      gsap.to(halo, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' });
      gsap.fromTo(halo, { scale: 0.92 }, { scale: 1.04, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.2 });
    } else {
      if (mode === 'fixed') {
        // volta a correr a partir de onde os ponteiros estão
        sim = (((hands.h % 360) / 30) * 3600) % 43200;
      }
      mode = n === 1 ? 'fast' : n === 2 ? 'medium' : 'real';
      speed = n === 1 ? 900 : n === 2 ? 60 : 1;
      gsap.to(halo, { opacity: 0, duration: 0.6 });
    }
  }

  anglesFromSim();
  paint();
  setStep(0);

  if (!reduceMotion) {
    gsap.fromTo(swing, { rotation: -1.4, svgOrigin: '200 -460' }, { rotation: 1.4, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, svgOrigin: '200 -460' });
    if (gears) gsap.to(gears, { rotation: 360, svgOrigin: `${CX} ${CY}`, duration: 60, ease: 'none', repeat: -1 });
  }

  gsap.ticker.add((_t, dt) => {
    if (!running || mode === 'fixed') return;
    sim += (Math.min(dt || 16, 60) / 1000) * speed;
    anglesFromSim();
    paint();
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress;
      railFill.style.transform = `scaleY(${p})`;
      setStep(p < 0.2 ? 0 : p < 0.47 ? 1 : p < 0.72 ? 2 : 3);
    },
  });
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      running = self.isActive;
    },
  });
}
