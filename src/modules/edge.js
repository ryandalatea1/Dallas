import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/** Diferenciais: números surgem e uma linha luminosa liga os quatro pontos conforme o scroll. */
export function initEdge() {
  const wrap = document.getElementById('pillars');
  const svg = document.getElementById('pillars-lines');
  if (!wrap || !svg) return;
  const path = svg.querySelector('path');
  const nums = Array.from(wrap.querySelectorAll('.pillar__num'));

  function draw() {
    const r = wrap.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    const pts = nums.map((n) => {
      const b = n.getBoundingClientRect();
      return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2];
    });
    if (pts.length < 2) return;
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i += 1) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    path.setAttribute('d', d);
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    return len;
  }

  draw();
  gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top 75%', end: 'bottom 55%', scrub: 0.6, invalidateOnRefresh: true, onRefresh: draw },
  });

  nums.forEach((num) => {
    const split = new SplitText(num, { type: 'chars', charsClass: 'char' });
    gsap.from(split.chars, {
      yPercent: 110,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.08,
      scrollTrigger: { trigger: num, start: 'top 82%', once: true },
    });
  });

  gsap.utils.toArray('.pillar').forEach((p) => {
    ScrollTrigger.create({ trigger: p, start: 'top 72%', onEnter: () => p.classList.add('is-lit') });
  });
}
