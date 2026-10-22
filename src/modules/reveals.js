import { gsap } from 'gsap';

/** Quebra o texto de um elemento em palavras (<span class="w">), mantendo <b> e <br>. */
export function splitWords(el) {
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          frag.appendChild(span);
          words.push(span);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  return words;
}

/**
 * Títulos sobem palavra por palavra saindo do desfoque; blocos aparecem
 * subindo; o parágrafo grande acende palavra por palavra com o scroll.
 */
export function initReveals({ reduceMotion = false, lowPower = false } = {}) {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = splitWords(el);
    if (reduceMotion) return;
    const from = { yPercent: 70, opacity: 0 };
    if (!lowPower) from.filter = 'blur(8px)';
    gsap.from(words, {
      ...from,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.045,
      clearProps: 'filter',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });

  if (!reduceMotion) {
    document.querySelectorAll('[data-rise]').forEach((el) => {
      const from = { opacity: 0, y: 30 };
      if (!lowPower) from.filter = 'blur(6px)';
      gsap.from(el, {
        ...from,
        duration: 1.1,
        ease: 'power3.out',
        clearProps: 'filter',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  document.querySelectorAll('[data-scrub-words]').forEach((el) => {
    const words = splitWords(el);
    if (reduceMotion) {
      gsap.set(words, { opacity: 1 });
      return;
    }
    gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true },
    });
  });
}
