# MD TARIQUL ISLAM — Personal Portfolio

Premium personal portfolio website for **MD TARIQUL ISLAM**
— International Qur'anic Reciter · Hafiz of the Qur'an · Qari · Qur'an Educator.

Built with **plain Node.js and zero npm dependencies**. Everything the site needs lives
in `public/`, so the same folder runs locally behind `server.js` *and* publishes as-is to
GitHub Pages, Netlify, Vercel or any static host.

---

## Run it locally

```bash
node server.js
```

Then open <http://localhost:4900>. To use a different port:

```bash
PORT=8080 node server.js
```

> **বাংলায়:** টার্মিনালে `node server.js` চালান, তারপর ব্রাউজারে `http://localhost:4900` খুলুন।

---

## Publish on GitHub Pages

1. Create an empty repository on GitHub (no README, no .gitignore).
2. From this folder:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment → Source: `GitHub Actions`**.

`.github/workflows/deploy.yml` then publishes `public/` on every push to `main`.
The site will be live at `https://<your-username>.github.io/<your-repo>/`.

All asset paths are **relative**, so the site works correctly under a repository
sub-path as well as at a domain root.

> **বাংলায়:** GitHub-এ খালি repository বানান → উপরের তিনটি কমান্ড চালান → Settings ›
> Pages › Source-এ **GitHub Actions** সিলেক্ট করুন। এরপর প্রতিবার push করলেই সাইট
> নিজে থেকে আপডেট হবে।

---

## Languages

The site ships in **English (default), বাংলা and العربية**, switchable from the header.

- English is written directly into `public/index.html`, so search engines and
  no-JavaScript visitors always get the full English page.
- Bangla and Arabic are overlays: `public/i18n/bn.json` and `public/i18n/ar.json`.
- Arabic automatically switches the whole page to right-to-left (`dir="rtl"`).
- The chosen language is remembered in `localStorage`; `?lang=bn` or `?lang=ar`
  also works for sharing a direct link.

### Editing or adding a translation

Every translatable element in `index.html` carries a `data-i18n="key"` attribute.
To change a Bangla string, find the same key in `bn.json` and edit its value.
To add a fourth language, copy `bn.json` to e.g. `ur.json`, translate the values, then
add `'ur'` to `SUPPORTED` in `public/js/i18n.js` and a button in the header.

Keys currently in use: **262**. To check a dictionary is complete:

```bash
node -e "const en=new Set(require('fs').readFileSync('public/index.html','utf8').match(/data-i18n=\"[^\"]*\"/g).map(s=>s.slice(11,-1))); const d=require('./public/i18n/bn.json'); console.log([...en].filter(k=>!(k in d)))"
```

---

## Adding your own content

### Portrait photograph

`public/assets/portrait.jpg` (896×1200, 3:4) is already in place and shown in the hero.

It was produced from the original photograph taken outside Al-Masjid an-Nabawi: the
background was replaced with a soft off-white wall carrying a low-relief Islamic
geometric pattern, and the harsh midday sun shadows were evened out. The subject —
face, beard, sunglasses, ghutra, igal and thobe — is unchanged from the original.

To swap in a different photo, overwrite `public/assets/portrait.jpg` with another 3:4
image and update the `width`/`height` attributes on the `<img>` in the hero of
`public/index.html` to match. The frame crops with `object-fit: cover`, so an image
that is not exactly 3:4 still fills it without distortion.

### Gallery photographs

1. Drop images into `public/assets/gallery/`.
2. Open `public/data/gallery.json` and set the matching entry's `"src"`, e.g.
   `"src": "assets/gallery/dubai-2017.jpg"`.

Each entry has a `cat` (`awards`, `studies`, `imam`, `competitions`, `teaching`,
`events`) that drives the filter buttons, plus `title` and `sub` captions in all three
languages. Set `"tall": true` for a portrait-shaped tile. No HTML changes needed.

### Videos

The three media tiles currently link out to the YouTube channel. To embed a clip
instead, replace a tile's `<a class="video">…</a>` in `index.html` with:

```html
<div class="video"><iframe src="https://www.youtube.com/embed/VIDEO_ID"
  title="Qur'an recitation" allowfullscreen loading="lazy"></iframe></div>
```

### Social preview image

Save a 1200×630 image as `public/assets/og-image.jpg` for link previews on
Facebook, WhatsApp and X.

### Before going live

Replace `https://example.com/` in `public/index.html` (the `canonical` tag),
`public/robots.txt` and `public/sitemap.xml` with the real domain.

---

## Content accuracy rules

The site deliberately distinguishes what has been **achieved** from what is **ongoing**
or **aspirational**. Please keep these status labels intact when editing:

| Item | Status shown |
|---|---|
| Hifz al-Qur'an | Completed |
| Dubai International Holy Qur'an Award 2017 | Achieved — 1st Place (Full Qur'an), 4th Place (Melody) |
| Kuwait International Qur'an Competition 2018 | Achieved — 9th Place |
| Sheikh Jassim Qur'an Competition 2023 | Participation |
| Al-Masjid an-Nabawi, Madinah | Ongoing |
| Holy Quran Academy, Sharjah | Ongoing |
| Qira'at studies | Ongoing |
| Islamic University of Madinah | Admission examination completed — result awaited |
| Qatar University | Future academic aspiration |

A future goal is never presented as completed education.

The official display name across the whole site is **MD TARIQUL ISLAM**. Other spellings
appear only where they belong to an external profile — the Wikipedia link uses
"Muhammad Tariqul Islam", the YouTube link "Hafez Tariqul Islam".

Academic education is listed in **chronological order** rather than the order it was
supplied in, so overlapping programmes read correctly.

---

## Project layout

```
server.js                  zero-dependency static server (local dev / self-hosting)
.github/workflows/         GitHub Pages deployment
public/                    ← the entire website; this is what gets published
  index.html               all sections, English copy, data-i18n keys
  404.html
  css/styles.css           design system, RTL support, responsive rules
  js/i18n.js               language engine (en default, bn/ar overlays)
  js/gallery.js            renders the gallery from data/gallery.json
  js/main.js               sticky header, mobile menu, scroll-spy, reveal
  i18n/bn.json             Bangla dictionary
  i18n/ar.json             Arabic dictionary
  data/gallery.json        gallery manifest (add photos here)
  assets/                  favicon, portrait, gallery images
  robots.txt · sitemap.xml
```

## Design system

Modern minimal: one typeface, hairline rules, generous whitespace, near-monochrome
with a single accent. No ornament, no drop shadows, no gradients.

| Token | Value | Use |
|---|---|---|
| Background | `#FDFDFC` | most sections |
| Alt background | `#F4F4F1` | alternating sections |
| Ink | `#0F1110` | headings and key text |
| Muted | `#767B78` | secondary text |
| Accent | `#1C5B43` | links, active states, the Qira'at panel |
| Dark | `#101512` / `#0A0E0C` | Vision section and footer |
| Typeface | Inter | everything (Noto Sans Bengali / Noto Sans Arabic per language) |
| Hairline | `rgba(15,17,16,.11)` | every divider, card edge and grid line |

Amiri is loaded for one element only — the calligraphic `القراءات العشر` in the Qira'at
panel. Headings are large and tightly tracked (`-0.032em`); Bangla and Arabic reset
tracking to zero and increase line-height, since tight tracking hurts both scripts.

Structure is built from **hairlines rather than cards** — lists, tables and grids share
one `border` treatment, and grid cells carry their own 1px ring (`box-shadow`) so an
incomplete row never leaves a stray filled block. Hover states change background or
border colour only; nothing moves. Animation is a single short fade-up, disabled
entirely under `prefers-reduced-motion`.

Section rhythm alternates background / alt-background, with exactly two dark moments —
**Vision** and the **footer** — so they carry weight without the page feeling heavy.

### Cache busting

`index.html` links assets as `css/styles.css?v=5`, `js/main.js?v=2` and so on. After
editing CSS or JS, bump that number so browsers pick the change up immediately instead
of serving a cached copy.

## Browser support

Modern Chrome, Safari, Firefox and Edge, including iOS Safari and Android Chrome.
The layout is tested from 375 px phones through tablets to wide desktops.
