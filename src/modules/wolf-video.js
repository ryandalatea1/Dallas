/**
 * Player do vídeo do lobo. Escolhe a versão certa para a tela (1080p, 1440p ou
 * 4K no desktop; vertical no celular) e só avisa que está pronto quando já há
 * vídeo suficiente no buffer para tocar sem engasgar. Se nenhuma fonte carregar,
 * resolve com ok:false e o site segue com a floresta em WebGL.
 */
export function initWolfVideo(
  video,
  { desktop, desktopHd, desktop4k, mobile, desktopWebm, mobileWebm, poster, posterMobile, loop, onTime, onEnded, lowPower = false, timeout = 7000 } = {}
) {
  if (!video) return Promise.resolve({ ok: false });
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const conn = navigator.connection || {};
  const dpr = window.devicePixelRatio || 1;
  const pixels = window.screen.width * dpr;
  const goodNet = !conn.saveData && !/2g|3g/.test(conn.effectiveType || '');
  const downlink = typeof conn.downlink === 'number' ? conn.downlink : null; // Mbps, quando o navegador informa
  // só sobe de qualidade quando a tela pede e a conexão aguenta (sem travar a abertura)
  const use4k = desktop4k && pixels >= 3000 && goodNet && !lowPower && (downlink === null || downlink >= 15);
  const useHd = desktopHd && pixels >= 1800 && goodNet && (downlink === null || downlink >= 6);
  const desktopList = [use4k ? desktop4k : null, useHd ? desktopHd : null, desktop, desktopWebm];
  const candidates = (isMobile ? [mobile, mobileWebm, desktop, desktopWebm] : desktopList).filter(Boolean);
  const chosenPoster = isMobile && posterMobile ? posterMobile : poster;
  if (chosenPoster) video.poster = chosenPoster;
  video.preload = 'auto';

  return new Promise((resolve) => {
    let index = 0;
    let settled = false;
    let readyTimer = null;
    const done = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(readyTimer);
      resolve(result);
    };
    const tryNext = () => {
      if (index >= candidates.length) return done({ ok: false });
      video.src = candidates[index];
      index += 1;
      video.load();
    };
    const buffered = () => {
      try {
        return video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0;
      } catch (error) {
        return 0;
      }
    };
    const ready = () => {
      if (settled) return;
      video.addEventListener('timeupdate', () => {
        if (loop && video.currentTime >= loop.end) video.currentTime = loop.start;
        if (onTime) onTime(video.currentTime);
      });
      if (onEnded) video.addEventListener('ended', onEnded);
      done({ ok: true, video });
    };
    video.addEventListener('error', () => {
      if (!settled) tryNext();
    });
    // pronto quando o navegador diz que toca até o fim sem parar, ou quando já
    // há uns 2 s no buffer (o vídeo tem 5 s); no pior caso, 2,5 s depois do primeiro frame
    video.addEventListener('canplaythrough', ready, { once: true });
    video.addEventListener('progress', () => {
      if (!settled && video.readyState >= 2 && buffered() >= Math.min(2, (video.duration || 5) - 0.1)) ready();
    });
    video.addEventListener(
      'loadeddata',
      () => {
        readyTimer = setTimeout(ready, 2500);
      },
      { once: true }
    );
    setTimeout(() => done({ ok: false, pending: true }), timeout * candidates.length);
    tryNext();
  });
}
