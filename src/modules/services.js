import { gsap } from 'gsap';

/** Lista de serviços: ao passar o cursor, uma miniatura do que entregamos segue o ponteiro. */
export function initServices() {
  const list = document.getElementById('services-list');
  const preview = document.getElementById('services-preview');
  if (!list || !preview) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const mocks = Array.from(preview.querySelectorAll('.mock'));
  const types = ['site', 'painel', 'sistema', 'trafego'];
  const pos = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let velocity = 0;
  let visible = false;

  const setX = gsap.quickSetter(preview, 'x', 'px');
  const setY = gsap.quickSetter(preview, 'y', 'px');
  const setRot = gsap.quickSetter(preview, 'rotate', 'deg');

  function activate(type) {
    mocks.forEach((mock, i) => mock.classList.toggle('is-active', types[i] === type));
  }

  function show() {
    if (visible) return;
    visible = true;
    pos.x = target.x;
    pos.y = target.y;
    gsap.to(preview, { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out', overwrite: true });
  }

  function hide() {
    visible = false;
    gsap.to(preview, { opacity: 0, scale: 0.8, duration: 0.4, ease: 'power3.in', overwrite: true });
  }

  list.addEventListener('pointermove', (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
  });

  list.querySelectorAll('.service').forEach((item) => {
    item.addEventListener('pointerenter', (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      activate(item.dataset.preview);
      show();
    });
  });

  list.addEventListener('pointerleave', hide);

  gsap.ticker.add((_t, deltaTime) => {
    if (!visible && Math.abs(target.x - pos.x) < 0.5) return;
    const dt = Math.min(deltaTime || 16, 50) / 1000;
    const k = 1 - Math.pow(0.002, dt);
    const dx = target.x - pos.x;
    pos.x += dx * k;
    pos.y += (target.y - pos.y) * k;
    velocity += (dx * 0.06 - velocity) * 0.12;
    const w = preview.offsetWidth;
    const h = preview.offsetHeight;
    const x = Math.min(window.innerWidth - w - 24, pos.x + 36);
    const y = Math.min(window.innerHeight - h - 24, Math.max(24, pos.y - h / 2));
    setX(x);
    setY(y);
    setRot(gsap.utils.clamp(-7, 7, velocity));
  });
}
