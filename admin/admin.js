/* Content admin. The form is generated from SCHEMA, so adding a field here is
   the only change needed to make it editable. */
(function () {
  'use strict';

  const LANGS = { en: 'English', bn: 'বাংলা', ar: 'العربية' };
  let data = null, lang = 'en', current = 'meta', dirty = false, galleryFiles = [], audioFiles = [];

  /* ---------- schema ---------- */
  const i18n = (k, label, o) => Object.assign({ k, label, type: 'i18n' }, o);
  const text = (k, label, o) => Object.assign({ k, label, type: 'text' }, o);
  const list = (k, label, item, o) => Object.assign({ k, label, type: 'list', item }, o);

  const SCHEMA = [
    { id: 'meta', group: 'Site', label: 'Site & SEO', path: 'meta', fields: [
      text('displayName', 'Display name', { hint: 'Shown in the header, contact block and footer.' }),
      i18n('brandRole', 'Header sub-line'),
      i18n('title', 'Browser tab title'),
      text('description', 'Search description', { area: true }),
      text('canonical', 'Site address', { hint: 'Replace https://example.com/ with the real domain before going live.' }),
      i18n('skip', '“Skip to content” link'),
      i18n('more', '“See more” button', { hint: 'Shown on phones under the gallery and video grids.' }),
      i18n('less', '“Show less” button'),
      i18n('readMore', '“Read more” link', { hint: 'Shown on phones under a long award note.' }),
      i18n('readLess', '“Show less” link'),
      i18n('nowPlaying', '“Now playing” label'),
      i18n('soon', '“Soon” badge', { hint: 'On a juz tile that has no audio link yet.' })
    ]},
    { id: 'nav', group: 'Site', label: 'Menu', path: 'nav', asList: {
      label: 'Menu items', titleKey: 'label',
      item: [ i18n('label', 'Label'), text('href', 'Links to', { hint: 'e.g. #about' }) ] } },
    { id: 'hero', group: 'Site', label: 'Hero', path: 'hero', fields: [
      i18n('eyebrow', 'Small line above the name'),
      i18n('name', 'Name'),
      i18n('roles', 'Roles line'),
      list('leads', 'Paragraphs', null, { simple: 'i18n', area: true }),
      list('ctas', 'Buttons', [ i18n('label', 'Label'), text('href', 'Links to') ], { titleKey: 'label' }),
      list('strip', 'Hero photographs', [
        { k: 'src', label: 'Photograph', type: 'image', folder: 'assets' },
        text('alt', 'Alt text')
      ], { titleKey: 'alt', hint: 'They drift across the top of the page on a loop. Two or three read best; with one it simply sits still.' }),
      { k: 'image', label: 'Fallback portrait', type: 'group', hint: 'Used if the list above is empty.', fields: [
        { k: 'src', label: 'Photograph', type: 'image', folder: 'assets' },
        text('alt', 'Alt text'), text('width', 'Width'), text('height', 'Height') ] }
    ]},
    { id: 'stats', group: 'Site', label: 'Hero figures', path: 'stats', asList: {
      label: 'Figures', titleKey: 'label',
      item: [ text('value', 'Figure', { hint: 'e.g. 2012, 1st, 10+' }), i18n('label', 'Caption') ] } },

    { id: 'about', group: 'Page', label: '02 About', path: 'sections.about', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('paragraphs', 'Paragraphs', null, { simple: 'i18n', area: true }),
      { k: 'mission', label: 'Mission box', type: 'group', fields: [
        i18n('label', 'Label'), i18n('text', 'Text', { area: true }) ] },
      { k: 'image', label: 'Picture beside the heading', type: 'group', fields: [
        { k: 'src', label: 'Picture', type: 'image', folder: 'assets',
          hint: 'A drawn Mushaf ships as the default — upload a photograph or PNG to replace it.' },
        i18n('alt', 'Alt text') ] }
    ]},
    { id: 'intl', group: 'Page', label: '04 International', path: 'sections.intl', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('items', 'Competitions', [
        text('flag', 'Flag emoji'), { k: 'logo', label: 'Organisation logo', type: 'image', folder: 'assets' }, text('year', 'Year'), i18n('title', 'Competition'),
        { k: 'statusKey', label: 'Status', type: 'status' },
        { k: 'featured', label: 'Highlight this one', type: 'bool' },
        list('categories', 'Categories', [
          text('medal', 'Medal emoji', { hint: 'Leave empty for no medal.' }),
          { k: 'rankKey', label: 'Placing', type: 'rank' },
          i18n('name', 'Category name')
        ], { titleKey: 'name' }),
        i18n('note', 'Note', { area: true })
      ], { titleKey: 'title' })
    ]},
    { id: 'natl', group: 'Page', label: '05 National', path: 'sections.natl', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('items', 'Competitions', [
        text('year', 'Year'), { k: 'logo', label: 'Organisation logo', type: 'image', folder: 'assets' }, i18n('name', 'Competition'), i18n('org', 'Broadcaster'),
        { k: 'rankKey', label: 'Placing', type: 'rank' }
      ], { titleKey: 'name' }),
      i18n('note', 'Closing note', { area: true })
    ]},
    { id: 'journey', group: 'Page', label: '03 Journey', path: 'sections.journey', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('items', 'Milestones', [
        text('year', 'Year'), i18n('title', 'What happened'), i18n('desc', 'Extra line'),
        { k: 'statusKey', label: 'Status', type: 'status' }
      ], { titleKey: 'title' })
    ]},
    { id: 'current', group: 'Page', label: '06 Current studies', path: 'sections.current', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('items', 'Places of study', [
        i18n('title', 'Institution'), { k: 'logo', label: 'Organisation logo', type: 'image', folder: 'assets' }, i18n('place', 'Location'), i18n('focus', 'What is studied'),
        { k: 'statusKey', label: 'Status', type: 'status' },
        i18n('desc', 'Description', { area: true }),
        text('icon', 'Icon (SVG paths)', { area: true, hint: 'Advanced — leave alone unless you know SVG.' })
      ], { titleKey: 'title' }),
      i18n('areasLabel', 'Chips heading'),
      list('areas', 'Areas of study', null, { simple: 'i18n' })
    ]},
    { id: 'qiraat', group: 'Page', label: "07 Qira'at", path: 'sections.qiraat', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      i18n('lead', 'Opening paragraph', { area: true }),
      i18n('focusLabel', 'Chips heading'),
      i18n('backLabel', '\u201cBack\u201d link on a topic page'),
      list('focus', 'Areas of focus', [
        text('slug', 'Address', { hint: 'Letters, numbers and hyphens \u2014 the page is served at /focus/<address>.html' }),
        text('arabic', 'Arabic name', { hint: 'Shown in Amiri above the heading.' }),
        i18n('label', 'Name'),
        i18n('summary', 'One-line summary', { area: true }),
        list('body', 'Paragraphs', null, { simple: 'i18n', area: true })
      ], { titleKey: 'label', hint: 'Each area is a chip in this section and a page of its own.' }),
      { k: 'objective', label: 'Objective box', type: 'group', fields: [
        i18n('label', 'Label'), i18n('text', 'Text', { area: true }) ] },
      text('arabic', 'Calligraphy line'), i18n('caption', 'Caption under it')
    ]},
    { id: 'education', group: 'Page', label: '08 Education', path: 'sections.education', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('items', 'Qualifications', [
        i18n('degree', 'Programme'),
        list('institution', 'Institution', null, { simple: 'i18n', hint: 'Two parts are joined with —, e.g. name then city.' }),
        i18n('years', 'Years'),
        { k: 'statusKey', label: 'Status', type: 'status', hint: 'Pick one to show a pill instead of the years.' }
      ], { titleKey: 'degree' })
    ]},
    { id: 'aspirations', group: 'Page', label: '09 Aspirations', path: 'sections.aspirations', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Institutions', [
        i18n('name', 'Institution'), { k: 'logo', label: 'Organisation logo', type: 'image', folder: 'assets' }, { k: 'statusKey', label: 'Status', type: 'status' },
        list('paragraphs', 'Paragraphs', null, { simple: 'i18n', area: true })
      ], { titleKey: 'name' }),
      i18n('pathLabel', 'Path heading'),
      list('path', 'Path steps', null, { simple: 'i18n' })
    ]},
    { id: 'teaching', group: 'Page', label: '11 Teaching', path: 'sections.teaching', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Positions', [ i18n('name', 'Role'), i18n('place', 'Organisation'), { k: 'logo', label: 'Organisation logo', type: 'image', folder: 'assets' }, i18n('years', 'Years') ], { titleKey: 'name' }),
      i18n('levelsLabel', 'Levels heading'),
      list('levels', 'Levels', [ i18n('tag', 'Level'), list('items', 'Topics', null, { simple: 'i18n' }) ], { titleKey: 'tag' })
    ]},
    { id: 'judging', group: 'Page', label: '12 Judging', path: 'sections.judging', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Panels', [ i18n('name', 'Organisation'), { k: 'logo', label: 'Organisation logo', type: 'image', folder: 'assets' }, i18n('years', 'Years') ], { titleKey: 'name' }),
      i18n('areasLabel', 'Chips heading'),
      list('areas', 'Areas of evaluation', null, { simple: 'i18n' })
    ]},
    { id: 'imam', group: 'Page', label: '10 Imam', path: 'sections.imam', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Mosques', [ i18n('name', 'Mosque'), i18n('place', 'Location'), i18n('years', 'Years') ], { titleKey: 'name' })
    ]},
    { id: 'media', group: 'Page', label: '14 Media', path: 'sections.media', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      i18n('networksLabel', 'Logo strip heading'),
      list('networks', 'TV networks', [
        text('name', 'Channel'),
        { k: 'logo', label: 'Logo', type: 'image', folder: 'assets',
          hint: 'Left empty, the tile shows the channel name instead.' }
      ], { titleKey: 'name', hint: 'They drift past below the videos, each on a light tile.' }),
      list('videos', 'Video tiles', [
        i18n('label', 'Caption'),
        text('href', 'Video link', { hint: 'Paste the YouTube, Facebook or channel URL the tile opens.' }),
        text('embed', 'Embed URL', { hint: 'Optional — an …/embed/VIDEO_ID address plays the clip inside the tile instead of linking out.' })
      ], { titleKey: 'label', hint: 'The first four show on the page; any beyond that sit behind “See more”.' })
    ]},
    { id: 'engagement', group: 'Page', label: '13 Countries', path: 'sections.engagement', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Countries', [
        text('flag', 'Flag emoji'), i18n('name', 'Country'), i18n('event', 'Event'), text('year', 'Year')
      ], { titleKey: 'name' })
    ]},
    { id: 'quran', group: 'Page', label: '15 Full Qur\u2019an', path: 'sections.quran', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      i18n('emptyNote', 'Note while parts are missing', { area: true,
        hint: 'Shown under the list until every juz has a link.' }),
      list('items', 'The thirty juz', [
        i18n('name', 'Juz name'),
        i18n('note', 'Caption'),
        { k: 'src', label: 'Recording', type: 'audio',
          hint: 'Upload the file, pick one already uploaded, or paste a link. Empty and the tile reads \u201cSoon\u201d.' }
      ], { titleKey: 'name', hint: 'Order is the order on the page. A juz with no recording is shown but cannot be played.' })
    ]},
    { id: 'gallery', group: 'Page', label: '16 Gallery', path: 'sections.gallery', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('filters', 'Filter buttons', [ text('id', 'Category id'), i18n('label', 'Label') ], { titleKey: 'label' }),
      list('items', 'Photographs', [
        { k: 'src', label: 'Photograph', type: 'image' },
        { k: 'cat', label: 'Category', type: 'catref' },
        i18n('title', 'Caption'), i18n('sub', 'Sub-caption'),
        i18n('slot', 'Empty-slot text', { hint: 'Shown while no photograph is set.' })
      ], { titleKey: 'title' }),
      i18n('note', 'Note under the grid', { area: true })
    ]},
    { id: 'blog', group: 'Page', label: '17 Blog', path: 'sections.blog', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      i18n('readLabel', '“Read the post” link'), i18n('allLabel', '“All posts” button'),
      i18n('backLabel', '“Back” link on a post'),
      i18n('emptyNote', 'Note when nothing is published', { area: true }),
      list('posts', 'Posts', [
        { k: 'published', label: 'Published', type: 'bool', def: false,
          hint: 'Unticked, the post is kept but nothing about it reaches the site.' },
        text('slug', 'Address', { hint: 'Letters, numbers and hyphens — the post is served at /blog/<address>.html' }),
        text('date', 'Date', { hint: 'YYYY-MM-DD. Shown in each language\u2019s own numerals.' }),
        { k: 'cover', label: 'Cover picture', type: 'image', folder: 'gallery' },
        i18n('title', 'Title'),
        i18n('excerpt', 'Summary', { area: true, hint: 'Shown on the card and under the title.' }),
        list('body', 'Paragraphs', null, { simple: 'i18n', area: true })
      ], { titleKey: 'title', hint: 'The newest four appear on the home page; every published post is listed at /blog/.' })
    ]},
    { id: 'vision', group: 'Page', label: '18 Vision', path: 'sections.vision', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      i18n('lead', 'Lead line', { area: true }), i18n('sub', 'Second line', { area: true }),
      list('items', 'Pillars', [ text('num', 'Number'), i18n('title', 'Pillar'), i18n('text', 'Text', { area: true }) ], { titleKey: 'title' })
    ]},
    { id: 'contact', group: 'Page', label: '19 Contact', path: 'sections.contact', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      i18n('roles', 'Roles line'),
      { k: 'phone', label: 'Phone', type: 'group', fields: [ i18n('label', 'Label'), text('value', 'Dial number'), text('display', 'Shown as') ] },
      { k: 'email', label: 'Email', type: 'group', fields: [ i18n('label', 'Label'), text('value', 'Address') ] },
      { k: 'based', label: 'Based in', type: 'group', fields: [ i18n('label', 'Label'), i18n('value', 'Value') ] },
      i18n('onlineLabel', 'Socials heading'),
      list('socials', 'Social profiles', [
        { k: 'enabled', label: 'Show this profile on the site', type: 'bool', def: true },
        text('network', 'Network', { hint: 'YouTube, Facebook, Instagram, Telegram, Spotify or Wikipedia — the brand icon follows this name exactly.' }),
        text('handle', 'Shown as'), text('href', 'Link')
      ], { titleKey: 'network', hint: 'Untick a profile to hide it from the contact card, the footer and the search-engine data — without deleting it.' })
    ]},
    { id: 'footer', group: 'Page', label: '20 Footer', path: 'sections.footer', fields: [
      i18n('tag', 'Tagline', { area: true }),
      list('columns', 'Column headings', null, { simple: 'i18n' }),
      i18n('copy', 'Copyright line'),
      i18n('credit', 'Developer credit', { hint: 'Shown in the footer bar beside the copyright.' }),
      i18n('top', '“Back to top” label')
    ]},

    { id: 'status', group: 'Labels', label: 'Status labels', path: 'status', asMap: { label: 'Status labels' } },
    { id: 'ranks', group: 'Labels', label: 'Placing labels', path: 'ranks', asMap: { label: 'Placings', numeric: true } },
    { id: 'backups', group: 'Labels', label: 'Earlier versions', custom: 'backups' }
  ];

  /* ---------- helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const get = p => p.split('.').reduce((o, k) => (o || {})[k], data);
  const blankI18n = () => ({ en: '', bn: '', ar: '' });
  const markDirty = () => { dirty = true; $('#save').disabled = false; $('#save').classList.add('is-dirty'); $('#state').textContent = 'unsaved'; };

  function toast(msg, bad) {
    const t = $('#toast');
    t.textContent = msg; t.classList.toggle('is-bad', !!bad); t.classList.add('is-up');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('is-up'), bad ? 7000 : 3200);
  }

  /* ---------- field renderers ---------- */
  function fieldI18n(obj, f) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field__label', f.label));
    if (!obj[f.k] || typeof obj[f.k] !== 'object') obj[f.k] = blankI18n();
    const input = f.area ? el('textarea') : Object.assign(el('input'), { type: 'text' });
    input.value = obj[f.k][lang] || '';
    input.setAttribute('lang', lang);
    input.addEventListener('input', () => { obj[f.k][lang] = input.value; markDirty(); });
    wrap.appendChild(input);
    if (lang !== 'en') {
      const ref = el('div', 'ref');
      ref.appendChild(el('b', null, 'English: '));
      ref.appendChild(document.createTextNode(obj[f.k].en || '—'));
      wrap.appendChild(ref);
    }
    if (f.hint) wrap.appendChild(el('div', 'hint', f.hint));
    return wrap;
  }

  function fieldText(obj, f) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field__label', f.label));
    const input = f.area ? el('textarea') : Object.assign(el('input'), { type: 'text' });
    input.value = obj[f.k] == null ? '' : String(obj[f.k]);
    input.addEventListener('input', () => { obj[f.k] = input.value; markDirty(); });
    wrap.appendChild(input);
    if (f.hint) wrap.appendChild(el('div', 'hint', f.hint));
    return wrap;
  }

  function fieldBool(obj, f) {
    const wrap = el('div', 'field');
    const lab = el('label', 'field__label');
    const cb = Object.assign(el('input'), { type: 'checkbox', checked: !!obj[f.k] });
    cb.style.marginRight = '8px'; cb.style.width = 'auto';
    cb.addEventListener('change', () => { obj[f.k] = cb.checked; markDirty(); });
    lab.appendChild(cb); lab.appendChild(document.createTextNode(f.label));
    wrap.appendChild(lab);
    return wrap;
  }

  function fieldChoice(obj, f, options, allowEmpty) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field__label', f.label));
    const sel = el('select');
    if (allowEmpty) sel.appendChild(new Option('— none —', ''));
    options.forEach(([v, label]) => sel.appendChild(new Option(label, v)));
    sel.value = obj[f.k] || '';
    sel.addEventListener('change', () => { obj[f.k] = sel.value; markDirty(); });
    wrap.appendChild(sel);
    if (f.hint) wrap.appendChild(el('div', 'hint', f.hint));
    return wrap;
  }

  /* A juz recording: upload it here, reuse one already uploaded, or paste a link
     to wherever it is hosted. */
  function fieldAudio(obj, f) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field__label', f.label));

    const url = Object.assign(el('input'), { type: 'text', value: obj[f.k] || '',
      placeholder: 'assets/audio/juz-01.mp3  or  https://\u2026/juz-01.mp3' });
    url.addEventListener('input', () => { obj[f.k] = url.value.trim(); markDirty(); paint(); });

    const row = el('div', 'pick');
    const sel = el('select');
    const fill = () => {
      sel.textContent = '';
      sel.appendChild(new Option('\u2014 uploaded files \u2014', ''));
      audioFiles.forEach(src => sel.appendChild(new Option(src.replace('assets/audio/', ''), src)));
      sel.value = audioFiles.includes(obj[f.k]) ? obj[f.k] : '';
    };
    sel.addEventListener('change', () => {
      if (!sel.value) return;
      obj[f.k] = sel.value; url.value = sel.value; markDirty(); paint();
    });

    const player = el('audio'); player.controls = true; player.preload = 'none';
    player.style.width = '100%'; player.style.marginTop = '8px';
    const paint = () => {
      const v = obj[f.k];
      if (v) { player.src = v.indexOf('http') === 0 ? v : '/' + v; player.style.display = ''; }
      else { player.removeAttribute('src'); player.style.display = 'none'; }
    };

    const up = Object.assign(el('input'), { type: 'file', accept: 'audio/*' });
    up.style.display = 'none';
    const btn = el('button', 'add', 'Upload\u2026'); btn.type = 'button';
    btn.addEventListener('click', () => up.click());
    up.addEventListener('change', async () => {
      const file = up.files[0]; if (!file) return;
      btn.textContent = 'Uploading\u2026 0%';
      try {
        const src = await uploadAudio(file, pct => { btn.textContent = 'Uploading\u2026 ' + pct + '%'; });
        if (!audioFiles.includes(src)) audioFiles.push(src);
        audioFiles.sort();
        obj[f.k] = src; url.value = src; markDirty(); fill(); paint();
        toast('Uploaded ' + src.replace('assets/audio/', ''));
      } catch (e) { toast(e.message, true); }
      btn.textContent = 'Upload\u2026'; up.value = '';
    });

    row.appendChild(sel); row.appendChild(btn); row.appendChild(up);
    wrap.appendChild(url); wrap.appendChild(row); wrap.appendChild(player);
    if (f.hint) wrap.appendChild(el('div', 'hint', f.hint));
    fill(); paint();
    return wrap;
  }

  /* XHR rather than fetch, because a juz file is large enough that the progress
     readout is the difference between "working" and "frozen". */
  function uploadAudio(file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.setRequestHeader('X-Filename', file.name);
      xhr.setRequestHeader('X-Folder', 'audio');
      xhr.upload.onprogress = e => {
        if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
      };
      xhr.onload = () => {
        let j = {}; try { j = JSON.parse(xhr.responseText); } catch (e) { /* not json */ }
        if (xhr.status === 401) return reject(new Error('Signed out \u2014 reload and sign in again'));
        if (xhr.status >= 200 && xhr.status < 300 && j.src) return resolve(j.src);
        reject(new Error(j.error || 'Upload failed (' + xhr.status + ')'));
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(file);
    });
  }

  function fieldImage(obj, f) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field__label', f.label));
    const row = el('div', 'pick');
    const folder = f.folder || 'gallery';
    const sel = el('select');
    sel.appendChild(new Option('— no photograph yet —', ''));
    galleryFiles.forEach(src => sel.appendChild(new Option(src.replace('assets/gallery/', ''), src)));
    if (obj[f.k] && !galleryFiles.includes(obj[f.k])) sel.appendChild(new Option(obj[f.k], obj[f.k]));
    sel.value = obj[f.k] || '';
    const img = el('img', 'thumb'); img.alt = '';
    const paint = () => { if (obj[f.k]) { img.src = '/' + obj[f.k]; img.style.display = ''; } else img.style.display = 'none'; };
    sel.addEventListener('change', () => { obj[f.k] = sel.value; markDirty(); paint(); });

    const up = Object.assign(el('input'), { type: 'file', accept: 'image/*' });
    up.style.display = 'none';
    const btn = el('button', 'add', 'Upload…'); btn.type = 'button';
    btn.addEventListener('click', () => up.click());
    up.addEventListener('change', async () => {
      const file = up.files[0]; if (!file) return;
      btn.textContent = 'Uploading…';
      try {
        const r = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'X-Filename': file.name, 'X-Folder': folder },
          body: file
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'upload failed');
        if (!galleryFiles.includes(j.src)) galleryFiles.push(j.src);
        sel.appendChild(new Option(j.src.replace('assets/gallery/', ''), j.src));
        sel.value = j.src; obj[f.k] = j.src; markDirty(); paint();
        toast('Uploaded ' + j.src.replace('assets/gallery/', ''));
      } catch (e) { toast(e.message, true); }
      btn.textContent = 'Upload…'; up.value = '';
    });

    row.appendChild(sel); row.appendChild(btn); row.appendChild(up); row.appendChild(img);
    wrap.appendChild(row); paint();
    return wrap;
  }

  function renderField(obj, f, host) {
    if (f.type === 'i18n') return host.appendChild(fieldI18n(obj, f));
    if (f.type === 'text') return host.appendChild(fieldText(obj, f));
    if (f.type === 'bool') return host.appendChild(fieldBool(obj, f));
    if (f.type === 'status') return host.appendChild(fieldChoice(obj, f,
      Object.keys(data.status).map(k => [k, data.status[k].en || k]), true));
    if (f.type === 'rank') return host.appendChild(fieldChoice(obj, f,
      Object.keys(data.ranks).map(k => [k, data.ranks[k].en || k]), true));
    if (f.type === 'catref') return host.appendChild(fieldChoice(obj, f,
      data.sections.gallery.filters.filter(x => x.id !== 'all').map(x => [x.id, x.label.en || x.id]), false));
    if (f.type === 'image') return host.appendChild(fieldImage(obj, f));
    if (f.type === 'audio') return host.appendChild(fieldAudio(obj, f));
    if (f.type === 'group') {
      const box = el('div', 'field');
      box.appendChild(el('div', 'field__label', f.label));
      const sub = el('div', 'sub');
      if (!obj[f.k]) obj[f.k] = {};
      f.fields.forEach(sf => renderField(obj[f.k], sf, sub));
      box.appendChild(sub); return host.appendChild(box);
    }
    if (f.type === 'list') return host.appendChild(renderList(obj, f));
  }

  function renderList(obj, f) {
    const box = el('div', 'field');
    box.appendChild(el('div', 'field__label', f.label));
    if (!Array.isArray(obj[f.k])) obj[f.k] = [];
    const items = obj[f.k];
    const host = el('div', 'list');

    const repaint = () => {
      host.textContent = '';
      items.forEach((it, i) => {
        const card = el('div', 'card');
        const head = el('div', 'card__head');
        head.appendChild(el('span', 'card__n', String(i + 1)));
        const titleVal = f.simple ? (f.simple === 'i18n' ? (it.en || '') : String(it || ''))
                                  : ((it[f.titleKey] && (it[f.titleKey].en ?? it[f.titleKey])) || '');
        head.appendChild(el('span', 'card__title', String(titleVal).slice(0, 70) || '(empty)'));
        const tools = el('div', 'card__tools');
        const mk = (label, title, fn, cls) => {
          const b = el('button', 'tool' + (cls || ''), label); b.type = 'button'; b.title = title;
          b.addEventListener('click', fn); tools.appendChild(b);
        };
        mk('↑', 'Move up', () => { if (i > 0) { items.splice(i - 1, 0, items.splice(i, 1)[0]); markDirty(); repaint(); } });
        mk('↓', 'Move down', () => { if (i < items.length - 1) { items.splice(i + 1, 0, items.splice(i, 1)[0]); markDirty(); repaint(); } });
        mk('⧉', 'Duplicate', () => { items.splice(i + 1, 0, JSON.parse(JSON.stringify(items[i]))); markDirty(); repaint(); });
        mk('✕', 'Delete', () => {
          if (!confirm('Delete item ' + (i + 1) + '? This cannot be undone once you save.')) return;
          items.splice(i, 1); markDirty(); repaint();
        }, ' tool--del');
        head.appendChild(tools);
        card.appendChild(head);

        if (f.simple === 'i18n') {
          if (typeof it !== 'object' || !it) items[i] = blankI18n();
          renderField(items, { k: i, label: '', type: 'i18n', area: f.area }, card);
        } else if (f.simple === 'text') {
          renderField(items, { k: i, label: '', type: 'text' }, card);
        } else {
          f.item.forEach(sf => renderField(it, sf, card));
        }
        host.appendChild(card);
      });

      const add = el('button', 'add', '+ Add ' + f.label.replace(/s$/, '').toLowerCase());
      add.type = 'button';
      add.addEventListener('click', () => {
        if (f.simple === 'i18n') items.push(blankI18n());
        else if (f.simple === 'text') items.push('');
        else {
          const fresh = {};
          f.item.forEach(sf => {
            fresh[sf.k] = sf.def !== undefined ? sf.def
              : sf.type === 'i18n' ? blankI18n()
              : sf.type === 'list' ? []
              : sf.type === 'bool' ? false : '';
          });
          items.push(fresh);
        }
        markDirty(); repaint();
      });
      host.appendChild(add);
    };
    repaint();
    box.appendChild(host);
    if (f.hint) box.appendChild(el('div', 'hint', f.hint));
    return box;
  }

  /* ---------- panels ---------- */
  function renderPanel() {
    const s = SCHEMA.find(x => x.id === current);
    const panel = $('#panel');
    panel.textContent = '';
    panel.appendChild(el('h2', 'sec-title', s.label));
    panel.appendChild(el('p', 'sec-hint',
      lang === 'en' ? 'Editing English. Switch language at the top to translate.'
                    : 'Editing ' + LANGS[lang] + '. The English is shown under each box for reference.'));
    if (s.asMap) {
      panel.appendChild(el('p', 'sec-hint',
        'You can reword these, but the set itself is fixed — each one has matching styling on the site.'));
    }

    if (s.custom === 'backups') return renderBackups(panel);
    const node = get(s.path);
    if (s.asMap) {
      Object.keys(node).forEach(k => renderField(node, { k, label: k, type: 'i18n' }, panel));
    } else if (s.asList) {
      renderField({ tmp: node }, Object.assign({ k: 'tmp', type: 'list' }, s.asList), panel);
    } else {
      s.fields.forEach(f => renderField(node, f, panel));
    }
    panel.scrollIntoView({ block: 'start' });
  }

  function renderSide() {
    const side = $('#side');
    side.textContent = '';
    let group = null;
    SCHEMA.forEach(s => {
      if (s.group !== group) { group = s.group; side.appendChild(el('div', 'side__group', group)); }
      const b = el('button', s.id === current ? 'is-on' : '', s.label);
      b.type = 'button';
      b.addEventListener('click', () => { current = s.id; renderSide(); renderPanel(); });
      side.appendChild(b);
    });
  }

  /* ---------- earlier versions ---------- */
  function renderBackups(panel) {
    panel.appendChild(el('p', 'sec-hint',
      'A copy of the content is kept every time you publish. Restoring one replaces what is on the site now.'));
    const host = el('div', 'list');
    panel.appendChild(host);
    host.appendChild(el('p', 'hint', 'Loading…'));
    fetch('/api/backups').then(r => r.json()).then(j => {
      host.textContent = '';
      if (!j.files || !j.files.length) { host.appendChild(el('p', 'hint', 'Nothing saved yet.')); return; }
      j.files.forEach(file => {
        const when = file.replace(/^site-|\.json$/g, '').replace(/T/, ' ').replace(/-(\d\d)-(\d\d)-\d+Z$/, ':$1:$2');
        const card = el('div', 'card');
        const head = el('div', 'card__head');
        head.appendChild(el('span', 'card__title', when));
        const b = el('button', 'tool', '↩'); b.type = 'button'; b.title = 'Restore this version';
        b.style.width = 'auto'; b.style.padding = '0 12px'; b.textContent = 'Restore';
        b.addEventListener('click', async () => {
          if (!confirm('Restore the version from ' + when + '? What is on the site now will be replaced.')) return;
          b.disabled = true; b.textContent = 'Restoring…';
          try {
            const r = await fetch('/api/restore', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ file })
            });
            const res = await r.json();
            if (!r.ok) throw new Error(res.error || 'Restore failed');
            toast('Restored. Reloading the editor…');
            setTimeout(() => location.reload(), 900);
          } catch (e) { toast(e.message, true); b.disabled = false; b.textContent = 'Restore'; }
        });
        head.appendChild(b);
        card.appendChild(head);
        host.appendChild(card);
      });
    }).catch(e => { host.textContent = ''; host.appendChild(el('p', 'hint', 'Could not list versions: ' + e.message)); });
  }

  /* ---------- save ---------- */
  async function save() {
    const btn = $('#save');
    btn.disabled = true; btn.textContent = 'Publishing…';
    try {
      const r = await fetch('/api/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, null, 2)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Save failed');
      dirty = false; btn.classList.remove('is-dirty');
      $('#state').textContent = 'published';
      toast('Published — ' + j.keys + ' phrases, ' + j.gallery + ' photographs. Reload the site to see it.');
    } catch (e) {
      toast(e.message, true);
      $('#state').textContent = 'not saved';
      btn.disabled = false;
    }
    btn.textContent = 'Save & publish';
  }

  /* ---------- boot ---------- */
  document.querySelectorAll('.langs button').forEach(b => {
    b.addEventListener('click', () => {
      lang = b.dataset.lang;
      document.querySelectorAll('.langs button').forEach(x => x.classList.toggle('is-on', x === b));
      renderPanel();
    });
  });
  $('#save').addEventListener('click', save);
  $('#out').addEventListener('click', async () => {
    if (dirty && !confirm('You have unsaved changes. Sign out anyway?')) return;
    dirty = false;
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/admin';
  });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (dirty) save(); }
  });

  Promise.all([
    fetch('/api/content').then(r => r.json()),
    fetch('/api/gallery-files').then(r => r.json()).catch(() => ({ files: [] })),
    fetch('/api/audio-files').then(r => r.json()).catch(() => ({ files: [] }))
  ]).then(([content, files, audio]) => {
    data = content; galleryFiles = files.files || []; audioFiles = audio.files || [];
    $('#state').textContent = 'loaded';
    renderSide(); renderPanel();
  }).catch(e => {
    $('#panel').textContent = 'Could not load the content: ' + e.message;
  });

  // Any call rejected as signed-out sends us back to the sign-in page.
  const rawFetch = window.fetch;
  window.fetch = function (input, init) {
    return rawFetch(input, init).then(r => {
      if (r.status === 401 && String(input).startsWith('/api/')) location.href = '/admin';
      return r;
    });
  };
})();
