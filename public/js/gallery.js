/* ==========================================================================
   Gallery — driven by data/gallery.json
   Adding a photograph = drop the file in public/assets/gallery/ and add one
   entry to the JSON. No markup changes needed.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('galleryGrid');
  if (!grid) return;

  var items = [];
  var active = 'all';

  var PH_SVG =
    '<svg viewBox="0 0 48 48" aria-hidden="true">' +
    '<rect x="5" y="9" width="38" height="30" rx="3"/>' +
    '<circle cx="17" cy="20" r="3.5"/>' +
    '<path d="M5 33l11-10 9 8 6-5 12 10"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function t(bundle) {
    return window.I18N ? window.I18N.t(bundle) : (bundle && bundle.en) || '';
  }

  function render() {
    var visible = items.filter(function (it) { return active === 'all' || it.cat === active; });

    if (!visible.length) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = visible.map(function (it) {
      var title = esc(t(it.title));
      var sub   = esc(t(it.sub));

      var inner = it.src
        ? '<img src="' + esc(it.src) + '" alt="' + title + '" loading="lazy" decoding="async">'
        : '<div class="gal-item__ph">' + PH_SVG + '<span>' + esc(t(it.slot)) + '</span></div>';

      return '<figure class="gal-item" data-cat="' + esc(it.cat) + '" tabindex="0">' +
               inner +
               '<figcaption class="gal-item__cap"><b>' + title + '</b><span>' + sub + '</span></figcaption>' +
             '</figure>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.gal-filter');
    if (!btn) return;
    active = btn.getAttribute('data-filter');
    document.querySelectorAll('.gal-filter').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    render();
  });

  document.addEventListener('langchange', render);

  fetch('data/gallery.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { items = Array.isArray(data) ? data : (data.items || []); render(); })
    .catch(function () { console.warn('[gallery] data/gallery.json could not be loaded'); });
})();
