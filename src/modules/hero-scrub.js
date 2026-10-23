import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Hero: o vídeo do lobo vira uma sequência de quadros desenhada num canvas e
 * o scroll é quem avança o filme. Enquanto o lobo corre, o conteúdo sai e as
 * três palavras da Dalas passam; quando ele para e encara, "Do clique à venda".
 * Os quadros baixam em ordem, alguns por vez, e o pôster cobre a espera.
 */
export function initHeroScrub({ reduceMotion = false, media = {} } = {}) {
  const wrap = document.querySelector('.hero-wrap');
  const canvas = document.getElementById('hero-seq');
  if (!wrap || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const N = mobile ? 60 : 70;
  const dir = mobile ? 'm' : 'd';
  const frames = new Array(N).fill(null);
  const poster = new Image();
  poster.src = mobile ? media.wolfPosterMobile || media.wolfPoster : media.wolfPoster;

  let W = 0;
  let H = 0;
  let current = -1;
  let target = 0;

  function cover(img) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const s = Math.max(W / iw, H / ih);
    const w = iw * s;
    const h = ih * s;
    // sobra vertical fica mais para cima: o lobo não some atrás do texto
    ctx.drawImage(img, (W - w) / 2, (H - h) * 0.42, w, h);
  }
  function nearest(i) {
    for (let d = 0; d < N; d += 1) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  }
  function draw(force) {
    const i = nearest(target);
    if (i < 0) {
      if (poster.complete && poster.naturalWidth) cover(poster);
      return;
    }
    if (i === current && !force) return;
    current = i;
    cover(frames[i]);
  }
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.25);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(true);
  }

  // baixa os quadros em ordem, quatro por vez
  let next = 0;
  let inflight = 0;
  function pump() {
    while (inflight < 4 && next < N) {
      const k = next;
      next += 1;
      inflight += 1;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        frames[k] = img;
        inflight -= 1;
        if (nearest(target) !== current) draw();
        pump();
      };
      img.onerror = () => {
        inflight -= 1;
        pump();
      };
      img.src = `./images/seq/${dir}/${String(k + 1).padStart(3, '0')}.webp`;
    }
  }
  poster.onload = () => draw(true);
  size();
  pump();
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(size, 120);
  });

  const content = document.getElementById('hero-content');
  const phases = [...document.querySelectorAll('.phase')];
  const bar = document.getElementById('hero-cue-bar');

  ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.35,
    onUpdate: (self) => {
      target = Math.round(self.progress * (N - 1));
      draw();
      if (bar) bar.style.width = `${self.progress * 100}%`;
    },
  });

  if (reduceMotion) {
    target = N - 1;
    draw();
    return;
  }

  // o conteúdo sai no começo do scroll
  gsap.to(content, {
    opacity: 0,
    y: -40,
    ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top top', end: () => `+=${window.innerHeight * 0.55}`, scrub: true },
  });

  // as frases passam enquanto o lobo corre; a última fica quando ele para
  const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
  const ranges = [
    [0.2, 0.38],
    [0.42, 0.6],
    [0.64, 0.8],
    [0.86, 1],
  ];
  phases.forEach((el, i) => {
    const [a, b] = ranges[i];
    tl.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, a);
    if (i < phases.length - 1) tl.to(el, { opacity: 0, y: -40, duration: 0.06, ease: 'power2.in' }, b - 0.06);
  });
  tl.to({}, { duration: 0.001 }, 1);

  // a palavra do título troca sozinha
  const rot = document.getElementById('hero-rot');
  if (rot) {
    const items = [...rot.children];
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const cur = items[i];
      cur.classList.remove('is-on');
      cur.classList.add('is-out');
      setTimeout(() => cur.classList.remove('is-out'), 650);
      i = (i + 1) % items.length;
      items[i].classList.add('is-on');
    }, 2300);
  }
}
