/* ==========================================================================
   i18n — English (default) · বাংলা · العربية
   English lives in the HTML itself, so it is always correct and crawlable.
   On first load we snapshot every [data-i18n] node; switching to bn/ar
   overlays a JSON dictionary, switching back to en restores the snapshot.
   ========================================================================== */
(function () {
  'use strict';

  var SUPPORTED = ['en', 'bn', 'ar'];
  var DEFAULT   = 'en';
  var STORE_KEY = 'mti-lang';
  var DIR       = { en: 'ltr', bn: 'ltr', ar: 'rtl' };
  var HTML_LANG = { en: 'en', bn: 'bn', ar: 'ar' };
  // Each page declares its own <title> in the three languages. A page that does
  // not (or a build that predates this) simply keeps the title it was served.
  var TITLES = window.PAGE_TITLES || {};

  var snapshot = null;   // { key: englishHTML }
  var cache    = {};     // { lang: dictionary }
  var current  = DEFAULT;

  function nodes() {
    return document.querySelectorAll('[data-i18n]');
  }

  function snap() {
    if (snapshot) return;
    snapshot = {};
    nodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in snapshot)) snapshot[k] = el.innerHTML;
    });
  }

  function paint(dict) {
    nodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = dict && Object.prototype.hasOwnProperty.call(dict, k) ? dict[k] : snapshot[k];
      if (typeof v === 'string' && el.innerHTML !== v) el.innerHTML = v;
    });
  }

  function chrome(lang) {
    var html = document.documentElement;
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', HTML_LANG[lang]);
    html.setAttribute('dir', DIR[lang]);
    if (TITLES[lang]) document.title = TITLES[lang];

    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-lang') === lang));
    });

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* private mode */ }
    current = lang;
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT;
    snap();

    if (lang === DEFAULT) { paint(null); chrome(lang); return Promise.resolve(); }
    if (cache[lang])      { paint(cache[lang]); chrome(lang); return Promise.resolve(); }

    return fetch('i18n/' + lang + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { cache[lang] = d; paint(d); chrome(lang); })
      .catch(function () {
        // Dictionary missing or offline — stay on English rather than breaking.
        console.warn('[i18n] could not load "' + lang + '", falling back to English');
        paint(null); chrome(DEFAULT);
      });
  }

  /* Visitors in the Arab countries of the Middle East open the site in Arabic,
     visitors in Bangladesh open it in Bengali, and everyone else in English.
     The time zone the device reports is the closest thing to a country that a
     static page can read — it needs no server, no IP lookup and no third-party
     service, and nothing about the visitor leaves the browser. */
  var ZONE_LANG = {
    'Asia/Riyadh':   'ar',  // Saudi Arabia
    'Asia/Dubai':    'ar',  // United Arab Emirates
    'Asia/Qatar':    'ar',  // Qatar
    'Asia/Kuwait':   'ar',  // Kuwait
    'Asia/Bahrain':  'ar',  // Bahrain
    'Asia/Muscat':   'ar',  // Oman
    'Asia/Aden':     'ar',  // Yemen
    'Asia/Baghdad':  'ar',  // Iraq
    'Asia/Amman':    'ar',  // Jordan
    'Asia/Damascus': 'ar',  // Syria
    'Asia/Beirut':   'ar',  // Lebanon
    'Asia/Gaza':     'ar',  // Palestine
    'Asia/Hebron':   'ar',  // Palestine
    'Africa/Cairo':  'ar',  // Egypt
    'Asia/Dhaka':    'bn',  // Bangladesh
    'Asia/Dacca':    'bn'   // Bangladesh — the old name, still sent by a few devices
  };

  function regionLang() {
    try {
      var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) return ZONE_LANG[zone] || null;
    } catch (e) { /* no Intl — fall through */ }
    // Only reached where the time zone is unreadable: fall back to the locale.
    var tag = (navigator.language || '').toLowerCase();
    if (tag === 'ar' || tag.indexOf('ar-') === 0) return 'ar';
    if (tag === 'bn' || tag.indexOf('bn-') === 0) return 'bn';
    return null;
  }

  function preferred() {
    // An explicit ?lang= wins over everything — it is how a link is shared.
    var q = new URLSearchParams(location.search).get('lang');
    if (q && SUPPORTED.indexOf(q) !== -1) return q;

    // Then whatever this visitor last chose with the switcher.
    var saved;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) { saved = null; }
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;

    return regionLang() || DEFAULT;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-set-lang]');
    if (!btn) return;
    e.preventDefault();
    apply(btn.getAttribute('data-set-lang'));
  });

  window.I18N = {
    apply: apply,
    get current() { return current; },
    t: function (bundle) {
      // bundle = { en: "...", bn: "...", ar: "..." }
      if (!bundle) return '';
      return bundle[current] || bundle[DEFAULT] || '';
    }
  };

  apply(preferred());
})();
