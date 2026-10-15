import { gsap } from 'gsap';

/**
 * Partículas de luz (as mesmas "faíscas" do fundo da logo) sobre o hero.
 * Canvas 2D com sprite pré-renderizado, leve o bastante para rodar sempre.
 */
export function initParticles(canvas, { count = 70, reduceMotion = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setRunning() {} };

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  const sctx = sprite.getContext('2d');
  const gradient = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(190,255,150,1)');
  gradient.addColorStop(0.25, 'rgba(120,255,60,0.8)');
  gradient.addColorStop(0.6, 'rgba(107,255,46,0.18)');
  gradient.addColorStop(1, 'rgba(107,255,46,0)');
  sctx.fillStyle = gradient;
  sctx.fillRect(0, 0, 64, 64);

  let width = 0;
  let height = 0;
  const particles = [];
  const pointer = { x: -9999, y: -9999 };
  let running = true;

  function spawn(p, initial) {
    p.x = Math.random() * width;
    p.y = initial ? Math.random() * height : height + 20;
    const big = Math.random() < 0.14;
    p.r = big ? 7 + Math.random() * 11 : 1.2 + Math.random() * 2.6;
    p.a = big ? 0.08 + Math.random() * 0.14 : 0.25 + Math.random() * 0.55;
    p.vy = big ? 5 + Math.random() * 8 : 9 + Math.random() * 22;
    p.vx = (Math.random() - 0.5) * 6;
    p.phase = Math.random() * Math.PI * 2;
    p.twinkle = 0.6 + Math.random() * 1.8;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < count; i += 1) {
    const p = {};
    spawn(p, true);
    particles.push(p);
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    },
    { passive: true }
  );

  let time = 0;

  function draw(_t, deltaTime) {
    if (!running) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    time += dt;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      if (!reduceMotion) {
        p.y -= p.vy * dt;
        p.x += (p.vx + Math.sin(time * 0.5 + p.phase) * 5) * dt;

        // o cursor afasta levemente as faíscas
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0.01) {
          const push = (1 - dist / 120) * 40 * dt;
          p.x += (dx / dist) * push;
          p.y += (dy / dist) * push;
        }
        if (p.y < -30 || p.x < -30 || p.x > width + 30) spawn(p, false);
      }

      const alpha = p.a * (0.65 + 0.35 * Math.sin(time * p.twinkle + p.phase));
      const size = p.r * 6;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  gsap.ticker.add(draw);

  return {
    setRunning(value) {
      running = value;
    },
  };
}
