import { gsap } from 'gsap';

/**
 * Partículas de luz: pontinhos de gelo que sobem devagar pela cena, oscilam
 * com o vento e acendem quando cai um raio. Canvas 2D, leve.
 */
export function initMotes(canvas, { count = 36, tint = '200,222,255', reduceMotion = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setRunning() {}, flash() {}, resize() {} };
  let w = 0;
  let h = 0;
  const dots = [];
  const state = { running: false, time: 0, flash: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(d, initial) {
    d.x = Math.random() * w;
    d.y = initial ? Math.random() * h : h + 10;
    d.r = 0.6 + Math.random() * 1.1;
    d.vy = 6 + Math.random() * 14;
    d.sw = 0.3 + Math.random() * 0.8;
    d.ph = Math.random() * Math.PI * 2;
    d.a = 0.2 + Math.random() * 0.45;
    d.tw = 0.6 + Math.random() * 1.8;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < count; i += 1) {
    const d = {};
    spawn(d, true);
    dots.push(d);
  }

  function render(_t, deltaTime) {
    if (!state.running || !w) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    state.time += dt;
    state.flash = Math.max(0, state.flash - dt * 1.6);
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      if (!reduceMotion) {
        d.y -= d.vy * dt;
        d.x += Math.sin(state.time * d.sw + d.ph) * 8 * dt;
        if (d.y < -10) spawn(d, false);
      }
      const tw = 0.55 + 0.45 * Math.sin(state.time * d.tw + d.ph);
      const alpha = Math.min(1, d.a * tw + state.flash * 0.6);
      const r = d.r * (1 + state.flash * 0.5);
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 4);
      g.addColorStop(0, `rgba(${tint},${alpha})`);
      g.addColorStop(0.35, `rgba(${tint},${alpha * 0.35})`);
      g.addColorStop(1, `rgba(${tint},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x, d.y, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  gsap.ticker.add(render);

  return {
    resize,
    flash(intensity = 1) {
      state.flash = Math.max(state.flash, intensity);
    },
    setRunning(v) {
      state.running = v;
      if (v) resize();
      else ctx.clearRect(0, 0, w, h);
    },
    setCount(n) {
      while (dots.length > n) dots.pop();
      while (dots.length < n) {
        const d = {};
        spawn(d, true);
        dots.push(d);
      }
    },
  };
}
