import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Soluções: uma lista em acordeão à esquerda e um "palco" à direita que mostra
 * um produto real por solução (sites e telas do Dalas CRM). Abre no clique e,
 * no desktop, também ao passar o mouse; sem interação, avança sozinho enquanto
 * a seção está na tela. No celular a imagem aparece dentro de cada item.
 */
export function initSolutions({ reduceMotion = false } = {}) {
  const root = document.getElementById('showcase');
  const list = document.getElementById('showcase-list');
  const stage = document.getElementById('showcase-stage');
  const screen = document.getElementById('stage-screen');
  const sweep = document.getElementById('stage-sweep');
  const urlEl = document.getElementById('stage-url');
  const label = document.getElementById('stage-label');
  const labelText = document.getElementById('stage-label-text');
  if (!root || !list) return null;

  const items = Array.from(list.querySelectorAll('.sol'));
  const desktop = window.matchMedia('(min-width: 1101px)');
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const AUTO_EVERY = 6.5;
  let active = -1;
  let layers = [];
  let inView = false;
  let idleUntil = 0; // até quando o usuário "mandou" (sem avanço automático)
  let progress = null;

  function buildStage() {
    if (!screen || layers.length) return;
    layers = items.map((item, i) => {
      const img = document.createElement('img');
      img.src = item.dataset.image;
      img.alt = '';
      img.decoding = 'async';
      if (i > 0) img.loading = 'lazy';
      img.className = 'stage__img';
      screen.appendChild(img);
      return img;
    });
  }

  function setBody(item, open, instant) {
    const body = item.querySelector('.sol__body');
    const head = item.querySelector('.sol__head');
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (instant || reduceMotion) {
      gsap.set(body, { height: open ? 'auto' : 0 });
      return;
    }
    gsap.to(body, { height: open ? 'auto' : 0, duration: open ? 0.7 : 0.5, ease: 'power3.inOut', overwrite: true, onComplete: () => ScrollTrigger.refresh() });
  }

  function runProgress() {
    if (progress) progress.kill();
    const bar = items[active].querySelector('.sol__bar i');
    items.forEach((it) => gsap.set(it.querySelector('.sol__bar i'), { scaleX: 0 }));
    if (reduceMotion || !desktop.matches) return;
    progress = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: AUTO_EVERY, ease: 'none', paused: !inView, onComplete: () => select((active + 1) % items.length, false) });
  }

  function select(index, byUser = true, instant = false) {
    if (index === active) {
      if (byUser) idleUntil = performance.now() + 14000;
      return;
    }
    const prev = active;
    active = index;
    if (byUser) idleUntil = performance.now() + 14000;
    items.forEach((item, i) => {
      const on = i === index;
      item.classList.toggle('is-active', on);
      setBody(item, on, instant || prev === -1);
    });
    const item = items[index];
    if (stage && desktop.matches) {
      buildStage();
      layers.forEach((img, i) => {
        if (i === index) {
          gsap.killTweensOf(img);
          gsap.fromTo(img, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: instant ? 0 : 0.9, ease: 'power3.out' });
          img.style.zIndex = 2;
        } else {
          img.style.zIndex = 1;
          gsap.to(img, { opacity: 0, duration: instant ? 0 : 0.6, ease: 'power2.out' });
        }
      });
      if (urlEl) urlEl.textContent = item.dataset.url || '';
      if (labelText) labelText.textContent = item.dataset.label || '';
      if (label) label.href = item.dataset.demo || '#';
      if (sweep && !instant && !reduceMotion) {
        gsap.fromTo(sweep, { xPercent: -120, opacity: 0.9 }, { xPercent: 120, opacity: 0, duration: 1.1, ease: 'power2.out' });
      }
    }
    runProgress();
  }

  items.forEach((item, i) => {
    const head = item.querySelector('.sol__head');
    head.addEventListener('click', () => {
      if (i === active && !desktop.matches) {
        // no celular o item aberto pode ser fechado
        item.classList.remove('is-active');
        setBody(item, false);
        active = -1;
        return;
      }
      select(i, true);
    });
    if (hoverable) {
      let timer = null;
      item.addEventListener('pointerenter', () => {
        if (!desktop.matches) return;
        timer = setTimeout(() => select(i, true), 140);
      });
      item.addEventListener('pointerleave', () => clearTimeout(timer));
    }
  });

  // estado inicial: primeiro aberto
  select(0, false, true);

  // só avança sozinho com a seção na tela
  ScrollTrigger.create({
    trigger: root,
    start: 'top 75%',
    end: 'bottom 25%',
    onToggle: (self) => {
      inView = self.isActive;
      if (!progress) return;
      if (inView && performance.now() > idleUntil) progress.play();
      else progress.pause();
    },
  });
  gsap.ticker.add(() => {
    if (!progress || !inView) return;
    const idle = performance.now() > idleUntil;
    if (idle && progress.paused()) progress.play();
    if (!idle && !progress.paused()) progress.pause();
  });

  if (!reduceMotion) {
    gsap.from(items, { opacity: 0, y: 26, duration: 1, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
    if (stage) gsap.from(stage, { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: stage, start: 'top 85%', once: true } });
  }

  // pré-carrega as imagens do palco quando a seção se aproxima
  ScrollTrigger.create({ trigger: root, start: 'top 160%', once: true, onEnter: () => desktop.matches && buildStage() });
  desktop.addEventListener('change', () => ScrollTrigger.refresh());

  return { select };
}
