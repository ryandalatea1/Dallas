import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

/**
 * Jornada "do anúncio à conversa": uma linha liga as sete etapas, desenha-se
 * com o scroll, e um ponto de luz (o cliente) percorre o caminho sem parar.
 */
export function initJourney() {
  const wrap = document.getElementById('journey');
  const svg = document.getElementById('journey-svg');
  if (!wrap || !svg) return;
  const track = svg.querySelector('.journey__track');
  const draw = svg.querySelector('.journey__draw');
  const dot = svg.querySelector('.journey__dot');
  const nodes = Array.from(wrap.querySelectorAll('.jnode__dot'));
  let traveler = null;

  function layout() {
    const r = wrap.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    const pts = nodes.map((n) => {
      const b = n.getBoundingClientRect();
      return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2];
    });
    if (pts.length < 2) return;
    const vertical = Math.abs(pts[1][0] - pts[0][0]) < 10;
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i += 1) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      if (vertical) d += ` L ${x1} ${y1}`;
      else {
        const cx = (x0 + x1) / 2;
        d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
      }
    }
    track.setAttribute('d', d);
    draw.setAttribute('d', d);
    const len = draw.getTotalLength();
    draw.style.strokeDasharray = `${len}`;
    draw.style.strokeDashoffset = `${len}`;
    if (traveler) traveler.kill();
    traveler = gsap.to(dot, {
      duration: 9,
      repeat: -1,
      ease: 'none',
      motionPath: { path: draw, align: draw, alignOrigin: [0.5, 0.5] },
    });
  }

  layout();
  gsap.to(draw, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top 80%', end: 'bottom 60%', scrub: 0.6, invalidateOnRefresh: true, onRefresh: layout },
  });
  wrap.querySelectorAll('.jnode').forEach((node) => {
    ScrollTrigger.create({ trigger: node, start: 'top 78%', onEnter: () => node.classList.add('is-lit') });
  });
  window.addEventListener('resize', () => requestAnimationFrame(layout));
}
