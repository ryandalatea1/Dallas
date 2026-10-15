import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/** Texto que acende palavra por palavra conforme você rola. */
export function initManifesto() {
  const el = document.getElementById('manifesto');
  if (!el) return;
  const split = new SplitText(el, { type: 'words', wordsClass: 'word' });
  gsap.to(split.words, {
    opacity: 1,
    ease: 'none',
    stagger: 0.08,
    scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true },
  });
}
