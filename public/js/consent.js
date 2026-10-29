/* ==========================================================
   Os 4 Gaudérios — consentimento de cookies (LGPD)
   - essenciais: sempre ligados (esta escolha e o login do painel)
   - conteúdo de terceiros: player do Spotify (só carrega com permissão)
   A escolha fica no cookie o4g_consent por 6 meses.
   ========================================================== */
(() => {
  const NAME = 'o4g_consent';
  const MAX_AGE = 60 * 60 * 24 * 180;

  const read = () => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + NAME + '=([^;]*)'));
    if (!m) return null;
    const v = decodeURIComponent(m[1]);
    return { media: /media=1/.test(v) };
  };
  let state = read();

  const write = prefs => {
    state = { media: !!prefs.media };
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${NAME}=${encodeURIComponent(`v1|media=${state.media ? 1 : 0}`)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    apply();
    closeBanner();
  };

  // libera (ou mantém bloqueados) os players de terceiros
  const apply = () => {
    if (!state || !state.media) return;
    document.querySelectorAll('iframe[data-consent-src]').forEach(f => {
      f.src = f.getAttribute('data-consent-src');
      f.removeAttribute('data-consent-src');
    });
    document.querySelectorAll('.embed-consent').forEach(n => n.remove());
  };

  const placeholder = compact => `
    <div class="embed-consent${compact ? ' embed-consent--compact' : ''}">
      <i class="ico ico--spotify" aria-hidden="true"></i>
      <p><strong>Player do Spotify</strong>O Spotify usa cookies próprios. Ative para ouvir aqui no site.</p>
      <button type="button" class="embed-consent-btn" data-consent-media>Ativar player</button>
      <a href="/politica-de-cookies">Saiba mais</a>
    </div>`;

  /* ---------- aviso ---------- */
  let banner;
  const closeBanner = () => {
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(() => banner && banner.remove(), 400);
    banner = null;
  };
  const openBanner = () => {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <p><strong>Sua privacidade</strong>Usamos cookies essenciais para o site funcionar. O player do Spotify só carrega se você permitir. <a href="/politica-de-cookies">Política de cookies</a></p>
      <div class="cookie-actions">
        <button type="button" class="cookie-btn cookie-btn--ghost" data-cookie="prefs">Preferências</button>
        <button type="button" class="cookie-btn" data-cookie="essential">Só essenciais</button>
        <button type="button" class="cookie-btn cookie-btn--gold" data-cookie="all">Aceitar todos</button>
      </div>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner && banner.classList.add('is-visible')));
  };

  /* ---------- preferências ---------- */
  const openPrefs = () => {
    let dlg = document.getElementById('cookiePrefs');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'cookiePrefs';
      dlg.className = 'cookie-modal';
      dlg.setAttribute('aria-label', 'Preferências de cookies');
      dlg.innerHTML = `
        <form method="dialog">
          <p class="cookie-modal-eyebrow">Privacidade</p>
          <h2>Preferências de cookies</h2>
          <p class="cookie-modal-lead">Escolha o que pode ser usado neste navegador. Você pode mudar quando quiser pelo link no rodapé.</p>
          <label class="cookie-opt">
            <span><strong>Essenciais</strong>Guardam esta escolha e mantêm o login do painel. Sem eles o site não funciona.</span>
            <input type="checkbox" checked disabled><i aria-hidden="true"></i>
          </label>
          <label class="cookie-opt">
            <span><strong>Conteúdo de terceiros</strong>Player do Spotify na seção de músicas e no mini player. O Spotify pode gravar cookies próprios.</span>
            <input type="checkbox" name="media"><i aria-hidden="true"></i>
          </label>
          <div class="cookie-actions">
            <a class="cookie-link" href="/politica-de-cookies">Política de cookies</a>
            <button type="submit" class="cookie-btn" value="cancel">Cancelar</button>
            <button type="submit" class="cookie-btn cookie-btn--gold" value="save">Salvar escolha</button>
          </div>
        </form>`;
      document.body.appendChild(dlg);
      dlg.addEventListener('close', () => {
        if (dlg.returnValue === 'save') write({ media: dlg.querySelector('[name=media]').checked });
      });
    }
    dlg.querySelector('[name=media]').checked = !!(state && state.media);
    dlg.returnValue = '';
    dlg.showModal();
  };

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cookie], [data-cookie-prefs], [data-consent-media]');
    if (!t) return;
    e.preventDefault();
    if (t.hasAttribute('data-cookie-prefs') || t.dataset.cookie === 'prefs') return openPrefs();
    if (t.hasAttribute('data-consent-media') || t.dataset.cookie === 'all') return write({ media: true });
    if (t.dataset.cookie === 'essential') write({ media: false });
  });

  // o aviso só aparece depois da abertura animada do site
  const showWhenReady = () => {
    if (state) return;
    if (!document.body.classList.contains('is-loading')) return openBanner();
    const mo = new MutationObserver(() => {
      if (!document.body.classList.contains('is-loading')) { mo.disconnect(); setTimeout(openBanner, 900); }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  };

  window.Consent = {
    has: key => !!(state && state[key]),
    open: openPrefs,
    // HTML de um iframe de terceiros: carregado direto ou bloqueado com aviso
    iframe: (src, attrs, compact) => (state && state.media)
      ? `<iframe src="${src}" ${attrs}></iframe>`
      : `<iframe data-consent-src="${src}" ${attrs}></iframe>${placeholder(compact)}`,
    placeholder
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showWhenReady);
  else showWhenReady();
})();
