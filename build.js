/**
 * Renders the published site from content/site.json.
 *
 *   node build.js
 *
 * Writes public/index.html (English baked in, so crawlers and no-JS visitors
 * get the full page), public/i18n/bn.json, public/i18n/ar.json and
 * public/data/gallery.json. The admin calls this after every save.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CSS_V = 67, JS_V = 14, IMG_V = 11;

function build() {
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
  const D = { bn: {}, ar: {} };
  const S = site.sections;

  /* Records a string's translations and returns the attribute + English. */
  // A bare & must become &amp;; anything already an entity, and any tag the
  // author typed on purpose (<strong>, <code>), is left untouched.
  const amp = s => String(s ?? '').replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+);)/g, '&amp;');
  const reg = (val, key) => {
    if (!val) return null;
    if (val.bn) D.bn[key] = amp(val.bn);
    if (val.ar) D.ar[key] = amp(val.ar);
    return { a: ` data-i18n="${key}"`, t: amp(val.en) };
  };
  /** Full element for a translatable string. */
  const E = (tag, cls, val, key, extra = '') => {
    const r = reg(val, key); if (!r) return '';
    return `<${tag}${cls ? ` class="${cls}"` : ''}${r.a}${extra}>${r.t}</${tag}>`;
  };
  /** Just the `data-i18n="…">English` middle, for hand-built elements. */
  const X = (val, key) => { const r = reg(val, key); return r ? `${r.a}>${r.t}` : '>'; };
  const attr = s => String(s ?? '')
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+);)/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  /* An organisation's mark, on a light tile so it reads the same on a cream
     card and on the slate band. Nothing is rendered when there is no file. */
  const orgLogo = (it, cls = '') => it && it.logo
    ? `<span class="orglogo${cls ? ' ' + cls : ''}"><img src="${attr(it.logo)}" alt="" loading="lazy" decoding="async"></span>`
    : '';

  const pill = (k, key) => k ? `<span class="pill pill--${k}"${X(site.status[k], key)}</span>` : '';

  /* Collapses a grid to the first few items. `phoneStep` narrows that on small screens;
     without it the grid is only ever collapsed on phones. */
  const moreBtn = (target, step, phoneStep) => `<button class="more" type="button" data-more="${target}" data-step="${step}"${phoneStep ? ` data-step-phone="${phoneStep}"` : ''} hidden>
      <span class="more__on"${X(site.meta.more, 'ui.more')}</span>
      <span class="more__off"${X(site.meta.less, 'ui.less')}</span>
    </button>`;

  const head = (n, numLabel, title, sub, keyBase, cls = 'sec-head') => `
    <div class="${cls} reveal">
      <span class="sec-num">${n} — <span${X(numLabel, keyBase + '.num')}</span></span>
      ${E('h2', 'sec-title', title, keyBase + '.title')}
      ${sub ? E('p', 'sec-sub', sub, keyBase + '.sub') : ''}
    </div>`;

  /* ---------------- sections ---------------- */

  const about = `
<section class="section" id="about">
  <div class="wrap">
    <div class="about">
      <aside class="about__aside reveal">
        <span class="sec-num">${S.about.num} — <span${X(S.about.numLabel, 'about.num')}</span></span>
        ${E('h2', 'sec-title', S.about.title, 'about.title')}
        ${S.about.image && S.about.image.src ? `<img class="about__art" src="${attr(S.about.image.src)}?v=3" alt="${attr(S.about.image.alt && S.about.image.alt.en || '')}" width="740" height="558" loading="lazy" decoding="async">` : ''}
      </aside>
      <div class="about__body reveal" data-delay="1">
        ${S.about.paragraphs.map((p, i) => E('p', '', p, `about.p${i + 1}`)).join('\n        ')}
        <div class="about__mission">
          ${E('h3', '', S.about.mission.label, 'about.mission.k')}
          ${E('p', '', S.about.mission.text, 'about.mission.v')}
        </div>
      </div>
    </div>
  </div>
</section>`;

  const award = (a, i) => {
    const b = `intl.items.${i}`;
    return `
      <article class="award${a.featured ? ' award--primary' : ''} reveal"${i ? ` data-delay="${i}"` : ''}>
        <div class="award__mark">
          <span class="award__flag" aria-hidden="true">${a.flag}</span>
          ${orgLogo(a)}
        </div>
        <div class="award__meta">
          <span class="award__year">${a.year}</span>
          ${E('h3', 'award__title', a.title, b + '.title')}
          ${pill(a.statusKey, 'status.' + a.statusKey)}
          <div class="award__cats">
            ${a.categories.map((c, j) => `<div class="award__cat">
              ${c.medal
                ? `<span class="award__rank"><span aria-hidden="true">${c.medal}</span> <span${X(site.ranks[c.rankKey], 'rank.' + c.rankKey)}</span></span>`
                : `<span class="award__rank"${c.rankKey ? X(site.ranks[c.rankKey], 'rank.' + c.rankKey) : X(c.rankText, `${b}.cat${j}.rank`)}</span>`}
              ${c.name ? E('span', 'award__catname', c.name, `cat.${j === 0 ? 'full' : 'melody'}`) : ''}
            </div>`).join('\n            ')}
          </div>
          ${a.note ? E('p', 'award__note', a.note, b + '.note') + `
          <button class="readmore" type="button" hidden aria-expanded="false">
            <span class="readmore__on"${X(site.meta.readMore, 'ui.readMore')}</span>
            <span class="readmore__off"${X(site.meta.readLess, 'ui.readLess')}</span>
          </button>` : ''}
        </div>
        <div class="award__side"></div>
      </article>`;
  };

  const achievements = `
<section class="section section--alt" id="achievements">
  <div class="wrap">
    ${head(S.intl.num, S.intl.numLabel, S.intl.title, null, 'intl', 'sec-head sec-head--center')}
    <div class="awards">${S.intl.items.map(award).join('')}
    </div>
    ${head(S.natl.num, S.natl.numLabel, S.natl.title, null, 'natl', 'sec-head sec-head--sub')}
    <div class="records reveal" data-delay="1">
      ${S.natl.items.map((r, i) => `<div class="record">
        <span class="record__year">${r.year}</span>
        <span class="record__lead">${orgLogo(r, 'orglogo--sm')}<span class="record__name"><span${X(r.name, `natl.items.${i}.name`)}</span><span class="record__org"${X(r.org, `natl.items.${i}.org`)}</span></span></span>
        <span class="record__rank"${X(site.ranks[r.rankKey], 'rank.' + r.rankKey)}</span>
      </div>`).join('\n      ')}
    </div>
    ${E('p', 'gal-note gal-note--start reveal', S.natl.note, 'natl.note')}
  </div>
</section>`;

  const journey = `
<section class="section" id="journey">
  <div class="wrap">
    ${head(S.journey.num, S.journey.numLabel, S.journey.title, null, 'journey')}
    <div class="timeline reveal" data-delay="1">
      ${S.journey.items.map((it, i) => `<div class="tl-item">
        <div class="tl-item__year">${it.year}</div>
        ${E('h3', 'tl-item__title', it.title, `journey.items.${i}.title`)}
        ${it.desc ? E('p', 'tl-item__desc', it.desc, `journey.items.${i}.desc`) : ''}
        ${it.statusKey ? `<div class="tl-item__tags">${pill(it.statusKey, 'status.' + it.statusKey)}</div>` : ''}
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;

  const studies = `
<section class="section section--alt" id="studies">
  <div class="wrap">
    ${head(S.current.num, S.current.numLabel, S.current.title, null, 'cur')}
    <div class="grid-2">
      ${S.current.items.map((c, i) => `<article class="study reveal"${i ? ` data-delay="${i}"` : ''}>
        ${c.logo ? orgLogo(c, 'orglogo--lg') : `<svg class="study__icon" viewBox="0 0 48 48" aria-hidden="true">${c.icon}</svg>`}
        ${E('h3', 'study__title', c.title, `cur.items.${i}.title`)}
        ${E('p', 'study__place', c.place, `cur.items.${i}.place`)}
        <p class="study__focus"><span${X(c.focus, `cur.items.${i}.focus`)}</span> ${pill(c.statusKey, 'status.' + c.statusKey)}</p>
        ${E('p', 'study__desc', c.desc, `cur.items.${i}.desc`)}
      </article>`).join('\n      ')}
    </div>
    ${E('h3', 'label reveal', S.current.areasLabel, 'cur.areas')}
    <div class="chips reveal" data-delay="1">
      ${S.current.areas.map((a, i) => E('span', 'chip', a, `cur.areas.${i}`)).join('\n      ')}
    </div>

    <div class="subsection">
      ${head(S.qiraat.num, S.qiraat.numLabel, S.qiraat.title, null, 'qir')}
      <div class="qiraat">
        <div class="reveal">
          ${E('p', 'lead', S.qiraat.lead, 'qir.lead')}
          ${E('h3', 'label', S.qiraat.focusLabel, 'qir.focus')}
          <div class="chips">
            ${S.qiraat.focus.map(f => `<a class="chip chip--link" href="focus/${attr(f.slug)}.html">
              ${E('span', '', f.label, `qir.focus.${f.slug}.label`)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>
            </a>`).join('\n            ')}
          </div>
          <div class="objective">
            ${E('h3', '', S.qiraat.objective.label, 'qir.obj.k')}
            ${E('p', '', S.qiraat.objective.text, 'qir.obj.v')}
          </div>
        </div>
        <div class="qiraat__panel reveal" data-delay="1">
          <p class="qiraat__arabic" lang="ar" dir="rtl">${S.qiraat.arabic}</p>
          ${E('p', 'qiraat__caption', S.qiraat.caption, 'qir.caption')}
        </div>
      </div>
    </div>
  </div>
</section>`;

  // One or more parts, joined with an em dash: "Institution — City, Country".
  const eduInst = (parts, i) => !parts || !parts.length ? '' :
    `<span class="edu__inst">${parts.map((p, j) => `<span${X(p, `edu.items.${i}.inst${j}`)}</span>`).join(' — ')}</span>`;

  const education = `
<section class="section" id="academic">
  <div class="wrap">
    ${head(S.education.num, S.education.numLabel, S.education.title, null, 'edu')}
    <div class="edu reveal" data-delay="1">
      ${S.education.items.map((e, i) => `<div class="edu__row">
        <span>${E('span', 'edu__deg', e.degree, `edu.items.${i}.deg`)}${eduInst(e.institution, i)}</span>
        <span class="edu__yrs">${e.statusKey ? pill(e.statusKey, 'status.' + e.statusKey)
          : `<span${X(e.years, `edu.items.${i}.yrs`)}</span>`}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;

  const aspirations = `
<section class="section section--mid" id="aspirations">
  <div class="wrap">
    ${head(S.aspirations.num, S.aspirations.numLabel, S.aspirations.title, S.aspirations.sub, 'asp')}
    <div class="grid-2">
      ${S.aspirations.items.map((a, i) => `<article class="aspire reveal"${i ? ` data-delay="${i}"` : ''}>
        <div class="aspire__head">
          ${orgLogo(a, 'orglogo--lg')}
          ${E('h3', 'aspire__name', a.name, `asp.items.${i}.name`)}
          ${pill(a.statusKey, 'status.' + a.statusKey)}
        </div>
        ${a.paragraphs.map((p, j) => E('p', 'aspire__body', p, `asp.items.${i}.p${j}`)).join('\n        ')}
      </article>`).join('\n      ')}
    </div>
    ${E('h3', 'label label--center reveal', S.aspirations.pathLabel, 'asp.path')}
    <div class="path reveal" data-delay="1">
      ${S.aspirations.path.map((p, i) =>
        `<span class="path__node${i === S.aspirations.path.length - 1 ? ' path__node--end' : ''}"${X(p, `asp.pathnode.${i}`)}</span>` +
        (i < S.aspirations.path.length - 1 ? '\n      <span class="path__arrow" aria-hidden="true">→</span>' : '')
      ).join('\n      ')}
    </div>
  </div>
</section>`;

  const xpRow = (x, key) => `<div class="xp__row">
        <span class="xp__lead">${orgLogo(x, 'orglogo--sm')}<span>${E('span', 'xp__name', x.name, key + '.name')}${x.place ? E('span', 'xp__loc', x.place, key + '.loc') : ''}</span></span>
        <span class="xp__yrs"><span${X(x.years, key + '.yrs')}</span></span>
      </div>`;

  const teaching = `
<section class="section" id="teaching">
  <div class="wrap">
    ${head(S.teaching.num, S.teaching.numLabel, S.teaching.title, S.teaching.sub, 'tea')}
    <div class="xp reveal" data-delay="1">
      ${S.teaching.items.map((x, i) => xpRow(x, `tea.items.${i}`)).join('\n      ')}
    </div>
    ${E('h3', 'label reveal', S.teaching.levelsLabel, 'tea.levels')}
    <div class="grid-3 reveal" data-delay="1">
      ${S.teaching.levels.map((l, i) => `<div class="level">
        ${E('span', 'level__tag', l.tag, `tea.levels.${i}.tag`)}
        <ul>
          ${l.items.map((li, j) => E('li', '', li, `tea.levels.${i}.${j}`)).join('\n          ')}
        </ul>
      </div>`).join('\n      ')}
    </div>

    <div class="subsection">
      ${head(S.judging.num, S.judging.numLabel, S.judging.title, S.judging.sub, 'jud')}
      <div class="xp reveal" data-delay="1">
        ${S.judging.items.map((x, i) => xpRow(x, `jud.items.${i}`)).join('\n        ')}
      </div>
      ${E('h3', 'label reveal', S.judging.areasLabel, 'jud.areas')}
      <div class="chips reveal" data-delay="1">
        ${S.judging.areas.map((a, i) => E('span', 'chip', a, `jud.areas.${i}`)).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;

  const imam = `
<section class="section section--alt" id="imam">
  <div class="wrap">
    ${head(S.imam.num, S.imam.numLabel, S.imam.title, S.imam.sub, 'imam')}
    <div class="xp reveal" data-delay="1">
      ${S.imam.items.map((x, i) => xpRow(x, `imam.items.${i}`)).join('\n      ')}
    </div>
  </div>
</section>`;

  const media = `
<section class="section section--deep" id="media">
  <div class="wrap">
    ${head(S.media.num, S.media.numLabel, S.media.title, S.media.sub, 'med', 'sec-head sec-head--center')}

    <div class="videos reveal" data-delay="2" id="videoGrid">
      ${S.media.videos.map((v, i) => v.embed
        ? `<div class="video video--embed"><iframe src="${attr(v.embed)}" title="${attr(v.label && v.label.en || '')}"
          loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
        : `<a class="video" href="${attr(v.href)}" target="_blank" rel="noopener noreferrer">
        <span class="video__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
        ${E('span', 'video__label', v.label, `med.videos.${i}`)}
      </a>`).join('\n      ')}
    </div>
    ${moreBtn('#videoGrid', 4, 3)}

    ${(() => {
      const tiles = S.media.networks.map(n => n.logo
        ? `<span class="tv"><img src="${attr(n.logo)}" alt="${attr(n.name)}" loading="lazy" decoding="async"></span>`
        : `<span class="tv tv--name">${amp(n.name)}</span>`);
      // Rendered twice so translateX(-50%) lands exactly one set along.
      const set = tiles.join('\n        ');
      return `<div class="tvstrip reveal" data-delay="1">
      ${E('h3', 'label label--center', S.media.networksLabel, 'med.networks')}
      <div class="tvstrip__win">
        <div class="tvstrip__rail">
        ${set}
        ${tiles.map(t => t.replace('<span class="tv', '<span aria-hidden="true" class="tv')).join('\n        ')}
        </div>
      </div>
    </div>`;
    })()}

    <div class="subsection">
      ${head(S.engagement.num, S.engagement.numLabel, S.engagement.title, S.engagement.sub, 'eng', 'sec-head sec-head--center')}
      <div class="grid-3 reveal" data-delay="1">
        ${S.engagement.items.map((c, i) => `<div class="country">
          <div class="country__flag" aria-hidden="true">${c.flag}</div>
          ${E('div', 'country__name', c.name, `eng.items.${i}.name`)}
          ${E('div', 'country__event', c.event, `eng.items.${i}.event`)}
          <span class="country__year">${c.year}</span>
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;

  /* ---------------- 15. the full Qur'an, juz by juz ---------------- */
  /* A Google Drive share link points at a viewer page, not at the audio. Rewrite
     it to the direct form so the player has something it can actually load. */
  const audioSrc = raw => {
    const v = String(raw || '').trim();
    if (!v) return '';
    const m = v.match(/drive\.google\.com\/(?:file\/d\/([\w-]{10,})|open\?id=([\w-]{10,})|uc\?[^#]*\bid=([\w-]{10,}))/);
    return m ? 'https://drive.google.com/uc?export=download&id=' + (m[1] || m[2] || m[3]) : v;
  };

  const quran = `
<section class="section section--alt" id="quran">
  <div class="wrap">
    ${head(S.quran.num, S.quran.numLabel, S.quran.title, S.quran.sub, 'qur', 'sec-head sec-head--center')}

    <div class="player reveal" id="quranPlayer" hidden>
      <div class="player__now">
        ${E('span', 'player__k', site.meta.nowPlaying, 'ui.nowPlaying')}
        <strong class="player__title" id="quranNow"></strong>
      </div>
      <audio class="player__audio" id="quranAudio" controls preload="none"></audio>
    </div>

    <ol class="juz reveal" data-delay="1" id="juzList">
      ${S.quran.items.map((j, i) => {
        const src = audioSrc(j.src);
        const has = !!src;
        const label = reg(j.name, `qur.items.${i}.name`);
        return `<li class="juz__item${has ? '' : ' is-empty'}">
        <button class="juz__btn" type="button" data-src="${attr(src)}"${has ? '' : ' disabled'} data-juz="${i + 1}">
          <span class="juz__n">${String(i + 1).padStart(2, '0')}</span>
          <span class="juz__meta">
            <span class="juz__name"${label ? label.a : ''}>${label ? label.t : ''}</span>
            ${j.note && j.note.en ? E('span', 'juz__note', j.note, `qur.items.${i}.note`) : ''}
          </span>
          ${has
            ? `<span class="juz__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>`
            : `<span class="juz__soon"${X(site.meta.soon, 'ui.soon')}</span>`}
        </button>
      </li>`;
      }).join('\n      ')}
    </ol>

    ${S.quran.items.every(j => audioSrc(j.src)) ? '' :
      E('p', 'gal-note', S.quran.emptyNote, 'qur.empty')}
  </div>
</section>`;

  const gallery = `
<section class="section section--alt" id="gallery">
  <div class="wrap">
    ${head(S.gallery.num, S.gallery.numLabel, S.gallery.title, null, 'gal', 'sec-head sec-head--center')}
    <div class="gal-filters reveal" role="group" aria-label="Gallery filters">
      ${S.gallery.filters.map((f, i) => `<button class="gal-filter${i === 0 ? ' is-active' : ''}" type="button" data-filter="${attr(f.id)}"${X(f.label, `gal.filters.${i}`)}</button>`).join('\n      ')}
    </div>
    <div class="gallery reveal" data-delay="1" id="galleryGrid"></div>
    ${moreBtn('#galleryGrid', 4, 3)}
    ${E('p', 'gal-note', S.gallery.note, 'gal.note')}
  </div>
</section>`;

  const vision = `
<section class="section section--deep" id="vision">
  <div class="wrap">
    ${head(S.vision.num, S.vision.numLabel, S.vision.title, null, 'vis')}
    <div class="reveal" data-delay="1">
      ${E('p', 'vision-lead', S.vision.lead, 'vis.lead')}
      ${E('p', 'vision-sub', S.vision.sub, 'vis.p2')}
    </div>
    <div class="vision-grid reveal" data-delay="2">
      ${S.vision.items.map((v, i) => `<div class="vision-cell">
        <span class="vision-cell__num">${v.num}</span>
        ${E('h3', 'vision-cell__title', v.title, `vis.items.${i}.k`)}
        ${E('p', '', v.text, `vis.items.${i}.v`)}
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;

  /* Each network's own mark, in its own brand colours. These are complete
     <svg> elements — the stylesheet must not repaint them. */
  const SOCIAL_ICONS = {
    YouTube: `<svg class="social__logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FF0000" d="M23 12s0-3.9-.5-5.7a3 3 0 0 0-2.1-2.1C18.6 3.7 12 3.7 12 3.7s-6.6 0-8.4.5a3 3 0 0 0-2.1 2.1C1 8.1 1 12 1 12s0 3.9.5 5.7a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1C23 15.9 23 12 23 12z"/>
      <path fill="#FFFFFF" d="M9.8 15.4V8.6l5.9 3.4z"/>
    </svg>`,
    Facebook: `<svg class="social__logo" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1877F2"/>
      <path fill="#FFFFFF" d="M15.9 14.9l.4-2.9h-2.8V10.1c0-.8.4-1.6 1.6-1.6h1.3V6.1s-1.1-.2-2.2-.2c-2.3 0-3.8 1.4-3.8 3.9V12H7.9v2.9h2.5v6.9a10 10 0 0 0 3.1 0v-6.9h2.4z"/>
    </svg>`,
    Instagram: `<svg class="social__logo" viewBox="0 0 24 24" aria-hidden="true">
      <defs><linearGradient id="igGrad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FEDA75"/><stop offset=".25" stop-color="#FA7E1E"/>
        <stop offset=".5" stop-color="#D62976"/><stop offset=".75" stop-color="#962FBF"/>
        <stop offset="1" stop-color="#4F5BD5"/>
      </linearGradient></defs>
      <rect x="1.8" y="1.8" width="20.4" height="20.4" rx="6" fill="url(#igGrad)"/>
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#FFFFFF" stroke-width="1.9"/>
      <circle cx="17.4" cy="6.7" r="1.3" fill="#FFFFFF"/>
    </svg>`,
    LinkedIn: `<svg class="social__logo" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.8" y="1.8" width="20.4" height="20.4" rx="4" fill="#0A66C2"/>
      <path fill="#FFFFFF" d="M8.3 18.4H5.5V9.7h2.8v8.7zM6.9 8.5a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zM18.5 18.4h-2.8v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3H9.9V9.7h2.7v1.2h.04a3 3 0 0 1 2.7-1.5c2.9 0 3.4 1.9 3.4 4.3v4.7z"/>
    </svg>`,
    Telegram: `<svg class="social__logo" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#229ED9"/>
      <path fill="#FFFFFF" d="M17.6 7.4 15.7 16.6c-.1.6-.5.8-1 .5l-2.8-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.2-4.7c.2-.2-.1-.3-.4-.1l-6.4 4-2.8-.9c-.6-.2-.6-.6.1-.9l11-4.2c.5-.2.9.1.8.9z"/>
    </svg>`,
    Spotify: `<svg class="social__logo" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1ED760"/>
      <g fill="none" stroke="#000000" stroke-linecap="round">
        <path stroke-width="2.1" d="M6.4 9.3c3.6-1 8-.7 11.2 1.2"/>
        <path stroke-width="1.7" d="M7 12.6c3-.8 6.6-.5 9.3 1.1"/>
        <path stroke-width="1.4" d="M7.6 15.7c2.4-.6 5.2-.4 7.4.9"/>
      </g>
    </svg>`,
    Wikipedia: `<img class="social__logo" src="assets/wikipedia-logo.webp?v=1" alt="" width="22" height="22" loading="lazy" decoding="async">`
  };
  /* A profile is on unless the admin turns it off. */
  const liveSocials = S.contact.socials.filter(x => x.enabled !== false);

  const EXT = '<span class="social__ext" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><path d="M7 17 17 7M9 7h8v8"/></svg></span>';

  const contact = `
<section class="section" id="contact">
  <div class="wrap">
    ${head(S.contact.num, S.contact.numLabel, S.contact.title, S.contact.sub, 'con')}
    <div class="contact">
      <div class="reveal">
        <h3 class="contact-name">${site.meta.displayName}</h3>
        ${E('p', 'contact-roles', S.contact.roles, 'con.roles')}
        <div class="contact-lines">
        <div class="contact-line">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>
          <span>${E('span', 'contact-line__k', S.contact.phone.label, 'con.phone')}<a class="contact-line__v" href="tel:${attr(S.contact.phone.value)}" dir="ltr">${S.contact.phone.display}</a></span>
        </div>
        <div class="contact-line">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>
          <span>${E('span', 'contact-line__k', S.contact.email.label, 'con.email')}<a class="contact-line__v" href="mailto:${attr(S.contact.email.value)}" dir="ltr">${S.contact.email.value}</a></span>
        </div>
        <div class="contact-line">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-5.3-7-10.5a7 7 0 1 1 14 0C19 15.7 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.6"/></svg>
          <span>${E('span', 'contact-line__k', S.contact.based.label, 'con.based')}${E('span', 'contact-line__v', S.contact.based.value, 'con.based.v')}</span>
        </div>
        </div>
      </div>
      <div class="reveal" data-delay="1">
        ${E('h3', 'label', S.contact.onlineLabel, 'con.online')}
        <div class="socials">
          ${liveSocials.map(s => `<a class="social" href="${attr(s.href)}" target="_blank" rel="noopener noreferrer">
            ${SOCIAL_ICONS[s.network] || ''}
            <span><span class="social__k">${s.network}</span><span class="social__v">${s.handle}</span></span>
            ${EXT}
          </a>`).join('\n          ')}
        </div>
      </div>
    </div>
  </div>
</section>`;

  // Split the menu in half rather than at a fixed index, so adding or removing
  // items never drops one out of the footer.
  const half = Math.ceil(site.nav.length / 2);
  const navCols = [site.nav.slice(0, half), site.nav.slice(half)];
  /* ---------------- 17. Blog ---------------- */
  const livePosts = (S.blog && S.blog.posts || []).filter(x => x.published);
  const postHref = (p, base = '') => `${base}blog/${encodeURIComponent(p.slug)}.html`;
  const siblingHref = p => `${encodeURIComponent(p.slug)}.html`;
  /* 2026-09-10 -> 10 September 2026, in the language the page is showing. */
  const showDate = iso => {
    const d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return { en: iso, bn: iso, ar: iso };
    const f = loc => new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
    return { en: f('en-GB'), bn: f('bn-BD'), ar: f('ar') };
  };

  const postCard = (p, i, base = '', sibling = false) => `<a class="post-card" href="${attr(sibling ? siblingHref(p) : postHref(p, base))}">
        ${p.cover ? `<span class="post-card__cover"><img src="${attr(base + p.cover)}" alt="" loading="lazy" decoding="async"></span>` : ''}
        ${E('span', 'post-card__date', showDate(p.date), `blog.posts.${p.slug}.date`)}
        ${E('h3', 'post-card__title', p.title, `blog.posts.${p.slug}.title`)}
        <span class="post-card__go"${X(S.blog.readLabel, 'blog.read')}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>`;

  const blog = `
<section class="section" id="blog">
  <div class="wrap">
    ${head(S.blog.num, S.blog.numLabel, S.blog.title, S.blog.sub, 'blog', 'sec-head sec-head--center')}
    ${livePosts.length ? `<div class="posts reveal" data-delay="1">
      ${livePosts.slice(0, 4).map((p, i) => postCard(p, i)).join('\n      ')}
    </div>
    <a class="btn btn--line btn--spaced posts__all" href="blog/"${X(S.blog.allLabel, 'blog.all')}</a>`
    : E('p', 'gal-note', S.blog.emptyNote, 'blog.empty')}
  </div>
</section>`;

  const headerHTML = (base = '') => `
<header class="header" id="header">
  <div class="wrap header__inner">
    <a class="brand" href="${base}#hero" aria-label="${attr(site.meta.displayName)} — home">
      <svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 3 25.2 9.6 33.4 8.6 32.4 16.8 39 22 32.4 27.2 33.4 35.4 25.2 34.4 20 41 14.8 34.4 6.6 35.4 7.6 27.2 1 22 7.6 16.8 6.6 8.6 14.8 9.6Z"/>
        <circle cx="20" cy="22" r="6.5"/>
      </svg>
      <span class="brand__text">
        <span class="brand__name">${site.meta.displayName}</span>
        ${E('span', 'brand__role', site.meta.brandRole, 'brand.role')}
      </span>
    </a>

    <nav class="nav" id="nav" aria-label="Main">
      ${site.nav.map((n, i) => `<a class="nav__link" href="${base}${attr(n.href)}"${X(n.label, `nav.${i}`)}</a>`).join('\n      ')}
    </nav>

    <div class="header__actions">
      <div class="lang" role="group" aria-label="Language / ভাষা / اللغة">
        <button class="lang__btn" type="button" data-set-lang="en" aria-pressed="true"  lang="en">EN</button>
        <button class="lang__btn" type="button" data-set-lang="bn" aria-pressed="false" lang="bn">বাং</button>
        <button class="lang__btn" type="button" data-set-lang="ar" aria-pressed="false" lang="ar">ع</button>
      </div>
      <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span></button>
    </div>
  </div>
</header>`;

  const footerHTML = (base = '') => `
<footer class="footer">
  <div class="wrap">
    <div class="footer__top">
      <div>
        <div class="footer__name">${site.meta.displayName}</div>
        <div class="footer__roles"${X(site.hero.roles, 'hero.roles')}</div>
        ${E('p', 'footer__tag', S.footer.tag, 'footer.tag')}
      </div>
      <nav class="footer__nav" aria-label="Footer">
        ${navCols.map((col, i) => `<div class="footer__col">
          ${E('h4', '', S.footer.columns[i], `footer.col${i}`)}
          ${col.map((n, j) => `<a href="${base}${attr(n.href)}"${X(n.label, `nav.${site.nav.indexOf(n)}`)}</a>`).join('\n          ')}
        </div>`).join('\n        ')}
        <div class="footer__col">
          ${E('h4', '', S.footer.columns[2], 'footer.col2')}
          <a href="mailto:${attr(S.contact.email.value)}"${X(S.contact.email.label, 'con.email')}</a>
          <a href="tel:${attr(S.contact.phone.value)}"${X(S.contact.phone.label, 'con.phone')}</a>
          ${liveSocials.filter(s => s.network !== 'Wikipedia').map(s =>
            `<a href="${attr(s.href)}" target="_blank" rel="noopener noreferrer">${s.network}</a>`).join('\n          ')}
        </div>
      </nav>
    </div>
    <div class="footer__bottom">
      <span${X(S.footer.copy, 'footer.copy')}</span>
      ${S.footer.credit ? E('span', 'footer__credit', S.footer.credit, 'footer.credit') : ''}
      <a href="${base}#hero"${X(S.footer.top, 'footer.top')}</a>
    </div>
  </div>
</footer>`;

  /* ---------------- document ---------------- */
  const ld = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: 'MD Tariqul Islam',
    alternateName: ['Muhammad Tariqul Islam', 'Hafez Tariqul Islam'],
    jobTitle: "International Qur'anic Reciter, Hafiz of the Qur'an, Qari, Qur'an Educator",
    nationality: 'Bangladeshi',
    email: 'mailto:' + S.contact.email.value,
    telephone: S.contact.phone.value,
    knowsLanguage: ['ar', 'bn', 'en'],
    knowsAbout: S.current.areas.map(a => a.en),
    award: S.intl.items.flatMap(a => a.categories
      .filter(c => c.rankKey)
      .map(c => `${site.ranks[c.rankKey].en} — ${c.name ? c.name.en + ', ' : ''}${a.title.en}, ${a.year}`)),
    sameAs: liveSocials.filter(s => s.network !== 'Wikipedia').map(s => s.href)
  };

  const doc = `<!DOCTYPE html>
<html lang="en" data-lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${attr(site.meta.title.en)}</title>
<meta name="description" content="${attr(site.meta.description)}">
<meta name="author" content="${attr(site.meta.displayName)}">
<meta name="theme-color" content="#231E18">
<link rel="canonical" href="${attr(site.meta.canonical)}">

<meta property="og:type" content="profile">
<meta property="og:title" content="${attr(site.meta.title.en)}">
<meta property="og:description" content="${attr(S.footer.tag.en)}">
<meta property="og:image" content="assets/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/favicon.svg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Reem+Kufi:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Hind+Siliguri:wght@300;400;500;600;700&family=Amiri:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css?v=${CSS_V}">

<script>window.PAGE_TITLES=${JSON.stringify(site.meta.title)}</script>

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>

<body>
<a class="skip-link" href="#main"${X(site.meta.skip, 'a11y.skip')}</a>

${headerHTML()}

<main id="main">

<section class="hero" id="hero">
  <div class="wrap hero__inner">
    <div class="hero__head">
      ${E('span', 'hero__eyebrow', site.hero.eyebrow, 'hero.eyebrow')}
      ${E('h1', 'hero__name', site.hero.name, 'hero.name')}
      ${E('p', 'hero__roles', site.hero.roles, 'hero.roles')}
    </div>

    ${(() => {
      const shots = (site.hero.strip && site.hero.strip.length ? site.hero.strip : [site.hero.image]);
      return `<div class="hero__media" role="img" aria-label="${attr(site.hero.image.alt)}">
      <div class="hero__rail" id="heroRail">
        ${shots.map((sh, i) => `<img class="hero__shot${i === 0 ? ' is-on' : ''}" src="${attr(sh.src)}?v=${IMG_V}" alt="${i === 0 ? attr(sh.alt || '') : ''}"
             width="1760" height="990" loading="${i === 0 ? 'eager' : 'lazy'}"${i === 0 ? ' fetchpriority="high"' : ''} decoding="async">`).join('\n        ')}
      </div>
    </div>`;
    })()}

    <div class="hero__body">
      ${site.hero.leads.map((p, i) => E('p', 'hero__lead', p, `hero.p${i + 1}`)).join('\n      ')}
      <div class="hero__actions">
        ${site.hero.ctas.map((c, i) => c.primary
          ? `<a class="btn btn--solid" href="${attr(c.href)}">
          <span${X(c.label, `hero.cta${i + 1}`)}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>`
          : `<a class="btn btn--line" href="${attr(c.href)}"${X(c.label, `hero.cta${i + 1}`)}</a>`).join('\n        ')}
      </div>
    </div>
  </div>

  <div class="hero__strip">
    <div class="wrap stat-row">
      ${site.stats.map((s, i) => `<div class="stat"><b>${s.value}</b><span${X(s.label, `stats.${i}`)}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>
${about}
${achievements}
${journey}
${studies}
${education}
${aspirations}
${teaching}
${imam}
${media}
${quran}
${gallery}
${blog}
${vision}
${contact}
</main>
${footerHTML()}

<script src="js/gallery.js?v=${JS_V}" defer></script>
<script src="js/quran.js?v=${JS_V}" defer></script>
<script src="js/i18n.js?v=${JS_V}" defer></script>
<script src="js/main.js?v=${JS_V}" defer></script>
</body>
</html>
`;


  /* ---------------- blog pages ---------------- */
  /* One page per post plus an index, sharing the site's header, footer and
     stylesheet. They sit a folder deep, so every link and asset takes `../`. */
  const B = '../';
  const blogPage = (titleEn, descEn, inner, titles) => `<!DOCTYPE html>
<html lang="en" data-lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${attr(titleEn)} — ${attr(site.meta.displayName)}</title>
<meta name="description" content="${attr(descEn)}">
<meta name="author" content="${attr(site.meta.displayName)}">
<meta name="theme-color" content="#231E18">
<meta property="og:type" content="article">
<meta property="og:title" content="${attr(titleEn)}">
<meta property="og:description" content="${attr(descEn)}">
<meta property="og:image" content="${B}assets/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${B}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${B}assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Reem+Kufi:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Hind+Siliguri:wght@300;400;500;600;700&family=Amiri:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${B}css/styles.css?v=${CSS_V}">
<script>window.PAGE_TITLES=${JSON.stringify(titles || site.meta.title)}</script>
</head>

<body>
<a class="skip-link" href="#main"${X(site.meta.skip, 'a11y.skip')}</a>
${headerHTML(B)}

<main id="main">
${inner}
</main>
${footerHTML(B)}

<script src="${B}js/i18n.js?v=${JS_V}" defer></script>
<script src="${B}js/main.js?v=${JS_V}" defer></script>
</body>
</html>
`;

  const nameSuffix = l => ' — ' + site.meta.displayName;
  const titlesFor = t => ({ en: t.en + nameSuffix('en'), bn: t.bn + nameSuffix('bn'), ar: t.ar + nameSuffix('ar') });

  const blogIndex = blogPage(S.blog.title.en, S.blog.sub.en, `
<section class="section section--page">
  <div class="wrap">
    ${head(S.blog.num, S.blog.numLabel, S.blog.title, S.blog.sub, 'blog', 'sec-head sec-head--center')}
    ${livePosts.length ? `<div class="posts">
      ${livePosts.map((p, i) => postCard(p, i, B, true)).join('\n      ')}
    </div>` : E('p', 'gal-note', S.blog.emptyNote, 'blog.empty')}
  </div>
</section>`, titlesFor(S.blog.title));

  const focusPage = f => blogPage(f.label.en, f.summary.en, `
<article class="section section--page post">
  <div class="wrap wrap--reading">
    <a class="post__back" href="${B}#qiraat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      <span${X(S.qiraat.backLabel, 'qir.back')}</span>
    </a>
    <p class="focus__arabic" lang="ar" dir="rtl">${f.arabic}</p>
    ${E('h1', 'post__title', f.label, `qir.focus.${f.slug}.label`)}
    ${E('p', 'post__lead', f.summary, `qir.focus.${f.slug}.summary`)}
    <div class="post__body">
      ${(f.body || []).map((para, k) => E('p', '', para, `qir.focus.${f.slug}.body.${k}`)).join('\n      ')}
    </div>
  </div>
</article>`, titlesFor(f.label));

  const postPage = p => blogPage(p.title.en, p.excerpt.en, `
<article class="section section--page post">
  <div class="wrap wrap--reading">
    <a class="post__back" href="${B}#blog">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      <span${X(S.blog.backLabel, 'blog.back')}</span>
    </a>
    ${E('span', 'post__date', showDate(p.date), `blog.posts.${p.slug}.date`)}
    ${E('h1', 'post__title', p.title, `blog.posts.${p.slug}.title`)}
    ${E('p', 'post__lead', p.excerpt, `blog.posts.${p.slug}.excerpt`)}
    ${p.cover ? `<img class="post__cover" src="${attr(B + p.cover)}" alt="" loading="lazy" decoding="async">` : ''}
    <div class="post__body">
      ${(p.body || []).map((para, k) => E('p', '', para, `blog.posts.${p.slug}.body.${k}`)).join('\n      ')}
    </div>
  </div>
</article>`, titlesFor(p.title));

  const W = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
  W('public/index.html', doc);
  W('public/i18n/bn.json', JSON.stringify(D.bn, null, 2) + '\n');
  W('public/i18n/ar.json', JSON.stringify(D.ar, null, 2) + '\n');
  /* Blog pages resolve i18n/<lang>.json against their own folder. They share
     one dictionary, which is simply the whole site's — extra keys are ignored. */
  const blogDir = path.join(ROOT, 'public/blog');
  fs.rmSync(blogDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(blogDir, 'i18n'), { recursive: true });
  W('public/blog/index.html', blogIndex);
  livePosts.forEach(p => W('public/blog/' + p.slug + '.html', postPage(p)));
  W('public/blog/i18n/bn.json', JSON.stringify(D.bn, null, 2) + '\n');
  W('public/blog/i18n/ar.json', JSON.stringify(D.ar, null, 2) + '\n');

  /* One page per area of focus, with the same folder-local dictionaries. */
  const focusDir = path.join(ROOT, 'public/focus');
  fs.rmSync(focusDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(focusDir, 'i18n'), { recursive: true });
  S.qiraat.focus.forEach(f => W('public/focus/' + f.slug + '.html', focusPage(f)));
  W('public/focus/i18n/bn.json', JSON.stringify(D.bn, null, 2) + '\n');
  W('public/focus/i18n/ar.json', JSON.stringify(D.ar, null, 2) + '\n');

  W('public/data/gallery.json', JSON.stringify(S.gallery.items.map(g => ({
    cat: g.cat, src: g.src || '', slot: g.slot, title: g.title, sub: g.sub
  })), null, 2) + '\n');

  const keys = new Set([...doc.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]));
  return { keys: keys.size, bn: Object.keys(D.bn).length, ar: Object.keys(D.ar).length,
           gallery: S.gallery.items.length, posts: livePosts.length,
           focus: S.qiraat.focus.length, bytes: doc.length };
}

module.exports = { build };
if (require.main === module) {
  const r = build();
  console.log('built — %d i18n keys in page, bn %d, ar %d, gallery %d, posts %d, focus %d, index.html %dkB',
    r.keys, r.bn, r.ar, r.gallery, r.posts, r.focus, Math.round(r.bytes / 1024));
}
