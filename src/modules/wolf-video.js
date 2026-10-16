/**
 * Player do vídeo do lobo. Tenta a fonte vertical no celular e a horizontal
 * no desktop; se nenhuma carregar, resolve com ok:false e o site segue só
 * com a floresta em WebGL. Opcionalmente repete um trecho (loop) ou avisa
 * quando o vídeo termina (onEnded) para a cena seguir em "hold".
 */
export function initWolfVideo(video, { desktop, desktop4k, mobile, desktopWebm, mobileWebm, poster, posterMobile, loop, onTime, onEnded, timeout = 7000 } = {}) {
  if (!video) return Promise.resolve({ ok: false });
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  // 4K só em telas grandes e conexões boas: o ganho é real, o custo também
  const conn = navigator.connection || {};
  const bigScreen = window.screen.width * (window.devicePixelRatio || 1) >= 2200;
  const goodNet = !conn.saveData && !/2g|3g/.test(conn.effectiveType || '');
  const use4k = desktop4k && bigScreen && goodNet;
  const candidates = (isMobile ? [mobile, mobileWebm, desktop, desktopWebm] : [use4k ? desktop4k : null, desktop, desktopWebm]).filter(Boolean);
  const chosenPoster = isMobile && posterMobile ? posterMobile : poster;
  if (chosenPoster) video.poster = chosenPoster;

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
        if (onEnded) video.addEventListener('ended', onEnded);
        done({ ok: true, video });
      },
      { once: true }
    );
    setTimeout(() => done({ ok: false, pending: true }), timeout * candidates.length);
    tryNext();
  });
}
