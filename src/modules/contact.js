/** Liga todos os botões de contato aos dados de src/config.js. */
export function initContact(config) {
  const digits = (config.whatsapp || '').replace(/\D/g, '');
  const whatsapp = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(config.whatsappMessage || '')}` : '';
  const email = config.email ? `mailto:${config.email}` : '';
  const handle = (config.instagram || '').replace('@', '');
  const instagram = handle ? `https://instagram.com/${handle}` : '';

  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const href = whatsapp || email;
    if (!href) return;
    el.href = href;
    if (whatsapp) {
      el.target = '_blank';
      el.rel = 'noopener';
    }
  });

  const ig = document.getElementById('footer-instagram');
  if (ig && instagram) {
    ig.href = instagram;
    ig.target = '_blank';
    ig.rel = 'noopener';
    ig.textContent = `@${handle}`;
  }
  const mail = document.getElementById('footer-email');
  if (mail && email) {
    mail.href = email;
    mail.textContent = config.email;
  }

  const alt = document.getElementById('cta-alt');
  if (alt) {
    const parts = [];
    if (config.email) parts.push(`<a href="mailto:${config.email}">${config.email}</a>`);
    if (handle) parts.push(`<a href="${instagram}" target="_blank" rel="noopener">@${handle}</a>`);
    alt.innerHTML = parts.join('<span class="sep">·</span>');
  }
}
