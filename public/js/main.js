/* Os 4 Gaudérios — interações e animações */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const isStatic = reduced || !hasGsap;
  if (isStatic) root.classList.add('static');

  $('#year').textContent = new Date().getFullYear();

  /* ---------- vídeos: carrega sob demanda ---------- */
  const loadVideo = v => {
    if (v.dataset.src && !v.src) { v.src = v.dataset.src; v.load(); }
  };
  const playVideo = v => { loadVideo(v); const p = v.play(); if (p) p.catch(() => {}); };

  // pré-carrega quando chega perto da tela
  const nearIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { loadVideo(e.target); nearIO.unobserve(e.target); }
  }), { rootMargin: '100% 0px' });
  $$('video[data-src]').forEach(v => nearIO.observe(v));

  // toca/pausa os vídeos autônomos conforme visibilidade
  const playIO = new IntersectionObserver(es => es.forEach(e => {
    e.isIntersecting ? playVideo(e.target) : e.target.pause();
  }), { threshold: .2 });
  $$('.knockout-video, .clip-mobile, .hero-video').forEach(v => playIO.observe(v));

  /* ---------- menu tela cheia ---------- */
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  let lenis;
  const isMenuOpen = () => menu.classList.contains('is-open');
  const setMenu = open => {
    // o círculo de abertura nasce do botão
    const r = menuBtn.getBoundingClientRect();
    menu.style.setProperty('--mx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--my', `${r.top + r.height / 2}px`);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    const label = $('.menu-btn-label', menuBtn);
    label.textContent = label.dataset.text = open ? 'Fechar' : 'Menu';
    document.body.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(!isMenuOpen()));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // prévia da seção ao passar o mouse
  const menuPreview = $('#menuPreview');
  $$('.menu-links a').forEach(a => a.addEventListener('pointerenter', () => {
    const src = a.dataset.img;
    if (!src || menuPreview.getAttribute('src') === src) return;
    menuPreview.classList.add('is-swapping');
    setTimeout(() => {
      menuPreview.src = src;
      menuPreview.classList.toggle('is-cover', /\.jpg$/.test(src));
      menuPreview.classList.remove('is-swapping');
    }, 180);
  }));

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (isMenuOpen()) setMenu(false);
    else if (dock.classList.contains('is-open')) setDock(false);
  });

  /* ---------- nav: seção atual (odômetro) + anel de progresso do medalhão ---------- */
  const secNum = $('#navSectionNum'), secName = $('#navSectionName'), medalProgress = $('#medalProgress');
  let currentSec = '00';
  const setSection = (num, name) => {
    if (num === currentSec) return;
    const up = num > currentSec;
    currentSec = num;
    secNum.animate([{ transform: `translateY(${up ? -100 : 100}%)`, opacity: 0 }], { duration: 220, easing: 'ease-in' }).onfinish = () => {
      secNum.textContent = num;
      secName.textContent = name;
      secNum.animate([{ transform: `translateY(${up ? 100 : -100}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    };
  };
  const setProgress = p => { medalProgress.style.strokeDashoffset = String(100 - p * 100); };

  /* ---------- mini player do Spotify ---------- */
  const dock = $('#dock'), dockBtn = $('#dockBtn'), dockPanel = $('#dockPanel');
  const spotifyEmbed = () => {
    const url = ((window.SITE || {}).links || {}).spotify || '';
    const m = url.match(/open\.spotify\.com\/(playlist|album|artist|track)\/([A-Za-z0-9]+)/);
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : '';
  };
  const setDock = open => {
    // o iframe é criado no primeiro clique e nunca é removido: minimizar não para a música
    if (open && !$('iframe', dockPanel)) {
      const src = spotifyEmbed();
      if (src) $('#dockFrame').innerHTML = `<iframe title="Playlist Os 4 Gaudérios no Spotify" src="${src}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    }
    dock.classList.toggle('is-open', open);
    if (open) dock.classList.add('is-playing');
    dockPanel.setAttribute('aria-hidden', String(!open));
    dockBtn.setAttribute('aria-expanded', String(open));
  };
  dockBtn.addEventListener('click', () => setDock(!dock.classList.contains('is-open')));
  $('#dockMin').addEventListener('click', () => setDock(false));

  /* ---------- modal de prévia ---------- */
  const modal = $('#modal'), modalVideo = $('#modalVideo');
  const openPreview = (src, title) => {
    $('#modalTitle').textContent = title;
    modalVideo.src = src;
    modal.showModal();
    lenis && lenis.stop();
    const p = modalVideo.play(); if (p) p.catch(() => {});
  };
  modal.addEventListener('close', () => {
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    lenis && lenis.start();
  });
  $('#modalClose').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  $$('[data-preview]').forEach(b => b.addEventListener('click', () => openPreview(b.dataset.preview, b.dataset.title)));

  /* ---------- agenda (dados em js/agenda.js) ---------- */
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const STATUS = { confirmado: 'Confirmado', ultimos: 'Últimos ingressos', esgotado: 'Esgotado', fechado: 'Evento fechado' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';

  /* ---------- redes e plataformas (links em js/config.js) ---------- */
  // sem link configurado, o href do HTML (busca na plataforma) continua valendo
  const LINKS = (window.SITE || {}).links || {};
  $$('[data-link]').forEach(a => {
    const url = safeUrl(LINKS[a.dataset.link]);
    if (url) a.href = url;
  });
  const waLink = s => 'https://wa.me/5554999170670?text=' + encodeURIComponent(`Olá! Gostaria de informações sobre o show dos 4 Gaudérios em ${s.cidade} (${s.dt.toLocaleDateString('pt-BR')}).`);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const RECENT_DAYS = 60; // shows realizados aparecem por até 60 dias
  const all = (window.AGENDA || [])
    .map(s => { const [y, m, d] = String(s.data).split('-').map(Number); return { ...s, dt: new Date(y, m - 1, d) }; })
    .filter(s => s.cidade && !isNaN(s.dt))
    .sort((a, b) => a.dt - b.dt);
  // modo ilustrativo (js/config.js): avança as datas em meses inteiros até virarem futuras
  if ((window.SITE || {}).agendaIlustrativa && all.length) {
    const first = all[0].dt;
    let k = 0;
    while (new Date(first.getFullYear(), first.getMonth() + k, first.getDate()) < today) k++;
    all.forEach(s => {
      s.dt = new Date(s.dt.getFullYear(), s.dt.getMonth() + k, s.dt.getDate());
      s.data = `${s.dt.getFullYear()}-${String(s.dt.getMonth() + 1).padStart(2, '0')}-${String(s.dt.getDate()).padStart(2, '0')}`;
    });
    $('#agenda .eyebrow').insertAdjacentHTML('beforeend', ' <span class="demo-badge">Datas ilustrativas</span>');
  }
  const shows = all.filter(s => s.dt >= today);
  const past = all.filter(s => s.dt < today && today - s.dt <= RECENT_DAYS * 864e5);

  const statusTag = s => STATUS[s.status] ? `<span class="tag tag--${s.status}">${STATUS[s.status]}</span>` : '';
  const showCta = s => {
    if (s.status === 'esgotado' || s.status === 'fechado') return '<span></span>';
    const link = safeUrl(s.link);
    return link
      ? `<a class="btn btn-gold btn-sm gig-cta" href="${esc(link)}" target="_blank" rel="noopener"><span>Ingressos ↗</span></a>`
      : `<a class="btn btn-ghost btn-sm gig-cta" href="${esc(waLink(s))}" target="_blank" rel="noopener"><span>Mais informações</span></a>`;
  };
  const place = s => [s.evento, s.local].filter(Boolean).map(esc).join(' · ');

  if (shows.length) {
    const [next, ...rest] = shows;
    const nextEl = $('#agendaNext');
    nextEl.hidden = false;
    nextEl.innerHTML = `
      <time class="next-date" datetime="${esc(next.data)}"><b>${String(next.dt.getDate()).padStart(2, '0')}</b><span>${MESES[next.dt.getMonth()]} · ${DIAS[next.dt.getDay()]}</span></time>
      <div class="next-info">
        <p class="eyebrow"><span class="dot"></span> Próximo baile</p>
        <h3>${esc(next.cidade)} · ${esc(next.uf)}</h3>
        <p>${place(next)}${next.hora ? ' · ' + esc(next.hora) : ''}</p>
      </div>
      <div class="next-side">
        <div class="countdown" aria-label="Contagem regressiva"><div><b data-cd="d">0</b><small>dias</small></div><div><b data-cd="h">0</b><small>horas</small></div><div><b data-cd="m">0</b><small>min</small></div></div>
        ${statusTag(next)}${showCta(next)}
      </div>`;
    // "23h" ou "22h30" vira horário; sem hora, conta até 21h
    const [hh, mm] = (String(next.hora || '').match(/(\d{1,2})\s*h\s*(\d{2})?/) || [, 21, 0]).slice(1).map(n => +n || 0);
    const target = new Date(next.dt); target.setHours(hh, mm);
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      $('[data-cd="d"]', nextEl).textContent = Math.floor(left / 864e5);
      $('[data-cd="h"]', nextEl).textContent = Math.floor(left / 36e5) % 24;
      $('[data-cd="m"]', nextEl).textContent = Math.floor(left / 6e4) % 60;
    };
    tick(); setInterval(tick, 30000);

    $('#agendaList').innerHTML = rest.map(s => `
      <article class="gig${s.status === 'esgotado' ? ' is-soldout' : ''}">
        <time class="gig-date" datetime="${esc(s.data)}"><b>${String(s.dt.getDate()).padStart(2, '0')}</b><span>${MESES[s.dt.getMonth()]}<br>${DIAS[s.dt.getDay()]}</span></time>
        <div class="gig-info"><h3>${esc(s.cidade)} · ${esc(s.uf)}</h3><p>${place(s)}${s.hora ? ' · ' + esc(s.hora) : ''}</p></div>
        <div class="gig-meta">${statusTag(s)}</div>
        ${showCta(s)}
      </article>`).join('');
  } else {
    $('#agendaEmpty').hidden = false;
  }

  if (past.length) {
    const NOMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const months = [...new Set(past.map(s => NOMES[s.dt.getMonth()]))].join(' e ');
    const pastEl = $('#agendaPast');
    pastEl.hidden = false;
    $('#agendaPastTitle').textContent = `Por onde o baile passou · ${months}`;
    $('#agendaPastCount').textContent = `${past.length} ${past.length > 1 ? 'shows realizados' : 'show realizado'}`;
    $('#agendaPastList').innerHTML = past.map(s => `
      <article class="gig is-past">
        <time class="gig-date" datetime="${esc(s.data)}"><b>${String(s.dt.getDate()).padStart(2, '0')}</b><span>${MESES[s.dt.getMonth()]}<br>${DIAS[s.dt.getDay()]}</span></time>
        <div class="gig-info"><h3>${esc(s.cidade)} · ${esc(s.uf)}</h3><p>${place(s)}${s.hora ? ' · ' + esc(s.hora) : ''}</p></div>
        <div class="gig-meta"><span class="tag tag--realizado">Realizado</span></div>
        <span></span>
      </article>`).join('');
  }

  /* ---------- kit de divulgação ---------- */
  const pressBtns = $$('.press-tabs button');
  pressBtns.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter, shown = [];
    pressBtns.forEach(x => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $$('.asset').forEach(a => {
      const on = f === 'all' || a.dataset.cat === f;
      a.classList.toggle('is-hidden', !on);
      on && shown.push(a);
    });
    if (!isStatic) {
      gsap.fromTo(shown, { autoAlpha: 0, y: 30, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, stagger: .05, ease: 'expo.out', overwrite: true });
      ScrollTrigger.refresh();
    }
  }));

  // pasta dos clipes em 4K (configurada em js/config.js)
  const pasta = safeUrl((window.SITE || {}).pastaClipes);
  if (pasta) $('#clipsFolder').href = pasta;

  // clipes do kit tocam ao passar o mouse; no celular, quando aparecem
  $$('.asset--clip').forEach(card => {
    const v = $('video', card);
    if (matchMedia('(hover: hover)').matches) {
      card.addEventListener('pointerenter', () => playVideo(v));
      card.addEventListener('pointerleave', () => v.pause());
    } else playIO.observe(v);
  });

  const copyBtn = $('#copyRelease');
  copyBtn.addEventListener('click', async () => {
    const text = $('#releaseText').textContent.trim();
    try { await navigator.clipboard.writeText(text); }
    catch {
      const r = document.createRange(); r.selectNodeContents($('#releaseText'));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      document.execCommand('copy');
    }
    copyBtn.classList.add('is-done');
    $('span', copyBtn).textContent = 'Copiado ✓';
    setTimeout(() => { copyBtn.classList.remove('is-done'); $('span', copyBtn).textContent = 'Copiar release'; }, 2200);
  });

  /* ---------- versão estática (sem GSAP ou movimento reduzido) ---------- */
  if (isStatic) {
    document.body.classList.remove('is-loading');
    $('#loader').remove();
    $('.float-wa').classList.add('is-visible');
    dock.classList.add('is-visible');
    $$('.clips-screen video').forEach(v => loadVideo(v));
    return;
  }

  /* ==========================================================
     A partir daqui: experiência animada
     ========================================================== */
  gsap.registerPlugin(ScrollTrigger);

  // rolagem suave
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    }));
  }

  /* ---------- utilitários de texto ---------- */
  const splitChars = el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      el.appendChild(s);
    });
    return $$('.ch', el);
  };
  const HIGHLIGHT = /^(1997|cordeona|vaneira|estrada,|acorde\.)$/i;
  const splitWords = el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w' + (HIGHLIGHT.test(w) ? ' hl' : '');
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return $$('.w', el);
  };

  /* ---------- loader ---------- */
  const heroChars = splitChars($('.hero-word'));
  gsap.set(heroChars, { yPercent: 110 });
  gsap.set(['.hero-4', '.hero-os'], { yPercent: 110 });
  gsap.set(['.hero-eyebrow', '.hero-sub', '.scroll-cue'], { autoAlpha: 0, y: 20 });

  const loaderYear = { v: 1997 };
  const loaderTl = gsap.timeline()
    .to(loaderYear, { v: new Date().getFullYear(), duration: 1.8, ease: 'power2.inOut', snap: { v: 1 }, onUpdate: () => { $('#loaderYear').textContent = loaderYear.v; } }, 0)
    .to('#loaderBar', { width: '100%', duration: 1.8, ease: 'power2.inOut' }, 0);

  const pageReady = new Promise(r => {
    if (document.readyState === 'complete') r();
    else addEventListener('load', r, { once: true });
    setTimeout(r, 4000); // não segura o usuário por causa de um vídeo lento
  });

  Promise.all([pageReady, loaderTl.then()]).then(() => {
    const loader = $('#loader');
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    setTimeout(() => loader.remove(), 1400);
    ScrollTrigger.refresh();

    gsap.timeline({ delay: .45, defaults: { ease: 'expo.out' } })
      .from('#heroMedia', { scale: 1.25, duration: 2.4, ease: 'power3.out' }, 0)
      .to('.hero-os', { yPercent: 0, duration: 1.2 }, .2)
      .to('.hero-4', { yPercent: 0, duration: 1.3 }, .3)
      .to(heroChars, { yPercent: 0, duration: 1.3, stagger: .045 }, .38)
      .to(['.hero-eyebrow', '.hero-sub', '.scroll-cue'], { autoAlpha: 1, y: 0, duration: 1, stagger: .12 }, .9);
  });

  /* ---------- nav: progresso, faixa compacta e seção atual ---------- */
  const nav = $('#nav'), floatWa = $('.float-wa');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      setProgress(self.progress);
      nav.classList.toggle('is-compact', y > 80);
      floatWa.classList.toggle('is-visible', y > innerHeight * 1.2);
      dock.classList.toggle('is-visible', y > innerHeight * 1.2 || dock.classList.contains('is-open'));
    }
  });
  $$('.menu-links a').forEach(a => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    const num = $('small', a).textContent, name = $('span', a).textContent;
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: s => {
        a.classList.toggle('is-active', s.isActive);
        if (s.isActive) setSection(num, name);
      },
      onLeaveBack: s => { if (s.trigger === $('#historia')) setSection('00', 'Início'); }
    });
  });

  const mm = gsap.matchMedia();
  const DESKTOP = '(min-width: 901px)';
  const MOBILE = '(max-width: 900px)';

  /* ---------- HERO: tela cheia → cartão ---------- */
  mm.add({ d: DESKTOP, m: MOBILE }, ctx => {
    const inset = ctx.conditions.d ? 'inset(13% 17% 19% 17% round 34px)' : 'inset(18% 5% 34% 5% round 22px)';
    gsap.set('#heroMedia', { clipPath: 'inset(0% 0% 0% 0% round 0px)' });
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 1 }
    })
      .to('#heroMedia', { clipPath: inset, ease: 'power2.inOut', duration: 1 }, 0)
      .to('.hero-video', { scale: 1, ease: 'none', duration: 1 }, 0)
      .to('#heroCopy', { yPercent: -18, autoAlpha: 0, ease: 'power1.in', duration: .45 }, 0)
      .fromTo('#heroAfter', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .4 }, .55);
  });

  /* ---------- MANIFESTO: palavra por palavra ---------- */
  const words = splitWords($('[data-reveal-words]'));
  gsap.to(words, {
    opacity: 1, ease: 'none', stagger: .1,
    scrollTrigger: { trigger: '.manifesto-text', start: 'top 82%', end: 'bottom 50%', scrub: true }
  });

  /* ---------- contadores ---------- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, from = +(el.dataset.from || 0), o = { v: from };
    el.textContent = from;
    gsap.to(o, {
      v: to, duration: 2, ease: 'power3.out', snap: { v: 1 },
      onUpdate: () => { el.textContent = o.v; },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- revelações genéricas ---------- */
  $$('.display, .lead, .clips-head .eyebrow, .music-copy .btn, .tracks li, .contact-actions, .contact-cards .c-card, .footer-word, .agenda-next, .gig, .agenda-empty, .agenda-foot, .press-head-side .btn, .press-tabs, .release, .platforms-head, .social-handle').forEach(el => {
    if (el.closest('.road, .lineup')) return;
    gsap.from(el, {
      y: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  ScrollTrigger.batch('.asset, .platform, .s-card', {
    start: 'top 92%', once: true,
    onEnter: els => gsap.fromTo(els, { y: 70, autoAlpha: 0, scale: .94 }, { y: 0, autoAlpha: 1, scale: 1, duration: 1.1, stagger: .08, ease: 'expo.out', overwrite: true })
  });

  /* ---------- BRASÃO ---------- */
  const crestTl = gsap.timeline({
    scrollTrigger: { trigger: '.crest', start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
  crestTl
    .fromTo('#crestWrap', { rotationY: -38, rotationX: 14, scale: .5, y: 120, autoAlpha: .2 }, { rotationY: 0, rotationX: 0, scale: 1, y: 0, autoAlpha: 1, ease: 'power2.out', duration: 1 }, 0)
    .to('#crestSun', { scale: 1.25, opacity: 1, ease: 'power1.out', duration: 1 }, 0)
    .fromTo('#crestGlare', { backgroundPosition: '120% 0' }, { backgroundPosition: '-30% 0', ease: 'none', duration: .8 }, .6);
  $$('.crest-words li').forEach((li, i) => {
    crestTl.fromTo(li, { autoAlpha: 0, x: li.dataset.side === 'l' ? -80 : 80, filter: 'blur(10px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: .35, ease: 'power2.out' }, .7 + i * .22);
  });
  crestTl
    .to('.crest-caption', { autoAlpha: 1, duration: .3 }, 1.5)
    .to('#crestWrap', { scale: 1.06, duration: .5, ease: 'none' }, 1.5);

  // inclinação com o mouse
  const crestTilt = $('#crestTilt');
  if (matchMedia('(hover: hover)').matches) {
    const rx = gsap.quickTo(crestTilt, 'rotationX', { duration: .8, ease: 'power3' });
    const ry = gsap.quickTo(crestTilt, 'rotationY', { duration: .8, ease: 'power3' });
    $('.crest-stage').addEventListener('pointermove', e => {
      const r = e.currentTarget.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - .5) * 22);
      rx(-((e.clientY - r.top) / r.height - .5) * 16);
    });
    $('.crest-stage').addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ---------- FORMAÇÃO ---------- */
  const caps = $$('.lineup-cap'), photos = $$('.lineup-photo'), dots = $$('.lineup-dots i');
  let lineupIdx = 0;
  const setLineup = i => {
    if (i === lineupIdx) return;
    lineupIdx = i;
    [caps, photos, dots].forEach(list => list.forEach((el, j) => el.classList.toggle('is-active', j === i)));
  };
  ScrollTrigger.create({
    trigger: '.lineup', start: 'top top', end: 'bottom bottom',
    onUpdate: s => setLineup(Math.min(photos.length - 1, Math.floor(s.progress * photos.length)))
  });
  gsap.to('.lineup-bgword span', {
    xPercent: -45, ease: 'none',
    scrollTrigger: { trigger: '.lineup', start: 'top bottom', end: 'bottom top', scrub: true }
  });
  gsap.from('.lineup-photos', {
    y: 120, scale: .9, ease: 'none',
    scrollTrigger: { trigger: '.lineup', start: 'top bottom', end: 'top top', scrub: true }
  });

  /* ---------- CLIPES ---------- */
  const screenVideos = $$('.clips-screen video'), clipItems = $$('.clip');
  let activeClip = -1;
  const setClip = i => {
    if (i === activeClip) return;
    activeClip = i;
    clipItems.forEach((c, j) => c.classList.toggle('is-active', j === i));
    screenVideos.forEach((v, j) => {
      const on = j === i;
      v.classList.toggle('is-active', on);
      on ? playVideo(v) : v.pause();
    });
    $('#clipNum').textContent = String(i + 1).padStart(2, '0');
  };
  mm.add(DESKTOP, () => {
    clipItems.forEach((c, i) => ScrollTrigger.create({
      trigger: c, start: 'top 55%', end: 'bottom 55%',
      onToggle: s => s.isActive && setClip(i)
    }));
    // a tela só toca enquanto a seção está visível
    ScrollTrigger.create({
      trigger: '.clips-body', start: 'top bottom', end: 'bottom top',
      onEnter: () => setClip(Math.max(activeClip, 0)),
      onLeave: () => screenVideos.forEach(v => v.pause()),
      onEnterBack: () => { const v = screenVideos[activeClip]; v && playVideo(v); },
      onLeaveBack: () => screenVideos.forEach(v => v.pause())
    });
    gsap.from('.clips-screen-inner', {
      scale: .86, rotationX: 12, transformPerspective: 1200, ease: 'none',
      scrollTrigger: { trigger: '.clips-body', start: 'top bottom', end: 'top 15%', scrub: true }
    });
    return () => screenVideos.forEach(v => v.pause());
  });
  $('#clipsScreen').addEventListener('click', () => {
    const b = $('[data-preview]', clipItems[Math.max(activeClip, 0)]);
    b && b.click();
  });

  /* ---------- VANERA: zoom através das letras ---------- */
  gsap.timeline({
    scrollTrigger: { trigger: '.knockout', start: 'top top', end: 'bottom bottom', scrub: 1 }
  })
    .to('#knockoutMask', { scale: 9, duration: .7, ease: 'power2.in' }, .3)
    .to('#knockoutMask', { autoAlpha: 0, duration: .25, ease: 'none' }, .7)
    .fromTo('#knockoutAfter', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .25 }, .85);

  /* ---------- MÚSICAS: marquee acelera com a rolagem ---------- */
  const tracks = $$('.marquee-track').map(t => t.getAnimations()[0]).filter(Boolean);
  ScrollTrigger.create({
    trigger: '.music', start: 'top bottom', end: 'bottom top',
    onUpdate: s => {
      const boost = 1 + Math.min(Math.abs(s.getVelocity()) / 400, 5);
      tracks.forEach(a => { a.playbackRate = boost; });
      clearTimeout(tracks._t);
      tracks._t = setTimeout(() => tracks.forEach(a => { a.playbackRate = 1; }), 120);
    }
  });

  /* ---------- ESTRADA: rolagem horizontal ---------- */
  const roadTrack = $('#roadTrack');
  const roadDist = () => roadTrack.scrollWidth - innerWidth;
  const roadTween = gsap.to(roadTrack, {
    x: () => -roadDist(), ease: 'none',
    scrollTrigger: {
      trigger: '.road-stage', start: 'top top', end: () => '+=' + roadDist(),
      pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
    }
  });
  gsap.to('#roadLine', {
    xPercent: -50, ease: 'none',
    scrollTrigger: { trigger: '.road-stage', start: 'top top', end: () => '+=' + roadDist(), scrub: 1, invalidateOnRefresh: true }
  });
  $$('.road-vehicle').forEach(fig => {
    const opts = { trigger: fig, containerAnimation: roadTween, start: 'left right', end: 'center center', scrub: true };
    gsap.from($('img', fig), { xPercent: 60, rotation: -2, ease: 'power2.out', scrollTrigger: opts });
    gsap.from($('.road-word', fig), { xPercent: -30, autoAlpha: 0, ease: 'none', scrollTrigger: { ...opts, end: 'right left' } });
    gsap.from($('figcaption', fig), { y: 40, autoAlpha: 0, ease: 'power2.out', scrollTrigger: { ...opts, start: 'left 60%' } });
  });

  /* ---------- CONTATO ---------- */
  gsap.from('.contact-glow', {
    scale: .5, autoAlpha: 0, ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'center center', scrub: true }
  });

  /* ---------- cursor + botões magnéticos ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = $('#cursor');
    const cx = gsap.quickTo(cursor, 'x', { duration: .25, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); cursor.style.opacity = 1; });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('pointerover', e => {
      const play = e.target.closest('.clips-screen');
      const hover = e.target.closest('a, button, .c-card');
      cursor.classList.toggle('is-play', !!play);
      cursor.classList.toggle('is-hover', !play && !!hover);
    });

    $$('.magnetic').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .3);
        my((e.clientY - r.top - r.height / 2) * .4);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
