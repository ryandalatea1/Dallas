import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const NS = 'http://www.w3.org/2000/svg';
const NAMES = ['Anúncio', 'Site', 'WhatsApp', 'CRM', 'Venda'];

function el(tag, attrs) {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

/** Funil: cinco faixas que se enchem conforme as etapas passam, e uma gota de luz descendo com o scroll. */
export function initFunnel({ reduceMotion = false } = {}) {
  const svg = document.getElementById('funnel-svg');
  const list = document.getElementById('fsteps');
  if (!svg || !list) return;
  const bands = document.getElementById('funnel-bands');
  const flow = document.getElementById('funnel-flow');
  const labels = document.getElementById('funnel-labels');
  const steps = [...list.querySelectorAll('.fstep')];
  const N = NAMES.length;
  const top = 24;
  const h = 92;
  const gap = 8;
  const wTop = 360;
  const wBot = 128;
  const fills = [];

  for (let i = 0; i < N; i += 1) {
    const y0 = top + i * (h + gap);
    const y1 = y0 + h;
    const w0 = wTop - (wTop - wBot) * (i / N);
    const w1 = wTop - (wTop - wBot) * ((i + 1) / N);
    const d = `M${200 - w0 / 2} ${y0} L${200 + w0 / 2} ${y0} L${200 + w1 / 2} ${y1} L${200 - w1 / 2} ${y1} Z`;
    bands.appendChild(el('path', { d, fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.14)', 'stroke-width': 1 }));
    const fill = el('path', { d, fill: i === N - 1 ? 'url(#fg-green)' : 'url(#fg-gold)', class: 'band-fill' });
    bands.appendChild(fill);
    fills.push(fill);
    const t = el('text', { x: 200, y: y0 + h / 2 + 5, 'text-anchor': 'middle', fill: '#ffffff', 'font-size': 15, 'font-weight': 600 });
    t.textContent = NAMES[i];
    labels.appendChild(t);
    const n = el('text', { x: 200 - w0 / 2 - 12, y: y0 + 16, 'text-anchor': 'end', fill: 'rgba(255,255,255,0.4)', 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' });
    n.textContent = `0${i + 1}`;
    labels.appendChild(n);
  }
  const glow = el('circle', { cx: 200, cy: top, r: 14, fill: 'rgba(255,255,255,0.18)' });
  const drop = el('circle', { cx: 200, cy: top, r: 5, fill: '#ffffff' });
  flow.appendChild(glow);
  flow.appendChild(drop);

  if (reduceMotion) {
    steps.forEach((s) => s.classList.add('is-on'));
    fills.forEach((f) => f.classList.add('is-on'));
    return;
  }

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 62%',
      onEnter: () => {
        step.classList.add('is-on');
        fills[i].classList.add('is-on');
      },
      onLeaveBack: () => {
        step.classList.remove('is-on');
        fills[i].classList.remove('is-on');
      },
    });
  });

  const pos = { y: top };
  gsap.to(pos, {
    y: top + N * (h + gap) - gap,
    ease: 'none',
    onUpdate: () => {
      drop.setAttribute('cy', pos.y);
      glow.setAttribute('cy', pos.y);
    },
    scrollTrigger: { trigger: list, start: 'top 62%', end: 'bottom 62%', scrub: 0.5 },
  });
}
