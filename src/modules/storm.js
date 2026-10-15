import { gsap } from 'gsap';

/**
 * Tempestade: raios procedurais (ramificados, com brilho), flash no céu,
 * tremor sutil de câmera e relâmpagos difusos entre um raio e outro.
 */
export function initStorm(canvas, { flash, shake, origin = [0.8, 0.3], every = [6, 13], reduceMotion = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { strike() {}, start() {}, stop() {}, setRunning() {} };

  let w = 0;
  let h = 0;
  let dpr = 1;
  const bolts = [];
  let running = true;
  let scheduled = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function makePath(x0, y0, x1, y1, jitter, depth = 7) {
    let pts = [
      [x0, y0],
      [x1, y1],
    ];
    for (let d = 0; d < depth; d += 1) {
      const next = [pts[0]];
      for (let i = 1; i < pts.length; i += 1) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const mx = (ax + bx) / 2 + (Math.random() - 0.5) * jitter;
        const my = (ay + by) / 2 + (Math.random() - 0.5) * jitter * 0.5;
        next.push([mx, my], [bx, by]);
      }
      pts = next;
      jitter *= 0.55;
    }
    return pts;
  }

  function makeBolt(ox, oy, intensity) {
    const sx = ox * w;
    const sy = -10;
    const ex = sx + (Math.random() - 0.5) * w * 0.14;
    const ey = oy * h + Math.random() * h * 0.08;
    const main = makePath(sx, sy, ex, ey, w * 0.12);
    const branches = [];
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i += 1) {
      const at = main[Math.floor(main.length * (0.25 + Math.random() * 0.55))];
      const len = (0.1 + Math.random() * 0.18) * h;
      const dir = Math.random() < 0.5 ? -1 : 1;
      branches.push(makePath(at[0], at[1], at[0] + dir * len * (0.5 + Math.random()), at[1] + len, w * 0.05, 5));
    }
    return { main, branches, born: performance.now(), life: 380 + intensity * 160, intensity };
  }

  function drawPath(pts, width, color, blur) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.shadowBlur = blur;
    ctx.shadowColor = color;
    ctx.stroke();
  }

  function render() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const now = performance.now();
    for (let i = bolts.length - 1; i >= 0; i -= 1) {
      const b = bolts[i];
      const t = (now - b.born) / b.life;
      if (t >= 1) {
        bolts.splice(i, 1);
        continue;
      }
      // cintila nos primeiros instantes, depois apaga
      const flicker = t < 0.35 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 60)) : 1;
      const a = Math.pow(1 - t, 1.6) * flicker * b.intensity;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'lighter';
      drawPath(b.main, 14, `rgba(140,200,255,${a * 0.18})`, 40);
      drawPath(b.main, 5, `rgba(190,230,255,${a * 0.6})`, 18);
      drawPath(b.main, 1.6, `rgba(255,255,255,${a})`, 6);
      b.branches.forEach((br) => {
        drawPath(br, 3, `rgba(190,230,255,${a * 0.35})`, 12);
        drawPath(br, 1, `rgba(255,255,255,${a * 0.7})`, 4);
      });
      ctx.restore();
    }
  }
  gsap.ticker.add(render);

  function strike({ x = origin[0], y = origin[1], intensity = 1, bolt = true } = {}) {
    if (reduceMotion) intensity *= 0.5;
    if (bolt && !reduceMotion) bolts.push(makeBolt(x, y, intensity));
    if (flash) {
      flash.style.setProperty('--fx', `${x * 100}%`);
      flash.style.setProperty('--fy', `${y * 100}%`);
      gsap.killTweensOf(flash);
      gsap
        .timeline()
        .to(flash, { opacity: 0.95 * intensity, duration: 0.04 })
        .to(flash, { opacity: 0.25 * intensity, duration: 0.08 })
        .to(flash, { opacity: 0.75 * intensity, duration: 0.05 })
        .to(flash, { opacity: 0, duration: 0.6, ease: 'power2.out' });
    }
    if (shake && !reduceMotion && intensity > 0.5) {
      gsap.killTweensOf(shake, 'x,y');
      gsap
        .timeline()
        .to(shake, { x: 3 * intensity, y: -2 * intensity, duration: 0.05 })
        .to(shake, { x: -3 * intensity, y: 2 * intensity, duration: 0.05 })
        .to(shake, { x: 2 * intensity, y: -1 * intensity, duration: 0.05 })
        .to(shake, { x: 0, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }

  function schedule() {
    const [min, max] = every;
    scheduled = gsap.delayedCall(min + Math.random() * (max - min), () => {
      if (!running) return;
      const big = Math.random() < 0.45;
      strike({
        x: origin[0] + (Math.random() - 0.5) * 0.2,
        y: origin[1] + (Math.random() - 0.5) * 0.08,
        intensity: big ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.25,
        bolt: big,
      });
      schedule();
    });
  }

  return {
    strike,
    start() {
      if (scheduled) scheduled.kill();
      schedule();
    },
    stop() {
      if (scheduled) scheduled.kill();
      scheduled = null;
    },
    setRunning(v) {
      running = v;
      if (!v) ctx.clearRect(0, 0, w, h);
    },
  };
}
