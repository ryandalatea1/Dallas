/** Duplica a faixa para o loop ficar contínuo. */
export function initTicker() {
  document.querySelectorAll('.ticker__track').forEach((track) => {
    track.innerHTML += track.innerHTML;
  });
}
