import { gsap } from 'gsap';

/** Projetos: a seção fixa na tela e os cartões correm na horizontal com o scroll. */
export function initProjects() {
  const section = document.getElementById('projetos');
  const track = document.getElementById('projects-track');
  if (!section || !track) return;

  document.querySelectorAll('.project .mock').forEach((mock) => mock.classList.add('is-active'));

  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });
}
