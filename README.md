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

Two derivatives of the original photograph (taken outside Al-Masjid an-Nabawi) ship with
the site, both produced with Higgsfield from the same source:

- `public/assets/portrait-cutout.webp` (900×939, 75 KB) — subject cut out on a
  transparent background. **This is the one the hero arch uses.**
- `public/assets/portrait.jpg` (896×1200, 3:4) — the same subject on a soft off-white
  wall with a low-relief Islamic geometric pattern. Not currently placed; keep it for a
  future About or press section.

In both, the harsh midday sun shadows were evened out to diffused light, and the subject
— face, beard, sunglasses, ghutra, igal and thobe — is unchanged from the original.

To swap the hero photo, replace `portrait-cutout.webp` with another transparent-background
cut-out and update the `width`/`height` on the `.arch__img` in `public/index.html`.

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

Deep green and gold, condensed display type, rounded cards and pill buttons —
the UI language of [tofayelahamed.com](https://tofayelahamed.com), adapted to this
subject rather than copied: different wordmark, different mark, its own palette
weighting and its own section rhythm.

| Token | Value | Use |
|---|---|---|
| Deep green | `#16291F` | hero, media section, feature cards |
| Darkest | `#0F1E17` | footer |
| Teal green | `#0E5F52` | sticky header, Aspirations band, solid buttons on light |
| Gold | `#F2CE4B` | accent — squiggle, arch, pills, years, play buttons |
| White | `#FFFFFF` | default section background, cards |
| Mint | `#F1F6F4` | alternating sections |
| Body text | `#3C5B51` / muted `#6F8B82` | paragraphs, captions |

**Type.** Display is **Staatliches** — a condensed all-caps face, set with
`text-transform: uppercase`. Staatliches is Latin-only, so each script swaps in its own
display face through the `--font-display` and `--display-case` variables: **Cairo** (700)
for Arabic and **Noto Sans Bengali** (700) for Bangla, both with uppercasing turned off
and looser line-height. Body text is **Inter**, swapping to the matching Noto face per
language. **Amiri** is loaded for one element only — the calligraphic `القراءات العشر`.

**Components.** Cards are 16px-radius on white with a 1px-soft shadow, lifting 3px on
hover. Buttons are full pills: gold on dark sections, teal on light. Section numbers are
pill badges rather than plain labels. Gallery captions are always visible over a gradient,
in Staatliches with a gold subtitle. The hero portrait is a **cut-out subject on a flat
gold arch** (`border-radius: 9999px 9999px 16px 16px`), with a hand-drawn gold underline
beneath the name.

**Rhythm.** white → mint → white → mint → white → teal (Aspirations) → white → mint →
deep green (Media) → mint → deep green (Vision) → white → darkest (footer).

### Cache busting

`index.html` links assets as `css/styles.css?v=7`, `js/main.js?v=2` and so on. After
editing CSS or JS, bump that number so browsers pick the change up immediately instead
of serving a cached copy.

## Browser support

Modern Chrome, Safari, Firefox and Edge, including iOS Safari and Android Chrome.
The layout is tested from 375 px phones through tablets to wide desktops.
