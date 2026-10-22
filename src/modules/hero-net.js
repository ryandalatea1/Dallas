import { gsap } from 'gsap';

/**
 * Hero: uma constelação de pontos ligados por linhas finas, dois feixes de luz
 * e uma órbita brilhante que percorre a jornada do cliente, acendendo cada
 * etapa (anúncio, site, WhatsApp, CRM, venda). Canvas 2D, pausa fora da tela.
 */
export function initHeroNet({ reduceMotion = false } = {}) {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('hero-net');
  const wrap = document.getElementById('hero-chips');
  if (!hero || !canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const chips = wrap ? [...wrap.querySelectorAll('.chip')] : [];

  let W = 0;
  let H = 0;
  let mobile = false;
  let nodes = [];
  let pairs = [];
  let anchors = [];
  let poly = []; // pontos do caminho, com comprimento acumulado
  let total = 1;
  let running = true;
  let time = 0;
  let acc = 0;
  const orb = { s: 0, a: 0 };
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let tl = null;

  const glow = document.createElement('canvas');
  glow.width = glow.height = 96;
  {
    const g = glow.getContext('2d');
    const r = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    r.addColorStop(0, 'rgba(255,255,255,0.95)');
    r.addColorStop(0.18, 'rgba(255,255,255,0.45)');
    r.addColorStop(0.5, 'rgba(220,225,240,0.12)');
    r.addColorStop(1, 'rgba(220,225,240,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 96, 96);
  }

  // números "aleatórios" estáveis: o desenho não muda a cada visita
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  function catmull(points, steps = 36) {
    const out = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      for (let s = 0; s < steps; s += 1) {
        const t = s / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        out.push({
          x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
          anchor: s === 0 ? i : -1,
        });
      }
    }
    const last = points[points.length - 1];
    out.push({ x: last.x, y: last.y, anchor: points.length - 1 });
    let len = 0;
    out.forEach((p, i) => {
      if (i) len += Math.hypot(p.x - out[i - 1].x, p.y - out[i - 1].y);
      p.len = len;
    });
    return out;
  }

  function pointAt(s) {
    if (!poly.length) return { x: 0, y: 0 };
    let lo = 0;
    let hi = poly.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (poly[mid].len < s) lo = mid;
      else hi = mid;
    }
    const a = poly[lo];
    const b = poly[hi];
    const t = b.len === a.len ? 0 : (s - a.len) / (b.len - a.len);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  function layout() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    mobile = W < 900;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    seed = 7;
    const n = mobile ? 34 : 76;
    nodes = [];
    for (let i = 0; i < n; i += 1) {
      const fx = mobile ? rand() * 1.05 : 0.26 + 0.8 * Math.pow(rand(), 0.75);
      nodes.push({
        x: fx * W,
        y: (rand() * 1.08 - 0.04) * H,
        r: 0.7 + rand() * 1.9,
        a: 0.2 + rand() * 0.6,
        ph: rand() * Math.PI * 2,
        sp: 0.25 + rand() * 0.6,
        depth: 0.3 + rand() * 0.9,
      });
    }
    pairs = [];
    const maxD = mobile ? 130 : 185;
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < maxD) pairs.push([i, j, 1 - d / maxD]);
      }
    }

    const active = mobile ? chips.filter((c) => +c.dataset.mx > 0) : chips;
    chips.forEach((c) => {
      c.style.display = active.includes(c) ? '' : 'none';
    });
    anchors = active.map((c) => {
      const fx = mobile ? +c.dataset.mx : +c.dataset.x;
      const fy = mobile ? +c.dataset.my : +c.dataset.y;
      const cw = c.offsetWidth;
      const ch = c.offsetHeight;
      let left = fx * W;
      if (left + cw > W - 14) left = W - 14 - cw;
      const top = fy * H - ch / 2;
      c.style.left = `${Math.round(left)}px`;
      c.style.top = `${Math.round(top)}px`;
      return { x: left - 18, y: fy * H, chip: c, lit: 0 };
    });
    if (!anchors.length) return;
    const first = anchors[0];
    const last = anchors[anchors.length - 1];
    const pts = [{ x: first.x - (mobile ? 60 : 160), y: first.y - (mobile ? 60 : 180) }, ...anchors, { x: last.x - (mobile ? 30 : 200), y: last.y + (mobile ? 60 : 160) }];
    poly = catmull(pts);
    total = poly[poly.length - 1].len;
    anchors.forEach((a, i) => {
      a.len = poly.find((p) => p.anchor === i + 1).len;
    });
    buildTimeline();
  }

  function light(i) {
    const a = anchors[i];
    if (!a) return;
    a.lit = 1;
    a.chip.classList.add('is-lit');
    gsap.to(a, { lit: 0, duration: 2.2, delay: 0.6, ease: 'power2.out' });
    setTimeout(() => a.chip.classList.remove('is-lit'), 1800);
  }

  function buildTimeline() {
    if (tl) tl.kill();
    orb.s = 0;
    orb.a = 0;
    if (reduceMotion) return;
    tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: !running });
    tl.to(orb, { a: 1, duration: 0.5 }, 0);
    let prev = 0;
    anchors.forEach((a, i) => {
      const dur = Math.max(0.6, (a.len - prev) / (mobile ? 150 : 240));
      tl.to(orb, { s: a.len, duration: dur, ease: 'power1.inOut' });
      tl.call(() => light(i));
      tl.to({}, { duration: 0.45 });
      prev = a.len;
    });
    tl.to(orb, { s: total, a: 0, duration: 1.2, ease: 'power1.in' });
  }

  function beam(x0, y0, x1, y1, alpha, t) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    const p = (t % 1.6) - 0.3;
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(Math.min(0.99, Math.max(0.01, p)), `rgba(255,255,255,${alpha * 2.4})`);
    g.addColorStop(Math.min(1, Math.max(0.02, p + 0.18)), `rgba(255,255,255,${alpha})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  function draw(dt) {
    time += dt;
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3);
    ctx.clearRect(0, 0, W, H);

    // feixes de luz diagonais
    beam(W * 0.32, H * 0.82, W * 1.05, H * 0.1, 0.07, time * 0.09);
    beam(W * 0.1, H * 1.02, W * 1.1, H * 0.48, 0.05, time * 0.07 + 0.7);

    // arcos grandes, como um globo
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.beginPath();
    ctx.arc(W * 1.06, H * 0.46, H * 0.78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W * 0.78, H * 1.55, H * 1.22, 0, Math.PI * 2);
    ctx.stroke();

    // posições com deriva e paralaxe do mouse
    const mx = mouse.x - 0.5;
    const my = mouse.y - 0.5;
    const pos = nodes.map((n) => ({
      x: n.x + Math.sin(time * 0.3 * n.sp + n.ph) * 7 - mx * 34 * n.depth,
      y: n.y + Math.cos(time * 0.25 * n.sp + n.ph) * 7 - my * 22 * n.depth,
    }));

    // linhas em três faixas de opacidade (poucas chamadas de desenho)
    [
      [0, 0.33, 0.035],
      [0.33, 0.66, 0.07],
      [0.66, 1.01, 0.12],
    ].forEach(([lo, hi, alpha]) => {
      ctx.beginPath();
      for (const [i, j, k] of pairs) {
        if (k < lo || k >= hi) continue;
        ctx.moveTo(pos[i].x, pos[i].y);
        ctx.lineTo(pos[j].x, pos[j].y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.stroke();
    });

    // pontos
    ctx.fillStyle = '#fff';
    nodes.forEach((n, i) => {
      ctx.globalAlpha = n.a * (0.55 + 0.45 * Math.sin(time * n.sp * 1.4 + n.ph));
      ctx.beginPath();
      ctx.arc(pos[i].x, pos[i].y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (!poly.length) return;
    // caminho da jornada
    ctx.beginPath();
    poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    // rastro da órbita
    if (orb.a > 0.01) {
      const len = mobile ? 90 : 170;
      const steps = 16;
      for (let k = 0; k < steps; k += 1) {
        const s0 = orb.s - len + (len * k) / steps;
        const s1 = orb.s - len + (len * (k + 1)) / steps;
        if (s1 <= 0) continue;
        const a = pointAt(Math.max(0, s0));
        const b = pointAt(s1);
        ctx.strokeStyle = `rgba(255,255,255,${(k / steps) * 0.75 * orb.a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    }

    // nós das etapas
    anchors.forEach((a) => {
      ctx.fillStyle = `rgba(255,255,255,${0.45 + a.lit * 0.55})`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 3.2 + a.lit * 1.6, 0, Math.PI * 2);
      ctx.fill();
      if (a.lit > 0.02) {
        ctx.globalAlpha = a.lit * 0.8;
        ctx.drawImage(glow, a.x - 40, a.y - 40, 80, 80);
        ctx.globalAlpha = 1;
      }
    });

    // órbita
    if (orb.a > 0.01) {
      const p = pointAt(orb.s);
      ctx.globalAlpha = orb.a;
      ctx.drawImage(glow, p.x - 48, p.y - 48, 96, 96);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function tick(_t, deltaTime) {
    if (!running) return;
    const dt = Math.min(deltaTime || 16, 60) / 1000;
    acc += dt;
    // no celular, 30 quadros por segundo bastam
    if (mobile && acc < 1 / 30) return;
    draw(acc);
    acc = 0;
  }

  layout();
  draw(0);
  gsap.ticker.add(tick);

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      layout();
      draw(0);
    }, 150);
  });
  if (window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      mouse.tx = e.clientX / W;
      mouse.ty = e.clientY / H;
    });
  }
  new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting && !document.hidden;
    if (tl) {
      if (running) tl.play();
      else tl.pause();
    }
  }).observe(hero);

  return {
    showChips() {
      gsap.fromTo(chips, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.5, clearProps: 'y' });
      setTimeout(() => layout(), 50);
    },
    layout,
  };
}
