import { gsap } from 'gsap';

/** Vapor da respiração: nuvens suaves que nascem no focinho, abrem e se dissipam. */
export function initVapor(canvas, { every = 3.4, reduceMotion = false, dprMax = 1 } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { breathe() {}, start() {}, stop() {}, setAnchor() {}, setRunning() {} };

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 96;
  const sctx = sprite.getContext('2d');
  const g = sctx.createRadialGradient(48, 48, 0, 48, 48, 48);
  g.addColorStop(0, 'rgba(226,238,248,0.62)');
  g.addColorStop(0.4, 'rgba(214,230,244,0.3)');
  g.addColorStop(0.75, 'rgba(204,222,238,0.07)');
  g.addColorStop(1, 'rgba(204,222,238,0)');
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, 96, 96);

  let w = 0;
  let h = 0;
  const anchor = { x: 0, y: 0 };
  const puffs = [];
  let running = true;
  let loop = null;
  let dirty = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // dir: para onde o lobo olha (1 = direita, -1 = esquerda); o vapor sai para a frente e sobe
  const dir = { x: 1 };
  // O lobo olha para a câmera: o vapor vem "para a frente", ou seja, cresce
  // e se abre, com uma deriva leve para o lado que ele encara e para cima.
  function breathe(strength = 1) {
    const n = 14 + Math.round(Math.random() * 6);
    const scale = Math.max(0.6, w / 1440);
    for (let i = 0; i < n; i += 1) {
      const delay = Math.random() * 0.6; // a expiração dura mais de meio segundo
      const a = -0.5 + (Math.random() - 0.5) * 1.1; // leque: frente e para cima
      const sp = (16 + Math.random() * 22) * scale * strength;
      puffs.push({
        x: anchor.x + dir.x * (2 + Math.random() * 10) * scale + (Math.random() - 0.5) * 8 * scale,
        y: anchor.y + (Math.random() - 0.3) * 8 * scale,
        vx: Math.cos(a) * sp * dir.x,
        vy: Math.sin(a) * sp - 5 * scale,
        size: (22 + Math.random() * 26) * scale,
        grow: 3 + Math.random() * 2.2,
        age: -delay,
        life: 2.8 + Math.random() * 1.8,
        alpha: 0.4 + Math.random() * 0.25,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  function render(_t, deltaTime) {
    if (!running) return;
    if (!puffs.length) {
      if (dirty) {
        ctx.clearRect(0, 0, w, h);
        dirty = false;
      }
      return;
    }
    dirty = true;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    ctx.clearRect(0, 0, w, h);
    for (let i = puffs.length - 1; i >= 0; i -= 1) {
      const p = puffs[i];
      p.age += dt;
      if (p.age < 0) continue;
      if (p.age >= p.life) {
        puffs.splice(i, 1);
        continue;
      }
      const t = p.age / p.life;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - dt * 0.9;
      p.vy = p.vy * (1 - dt * 0.6) - 6 * dt;
      p.rot += p.spin * dt;
      const size = p.size * (1 + t * p.grow);
      const alpha = p.alpha * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (1 - t * 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }
  gsap.ticker.add(render);

  return {
    breathe,
    setDpr(d) {
      dprMax = d;
      resize();
    },
    setAnchor(x, y, facing = 1) {
      anchor.x = x;
      anchor.y = y;
      dir.x = facing;
    },
    start() {
      if (reduceMotion) return;
      if (loop) loop.kill();
      const tick = () => {
        breathe(0.9 + Math.random() * 0.3);
        loop = gsap.delayedCall(every * (0.9 + Math.random() * 0.2), tick);
      };
      tick();
    },
    stop() {
      if (loop) loop.kill();
      loop = null;
    },
    setRunning(v) {
      running = v;
    },
  };
}
