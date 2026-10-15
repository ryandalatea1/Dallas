import { mockHTML } from './mocks.js';

/** Portfólio: clique abre os detalhes num diálogo nativo, com a mesma miniatura. */
export function initPortfolio() {
  const modal = document.getElementById('modal');
  if (!modal || typeof modal.showModal !== 'function') return;
  const visual = document.getElementById('modal-visual');
  const title = document.getElementById('modal-title');
  const cat = document.getElementById('modal-cat');
  const desc = document.getElementById('modal-desc');
  const tech = document.getElementById('modal-tech');

  document.querySelectorAll('[data-piece]').forEach((piece) => {
    const open = () => {
      title.textContent = piece.dataset.title;
      cat.textContent = piece.dataset.cat;
      desc.textContent = piece.dataset.desc;
      tech.textContent = piece.dataset.tech;
      const mock = piece.querySelector('[data-mock]');
      visual.innerHTML = mock ? mockHTML(mock.dataset.mock) : '';
      visual.querySelectorAll('.mock').forEach((m) => m.classList.add('is-active'));
      modal.showModal();
      document.documentElement.classList.add('modal-open');
    };
    piece.querySelector('.piece__btn').addEventListener('click', open);
    piece.querySelector('.piece__visual').addEventListener('click', open);
  });

  const close = () => modal.close();
  document.getElementById('modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  modal.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));
}
