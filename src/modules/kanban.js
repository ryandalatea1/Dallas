import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const LEADS = [
  { ini: 'CL', name: 'Camila Lopes', src: 'Instagram' },
  { ini: 'RM', name: 'Rafael Moura', src: 'Google Ads' },
  { ini: 'BT', name: 'Bianca Torres', src: 'Site' },
];
const STAGES = [
  { icon: '#i-ig', color: '#e1306c', text: 'Mensagem nova pelo Instagram', sub: (l) => `${l.src} · agora` },
  { icon: '#i-bolt', color: '#3fbf6e', text: 'A automação respondeu na hora', sub: () => 'Respondido sozinho' },
  { icon: '#i-check', color: '#3fbf6e', text: 'Venda fechada', sub: () => 'Venda fechada' },
];

/** Card 02: um cliente atravessa o funil do CRM (novo, em conversa, venda). */
export function initKanban({ reduceMotion = false } = {}) {
  const board = document.getElementById('kanban');
  const live = document.getElementById('kb-live');
  const chip = document.getElementById('kb-chip');
  if (!board || !live || !chip) return;
  const cols = [...board.querySelectorAll('.kb__col')];
  const ok = document.getElementById('kb-ok');
  const src = document.getElementById('kb-live-src');
  const chipUse = chip.querySelector('use');
  const chipSvg = chip.querySelector('svg');
  const chipText = chip.querySelector('span');
  let lead = 0;
  let tl = null;
  let visible = false;

  function spot(i) {
    const col = cols[i];
    const cards = col.querySelectorAll('.kb__card--ghost').length;
    const head = col.querySelector('p');
    const y = col.offsetTop + head.offsetTop + head.offsetHeight + 8 + cards * 41;
    return { x: col.offsetLeft + 8, y, w: col.offsetWidth - 16 };
  }

  function setStage(i, l) {
    const s = STAGES[i];
    chip.classList.add('is-swap');
    setTimeout(() => {
      chipUse.setAttribute('href', s.icon);
      chipSvg.style.color = s.color;
      chipText.textContent = s.text;
      chip.classList.remove('is-swap');
    }, 200);
    src.textContent = s.sub(l);
  }

  function build() {
    const l = LEADS[lead];
    live.querySelector('b').textContent = l.ini;
    live.querySelector('span').firstChild.textContent = l.name;
    ok.classList.remove('is-on');
    const p0 = spot(0);
    gsap.set(live, { x: p0.x, y: p0.y, width: p0.w, opacity: 0, scale: 0.9 });
    setStage(0, l);
    tl = gsap.timeline({
      paused: !visible,
      onComplete: () => {
        lead = (lead + 1) % LEADS.length;
        build();
      },
    });
    tl.to(live, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, 0.2)
      .add(() => setStage(1, l), 2)
      .to(live, { x: () => spot(1).x, y: () => spot(1).y, width: () => spot(1).w, duration: 0.9, ease: 'power3.inOut' }, 2)
      .add(() => setStage(2, l), 4.1)
      .to(live, { x: () => spot(2).x, y: () => spot(2).y, width: () => spot(2).w, duration: 0.9, ease: 'power3.inOut' }, 4.1)
      .add(() => ok.classList.add('is-on'), 4.9)
      .to(live, { opacity: 0, duration: 0.5 }, 6.6)
      .to({}, { duration: 0.4 });
  }

  if (reduceMotion) {
    const p = spot(2);
    gsap.set(live, { x: p.x, y: p.y, width: p.w, opacity: 1 });
    ok.classList.add('is-on');
    return;
  }
  // espera o layout (fontes) para medir as colunas
  document.fonts.ready.then(() => {
    build();
    ScrollTrigger.create({
      trigger: board,
      start: 'top 90%',
      end: 'bottom 10%',
      onToggle: (self) => {
        visible = self.isActive;
        if (!tl) return;
        if (visible) tl.play();
        else tl.pause();
      },
    });
  });
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    if (tl) tl.kill();
    build();
  });
}
