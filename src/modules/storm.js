import { gsap } from 'gsap';

/**
 * Tempestade: raios procedurais (ramificados, com brilho), flash no céu,
 * tremor sutil de câmera e relâmpagos difusos entre um raio e outro.
 */
export function initStorm(canvas, { flash, shake, origin = [0.8, 0.3], every = [6, 13], meteors = false, onStrike = null, reduceMotion = false, dprMax = 2 } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { strike() {}, start() {}, stop() {}, setRunning() {} };

  let w = 0;
  let h = 0;
  let dpr = 1;
  const bolts = [];
  const stars = [];
  let running = true;
  let scheduled = null;
  let meteorTimer = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, dprMax);
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
    const count = 3 + Math.floor(Math.random() * 3);
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

  function spawnMeteor() {
    const dir = Math.random() < 0.6 ? 1 : -1;
    const angle = (0.32 + Math.random() * 0.3) * dir;
    const speed = (420 + Math.random() * 380) * (w / 1440);
    stars.push({
      x: (0.12 + Math.random() * 0.76) * w,
      y: (0.04 + Math.random() * 0.26) * h,
      vx: Math.cos(angle) * speed * (dir === 1 ? 1 : -1) * (dir === 1 ? 1 : -1),
      vy: Math.abs(Math.sin(angle)) * speed,
      len: 90 + Math.random() * 140,
      born: performance.now(),
      life: 650 + Math.random() * 450,
    });
  }

  function scheduleMeteor() {
    meteorTimer = gsap.delayedCall(4 + Math.random() * 7, () => {
      if (!running) return;
      spawnMeteor();
      if (Math.random() < 0.25) gsap.delayedCall(0.35, spawnMeteor);
      scheduleMeteor();
    });
  }

  function render() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const now = performance.now();

    // estrelas cadentes
    for (let i = stars.length - 1; i >= 0; i -= 1) {
      const s = stars[i];
      const t = (now - s.born) / s.life;
      if (t >= 1) {
        stars.splice(i, 1);
        continue;
      }
      const x = s.x + (s.vx * (now - s.born)) / 1000;
      const y = s.y + (s.vy * (now - s.born)) / 1000;
      const a = Math.sin(Math.PI * t);
      const mag = Math.hypot(s.vx, s.vy);
      const tx = x - (s.vx / mag) * s.len * a;
      const ty = y - (s.vy / mag) * s.len * a;
      const g = ctx.createLinearGradient(tx, ty, x, y);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, `rgba(255,255,255,${0.9 * a})`);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(200,225,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

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

  function strike({ x = origin[0], y = origin[1], intensity = 1, bolt = true, echo = true } = {}) {
    if (reduceMotion) intensity *= 0.5;
    if (bolt && !reduceMotion) bolts.push(makeBolt(x, y, intensity));
    if (onStrike) onStrike(intensity);
    // às vezes o raio vem em dupla
    if (echo && bolt && !reduceMotion && Math.random() < 0.35) {
      gsap.delayedCall(0.12 + Math.random() * 0.2, () => strike({ x: x + (Math.random() - 0.5) * 0.08, y, intensity: intensity * 0.7, bolt: true, echo: false }));
    }
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
      if (meteors && !reduceMotion) {
        if (meteorTimer) meteorTimer.kill();
        scheduleMeteor();
      }
    },
    stop() {
      if (scheduled) scheduled.kill();
      scheduled = null;
      if (meteorTimer) meteorTimer.kill();
      meteorTimer = null;
    },
    setRunning(v) {
      running = v;
      if (!v) ctx.clearRect(0, 0, w, h);
    },
  };
}
