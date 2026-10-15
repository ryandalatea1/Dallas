/**
 * Miniaturas de interface em CSS puro, usadas no preview dos serviços e nos
 * projetos. Uma fonte só: quem quiser trocar por imagens reais, troca aqui.
 */
const MOCKS = {
  site: `
    <div class="mock mock--site">
      <div class="m-frame">
        <div class="m-bar"><i></i><i></i><i></i></div>
        <div class="m-body">
          <div class="m-nav"><b></b><span></span><span></span><span></span><em></em></div>
          <div class="m-hero">
            <div class="m-hero__text">
              <b class="m-h"></b><b class="m-h m-h--2"></b>
              <span class="m-p"></span><span class="m-p m-p--2"></span>
              <em class="m-btn"></em>
            </div>
            <div class="m-hero__art"></div>
          </div>
        </div>
      </div>
    </div>`,
  painel: `
    <div class="mock mock--painel">
      <div class="m-dash">
        <aside class="m-side"><i></i><i></i><i></i><i></i><i></i></aside>
        <div class="m-main">
          <div class="m-tiles"><div></div><div></div><div></div><div></div></div>
          <div class="m-chart">
            <i style="--h:38%"></i><i style="--h:52%"></i><i style="--h:44%"></i><i style="--h:66%"></i>
            <i style="--h:58%"></i><i style="--h:78%"></i><i style="--h:72%"></i><i style="--h:96%"></i>
          </div>
          <svg class="m-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,26 12,21 24,23 36,15 48,17 60,10 72,12 84,6 100,2"></polyline>
          </svg>
        </div>
      </div>
    </div>`,
  sistema: `
    <div class="mock mock--sistema">
      <div class="m-dash">
        <aside class="m-side"><i></i><i></i><i></i><i></i><i></i><i></i></aside>
        <div class="m-main">
          <div class="m-toolbar"><span></span><em></em></div>
          <div class="m-table">
            <div class="m-row"><i></i><span style="--w:36%"></span><span style="--w:18%"></span><b></b></div>
            <div class="m-row"><i></i><span style="--w:28%"></span><span style="--w:22%"></span><b></b></div>
            <div class="m-row"><i class="off"></i><span style="--w:40%"></span><span style="--w:14%"></span><b></b></div>
            <div class="m-row"><i></i><span style="--w:32%"></span><span style="--w:20%"></span><b></b></div>
            <div class="m-row"><i class="off"></i><span style="--w:24%"></span><span style="--w:26%"></span><b></b></div>
          </div>
        </div>
      </div>
    </div>`,
  trafego: `
    <div class="mock mock--trafego">
      <div class="m-ads">
        <div class="m-ad">
          <div class="m-ad__img"></div>
          <span class="m-p"></span><span class="m-p m-p--2"></span>
          <em class="m-btn"></em>
        </div>
        <div class="m-stats">
          <div class="m-stat"><span></span><i style="--w:62%"></i></div>
          <div class="m-stat"><span></span><i style="--w:78%"></i></div>
          <div class="m-stat"><span></span><i style="--w:94%"></i></div>
        </div>
      </div>
    </div>`,
  automacao: `
    <div class="mock mock--automacao">
      <div class="m-flow">
        <div class="m-node m-node--in"><i></i><span></span></div>
        <div class="m-link"></div>
        <div class="m-node m-node--ai"><b></b><span></span></div>
        <div class="m-link"></div>
        <div class="m-node"><i></i><span></span></div>
        <div class="m-branch"><div class="m-node m-node--sm"><span></span></div><div class="m-node m-node--sm"><span></span></div></div>
      </div>
    </div>`,
  estrategia: `
    <div class="mock mock--estrategia">
      <div class="m-radar">
        <i></i><i></i><i></i>
        <b class="m-sweep"></b>
        <em style="--a:20%;--b:28%"></em><em style="--a:62%;--b:40%"></em><em style="--a:48%;--b:70%"></em>
      </div>
      <div class="m-legend"><span></span><span></span><span></span></div>
    </div>`,
};

export function mockHTML(type) {
  return MOCKS[type] || '';
}

/** Preenche todo elemento com data-mock e monta o conjunto do preview de serviços. */
export function mountMocks() {
  document.querySelectorAll('[data-mock]').forEach((el) => {
    el.innerHTML = mockHTML(el.dataset.mock);
  });
}
