(() => {
  const ROLES = ['strategy', 'product', 'analytics'];
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw6dTnsOkly42s5ulUaM93uMCB_9UTckrBbT0KCVS-44XFllEsEbmcS3huk0SaB7TafGg/exec';
  const LINKEDIN = 'https://www.linkedin.com/in/phucnh2402/';
  const IMG_BASE = new URL('../img/', document.currentScript.src);
  const track = (name, params) => { if (typeof window.gtag === 'function') window.gtag('event', name, params); };

  /* ---------- Case studies (one entry per project card, keyed by data-case) ---------- */

  const CASES = {
    reroute: {
      title: 'Reroute: airline disruption seat allocation',
      tag: 'Airline revenue management',
      question: 'When a delay strands connecting passengers, who should get the few seats left on recovery flights?',
      stats: [['−18.9%', 'expected revenue loss vs. manual triage'], ['0.92', 'AUC, calibrated misconnect model'], ['7 ms', 'mean solve time']],
      did: [
        'Simulated 100 disruptions at 50–150% seat supply vs. demand.',
        'Calibrated a LightGBM misconnect-risk model with Platt scaling.',
        'Allocated seats with a linear program under cabin, connection-time and loyalty rules.',
      ],
      found: [
        '$134K less expected loss than gate-agent triage ($710K → $576K).',
        'Gains hold at 18–21% from very tight to ample seat supply.',
        '95% of solves finish within 11 ms.',
      ],
      soWhat: 'Fast and explainable enough to run live at the gate, with an audit log behind every reassignment.',
      limits: 'Synthetic data calibrated to public statistics; real airline cost structures may differ.',
      figure: { src: 'cases/reroute-improvement.webp', width: 960, height: 600, caption: 'Cost reduction vs. manual triage across 100 simulated disruptions (median 18.8%).' },
      tools: ['Python', 'LightGBM', 'SciPy / HiGHS', 'FastAPI', 'Docker'],
      repo: 'https://github.com/Robertn02/Airline-Revenue-Management-IROPS-Seat-Allocation-Optimizer',
      demo: 'https://robertn02.github.io/Airline-Revenue-Management-IROPS-Seat-Allocation-Optimizer/',
    },
    rivian: {
      title: 'Rivian smart charging and incentives',
      tag: 'EV and energy',
      question: 'Can shifting EV charging to cleaner hours cut emissions and help sell more Rivians?',
      stats: [['476k lbs', 'CO₂ avoided per year'], ['68%', 'of the ideal savings captured'], ['11–21%', 'potential sales uplift']],
      did: [
        'Labeled 2023 CAISO hours where waiting 8 hours is at least 10% cleaner.',
        'Trained logistic regression and random forest models to predict cleaner windows.',
        'Applied the model to 2024 Rivian sessions and priced the savings as SCE incentives.',
      ],
      found: [
        'Drivers would save $19–97 a month ($233–1,164 a year).',
        'At a price elasticity of −3.2, those savings lift sales 10.7–21.3%.',
      ],
      soWhat: 'Ship opt-in automated smart charging in the Rivian app, backed by simple SCE incentive payments.',
      tools: ['Python', 'Random forest', 'Logistic regression', 'Price elasticity'],
      repo: 'https://github.com/Robertn02/Rivian-SCE-EV-Smart-Charging-Emissions-and-Incentive-Analysis',
    },
    robinhood: {
      title: 'Robinhood retail investor herding',
      tag: 'Capital markets',
      question: 'How did Robinhood investors actually behave during the 2018–2020 retail boom?',
      stats: [['6', 'stocks dominated retail holdings'], ['ρ > 0.9', 'co-movement across top holdings'], ['3×', 'growth in median holdings']],
      did: [
        'Joined RobinTrack holdings with CRSP security identifiers.',
        'Measured concentration, co-movement and the link between flows and returns.',
        'Mapped CRSP share codes to see what retail investors held.',
      ],
      found: [
        'F, GE, AAPL, MSFT, AAL and DIS moved almost in lockstep.',
        'AAL holdings kept rising while returns swung: cost-averaging, not momentum.',
        'ETFs were the second-largest holding type after U.S. common shares.',
      ],
      soWhat: 'Participation broadened, yet buying still herded into a handful of familiar names.',
      tools: ['Python', 'CRSP', 'RobinTrack'],
      repo: 'https://github.com/Robertn02/Robinhood-CRSP-Retail-Investor-Flow-Behavioral-Analytics',
    },
    uber: {
      title: 'NYC Uber demand and hotspots',
      tag: 'Mobility',
      question: 'When and where does Uber demand peak in New York City?',
      stats: [['~75%', 'of pickups on weekdays'], ['R² 0.76', 'from weekday and month effects'], ['4–9 pm', 'daily demand peak']],
      did: [
        'Cleaned 2014–2015 TLC and FiveThirtyEight pickup records.',
        'Regressed daily pickups on weekday and month effects (OLS).',
        'Clustered pickup locations with K-means and tracked hotspots month to month.',
      ],
      found: [
        'Demand is concentrated in a few bases and driven by commuting.',
        'Mondays and Sundays run well below Fridays; summer brings the biggest lift.',
        'Hotspots stay anchored in Manhattan, with airport and outer-borough satellites.',
      ],
      soWhat: 'Plan driver supply around the weekday 4–9 pm peak and the summer lift.',
      limits: 'Pickup-only data: no fares, drop-offs or wait times.',
      tools: ['Python', 'OLS', 'K-means', 'Folium'],
      repo: 'https://github.com/Robertn02/Uber-NYC-Pickup-Demand-and-Hotspot-Analytics',
    },
    spotify: {
      title: 'What makes listeners pay for Premium',
      tag: 'Consumer subscriptions',
      question: 'What makes free Spotify listeners willing to pay for Premium?',
      stats: [['0.178', 'pseudo R², podcast-variety satisfaction'], ['≈0.01', 'pseudo R², age group'], ['<0.01', 'pseudo R², device']],
      did: [
        'Explored a Kaggle survey of Spotify listeners.',
        'Encoded age group, device and podcast satisfaction as predictors.',
        'Tested each hypothesis with its own logistic regression.',
      ],
      found: [
        'Satisfaction with podcast variety is the only meaningful predictor of upgrade intent.',
        'Listeners aged 12–35 show the strongest intent.',
      ],
      soWhat: 'Lead the upgrade path with exclusive short-form podcasts aimed at students and young adults.',
      limits: 'Survey data is observational, so these are associations, not causes.',
      tools: ['Python', 'Logistic regression'],
      repo: 'https://github.com/Robertn02/Spotify-Premium-Subscription-Behavior-Modeling-and-Driver-Analysis',
    },
    etf: {
      title: 'ETF sentiment and crowding signals',
      tag: 'Quant research',
      question: 'Do sentiment and crowding signals built from public ETF data predict sector returns?',
      stats: [['0.07', 'Sharpe, sentiment long-short'], ['−2.5%', 'annual return, crowding long-short'], ['t < 2', 'every alpha, every factor model']],
      did: [
        'Built sentiment and crowding factors from ETF price and volume, 2005–2024.',
        'Formed long, short and long-short portfolios across the 11 sector SPDR ETFs.',
        'Tested alpha with CAPM, Fama-French 3-factor and 5-factor plus momentum.',
      ],
      found: [
        'Sentiment long-short flipped from +1.75% (2005–14) to −2.21% (2015–24).',
        'Single legs sometimes earned alpha, but they moved together, so spreads collapsed.',
      ],
      soWhat: 'The signals carry information, but ETF arbitrage and co-movement stop it from becoming tradable alpha.',
      tools: ['Python', 'Fama-French', 'Backtesting'],
      repo: 'https://github.com/Robertn02/ETF-Sentiment-and-Crowdedness-Factor-Performance-Analysis',
    },
    smartbeta: {
      title: 'Fundamental indexing vs. market cap',
      tag: 'Factor investing',
      question: 'Does weighting stocks by fundamentals beat market-cap weighting, or is it just factor exposure?',
      stats: [['4', 'fundamental weightings tested'], ['Top 1,000', 'stocks per portfolio'], ['1962–today', 'in- and out-of-sample']],
      did: [
        'Merged CRSP returns with Compustat fundamentals using a 6-month reporting lag.',
        'Built top-1,000 portfolios weighted by book equity, income, sales and dividends.',
        'Ran CAPM and Fama-French 3-factor regressions before and after 2005.',
      ],
      found: [
        'Fundamental portfolios showed positive CAPM alpha before 2005.',
        'Controlling for size and value erased most of it; after 2005, no alpha was significant.',
      ],
      soWhat: 'The edge is value and size exposure rather than true alpha, and it has faded since 2005.',
      tools: ['CRSP', 'Compustat', 'CAPM', 'Fama-French'],
      repo: 'https://github.com/Robertn02/Fundamental-Indexation-and-Smart-Beta-Performance-Analysis',
    },
    walmart: {
      title: 'Walmart sales drivers and holiday effects',
      tag: 'Retail',
      question: 'What drives weekly store sales at Walmart, and how much do holidays matter?',
      did: [
        'Combined weekly store and department sales with CPI, fuel, unemployment and markdown data (2010–2012).',
        'Estimated holiday uplift with fixed-effects regression and difference-in-differences.',
        'Segmented stores with K-means on productivity, volatility and growth.',
      ],
      soWhat: 'Segments stores by performance and elasticity to guide operating strategy.',
      tools: ['Python', 'Fixed effects', 'Diff-in-diff', 'K-means'],
      repo: 'https://github.com/Robertn02/Walmart-Retail-Performance-Analytics-Sales-Drivers-and-Holiday-Effects',
    },
    lax: {
      title: 'LAX flight delay prediction',
      tag: 'Airports',
      question: 'What makes flights from JFK and Newark arrive late into LAX?',
      did: [
        'Cleaned 2013 BTS on-time data for JFK and EWR flights into LAX.',
        'Explored delays by carrier, month, weekday and hour.',
        'Trained a decision tree to flag arrivals more than 15 minutes late.',
      ],
      found: [
        'Departure delay is the strongest predictor of a late arrival.',
        'Delays peak in summer and in the late evening.',
      ],
      soWhat: 'Arrival punctuality at LAX is mostly decided at departure, so that is where to intervene.',
      limits: 'No weather data yet; adding it and testing other models are the next steps.',
      tools: ['Python', 'Decision trees'],
      repo: 'https://github.com/Robertn02/Flight-Delay-Prediction-and-Airport-Optimization-LAX',
    },
    insurance: {
      title: 'Insurance claim prediction pipeline',
      tag: 'Insurance pricing',
      question: 'How much will a policy cost in claims, and will it claim at all?',
      did: [
        'Engineered policy-age, value-to-power and premium-ratio features.',
        'Winsorized skewed loss targets at the 99th percentile.',
        'Modeled loss cost with XGBoost (Tweedie) and claim occurrence with a random forest.',
      ],
      soWhat: 'Sharper loss-cost estimates let insurers price fairly and avoid adverse selection.',
      tools: ['Python', 'XGBoost', 'Random forest'],
      repo: 'https://github.com/Robertn02/Insurance-Claim-Prediction-Machine-Learning-Pipeline-XGBoost-Tweedie',
    },
    semiconductor: {
      title: 'Semiconductor yield analytics',
      tag: 'Semiconductors · Team project',
      question: 'Where is first-pass yield being lost across product lines?',
      did: [
        'Built throughput dashboards across product lines.',
        'Flagged anomalies in production data with machine learning.',
      ],
      limits: 'Team project; the code is not public.',
      tools: ['Python', 'Power BI', 'Machine learning'],
    },
  };

  // Tiny DOM helper: h('p', {class: 'x'}, 'text', childNode)
  const h = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => { if (v !== undefined && v !== null) el.setAttribute(k, v); });
    children.flat().forEach((c) => { if (c !== undefined && c !== null && c !== false) el.append(c); });
    return el;
  };
  const icon = (id, cls = 'icon') => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', cls);
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  };

  const caseCards = [...document.querySelectorAll('.work-card[data-case]')].filter((c) => CASES[c.dataset.case]);
  if (caseCards.length && typeof HTMLDialogElement === 'function') {
    const dialog = h('dialog', { class: 'case', 'aria-labelledby': 'case-title' });
    document.body.append(dialog);
    let current = null;

    const visibleCards = () => caseCards.filter((c) => !c.hidden);

    const setUrl = (id) => {
      const url = new URL(location.href);
      if (id) url.searchParams.set('case', id); else url.searchParams.delete('case');
      history.replaceState(null, '', url);
    };

    const block = (title, iconId, items) => h('section', { class: 'case-block' },
      h('h3', {}, icon(iconId), title),
      h('ul', {}, items.map((t) => h('li', {}, t))));

    const render = (card) => {
      const id = card.dataset.case;
      const c = CASES[id];
      const img = card.querySelector('.work-media img');
      const list = visibleCards();
      const i = list.indexOf(card);
      const prev = list[(i - 1 + list.length) % list.length];
      const next = list[(i + 1) % list.length];

      const media = h('div', { class: 'case-media' },
        img ? h('img', { src: img.currentSrc || img.src, alt: '' }) : null,
        h('button', { class: 'case-close', type: 'button', 'aria-label': 'Close case study' }, icon('i-close')));

      const actions = h('div', { class: 'case-actions' },
        c.demo ? h('a', { class: 'btn btn-primary btn-sm', href: c.demo, target: '_blank', rel: 'noopener', 'data-track': 'demo' }, 'Try the live simulator', icon('i-external')) : null,
        c.repo ? h('a', { class: `btn ${c.demo ? 'btn-secondary' : 'btn-primary'} btn-sm`, href: c.repo, target: '_blank', rel: 'noopener', 'data-track': 'code' }, icon('i-github', 'icon icon--fill'), 'Code and write-up') : null);

      const nav = list.length > 1 ? h('div', { class: 'case-nav' },
        h('button', { class: 'icon-btn', type: 'button', 'data-go': prev.dataset.case, 'data-dir': 'prev', 'aria-label': `Previous: ${CASES[prev.dataset.case].title}` }, icon('i-arrow', 'icon icon--back')),
        h('span', { class: 'case-count' }, `${i + 1} / ${list.length}`),
        h('button', { class: 'icon-btn', type: 'button', 'data-go': next.dataset.case, 'data-dir': 'next', 'aria-label': `Next: ${CASES[next.dataset.case].title}` }, icon('i-arrow'))) : null;

      const body = h('div', { class: 'case-body' },
        h('span', { class: 'tag' }, c.tag),
        h('h2', { id: 'case-title' }, c.title),
        h('p', { class: 'case-question' }, c.question),
        c.stats ? h('div', { class: 'stats' }, c.stats.map(([v, l]) => h('div', { class: 'stat' }, h('strong', {}, v), h('span', {}, l)))) : null,
        h('div', { class: 'case-grid' },
          c.did ? block('What I did', 'i-layers', c.did) : null,
          c.found ? block('What I found', 'i-chart', c.found) : null),
        c.soWhat ? h('div', { class: 'case-sowhat' }, h('strong', {}, 'So what'), h('p', {}, c.soWhat)) : null,
        c.figure ? h('figure', { class: 'case-figure' },
          h('img', { src: new URL(c.figure.src, IMG_BASE).href, width: c.figure.width, height: c.figure.height, alt: c.figure.caption, loading: 'lazy' }),
          h('figcaption', {}, c.figure.caption)) : null,
        c.limits ? h('p', { class: 'case-limits' }, h('strong', {}, 'Limits: '), c.limits) : null,
        h('div', { class: 'chips' }, c.tools.map((t) => h('span', { class: 'chip' }, t))));

      dialog.replaceChildren(
        h('div', { class: 'case-scroll' }, media, body),
        h('div', { class: 'case-foot' }, nav, actions));
      dialog.querySelector('.case-scroll').scrollTop = 0;
      current = card;
    };

    const open = (card, source) => {
      render(card);
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('.case-close').focus();
      setUrl(card.dataset.case);
      track('case_open', { case_id: card.dataset.case, source });
    };

    // Runs on every way out (close button, backdrop, Esc); safe to call twice.
    const cleanup = () => {
      if (!current) return;
      const card = current;
      current = null;
      setUrl(null);
      card.querySelector('h3 a')?.focus({ preventScroll: true });
    };
    const closeCase = () => { if (dialog.open) dialog.close(); cleanup(); };

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('.case-close')) { closeCase(); return; }
      const go = e.target.closest('[data-go]');
      if (go) {
        const card = caseCards.find((c) => c.dataset.case === go.dataset.go);
        if (card) { open(card, 'nav'); dialog.querySelector(`[data-dir="${go.dataset.dir}"]`)?.focus(); }
        return;
      }
      const link = e.target.closest('[data-track]');
      if (link) track(`case_${link.dataset.track}`, { case_id: current?.dataset.case });
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.target.closest('input, textarea')) return;
      const btns = dialog.querySelectorAll('[data-go]');
      if (btns.length) btns[e.key === 'ArrowLeft' ? 0 : 1].click();
    });
    dialog.addEventListener('close', cleanup);

    caseCards.forEach((card) => {
      const link = card.querySelector('h3 a');
      if (!link) return;
      link.setAttribute('aria-haspopup', 'dialog');
      link.addEventListener('click', (e) => {
        // Let modified clicks (new tab, etc.) follow the link to the code
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        open(card, 'card');
      });
    });

    const linked = new URLSearchParams(location.search).get('case');
    const linkedCard = linked && caseCards.find((c) => c.dataset.case === linked);
    if (linkedCard) open(linkedCard, 'link');
  }

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

    // If sending fails, keep the visitor's note: copy it and hand them to LinkedIn.
    const showFallback = () => {
      const note = [form.subject.value, form.message.value].filter(Boolean).join('\n\n');
      const btn = h('button', { class: 'btn btn-secondary btn-sm', type: 'button' }, icon('i-linkedin', 'icon icon--fill'), 'Copy note and open LinkedIn');
      btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(note); } catch { /* clipboard blocked: LinkedIn still opens */ }
        window.open(LINKEDIN, '_blank', 'noopener');
        track('contact_fallback');
      });
      status.replaceChildren(h('span', {}, 'That didn’t go through. Your note is still here.'), btn);
    };

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
        track('contact_sent');
      } catch (err) {
        console.warn('Contact form failed:', err);
        showFallback();
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
