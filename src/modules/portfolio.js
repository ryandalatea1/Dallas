/** Portfólio: clique abre os detalhes num diálogo nativo, com o mesmo pôster. */
export function initPortfolio() {
  const modal = document.getElementById('modal');
  if (!modal || typeof modal.showModal !== 'function') return;
  const visual = document.getElementById('modal-visual');
  const title = document.getElementById('modal-title');
  const cat = document.getElementById('modal-cat');
  const desc = document.getElementById('modal-desc');
  const tech = document.getElementById('modal-tech');

  document.querySelectorAll('[data-piece]').forEach((piece) => {
    const poster = piece.querySelector('.poster');
    const open = () => {
      title.textContent = piece.dataset.title;
      cat.textContent = piece.dataset.cat;
      desc.textContent = piece.dataset.desc;
      tech.textContent = piece.dataset.tech;
      visual.innerHTML = '';
      if (poster) visual.appendChild(poster.cloneNode(true));
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

  // imagens reais: data-image no article troca o pôster pela foto do projeto
  document.querySelectorAll('[data-piece][data-image]').forEach((piece) => {
    const src = piece.dataset.image;
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const p = piece.querySelector('.poster');
      if (p) {
        p.classList.add('poster--image');
        p.style.backgroundImage = `url("${src}")`;
      }
    };
    img.src = src;
  });
}
