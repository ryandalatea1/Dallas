import { gsap } from 'gsap';

/**
 * Rede de pontos e linhas do hero. As etiquetas do caminho do cliente (chips)
 * viram nós fixos, ligados em sequência, com um pulso que percorre o trajeto.
 */
export function initConstellation(canvas, { chips = [], reduceMotion = false, finePointer = true } = {}) {
  const ctx = canvas.getContext('2d');
  const state = { reveal: 0, running: true, time: 0 };
  if (!ctx) return { state, setRunning() {}, resize() {} };

  const COUNT = window.innerWidth < 900 ? 50 : 90;
  const LINK = 140;
  const nodes = [];
  let anchors = [];
  let w = 0;
  let h = 0;
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  const zone = () => (w > 900 ? { x0: w * 0.44, x1: w + 20, y0: -20, y1: h + 20 } : { x0: -20, x1: w + 20, y0: -20, y1: h * 0.6 });
  const rand = (a, b) => a + Math.random() * (b - a);

  function seed() {
    nodes.length = 0;
    const z = zone();
    for (let i = 0; i < COUNT; i += 1) {
      nodes.push({
        x: rand(z.x0, z.x1),
        y: rand(z.y0, z.y1),
        vx: rand(-5, 5),
        vy: rand(-5, 5),
        r: rand(0.9, 2.2),
        a: rand(0.25, 0.75),
      });
    }
  }

  function measureAnchors() {
    anchors = chips.map((chip) => {
      const cs = getComputedStyle(chip);
      const px = parseFloat(cs.getPropertyValue('--x')) / 100;
      const py = parseFloat(cs.getPropertyValue('--y')) / 100;
      return { x: px * w, y: py * h };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    measureAnchors();
  }
  resize();
  window.addEventListener('resize', resize);

  if (finePointer) {
    window.addEventListener(
      'pointermove',
      (event) => {
        const r = canvas.getBoundingClientRect();
        pointer.tx = (event.clientX - r.left) / r.width;
        pointer.ty = (event.clientY - r.top) / r.height;
      },
      { passive: true }
    );
  }

  function draw(_t, deltaTime) {
    if (!state.running || !w) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    if (!reduceMotion) state.time += dt;
    const k = 1 - Math.pow(0.01, dt);
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;
    const ox = (pointer.x - 0.5) * -26;
    const oy = (pointer.y - 0.5) * -18;
    const z = zone();
    const rv = state.reveal;
    const showChips = w > 900;

    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    // deriva lenta dos nós
    if (!reduceMotion) {
      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < z.x0) n.x = z.x1;
        if (n.x > z.x1) n.x = z.x0;
        if (n.y < z.y0) n.y = z.y1;
        if (n.y > z.y1) n.y = z.y0;
      }
    }

    // ligações entre nós próximos
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        const d = Math.sqrt(d2);
        ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * 0.16 * rv})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x + ox, a.y + oy);
        ctx.lineTo(b.x + ox, b.y + oy);
        ctx.stroke();
      }
    }

    // nós
    for (const n of nodes) {
      ctx.fillStyle = `rgba(255,255,255,${n.a * rv})`;
      ctx.beginPath();
      ctx.arc(n.x + ox, n.y + oy, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!showChips || !anchors.length) return;

    // cada etiqueta se prende aos três nós mais próximos
    for (const an of anchors) {
      const near = nodes
        .map((n) => ({ n, d: Math.hypot(n.x - an.x, n.y - an.y) }))
        .sort((p, q) => p.d - q.d)
        .slice(0, 3);
      for (const { n, d } of near) {
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.26 - d / 1200) * rv})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(an.x + ox * 0.6, an.y + oy * 0.6);
        ctx.lineTo(n.x + ox, n.y + oy);
        ctx.stroke();
      }
    }

    // trajeto do cliente: etiqueta a etiqueta
    ctx.strokeStyle = `rgba(255,255,255,${0.3 * rv})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    anchors.forEach((an, i) => {
      const x = an.x + ox * 0.6;
      const y = an.y + oy * 0.6;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // pulso percorrendo o trajeto
    const segs = anchors.length - 1;
    const p = (state.time * 0.16) % 1;
    const si = Math.min(segs - 1, Math.floor(p * segs));
    const sp = p * segs - si;
    const A = anchors[si];
    const B = anchors[si + 1];
    const px = A.x + (B.x - A.x) * sp + ox * 0.6;
    const py = A.y + (B.y - A.y) * sp + oy * 0.6;
    const glow = ctx.createRadialGradient(px, py, 0, px, py, 22);
    glow.addColorStop(0, `rgba(255,255,255,${0.9 * rv})`);
    glow.addColorStop(0.25, `rgba(255,255,255,${0.35 * rv})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, 22, 0, Math.PI * 2);
    ctx.fill();

    // nós das etiquetas
    for (const an of anchors) {
      const x = an.x + ox * 0.6;
      const y = an.y + oy * 0.6;
      ctx.fillStyle = `rgba(255,255,255,${0.9 * rv})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${0.25 * rv})`;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  gsap.ticker.add(draw);

  return {
    state,
    resize,
    setRunning(value) {
      state.running = value;
    },
  };
}
