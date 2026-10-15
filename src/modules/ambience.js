/** Som ambiente opcional (vento, floresta). Nunca toca sozinho: só no clique. */
export function initAmbience(button, src) {
  if (!button || !src) return;
  const audio = new Audio();
  audio.loop = true;
  audio.volume = 0;
  audio.preload = 'none';
  let ready = false;
  let on = false;

  audio.addEventListener('canplaythrough', () => {
    ready = true;
  });
  audio.addEventListener('error', () => {
    button.hidden = true;
  });
  audio.src = src;
  // só mostramos o botão se o arquivo existir
  fetch(src, { method: 'HEAD' })
    .then((r) => {
      if (r.ok && (r.headers.get('content-type') || '').startsWith('audio')) button.hidden = false;
    })
    .catch(() => {});

  const fade = (to, ms) => {
    const from = audio.volume;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step);
      else if (to === 0) audio.pause();
    };
    requestAnimationFrame(step);
  };

  button.addEventListener('click', async () => {
    on = !on;
    button.setAttribute('aria-pressed', String(on));
    button.classList.toggle('is-on', on);
    if (on) {
      try {
        if (!ready) audio.load();
        await audio.play();
        fade(0.5, 1500);
      } catch (error) {
        on = false;
        button.classList.remove('is-on');
        button.setAttribute('aria-pressed', 'false');
      }
    } else {
      fade(0, 800);
    }
  });
}
