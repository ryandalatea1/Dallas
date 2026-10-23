import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Serviços: no desktop a seção fica presa e o scroll vertical empurra os
 * cartões para o lado; no celular é uma fileira que desliza com o dedo.
 * As ilustrações só animam enquanto estão na tela.
 */
export function initServices({ reduceMotion = false } = {}) {
  const pin = document.getElementById('services-pin');
  const track = document.getElementById('services-track');
  const bar = document.getElementById('services-bar');
  if (!pin || !track) return;
  const section = pin.parentElement;
  const cards = [...track.querySelectorAll('.svc')];
  const wide = window.matchMedia('(min-width: 1101px)');
  let tween = null;

  function build() {
    if (tween) {
      tween.scrollTrigger.kill();
      tween.kill();
      tween = null;
    }
    gsap.set(track, { clearProps: 'transform' });
    if (!wide.matches || reduceMotion) return;
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 40);
    tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${dist()}`,
        pin,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) bar.style.width = `${self.progress * 100}%`;
        },
      },
    });
  }
  build();
  wide.addEventListener('change', build);

  // cartões entram um atrás do outro quando a seção chega
  if (!reduceMotion) {
    gsap.from(cards, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: section, start: 'top 70%', once: true },
    });
  }

  // ilustrações pausadas fora da tela
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)),
    { threshold: 0.05 }
  );
  track.querySelectorAll('.svc__art').forEach((art) => io.observe(art));
}
