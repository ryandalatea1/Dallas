/**
 * Demonstração do CRM dentro do site: carrega o app só quando a seção se
 * aproxima e o renderiza em largura de desktop (1280px), reduzido em escala
 * para caber no quadro. Assim o visitante vê o painel completo e ainda pode
 * clicar, arrastar e conversar. No celular fica a imagem e o botão de abrir.
 */
export function initCrmDemo() {
  const frame = document.getElementById('crm-frame');
  const screen = document.getElementById('crm-screen');
  if (!frame || !screen) return;
  const src = frame.dataset.src;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile || !src) return;
  const BASE = 1280;
  let iframe = null;

  function fit() {
    if (!iframe) return;
    const w = screen.clientWidth;
    const h = screen.clientHeight;
    const s = w / BASE;
    iframe.style.width = `${BASE}px`;
    iframe.style.height = `${Math.round(h / s)}px`;
    iframe.style.transform = `scale(${s})`;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Demonstração do Dalas CRM';
      iframe.loading = 'lazy';
      iframe.addEventListener('load', () => screen.classList.add('is-ready'));
      screen.appendChild(iframe);
      fit();
      window.addEventListener('resize', fit);
      io.disconnect();
    },
    { rootMargin: '400px 0px' }
  );
  io.observe(frame);
}
