/* ==========================================================================
   The full Qur'an, juz by juz.
   One <audio> element serves all thirty tiles: picking a juz points the
   player at that file and starts it. The player stays hidden until the
   first pick, so the section opens as a clean index.
   ========================================================================== */
(function () {
  'use strict';

  var list   = document.getElementById('juzList');
  var player = document.getElementById('quranPlayer');
  var audio  = document.getElementById('quranAudio');
  var now    = document.getElementById('quranNow');
  if (!list || !player || !audio || !now) return;

  var playing = null;   // the <button> currently loaded

  function mark(btn) {
    Array.prototype.forEach.call(list.querySelectorAll('.juz__btn'), function (b) {
      b.classList.toggle('is-playing', b === btn);
      b.setAttribute('aria-current', b === btn ? 'true' : 'false');
    });
  }

  function nameOf(btn) {
    var el = btn.querySelector('.juz__name');
    return el ? el.textContent.trim() : '';
  }

  function pick(btn) {
    var src = btn.getAttribute('data-src');
    if (!src) return;

    if (playing === btn) {                 // same juz — toggle it
      if (audio.paused) audio.play().catch(nudge); else audio.pause();
      return;
    }
    playing = btn;
    audio.src = src;
    now.textContent = nameOf(btn);
    player.hidden = false;
    mark(btn);
    audio.play().catch(nudge);
  }

  // Autoplay can be refused (a policy block, or a file that will not load).
  // The controls are already on screen, so leave them to the visitor.
  function nudge() { player.hidden = false; }

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.juz__btn');
    if (btn && !btn.disabled) pick(btn);
  });

  // Roll on to the next juz that actually has audio.
  audio.addEventListener('ended', function () {
    if (!playing) return;
    var all = Array.prototype.slice.call(list.querySelectorAll('.juz__btn:not([disabled])'));
    var next = all[all.indexOf(playing) + 1];
    if (next) pick(next);
    else { mark(null); playing = null; }
  });

  audio.addEventListener('error', function () {
    if (playing) playing.classList.add('is-broken');
  });

  // The tile captions are re-rendered on a language switch.
  document.addEventListener('langchange', function () {
    if (playing) now.textContent = nameOf(playing);
  });
})();
