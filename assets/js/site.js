(() => {
  const ROLES = ['strategy', 'product', 'analytics'];
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw6dTnsOkly42s5ulUaM93uMCB_9UTckrBbT0KCVS-44XFllEsEbmcS3huk0SaB7TafGg/exec';

  /* ---------- Theme: every visit starts dark; light lasts for the session ---------- */

  const root = document.documentElement;
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const syncTheme = () => {
    const light = root.dataset.theme === 'light';
    if (themeBtn) themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    if (themeMeta) themeMeta.setAttribute('content', light ? '#ffffff' : '#0a1120');
  };
  syncTheme();
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const light = root.dataset.theme !== 'light';
      if (light) root.dataset.theme = 'light'; else delete root.dataset.theme;
      try { sessionStorage.setItem('theme', light ? 'light' : 'dark'); } catch { /* storage blocked */ }
      syncTheme();
    });
  }

  /* ---------- Navigation ---------- */

  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const menuBtn = document.querySelector('.menu-btn');
  const links = document.getElementById('nav-links');
  if (menuBtn && links) {
    const setOpen = (open) => {
      links.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', () => setOpen(!links.classList.contains('is-open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) { setOpen(false); menuBtn.focus(); }
    });
  }

  // Highlight the nav link for the section in view
  const sectionLinks = links ? [...links.querySelectorAll('a[href^="#"]')] : [];
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(sectionLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((a) => a.classList.toggle('is-active', a === byId.get(entry.target.id)));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
  }

  /* ---------- Résumé: only show links once the PDF exists ---------- */

  const resumeLinks = document.querySelectorAll('[data-resume]');
  if (resumeLinks.length && location.protocol.startsWith('http')) {
    fetch(resumeLinks[0].getAttribute('href'), { method: 'HEAD' })
      .then((res) => { if (res.ok) resumeLinks.forEach((a) => { a.hidden = false; }); })
      .catch(() => {});
  }

  /* ---------- Projects: filter by role (?for=strategy|product|analytics) ---------- */

  const tabs = document.querySelector('[data-filter]');
  if (tabs) {
    const cards = [...document.querySelectorAll('[data-for]')];
    const empty = document.querySelector('[data-empty]');

    tabs.querySelectorAll('[data-value]').forEach((btn) => {
      const value = btn.dataset.value;
      const count = value === 'all' ? cards.length : cards.filter((c) => c.dataset.for.split(' ').includes(value)).length;
      const badge = btn.querySelector('.tab-count');
      if (badge) badge.textContent = count;
    });

    const apply = (value, updateUrl) => {
      const role = ROLES.includes(value) ? value : 'all';
      tabs.querySelectorAll('[data-value]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === role)));
      let shown = 0;
      cards.forEach((card) => {
        card.hidden = role !== 'all' && !card.dataset.for.split(' ').includes(role);
        if (!card.hidden) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
      if (updateUrl) {
        const url = new URL(location.href);
        role === 'all' ? url.searchParams.delete('for') : url.searchParams.set('for', role);
        history.replaceState(null, '', url);
      }
    };

    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-value]');
      if (btn) apply(btn.dataset.value, true);
    });
    apply(new URLSearchParams(location.search).get('for'), false);
  }

  /* ---------- Contact form ---------- */

  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        const invalid = form.querySelector(':invalid');
        status.textContent = invalid && invalid.type === 'email'
          ? 'Add a valid email address so I can reply.'
          : 'Add a short message before sending.';
        invalid?.focus();
        return;
      }

      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      status.textContent = 'Sending…';

      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form) });
        let ok = res.ok;
        try { ok = Boolean((await res.json()).ok); } catch { /* non-JSON reply */ }
        if (!ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        status.textContent = 'Message sent. Thanks, I’ll be in touch soon.';
      } catch (err) {
        console.error(err);
        status.textContent = 'That didn’t go through. Message me on LinkedIn instead.';
      } finally {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
      }
    });
  }

  /* ---------- Deep links ---------- */

  // Old /experience/ links redirect to /#experience; land there once fonts settle.
  const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) {
    (document.fonts ? document.fonts.ready : Promise.resolve())
      .then(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
