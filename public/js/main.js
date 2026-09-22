/* ==========================================================================
   Interactions — sticky header, mobile menu, scroll-spy, reveal animation
   ========================================================================== */
(function () {
  'use strict';

  var header  = document.getElementById('header');
  var nav     = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');

  /* ---- Sticky header ---- */
  var hero = document.getElementById('hero');
  function syncHeader() {
    var past = window.scrollY > (hero ? Math.min(hero.offsetHeight - 90, window.innerHeight - 90) : 40);
    header.classList.toggle('is-stuck', past);
  }
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
  window.addEventListener('resize', syncHeader);

  /* ---- Mobile menu ---- */
  function closeMenu() {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.nav__link')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) closeMenu();
    });
  }

  /* ---- Scroll-spy ---- */
  // On a blog page the same nav points back at the home page ("../#about"),
  // which is neither a selector nor a section on this page.
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'))
    .filter(function (a) { return (a.getAttribute('href') || '').charAt(0) === '#'; });
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    targets.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Reveal on scroll ---- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting && en.boundingClientRect.top > 0) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- Hero: one photograph at a time, changing every few seconds ---- */
  (function () {
    var rail = document.getElementById('heroRail');
    if (!rail) return;
    var shots = Array.prototype.slice.call(rail.querySelectorAll('.hero__shot'));
    if (shots.length < 2) return;

    rail.classList.add('is-live');
    var at = 0, timer = null, HOLD = 5200;

    var dots = document.createElement('div');
    dots.className = 'hero__dots';
    shots.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'hero__dot' + (i ? '' : ' is-on');
      d.setAttribute('aria-label', 'Photograph ' + (i + 1));
      d.addEventListener('click', function () { go(i); restart(); });
      dots.appendChild(d);
    });
    rail.parentNode.appendChild(dots);

    function go(n) {
      at = (n + shots.length) % shots.length;
      shots.forEach(function (im, i) { im.classList.toggle('is-on', i === at); });
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle('is-on', i === at);
      });
    }
    function tick() { go(at + 1); }
    function restart() { stop(); if (!reduced) timer = setInterval(tick, HOLD); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    // Nothing moves for a visitor who asked for less motion, or on a hidden tab.
    if (reduced) return;
    restart();
    rail.parentNode.addEventListener('mouseenter', stop);
    rail.parentNode.addEventListener('mouseleave', restart);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else restart();
    });
  })();

  /* ---- Reading progress across the top of the header ---- */
  if (!reduced) {
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    var draw = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(draw); }
    }, { passive: true });
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  /* ---- Grids whose children arrive one after another ---- */
  var STAGGER = ['.stat-row', '.awards', '.records', '.grid-2', '.grid-3', '.networks',
                 '.videos', '.juz', '.posts', '.chips', '.path', '.socials', '.edu', '.xp'];
  Array.prototype.forEach.call(document.querySelectorAll(STAGGER.join(',')), function (grid) {
    var kids = grid.children;
    if (kids.length < 2) return;
    grid.classList.add('stagger');
    // Cap the ramp so a thirty-tile grid does not keep the last one waiting.
    for (var i = 0; i < kids.length; i++) kids[i].style.setProperty('--i', Math.min(i, 9));
    if (!('IntersectionObserver' in window)) { grid.classList.add('is-in'); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        // Already scrolled past counts as seen, so a jump never leaves a blank grid.
        if (!en.isIntersecting && en.boundingClientRect.top > 0) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    io.observe(grid);
  });

  /* ---- Hero figures count up the first time they are seen ---- */
  Array.prototype.forEach.call(document.querySelectorAll('.stat b'), function (el) {
    var done = false;
    function run() {
      if (done) return;
      done = true;
      // "2012" counts; "1st" and "10+" keep their suffix and count the number.
      var raw = el.textContent.trim();
      var m = raw.match(/^(\d+)(.*)$/);
      if (!m || reduced) return;
      var tail = m[2];
      // An ordinal counted from zero reads as "0st" on the way up, so leave it be.
      if (/^(st|nd|rd|th)/i.test(tail)) return;
      var target = Number(m[1]), from = target > 100 ? target - 40 : 0;
      var t0 = null, dur = 1100;
      function step(now) {
        if (t0 === null) t0 = now;
        var k = Math.min(1, (now - t0) / dur);
        var eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (target - from) * eased) + tail;
        if (k < 1) window.requestAnimationFrame(step);
        else el.textContent = raw;
      }
      window.requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(); obs.unobserve(en.target); } });
    }, { threshold: 0.6 });
    io.observe(el);
    // A language switch rewrites the figures' captions, not the figures themselves.
  });

  /* ---- "See more": show the first few items of a grid ---- */
  var phone = window.matchMedia('(max-width: 640px)');
  Array.prototype.forEach.call(document.querySelectorAll('.more'), function (btn) {
    var grid = document.querySelector(btn.getAttribute('data-more'));
    if (!grid) return;
    var step = Number(btn.getAttribute('data-step')) || 3;
    // A grid with data-step-phone collapses at every width, just to a smaller
    // count on phones; without it, collapsing is a phone-only affordance.
    var phoneStep = Number(btn.getAttribute('data-step-phone')) || 0;
    var open = false;

    function apply() {
      var items = Array.prototype.slice.call(grid.children);
      var limit = phone.matches && phoneStep ? phoneStep : step;
      var collapsible = (phoneStep || phone.matches) && items.length > limit;
      items.forEach(function (el, i) { el.hidden = collapsible && !open && i >= limit; });
      btn.hidden = !collapsible;
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { open = !open; apply(); });
    // The gallery re-renders on filter and on language change.
    document.addEventListener('gallery:render', function () { open = false; apply(); });
    document.addEventListener('langchange', apply);
    if (phone.addEventListener) phone.addEventListener('change', function () { open = false; apply(); });
    apply();
  });

  /* ---- "Read more": fold a long note on phones ---- */
  Array.prototype.forEach.call(document.querySelectorAll('.readmore'), function (btn) {
    var note = btn.previousElementSibling;
    if (!note) return;
    var open = false;

    function apply() {
      if (!phone.matches) {
        note.classList.remove('is-clamped');
        btn.hidden = true;
        return;
      }
      // Measure against the clamp: only offer the link when text is actually cut.
      note.classList.add('is-clamped');
      var overflows = note.scrollHeight - note.clientHeight > 2;
      if (!overflows) { note.classList.remove('is-clamped'); btn.hidden = true; return; }
      note.classList.toggle('is-clamped', !open);
      btn.hidden = false;
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { open = !open; apply(); });
    document.addEventListener('langchange', function () { open = false; apply(); });
    if (phone.addEventListener) phone.addEventListener('change', function () { open = false; apply(); });
    // Web fonts land after first paint and change how many lines the note takes.
    window.addEventListener('load', apply);
    apply();
  });

  /* ---- Smooth anchor scrolling that respects the fixed header ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var offset = header.offsetHeight + 12;
    var top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });
})();
