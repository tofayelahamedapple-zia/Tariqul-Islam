/* Content admin. The form is generated from SCHEMA, so adding a field here is
   the only change needed to make it editable. */
(function () {
  'use strict';

  const LANGS = { en: 'English', bn: 'বাংলা', ar: 'العربية' };
  let data = null, lang = 'en', current = 'meta', dirty = false, galleryFiles = [];

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
      i18n('skip', '“Skip to content” link')
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
      { k: 'image', label: 'Portrait', type: 'group', fields: [
        text('src', 'File'), text('alt', 'Alt text'), text('width', 'Width'), text('height', 'Height') ] }
    ]},
    { id: 'stats', group: 'Site', label: 'Hero figures', path: 'stats', asList: {
      label: 'Figures', titleKey: 'label',
      item: [ text('value', 'Figure', { hint: 'e.g. 2012, 1st, 10+' }), i18n('label', 'Caption') ] } },

    { id: 'about', group: 'Page', label: '02 About', path: 'sections.about', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('paragraphs', 'Paragraphs', null, { simple: 'i18n', area: true }),
      { k: 'mission', label: 'Mission box', type: 'group', fields: [
        i18n('label', 'Label'), i18n('text', 'Text', { area: true }) ] }
    ]},
    { id: 'intl', group: 'Page', label: '04 International', path: 'sections.intl', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      list('items', 'Competitions', [
        text('flag', 'Flag emoji'), text('year', 'Year'), i18n('title', 'Competition'),
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
        text('year', 'Year'), i18n('name', 'Competition'), i18n('org', 'Broadcaster'),
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
        i18n('title', 'Institution'), i18n('place', 'Location'), i18n('focus', 'What is studied'),
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
      list('focus', 'Areas of focus', null, { simple: 'i18n' }),
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
        i18n('name', 'Institution'), { k: 'statusKey', label: 'Status', type: 'status' },
        list('paragraphs', 'Paragraphs', null, { simple: 'i18n', area: true })
      ], { titleKey: 'name' }),
      i18n('pathLabel', 'Path heading'),
      list('path', 'Path steps', null, { simple: 'i18n' })
    ]},
    { id: 'teaching', group: 'Page', label: '11 Teaching', path: 'sections.teaching', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Positions', [ i18n('name', 'Role'), i18n('place', 'Organisation'), i18n('years', 'Years') ], { titleKey: 'name' }),
      i18n('levelsLabel', 'Levels heading'),
      list('levels', 'Levels', [ i18n('tag', 'Level'), list('items', 'Topics', null, { simple: 'i18n' }) ], { titleKey: 'tag' })
    ]},
    { id: 'judging', group: 'Page', label: '12 Judging', path: 'sections.judging', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Panels', [ i18n('name', 'Organisation'), i18n('years', 'Years') ], { titleKey: 'name' }),
      i18n('areasLabel', 'Chips heading'),
      list('areas', 'Areas of evaluation', null, { simple: 'i18n' })
    ]},
    { id: 'imam', group: 'Page', label: '10 Imam', path: 'sections.imam', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Mosques', [ i18n('name', 'Mosque'), i18n('place', 'Location'), i18n('years', 'Years') ], { titleKey: 'name' })
    ]},
    { id: 'media', group: 'Page', label: '14 Media', path: 'sections.media', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('networks', 'TV networks', null, { simple: 'text' }),
      list('videos', 'Video tiles', [ i18n('label', 'Caption'), text('href', 'Links to') ], { titleKey: 'label' })
    ]},
    { id: 'engagement', group: 'Page', label: '13 Countries', path: 'sections.engagement', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      list('items', 'Countries', [
        text('flag', 'Flag emoji'), i18n('name', 'Country'), i18n('event', 'Event'), text('year', 'Year')
      ], { titleKey: 'name' })
    ]},
    { id: 'gallery', group: 'Page', label: '15 Gallery', path: 'sections.gallery', fields: [
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
    { id: 'vision', group: 'Page', label: '16 Vision', path: 'sections.vision', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'),
      i18n('lead', 'Lead line', { area: true }), i18n('sub', 'Second line', { area: true }),
      list('items', 'Pillars', [ text('num', 'Number'), i18n('title', 'Pillar'), i18n('text', 'Text', { area: true }) ], { titleKey: 'title' })
    ]},
    { id: 'contact', group: 'Page', label: '17 Contact', path: 'sections.contact', fields: [
      text('num', 'Number'), i18n('numLabel', 'Section label'), i18n('title', 'Heading'), i18n('sub', 'Intro', { area: true }),
      i18n('roles', 'Roles line'),
      { k: 'phone', label: 'Phone', type: 'group', fields: [ i18n('label', 'Label'), text('value', 'Dial number'), text('display', 'Shown as') ] },
      { k: 'email', label: 'Email', type: 'group', fields: [ i18n('label', 'Label'), text('value', 'Address') ] },
      { k: 'based', label: 'Based in', type: 'group', fields: [ i18n('label', 'Label'), i18n('value', 'Value') ] },
      i18n('cta', 'Button label'), i18n('onlineLabel', 'Socials heading'),
      list('socials', 'Social profiles', [
        text('network', 'Network', { hint: 'YouTube, Facebook, Instagram or Wikipedia — the icon follows this.' }),
        text('handle', 'Shown as'), text('href', 'Link')
      ], { titleKey: 'network' })
    ]},
    { id: 'footer', group: 'Page', label: '18 Footer', path: 'sections.footer', fields: [
      i18n('tag', 'Tagline', { area: true }),
      list('columns', 'Column headings', null, { simple: 'i18n' }),
      i18n('copy', 'Copyright line'), i18n('top', '“Back to top” label')
    ]},

    { id: 'status', group: 'Labels', label: 'Status labels', path: 'status', asMap: { label: 'Status labels' } },
    { id: 'ranks', group: 'Labels', label: 'Placing labels', path: 'ranks', asMap: { label: 'Placings', numeric: true } }
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

  function fieldImage(obj, f) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field__label', f.label));
    const row = el('div', 'pick');
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
        const r = await fetch('/api/upload', { method: 'POST', headers: { 'X-Filename': file.name }, body: file });
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
            fresh[sf.k] = sf.type === 'i18n' ? blankI18n()
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
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (dirty) save(); }
  });

  Promise.all([
    fetch('/api/content').then(r => r.json()),
    fetch('/api/gallery-files').then(r => r.json()).catch(() => ({ files: [] }))
  ]).then(([content, files]) => {
    data = content; galleryFiles = files.files || [];
    $('#state').textContent = 'loaded';
    renderSide(); renderPanel();
  }).catch(e => {
    $('#panel').textContent = 'Could not load the content: ' + e.message;
  });
})();
