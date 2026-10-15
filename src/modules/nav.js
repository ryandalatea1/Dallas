/** Barra fixa: vidro ao rolar, some ao descer, volta ao subir. Menu em tela cheia no mobile. */
export function initNav(lenis) {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  let open = false;

  lenis.on('scroll', ({ scroll, direction }) => {
    nav.classList.toggle('is-scrolled', scroll > 40);
    const hide = scroll > 240 && direction === 1 && !open;
    nav.classList.toggle('is-hidden', hide);
  });

  function setMenu(value) {
    open = value;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.remove('is-hidden');
    if (open) lenis.stop();
    else lenis.start();
  }

  burger.addEventListener('click', () => setMenu(!open));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) setMenu(false);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  // Âncoras internas rolam suave pelo Lenis.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const run = () => lenis.scrollTo(target, { offset: -64, duration: 1.5 });
      if (open) {
        setMenu(false);
        setTimeout(run, 150);
      } else {
        run();
      }
    });
  });
}
