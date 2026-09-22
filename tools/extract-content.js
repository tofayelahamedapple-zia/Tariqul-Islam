/**
 * One-off migration: lift every piece of content out of the hand-written
 * public/index.html (plus the two dictionaries and gallery.json) into
 * content/site.json.
 *
 *   node tools/extract-content.js
 *
 * After this, site.json is the source of truth and build.js regenerates
 * public/index.html, public/i18n/*.json and public/data/gallery.json from it.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = R('public/index.html');
if (html.includes('data-i18n="edu.items.')) {
  console.error('Refusing to run: public/index.html is already generated output.\n' +
                'Restore the hand-written page first (git checkout -- public/index.html public/i18n public/data).');
  process.exit(1);
}
const bn = JSON.parse(R('public/i18n/bn.json'));
const ar = JSON.parse(R('public/i18n/ar.json'));
const gallery = JSON.parse(R('public/data/gallery.json'));

/* English lives in the markup; index it by data-i18n key. */
const EN = {};
// Match the closing tag of the *same* element, so nested markup
// (e.g. <code> inside a <p>) does not truncate the English.
for (const m of html.matchAll(/<(span|h1|h2|h3|h4|p|a|li|b|button|div)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
  if (!(m[2] in EN)) EN[m[2]] = m[3].trim();
}
const decode = s => String(s ?? '')
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, '\u00a0').replace(/&amp;/g, '&');
const t = key => key ? { en: decode(EN[key]), bn: decode(bn[key]), ar: decode(ar[key]) } : null;
const all = (src, re) => [...src.matchAll(re)];
const one = (src, re) => { const m = src.match(re); return m ? m[1].trim() : ''; };
const secOf = id => {
  const i = html.indexOf(`id="${id}"`);
  const start = html.lastIndexOf('<section', i);
  return html.slice(start, html.indexOf('</section>', i));
};
const statusOf = s => one(s, /class="pill pill--([a-z]+)"/);
const splitItems = (src, marker) =>
  src.split(marker).slice(1).map(chunk => chunk);

const site = {
  _note: 'Single source of truth for every word on the site. Edit at /admin (node server.js), or by hand then run: node build.js',
  meta: {
    displayName: 'MD TARIQUL ISLAM',
    brandRole: t('brand.role'),
    title: {
      en: decode(one(html, /<title>([\s\S]*?)<\/title>/)),
      bn: 'এমডি তারিকুল ইসলাম — আন্তর্জাতিক কুরআন তিলাওয়াতকারী, হাফিজ ও কুরআন শিক্ষক',
      ar: 'محمد طريق الإسلام — قارئ دولي للقرآن الكريم، حافظ ومعلّم للقرآن'
    },
    description: decode(one(html, /<meta name="description" content="([^"]*)"/)),
    canonical: one(html, /<link rel="canonical" href="([^"]*)"/),
    skip: t('a11y.skip'),
    more: { en: 'See more', bn: 'আরও দেখুন', ar: 'عرض المزيد' },
    less: { en: 'Show less', bn: 'কম দেখুন', ar: 'عرض أقل' },
    readMore: { en: 'Read more', bn: 'আরও পড়ুন', ar: 'اقرأ المزيد' },
    readLess: { en: 'Show less', bn: 'কম দেখুন', ar: 'عرض أقل' }
  },
  status: {}, ranks: {},
  nav: all(html, /<a class="nav__link" href="([^"]+)"\s+data-i18n="([^"]+)"/g).map(m => ({ href: m[1], label: t(m[2]) })),
  hero: {
    eyebrow: t('hero.eyebrow'), name: t('hero.name'), roles: t('hero.roles'),
    leads: ['hero.p1','hero.p2','hero.p3'].map(t),
    ctas: [
      { href: '#journey', label: t('hero.cta1'), primary: true },
      { href: '#achievements', label: t('hero.cta2') },
      { href: '#media', label: t('hero.cta3') }
    ],
    image: { src: 'assets/portrait-arch.webp?v=3', width: 900, height: 1200, alt: 'MD Tariqul Islam' }
  },
  stats: all(html, /<div class="stat"><b>([^<]*)<\/b><span data-i18n="([^"]+)">/g)
          .map(m => ({ value: m[1].trim(), label: t(m[2]) })),
  sections: {}
};
for (const k of ['achieved','completed','ongoing','awaited','future','participation']) site.status[k] = t('status.' + k);
for (const k of ['1','2','4','5','6','9']) site.ranks[k] = t('rank.' + k);

const S = site.sections;

/* 02 about */
S.about = { num:'02', numLabel:t('about.num'), title:t('about.title'),
  paragraphs:['about.p1','about.p2','about.p3','about.p4','about.p5','about.p6'].map(t),
  mission:{ label:t('about.mission.k'), text:t('about.mission.v') } };

/* 04 international + 05 national */
const ach = secOf('achievements');
S.intl = { num:'04', numLabel:t('intl.num'), title:t('intl.title'),
  items: all(ach, /<article class="award([^"]*)"[^>]*>([\s\S]*?)<\/article>/g).map(m => {
    const b = m[2];
    return {
      featured: m[1].includes('award--primary'),
      flag: one(b, /class="award__flag"[^>]*>([^<]*)</),
      year: one(b, /class="award__year">([^<]*)</),
      title: t(one(b, /class="award__title" data-i18n="([^"]+)"/)),
      statusKey: statusOf(b),
      categories: all(b, /<div class="award__cat">([\s\S]*?)<\/div>/g).map(c => {
        const inner = c[1];
        const medal = one(inner, /<span aria-hidden="true">([^<]*)</);
        const nested = one(inner, /<span data-i18n="rank\.([^"]+)">/);
        const direct = one(inner, /class="award__rank" data-i18n="([^"]+)"/);
        return {
          medal,
          rankKey: nested || (direct.startsWith('rank.') ? direct.slice(5) : ''),
          rankText: direct && !direct.startsWith('rank.') ? t(direct) : null,
          name: t(one(inner, /class="award__catname" data-i18n="([^"]+)"/))
        };
      }),
      note: t(one(b, /class="award__note" data-i18n="([^"]+)"/))
    };
  }) };

S.natl = { num:'05', numLabel:t('natl.num'), title:t('natl.title'), note:t('natl.note'),
  items: all(ach, /<span class="record__year">([^<]*)<\/span>\s*<span class="record__name"><span data-i18n="([^"]+)">[^<]*<\/span><span class="record__org" data-i18n="([^"]+)">[^<]*<\/span><\/span>\s*<span class="record__rank" data-i18n="rank\.([^"]+)">/g)
    .map(m => ({ year:m[1].trim(), name:t(m[2]), org:t(m[3]), rankKey:m[4] })) };

/* 03 journey */
S.journey = { num:'03', numLabel:t('journey.num'), title:t('journey.title'),
  items: splitItems(secOf('journey'), '<div class="tl-item">').map(b => ({
    year: one(b, /class="tl-item__year">([^<]*)</),
    title: t(one(b, /class="tl-item__title" data-i18n="([^"]+)"/)),
    desc: t(one(b, /class="tl-item__desc" data-i18n="([^"]+)"/)),
    statusKey: statusOf(b)
  })) };

/* 06 current studies + 07 qira'at */
const stu = secOf('studies');
S.current = { num:'06', numLabel:t('cur.num'), title:t('cur.title'),
  items: all(stu, /<article class="study[^"]*"[^>]*>([\s\S]*?)<\/article>/g).map(m => {
    const b = m[1];
    return {
      icon: one(b, /<svg class="study__icon"[^>]*>([\s\S]*?)<\/svg>/),
      title: t(one(b, /class="study__title" data-i18n="([^"]+)"/)),
      place: t(one(b, /class="study__place" data-i18n="([^"]+)"/)),
      focus: t(one(b, /class="study__focus"><span data-i18n="([^"]+)"/)),
      statusKey: statusOf(b),
      desc: t(one(b, /class="study__desc" data-i18n="([^"]+)"/))
    };
  }),
  areasLabel: t('cur.areas'),
  areas: all(stu.slice(0, stu.indexOf('qir.num')), /<span class="chip" data-i18n="([^"]+)">/g).map(m => t(m[1]))
};
S.qiraat = { num:'07', numLabel:t('qir.num'), title:t('qir.title'), lead:t('qir.lead'),
  focusLabel: t('qir.focus'),
  focus: all(stu.slice(stu.indexOf('qir.focus')), /<span class="chip" data-i18n="([^"]+)">/g).map(m => t(m[1])),
  objective: { label:t('qir.obj.k'), text:t('qir.obj.v') },
  arabic: one(stu, /class="qiraat__arabic"[^>]*>([^<]*)</),
  caption: t('qir.caption') };

/* 08 education */
S.education = { num:'08', numLabel:t('edu.num'), title:t('edu.title'),
  items: splitItems(secOf('academic'), '<div class="edu__row">').map(b => ({
    degree: t(one(b, /class="edu__deg" data-i18n="([^"]+)"/)),
    institution: one(b, /class="edu__inst"><span data-i18n="([^"]+)">/)
      ? all(b, /<span data-i18n="(cur\.[a-z]\.(?:title|place))">/g).map(m => t(m[1]))
      : [t(one(b, /class="edu__inst" data-i18n="([^"]+)"/))],
    years: (() => {
      const k = one(b, /class="edu__yrs"[^>]*data-i18n="([^"]+)"/);
      const plain = one(b, /class="edu__yrs">([^<]*)</);
      return k ? t(k) : { en: plain, bn: plain, ar: plain };
    })(),
    statusKey: statusOf(b)
  })) };

/* 09 aspirations */
const asp = secOf('aspirations');
S.aspirations = { num:'09', numLabel:t('asp.num'), title:t('asp.title'), sub:t('asp.sub'),
  items: all(asp, /<article class="aspire[^"]*"[^>]*>([\s\S]*?)<\/article>/g).map(m => ({
    name: t(one(m[1], /class="aspire__name" data-i18n="([^"]+)"/)),
    statusKey: statusOf(m[1]),
    paragraphs: all(m[1], /class="aspire__body" data-i18n="([^"]+)"/g).map(p => t(p[1]))
  })),
  pathLabel: t('asp.path'),
  path: all(asp, /<span class="path__node[^"]*" data-i18n="([^"]+)">/g).map(m => t(m[1])) };

/* 11 teaching + 12 judging */
const tea = secOf('teaching');
const judIdx = tea.indexOf('jud.num');
S.teaching = { num:'11', numLabel:t('tea.num'), title:t('tea.title'), sub:t('tea.sub'),
  items: splitItems(tea.slice(0, judIdx), '<div class="xp__row">').map(b => ({
    name: t(one(b, /class="xp__name" data-i18n="([^"]+)"/)),
    place: t(one(b, /class="xp__loc" data-i18n="([^"]+)"/)),
    years: (() => {
      const k = one(b, /class="xp__yrs"[^>]*data-i18n="([^"]+)"/);
      const plain = one(b, /class="xp__yrs">([^<]*)</);
      return k ? t(k) : { en: plain, bn: plain, ar: plain };
    })()
  })),
  levelsLabel: t('tea.levels'),
  levels: all(tea, /<span class="level__tag" data-i18n="([^"]+)">[\s\S]*?<ul>([\s\S]*?)<\/ul>/g).map(m => ({
    tag: t(m[1]),
    items: all(m[2], /<li data-i18n="([^"]+)">/g).map(li => t(li[1]))
  })) };
S.judging = { num:'12', numLabel:t('jud.num'), title:t('jud.title'), sub:t('jud.sub'),
  items: splitItems(tea.slice(judIdx), '<div class="xp__row">').map(b => ({
    name: t(one(b, /class="xp__name" data-i18n="([^"]+)"/)),
    years: (() => { const p = one(b, /class="xp__yrs">([^<]*)</); return { en: p, bn: p, ar: p }; })()
  })),
  areasLabel: t('jud.areas'),
  areas: all(tea.slice(judIdx), /<span class="chip" data-i18n="([^"]+)">/g).map(m => t(m[1])) };

/* 10 imam */
S.imam = { num:'10', numLabel:t('imam.num'), title:t('imam.title'), sub:t('imam.sub'),
  items: splitItems(secOf('imam'), '<div class="xp__row">').map(b => ({
    name: t(one(b, /class="xp__name" data-i18n="([^"]+)"/)),
    place: t(one(b, /class="xp__loc" data-i18n="([^"]+)"/)),
    years: (() => { const p = one(b, /class="xp__yrs">([^<]*)</); return { en: p, bn: p, ar: p }; })()
  })) };

/* 14 media + 13 engagement */
const med = secOf('media');
S.media = { num:'14', numLabel:t('med.num'), title:t('med.title'), sub:t('med.sub'),
  networks: all(med, /<span class="network">([^<]*)<\/span>/g).map(m => m[1].trim()),
  videos: all(med, /<a class="video" href="([^"]+)"[\s\S]*?class="video__label" data-i18n="([^"]+)"/g)
            .map(m => ({ href:m[1], label:t(m[2]) })) };
S.engagement = { num:'13', numLabel:t('eng.num'), title:t('eng.title'), sub:t('eng.sub'),
  items: splitItems(med, '<div class="country">').map(b => {
    return { flag: one(b, /class="country__flag"[^>]*>([^<]*)</),
             name: t(one(b, /class="country__name" data-i18n="([^"]+)"/)),
             event: t(one(b, /class="country__event" data-i18n="([^"]+)"/)),
             year: one(b, /class="country__year">([^<]*)</) };
  }) };

/* 15 gallery */
S.gallery = { num:'15', numLabel:t('gal.num'), title:t('gal.title'), note:t('gal.note'),
  filters: all(secOf('gallery'), /data-filter="([^"]+)"\s+data-i18n="([^"]+)"/g).map(m => ({ id:m[1], label:t(m[2]) })),
  items: gallery.map(g => ({ cat:g.cat, src:g.src||'', slot:g.slot, title:g.title, sub:g.sub })) };

/* 16 vision */
S.vision = { num:'16', numLabel:t('vis.num'), title:t('vis.title'), lead:t('vis.lead'), sub:t('vis.p2'),
  items: all(secOf('vision'), /<span class="vision-cell__num">([^<]*)<\/span>\s*<h3 class="vision-cell__title" data-i18n="([^"]+)">[^<]*<\/h3>\s*<p data-i18n="([^"]+)">/g)
    .map(m => ({ num:m[1].trim(), title:t(m[2]), text:t(m[3]) })) };

/* 17 contact */
const con = secOf('contact');
S.contact = { num:'17', numLabel:t('con.num'), title:t('con.title'), sub:t('con.sub'),
  roles: t('con.roles'),
  phone: { label:t('con.phone'), value:one(con, /href="tel:([^"]+)"/), display:one(con, /class="contact-line__v" href="tel:[^"]*" dir="ltr">([^<]*)</) },
  email: { label:t('con.email'), value:one(con, /href="mailto:([^"]+)"/) },
  based: { label:t('con.based'), value:t('con.based.v') },
  cta: t('con.cta'),
  onlineLabel: t('con.online'),
  socials: all(con, /<a class="social" href="([^"]+)"[\s\S]*?class="social__k">([^<]*)<\/span><span class="social__v">([^<]*)</g)
            .map(m => ({ href:m[1], network:m[2].trim(), handle:m[3].trim() })) };

/* 18 footer */
S.footer = { tag:t('footer.tag'), copy:t('footer.copy'), top:t('footer.top'),
  columns: all(html, /<h4 data-i18n="(footer\.[a-z]+)">/g).map(m => t(m[1])) };

fs.mkdirSync(path.join(ROOT, 'content'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'content/site.json'), JSON.stringify(site, null, 2) + '\n');

const n = o => Array.isArray(o) ? o.length : 0;
console.log('content/site.json written');
console.log('  nav %d · stats %d · awards %d · records %d · journey %d · studies %d',
  n(site.nav), n(site.stats), n(S.intl.items), n(S.natl.items), n(S.journey.items), n(S.current.items));
console.log('  education %d · aspirations %d · teaching %d · levels %d · judging %d · imam %d',
  n(S.education.items), n(S.aspirations.items), n(S.teaching.items), n(S.teaching.levels), n(S.judging.items), n(S.imam.items));
console.log('  networks %d · videos %d · countries %d · gallery %d · vision %d · socials %d',
  n(S.media.networks), n(S.media.videos), n(S.engagement.items), n(S.gallery.items), n(S.vision.items), n(S.contact.socials));
