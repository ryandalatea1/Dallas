/** Liga os botões de contato aos dados de src/config.js. */
export function initContact(config) {
  const button = document.getElementById('cta-button');
  const alt = document.getElementById('cta-alt');
  if (!button) return;

  const digits = (config.whatsapp || '').replace(/\D/g, '');
  const whatsapp = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(config.whatsappMessage || '')}` : '';
  const email = config.email ? `mailto:${config.email}` : '';
  const href = whatsapp || email;

  if (href) {
    button.href = href;
    if (whatsapp) {
      button.target = '_blank';
      button.rel = 'noopener';
    }
  }

  const handle = (config.instagram || '').replace('@', '');
  const parts = [];
  if (config.email) parts.push(`<a href="mailto:${config.email}">${config.email}</a>`);
  if (handle) parts.push(`<a href="https://instagram.com/${handle}" target="_blank" rel="noopener">@${handle}</a>`);
  if (alt) alt.innerHTML = parts.join('<span class="sep">✦</span>');
}
