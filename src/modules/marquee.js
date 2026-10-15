/** Duplica o conteúdo da faixa para o loop ficar contínuo. */
export function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}
