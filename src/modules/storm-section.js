import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initStorm } from './storm.js';

/**
 * A tempestade: chuva diagonal, raios ao fundo e o lobo correndo até parar e
 * encarar. O vídeo só baixa quando a seção se aproxima e só toca na tela.
 */
export function initStormSection({ media = {}, reduceMotion = false, lowPower = false } = {}) {
  const section = document.getElementById('tempestade');
  if (!section) return;
  const rain = document.getElementById('storm-rain');
  const video = document.getElementById('storm-video');
  const mobile = window.matchMedia('(max-width: 900px)').matches;

  // ---------- chuva ----------
  const ctx = rain.getContext('2d');
  let W = 0;
  let H = 0;
  const drops = [];
  const count = lowPower ? 70 : 150;
  let rainOn = false;
  let acc = 0;
  function size() {
    W = rain.clientWidth;
    H = rain.clientHeight;
    rain.width = W;
    rain.height = H;
  }
  function spawn(d, any) {
    d.x = Math.random() * (W + 200);
    d.y = any ? Math.random() * H : -40 - Math.random() * 200;
    d.len = 12 + Math.random() * 22;
    d.v = 900 + Math.random() * 600;
    d.a = 0.08 + Math.random() * 0.22;
  }
  size();
  for (let i = 0; i < count; i += 1) {
    const d = {};
    spawn(d, true);
    drops.push(d);
  }
  const wind = -0.22;
  gsap.ticker.add((_t, dt) => {
    if (!rainOn || reduceMotion) return;
    acc += Math.min(dt || 16, 60) / 1000;
    if (lowPower && acc < 1 / 30) return;
    const step = acc;
    acc = 0;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (const bucket of [0.12, 0.22, 0.32]) {
      ctx.beginPath();
      for (const d of drops) {
        if (Math.abs(d.a - bucket) > 0.05) continue;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + wind * d.len, d.y + d.len);
      }
      ctx.strokeStyle = `rgba(210,220,235,${bucket})`;
      ctx.stroke();
    }
    for (const d of drops) {
      d.y += d.v * step;
      d.x += wind * d.v * step;
      if (d.y > H + 20 || d.x < -40) spawn(d, false);
    }
  });
  window.addEventListener('resize', size);

  // ---------- raios ----------
  const storm = initStorm(document.getElementById('storm-bolts'), {
    flash: document.getElementById('storm-flash'),
    origin: [0.74, 0.18],
    every: [5, 11],
    reduceMotion,
    dprMax: 1,
  });
  storm.setRunning(false);

  // ---------- vídeo ----------
  let loaded = false;
  function load() {
    if (loaded || !video) return;
    loaded = true;
    const mp4 = mobile ? media.wolfMobile : media.wolfDesktop;
    const webm = mobile ? media.wolfMobileWebm : media.wolfDesktopWebm;
    const h264 = video.canPlayType('video/mp4; codecs="avc1.640028"');
    video.poster = mobile ? media.wolfPosterMobile || media.wolfPoster : media.wolfPoster;
    video.src = h264 ? mp4 : webm || mp4;
    video.preload = 'auto';
    video.addEventListener('error', () => {
      if (webm && !video.src.endsWith('.webm')) video.src = webm;
    });
    video.load();
  }
  ScrollTrigger.create({ trigger: section, start: 'top 250%', once: true, onEnter: load });

  let played = false;
  ScrollTrigger.create({
    trigger: section,
    start: 'top 85%',
    end: 'bottom top',
    onToggle: (self) => {
      rainOn = self.isActive;
      storm.setRunning(self.isActive);
      if (self.isActive) {
        storm.start();
        if (!reduceMotion) gsap.delayedCall(1.4, () => storm.strike({ intensity: 0.9 }));
      } else {
        storm.stop();
        ctx.clearRect(0, 0, W, H);
      }
    },
  });
  // o lobo corre uma vez e para encarando quem chega
  ScrollTrigger.create({
    trigger: video || section,
    start: 'top 70%',
    end: 'bottom top',
    onToggle: (self) => {
      if (!video) return;
      if (self.isActive && !played) {
        load();
        played = true;
        video.currentTime = 0;
        video.play().catch(() => {});
      } else if (!self.isActive) {
        video.pause();
      } else if (self.isActive && !video.ended) {
        video.play().catch(() => {});
      }
    },
  });
}
