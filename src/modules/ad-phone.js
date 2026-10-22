import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const BRANDS = [
  {
    name: 'Áurea Odonto',
    av: 'ÁO',
    vars: {
      '--brand-bg': '#efe6d4',
      '--brand-ink': '#4a3713',
      '--brand-creative': 'linear-gradient(160deg, #f7f0e2, #e3cfa4)',
      '--brand-badge': '#ffffff',
      '--brand-badge-ink': '#7a5c22',
      '--brand-font': 'Georgia, "Times New Roman", serif',
      '--brand-art': 'radial-gradient(circle at 40% 38%, #ffffff 0 34%, #f3e7cf 35% 100%)',
    },
    badge: 'Agenda aberta',
    title: 'Seu sorriso,<br />planejado.',
    sub: 'Implantes, lentes e ortodontia invisível.',
    cta: 'Enviar mensagem',
    site: './images/phone/aurea.jpg',
    siteBg: '#f6f1e8',
    ask: 'Olá! Vi o anúncio. Como funciona a avaliação?',
    reply: 'Oi! A avaliação é sem custo. Temos amanhã às 9h ou às 14h30, qual fica melhor?',
  },
  {
    name: 'Forja Box',
    av: 'FB',
    vars: {
      '--brand-bg': '#1b1b1d',
      '--brand-ink': '#ffffff',
      '--brand-creative': 'linear-gradient(160deg, #1e1e21 30%, #3a1a0c)',
      '--brand-badge': '#ff5a1f',
      '--brand-badge-ink': '#ffffff',
      '--brand-font': '"Plus Jakarta Sans", sans-serif',
      '--brand-art': 'radial-gradient(circle at 50% 50%, #ff5a1f 0 20%, rgba(255, 90, 31, 0.28) 21% 58%, transparent 60%)',
    },
    badge: 'Aula grátis',
    title: 'Força não nasce.<br />Se forja.',
    sub: 'Cross training e musculação em BH.',
    cta: 'Enviar mensagem',
    site: './images/phone/forja.jpg',
    siteBg: '#141414',
    ask: 'Oi! Quero agendar a aula experimental.',
    reply: 'Bora! Tem turma hoje às 18h ou amanhã às 7h. Qual você prefere?',
  },
];

const STEPS = {
  ig: { icon: '#i-ig', color: '#e1306c', text: 'No Instagram, o cliente vê o seu anúncio' },
  site: { icon: '#i-site', color: '#d6b46a', text: 'Ele abre o seu site e entende por que você' },
  chat: { icon: '#i-wa', color: '#25d366', text: 'E chama no seu WhatsApp, pronto para comprar' },
};

/** Card 01: o celular mostra o anúncio, o site e a conversa no WhatsApp, em loop. */
export function initAdPhone({ reduceMotion = false } = {}) {
  const phone = document.getElementById('ad-phone');
  const chip = document.getElementById('ad-chip');
  if (!phone || !chip) return;
  const card = phone.closest('.card');
  const screens = Object.fromEntries([...phone.querySelectorAll('[data-scr]')].map((s) => [s.dataset.scr, s]));
  const tap = document.getElementById('ad-tap');
  const m1 = document.getElementById('wa-m1');
  const m2 = document.getElementById('wa-m2');
  const typing = document.getElementById('wa-typing');
  const status = document.getElementById('wa-status');
  const siteImg = phone.querySelector('[data-brand-site]');
  const chipUse = chip.querySelector('use');
  const chipSvg = chip.querySelector('svg');
  const chipText = chip.querySelector('span');
  let brandIndex = 0;
  let tl = null;
  let visible = false;

  function applyBrand(b) {
    Object.entries(b.vars).forEach(([k, v]) => phone.style.setProperty(k, v));
    phone.querySelectorAll('[data-brand-name]').forEach((el) => (el.textContent = b.name));
    phone.querySelectorAll('[data-brand-av]').forEach((el) => (el.textContent = b.av));
    phone.querySelector('[data-brand-badge]').textContent = b.badge;
    phone.querySelector('[data-brand-title]').innerHTML = b.title;
    phone.querySelector('[data-brand-sub]').textContent = b.sub;
    phone.querySelector('[data-brand-cta]').textContent = b.cta;
    phone.querySelector('[data-brand-ask]').textContent = b.ask;
    phone.querySelector('[data-brand-reply]').textContent = b.reply;
    screens.site.style.background = b.siteBg;
    if (siteImg.getAttribute('src') !== b.site) siteImg.src = b.site;
  }

  function show(key) {
    Object.entries(screens).forEach(([k, el]) => el.classList.toggle('is-on', k === key));
  }

  function setChip(key) {
    const step = STEPS[key];
    if (!step) return;
    chip.classList.add('is-swap');
    setTimeout(() => {
      chipUse.setAttribute('href', step.icon);
      chipSvg.style.color = step.color;
      chipText.textContent = step.text;
      chip.classList.remove('is-swap');
    }, 220);
  }

  function reset() {
    tap.classList.remove('is-on', 'is-press');
    [m1, m2, typing].forEach((el) => el.classList.remove('is-on'));
    status.textContent = 'online';
    gsap.set(siteImg, { y: 0 });
  }

  function build() {
    const b = BRANDS[brandIndex];
    applyBrand(b);
    reset();
    show('ig');
    setChip('ig');
    tl = gsap.timeline({
      paused: !visible,
      onComplete: () => {
        brandIndex = (brandIndex + 1) % BRANDS.length;
        build();
      },
    });
    tl.call(() => tap.classList.add('is-on'), null, 2.2)
      .call(() => tap.classList.add('is-press'), null, 2.9)
      .call(() => {
        show('site');
        setChip('site');
      }, null, 3.2)
      .fromTo(siteImg, { y: 0 }, { y: () => -(siteImg.offsetHeight - screens.site.offsetHeight) * 0.42, duration: 3, ease: 'power1.inOut' }, 3.5)
      .call(() => show('splash'), null, 6.6)
      .call(() => {
        show('chat');
        setChip('chat');
      }, null, 7.3)
      .call(() => m1.classList.add('is-on'), null, 7.6)
      .call(() => {
        typing.classList.add('is-on');
        status.textContent = 'digitando...';
      }, null, 8.5)
      .call(() => {
        typing.classList.remove('is-on');
        m2.classList.add('is-on');
        status.textContent = 'online';
      }, null, 10)
      .to({}, { duration: 2.6 });
  }

  if (reduceMotion) {
    applyBrand(BRANDS[0]);
    return;
  }
  build();
  ScrollTrigger.create({
    trigger: card || phone,
    start: 'top 85%',
    end: 'bottom 10%',
    onToggle: (self) => {
      visible = self.isActive;
      if (!tl) return;
      if (visible) tl.play();
      else tl.pause();
    },
  });
}
