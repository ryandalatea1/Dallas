/**
 * Player do vídeo do lobo. Tenta a fonte vertical no celular e a horizontal
 * no desktop; se nenhuma existir ainda, resolve com ok:false e o site segue
 * só com a floresta em WebGL. Depois da corrida, repete o trecho da
 * respiração indefinidamente.
 */
export function initWolfVideo(video, { desktop, mobile, poster, loop, onTime, timeout = 6000 } = {}) {
  if (!video) return Promise.resolve({ ok: false });
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const candidates = (isMobile ? [mobile, desktop] : [desktop]).filter(Boolean);
  if (poster) video.poster = poster;

  return new Promise((resolve) => {
    let index = 0;
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const tryNext = () => {
      if (index >= candidates.length) return done({ ok: false });
      video.src = candidates[index];
      index += 1;
      video.load();
    };
    video.addEventListener('error', () => {
      if (!settled) tryNext();
    });
    video.addEventListener(
      'loadeddata',
      () => {
        video.addEventListener('timeupdate', () => {
          if (loop && video.currentTime >= loop.end) video.currentTime = loop.start;
          if (onTime) onTime(video.currentTime);
        });
        done({ ok: true, video });
      },
      { once: true }
    );
    setTimeout(() => done({ ok: false, pending: true }), timeout);
    tryNext();
  });
}
