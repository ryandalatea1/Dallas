import { gsap } from 'gsap';

/**
 * Vigia de quadros: se o aparelho não acompanha (muitos quadros longos),
 * avisa para baixar a qualidade dos efeitos, um nível por vez. Mede em
 * janelas de ~2 s depois de um aquecimento; ignora a aba em segundo plano.
 */
export function watchFrames({ onLevel, maxLevel = 2, warmup = 3000 } = {}) {
  const start = performance.now();
  let total = 0;
  let long = 0;
  let level = 0;
  let lastHidden = 0;
  const tick = (_t, dt) => {
    if (level >= maxLevel) {
      gsap.ticker.remove(tick);
      return;
    }
    const now = performance.now();
    if (document.hidden) {
      lastHidden = now;
      return;
    }
    if (now - start < warmup || now - lastHidden < 1500) return;
    total += 1;
    if (dt > 40) long += 1; // abaixo de ~25 fps
    if (total >= 90) {
      if (long / total > 0.22) {
        level += 1;
        onLevel(level);
      }
      total = 0;
      long = 0;
    }
  };
  gsap.ticker.add(tick);
  return { get level() { return level; } };
}
