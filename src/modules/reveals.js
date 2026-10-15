import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/** Títulos entram linha a linha por trás de uma máscara; leads apenas surgem. */
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
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
          onComplete: () => {
            el.dataset.revealed = '1';
          },
        });
      },
    });
  });

  document.querySelectorAll('[data-fade]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 18,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}
