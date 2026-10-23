import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Audiovisual: uma tira de filme com quadros do lobo que desliza com o scroll; o botão toca o vídeo de verdade. */
export function initReel({ reduceMotion = false, media = {} } = {}) {
  const film = document.getElementById('reel');
  const strip = document.getElementById('reel-strip');
  if (!film || !strip) return;
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const dir = mobile ? 'm' : 'd';
  const N = mobile ? 60 : 70;
  const picks = [];
  for (let i = 0; i < 10; i += 1) picks.push(Math.round(1 + (i * (N - 1)) / 9));
  const w = mobile ? 540 : 1152;
  const h = mobile ? 960 : 648;
  const html = picks.map((k) => `<img src="./images/seq/${dir}/${String(k).padStart(3, '0')}.webp" alt="" loading="lazy" width="${w}" height="${h}" />`).join('');
  strip.innerHTML = html + html;

  if (!reduceMotion) {
    gsap.to(strip, { xPercent: -32, ease: 'none', scrollTrigger: { trigger: film, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  const btn = document.getElementById('reel-play');
  const video = document.getElementById('reel-video');
  if (!btn || !video) return;
  btn.addEventListener('click', () => {
    const h264 = video.canPlayType('video/mp4; codecs="avc1.640028"');
    const mp4 = mobile ? media.wolfMobile : media.wolfDesktop;
    const webm = mobile ? media.wolfMobileWebm : media.wolfDesktopWebm;
    video.src = h264 ? mp4 : webm || mp4;
    video.load();
    film.classList.add('is-playing');
    video.play().catch(() => {});
  });
  ScrollTrigger.create({
    trigger: film,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      if (!film.classList.contains('is-playing')) return;
      if (self.isActive) video.play().catch(() => {});
      else video.pause();
    },
  });
}
