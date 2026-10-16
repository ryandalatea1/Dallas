/** Demonstração do CRM dentro do site: carrega o app só quando a seção se aproxima. */
export function initCrmDemo() {
  const frame = document.getElementById('crm-frame');
  const screen = document.getElementById('crm-screen');
  if (!frame || !screen) return;
  const src = frame.dataset.src;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile || !src) return; // no celular fica a imagem e o botão de abrir
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Demonstração do Dalas CRM';
      iframe.loading = 'lazy';
      iframe.addEventListener('load', () => screen.classList.add('is-ready'));
      screen.appendChild(iframe);
      io.disconnect();
    },
    { rootMargin: '400px 0px' }
  );
  io.observe(frame);
}
