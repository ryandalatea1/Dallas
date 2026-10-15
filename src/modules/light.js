import { gsap } from 'gsap';

/** Luz que acompanha o cursor pelas seções escuras, e a linha de progresso no topo. */
export function initLight(lenis) {
  const light = document.getElementById('cursor-light');
  const bar = document.getElementById('progress');
  if (light && window.matchMedia('(pointer: fine)').matches) {
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...pos };
    const setX = gsap.quickSetter(light, 'x', 'px');
    const setY = gsap.quickSetter(light, 'y', 'px');
    let shown = false;
    window.addEventListener(
      'pointermove',
      (e) => {
        target.x = e.clientX;
        target.y = e.clientY;
        if (!shown) {
          shown = true;
          pos.x = target.x;
          pos.y = target.y;
          gsap.to(light, { opacity: 1, duration: 0.8 });
        }
      },
      { passive: true }
    );
    gsap.ticker.add((_t, dt) => {
      const k = 1 - Math.pow(0.001, Math.min(dt || 16, 50) / 1000);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      setX(pos.x);
      setY(pos.y);
    });
  }
  if (bar && lenis) {
    lenis.on('scroll', ({ progress }) => {
      bar.style.transform = `scaleX(${progress})`;
    });
  }
}
