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
const CSS_V = 23, JS_V = 4;

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
  const pill = (k, key) => k ? `<span class="pill pill--${k}"${X(site.status[k], key)}</span>` : '';

  /* Collapses a grid to the first few items on phones. */
  const moreBtn = (target, step) => `<button class="more" type="button" data-more="${target}" data-step="${step}" hidden>
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
        <div class="award__flag" aria-hidden="true">${a.flag}</div>
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
          ${a.note ? E('p', 'award__note', a.note, b + '.note') : ''}
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
        <span class="record__name"><span${X(r.name, `natl.items.${i}.name`)}</span><span class="record__org"${X(r.org, `natl.items.${i}.org`)}</span></span>
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
        <svg class="study__icon" viewBox="0 0 48 48" aria-hidden="true">${c.icon}</svg>
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
            ${S.qiraat.focus.map((f, i) => E('span', 'chip', f, `qir.focus.${i}`)).join('\n            ')}
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
        <span>${E('span', 'xp__name', x.name, key + '.name')}${x.place ? E('span', 'xp__loc', x.place, key + '.loc') : ''}</span>
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
    <div class="networks reveal" data-delay="1">
      ${S.media.networks.map(n => `<span class="network">${n}</span>`).join('\n      ')}
    </div>
    <div class="videos reveal" data-delay="2" id="videoGrid">
      ${S.media.videos.map((v, i) => `<a class="video" href="${attr(v.href)}" target="_blank" rel="noopener noreferrer">
        <span class="video__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
        ${E('span', 'video__label', v.label, `med.videos.${i}`)}
      </a>`).join('\n      ')}
    </div>
    ${moreBtn('#videoGrid', 3)}

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

  const gallery = `
<section class="section section--alt" id="gallery">
  <div class="wrap">
    ${head(S.gallery.num, S.gallery.numLabel, S.gallery.title, null, 'gal', 'sec-head sec-head--center')}
    <div class="gal-filters reveal" role="group" aria-label="Gallery filters">
      ${S.gallery.filters.map((f, i) => `<button class="gal-filter${i === 0 ? ' is-active' : ''}" type="button" data-filter="${attr(f.id)}"${X(f.label, `gal.filters.${i}`)}</button>`).join('\n      ')}
    </div>
    <div class="gallery reveal" data-delay="1" id="galleryGrid"></div>
    ${moreBtn('#galleryGrid', 3)}
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

  const SOCIAL_ICONS = {
    YouTube: '<path d="M23 12s0-3.9-.5-5.7a3 3 0 0 0-2.1-2.1C18.6 3.7 12 3.7 12 3.7s-6.6 0-8.4.5a3 3 0 0 0-2.1 2.1C1 8.1 1 12 1 12s0 3.9.5 5.7a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1C23 15.9 23 12 23 12zM9.8 15.4V8.6l5.9 3.4z"/>',
    Facebook: '<path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/>',
    Instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9s.7.8.9 1.4c.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.9 3.9 0 0 1-2.3 2.3c-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.9 3.9 0 0 1-2.3-2.3c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4s.8-.7 1.4-.9c.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1zm0 3.8a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 9.9a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8zm7.6-10.1a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0z"/>',
    Wikipedia: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.3 0 2.9 2.4 3.4 6H8.6C9.1 6.4 10.7 4 12 4zM4.3 10h3.1a22 22 0 0 0 0 4H4.3a8 8 0 0 1 0-4zm0 6h3.1c.5 3.6 2.1 6 3.4 6-2.9 0-5.4-2.4-6.5-6zm5.1 0h5.2c-.5 3.6-2.1 6-2.6 6s-2.1-2.4-2.6-6zm5.5-2H9.1a20 20 0 0 1 0-4h5.8a20 20 0 0 1 0 4zm1.7 8c1.3 0 2.9-2.4 3.4-6h3.1c-1.1 3.6-3.6 6-6.5 6zm3.7-8a22 22 0 0 0 0-4h3.1a8 8 0 0 1 0 4h-3.1zM16.6 4c2.9 0 5.4 2.4 6.5 6h-3.1c-.5-3.6-2.1-6-3.4-6z"/>'
  };
  const EXT = '<span class="social__ext" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><path d="M7 17 17 7M9 7h8v8"/></svg></span>';

  const contact = `
<section class="section" id="contact">
  <div class="wrap">
    ${head(S.contact.num, S.contact.numLabel, S.contact.title, S.contact.sub, 'con')}
    <div class="contact">
      <div class="reveal">
        <h3 class="contact-name">${site.meta.displayName}</h3>
        ${E('p', 'contact-roles', S.contact.roles, 'con.roles')}
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
        <a class="btn btn--solid btn--spaced" href="mailto:${attr(S.contact.email.value)}">
          <span${X(S.contact.cta, 'con.cta')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
      <div class="reveal" data-delay="1">
        ${E('h3', 'label', S.contact.onlineLabel, 'con.online')}
        <div class="socials">
          ${S.contact.socials.map(s => `<a class="social" href="${attr(s.href)}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL_ICONS[s.network] || ''}</svg>
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
  const footer = `
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
          ${col.map((n, j) => `<a href="${attr(n.href)}"${X(n.label, `nav.${site.nav.indexOf(n)}`)}</a>`).join('\n          ')}
        </div>`).join('\n        ')}
        <div class="footer__col">
          ${E('h4', '', S.footer.columns[2], 'footer.col2')}
          <a href="mailto:${attr(S.contact.email.value)}"${X(S.contact.email.label, 'con.email')}</a>
          <a href="tel:${attr(S.contact.phone.value)}"${X(S.contact.phone.label, 'con.phone')}</a>
          ${S.contact.socials.filter(s => s.network !== 'Wikipedia').map(s =>
            `<a href="${attr(s.href)}" target="_blank" rel="noopener noreferrer">${s.network}</a>`).join('\n          ')}
        </div>
      </nav>
    </div>
    <div class="footer__bottom">
      <span${X(S.footer.copy, 'footer.copy')}</span>
      <a href="#hero"${X(S.footer.top, 'footer.top')}</a>
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
    sameAs: S.contact.socials.filter(s => s.network !== 'Wikipedia').map(s => s.href)
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

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>

<body>
<a class="skip-link" href="#main"${X(site.meta.skip, 'a11y.skip')}</a>

<header class="header" id="header">
  <div class="wrap header__inner">
    <a class="brand" href="#hero" aria-label="${attr(site.meta.displayName)} — home">
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
      ${site.nav.map((n, i) => `<a class="nav__link" href="${attr(n.href)}"${X(n.label, `nav.${i}`)}</a>`).join('\n      ')}
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
</header>

<main id="main">

<section class="hero" id="hero">
  <div class="wrap hero__inner">
    <div class="hero__head">
      ${E('span', 'hero__eyebrow', site.hero.eyebrow, 'hero.eyebrow')}
      ${E('h1', 'hero__name', site.hero.name, 'hero.name')}
      ${E('p', 'hero__roles', site.hero.roles, 'hero.roles')}
    </div>

    <figure class="hero__media">
      <img class="hero__img" src="${attr(site.hero.image.src)}" alt="${attr(site.hero.image.alt)}"
           width="${site.hero.image.width}" height="${site.hero.image.height}" loading="eager" fetchpriority="high">
      <svg class="hero__arch" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="mihrab" clipPathUnits="objectBoundingBox">
            <path d="M0,1 L0,0.45 C0,0.2 0.2,0.05 0.5,0 C0.8,0.05 1,0.2 1,0.45 L1,1 Z"/>
          </clipPath>
        </defs>
        <g fill="none" stroke="currentColor" vector-effect="non-scaling-stroke" stroke-linejoin="round">
          <path stroke-width="2.4" d="M2,398 L2,181 C2,82 61,22 150,2.5 C239,22 298,82 298,181 L298,398 Z"/>
          <path stroke-width="1"   d="M13,387 L13,188 C13,96 68,42 150,22 C232,42 287,96 287,188 L287,387 Z"/>
        </g>
      </svg>
    </figure>

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
${gallery}
${vision}
${contact}
</main>
${footer}

<script src="js/gallery.js?v=${JS_V}" defer></script>
<script src="js/i18n.js?v=${JS_V}" defer></script>
<script src="js/main.js?v=${JS_V}" defer></script>
</body>
</html>
`;

  /* titles for the language switcher live in i18n.js; feed them from content */
  D.bn['meta.title'] = site.meta.title.bn;
  D.ar['meta.title'] = site.meta.title.ar;

  const W = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
  W('public/index.html', doc);
  W('public/i18n/bn.json', JSON.stringify(D.bn, null, 2) + '\n');
  W('public/i18n/ar.json', JSON.stringify(D.ar, null, 2) + '\n');
  W('public/data/gallery.json', JSON.stringify(S.gallery.items.map(g => ({
    cat: g.cat, src: g.src || '', slot: g.slot, title: g.title, sub: g.sub
  })), null, 2) + '\n');

  const keys = new Set([...doc.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]));
  return { keys: keys.size, bn: Object.keys(D.bn).length, ar: Object.keys(D.ar).length,
           gallery: S.gallery.items.length, bytes: doc.length };
}

module.exports = { build };
if (require.main === module) {
  const r = build();
  console.log('built — %d i18n keys in page, bn %d, ar %d, gallery %d, index.html %dkB',
    r.keys, r.bn, r.ar, r.gallery, Math.round(r.bytes / 1024));
}
