import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/** Títulos entram linha a linha por trás de uma máscara; textos acendem palavra por palavra com o scroll. */
export function initReveals() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'rline',
      autoSplit: true,
      onSplit: (self) => {
        if (el.dataset.revealed) return null;
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.3,
          ease: 'power4.out',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onComplete: () => {
            el.dataset.revealed = '1';
          },
        });
      },
    });
  });

  document.querySelectorAll('[data-fade]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 18, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  document.querySelectorAll('[data-words]').forEach((block) => {
    const targets = block.matches('p') ? [block] : block.querySelectorAll('p');
    const split = new SplitText(targets, { type: 'words', wordsClass: 'word' });
    gsap.to(split.words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.04,
      scrollTrigger: { trigger: block, start: 'top 80%', end: 'bottom 55%', scrub: true },
    });
  });
}
