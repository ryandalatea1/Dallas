import { gsap } from 'gsap';

/**
 * Fumaça/névoa rasteira: nuvens suaves que rolam devagar pelo chão da cena,
 * com rajadas, e que acendem quando cai um raio. Canvas 2D com sprites
 * pré-renderizados, barato o bastante para rodar junto com o vídeo.
 */
export function initSmoke(canvas, { count = 26, zone = [0.45, 1.05], tint = '200,215,235', opacity = 1, reduceMotion = false, dprMax = 0.6, fps = 30 } = {}) {
  let activeCount = count;
  let frameEvery = 1 / fps;
  let acc = 0;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setRunning() {}, flash() {}, resize() {} };

  const sprites = [0, 1, 2].map((variant) => {
    const s = document.createElement('canvas');
    s.width = s.height = 256;
    const c = s.getContext('2d');
    const blobs = 7 + variant * 3;
    for (let i = 0; i < blobs; i += 1) {
      const x = 128 + (Math.random() - 0.5) * 120;
      const y = 128 + (Math.random() - 0.5) * 90;
      const r = 50 + Math.random() * 70;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${tint},${0.16 + Math.random() * 0.1})`);
      g.addColorStop(0.55, `rgba(${tint},0.06)`);
      g.addColorStop(1, `rgba(${tint},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 256);
    }
    return s;
  });

  let w = 0;
  let h = 0;
  const puffs = [];
  const state = { running: true, frozen: false, time: 0, flash: 0 };

  function spawn(p, initial) {
    const scale = Math.max(0.7, w / 1440);
    p.size = (260 + Math.random() * 460) * scale;
    p.x = initial ? Math.random() * (w + p.size) - p.size / 2 : -p.size / 2;
    p.y = h * (zone[0] + Math.random() * (zone[1] - zone[0]));
    p.vx = (8 + Math.random() * 16) * scale;
    p.a = 0.35 + Math.random() * 0.5;
    p.sprite = sprites[Math.floor(Math.random() * sprites.length)];
    p.phase = Math.random() * Math.PI * 2;
    p.rot = (Math.random() - 0.5) * 0.6;
    p.spin = (Math.random() - 0.5) * 0.04;
    p.flip = Math.random() < 0.5 ? -1 : 1;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    puffs.length = 0;
    for (let i = 0; i < activeCount; i += 1) {
      const p = {};
      spawn(p, true);
      puffs.push(p);
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function render(_t, deltaTime) {
    if (!state.running || state.frozen || !w) return;
    // a névoa é lenta: 30 quadros por segundo bastam e custam metade
    acc += Math.min(deltaTime || 16, 50) / 1000;
    if (acc < frameEvery) return;
    draw(acc);
    acc = 0;
  }

  function draw(dt) {
    if (!reduceMotion) state.time += dt;
    state.flash = Math.max(0, state.flash - dt * 1.8);
    const gust = 0.7 + 0.3 * Math.sin(state.time * 0.3) + 0.2 * Math.sin(state.time * 0.9 + 1.3);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'screen';
    for (const p of puffs) {
      if (!reduceMotion) {
        p.x += p.vx * gust * dt;
        p.rot += p.spin * dt;
        if (p.x - p.size / 2 > w) spawn(p, false);
      }
      const y = p.y + Math.sin(state.time * 0.35 + p.phase) * 14;
      const alpha = p.a * opacity * (0.55 + 0.45 * Math.sin(state.time * 0.5 + p.phase)) * (1 + state.flash * 1.6);
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.translate(p.x, y);
      ctx.rotate(p.rot);
      ctx.scale(p.flip, 1);
      ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  gsap.ticker.add(render);

  return {
    resize,
    flash(intensity = 1) {
      state.flash = Math.max(state.flash, intensity);
    },
    setRunning(v) {
      state.running = v;
      if (!v && !state.frozen) ctx.clearRect(0, 0, w, h);
    },
    // menos névoa, menor resolução, menos quadros: mesma cara, muito mais leve
    setQuality({ dpr, count: n, fps: f } = {}) {
      if (dpr) dprMax = dpr;
      if (n) activeCount = n;
      if (f) frameEvery = 1 / f;
      resize();
    },
    // para a animação mas deixa a névoa desenhada
    freeze() {
      state.frozen = true;
      if (w) draw(0);
    },
  };
}
