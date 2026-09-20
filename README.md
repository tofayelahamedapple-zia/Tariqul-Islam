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

The hero is art-directed: two crops of the same photograph, each cut to the panel it
fills, so `object-fit: cover` has almost nothing left to trim.

| File | Size | Used by |
|---|---|---|
| `portrait-tall.webp` | 880×1577 (9:16) | the framed desktop panel, via `<source media="(min-width: 921px)">` |
| `portrait-wide.webp` | 1600×893 (16:9) | the 4:3 stacked frame below 921px — also the `<img>` fallback |
| `portrait.jpg` | 896×1200 (3:4) | the original crop; kept, not currently placed |
| `portrait-cutout.webp` | 900×939, transparent | subject cut out; kept for any flat-colour layout |

All four come from one source photograph taken outside Al-Masjid an-Nabawi. The
background was replaced with a soft off-white wall carrying a low-relief Islamic
geometric pattern and the harsh midday shadows were evened out; the two hero crops were
then produced by **outpainting** that image, so the subject's own pixels are untouched
and only the wall is extended. Face, beard, sunglasses, ghutra, igal and thobe are
unchanged from the original throughout.

To swap the hero photo, replace both webp files with your own 9:16 and 16:9 crops and
update the `width`/`height` on the `<source>` and `<img>` in `public/index.html`.

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

Warm espresso, terracotta sand and cream — an editorial system built around a
high-contrast serif and hairline rules. The palette is entirely warm: there is no
blue or grey anywhere, so the dark bands and the sand accent share one temperature.

| Token | Value | Use |
|---|---|---|
| Dark | `#231E18` | hero, Studies, Media, Vision, mission block |
| Darkest | `#17120E` | footer |
| Stone | `#3C3229` | Aspirations band |
| Sand | `#DC9A63` | accent — rules, pills, ranks, years, calligraphy |
| Sand deep | `#C8854E` | the same accent on cream backgrounds |
| Cream | `#FBF7F1` | default section background |
| Cream alt | `#F2EADF` | alternating sections |
| Ink / body | `#241F1A` / `#56493F` | headings, paragraphs |
| Muted | `#8C8077` | captions, secondary text |

**Texture.** One eight-point geometric tile — octagram, rotated square, centre circle —
is laid across every band at **5% opacity**, 80px. Two variants are held as tokens:
`--pattern-light` (cream stroke) for the dark bands and the footer, `--pattern-dark`
(espresso stroke) for the cream ones. It renders as a `::before` layer at `z-index: 0`
with each band's `.wrap` lifted to `z-index: 1`, so it never sits over content. To make
it stronger or fainter, change the single `opacity` on that rule.

**Type.** Display is **Fraunces** — a variable serif with optical sizing, set at weight
500 with tight tracking. Body is **Plus Jakarta Sans**. Fraunces covers Latin only, so
each script swaps its own display face through `--font-display` and `--display-weight`:
**Reem Kufi** (geometric kufi) for Arabic and **Hind Siliguri** for Bangla, both with
looser line-height. Body text swaps to **IBM Plex Sans Arabic** and **Hind Siliguri**
respectively. **Amiri** is loaded for one element only — the calligraphic
`القراءات العشر` in the Qira'at panel.

**Hero.** Two columns: the copy leads, the photograph sits in the trailing column
inside an **arabesque frame** — a sand rule with an eight-point star medallion at each
corner, drawn as a single `border-image` from the `--frame-arabesque` token (a 64×64
SVG sliced at 20, so the medallions render close to 1:1 against an 18px border). The
frame is symmetric, so RTL needs no flip. A four-figure **credential strip** — Hifz
year, Dubai placing, countries, years teaching — runs across the foot of the hero on a
hairline. Those four figures used to sit in the About column; they now appear once,
here, so About is purely narrative.

The copy is split into `.hero__head` (eyebrow, name, roles) and `.hero__body`
(paragraphs, buttons) with the photograph **between them in the document**. On desktop
that makes no difference — grid placement puts head and body in column 1 and the
photograph in column 2, centred across both rows. Below 920px the hero becomes a flex
column and the natural order puts the face directly under the name, where it is visible
without scrolling; the frame keeps a 4:3 crop there and the strip reflows to a 2×2.

**Components.** Section numbers are small caps followed by a short rule. Cards are
10px-radius with a 1px border that warms to sand on hover — nothing moves. Lists
(awards, education, imam, judging) are hairline rows. Gallery captions sit **beneath**
each frame in serif with a sand subtitle, magazine-style, rather than overlaying the
image. The headline award carries a 2px sand rule in the margin.

**Rhythm.** night (hero) → cream → cream-alt → cream → night (Studies + Qira'at) →
cream → slate (Aspirations) → cream → cream-alt → night (Media) → cream → night
(Vision) → cream-alt → darkest (footer).

### Cache busting

`index.html` links assets as `css/styles.css?v=16`, `js/main.js?v=2` and so on. After
editing CSS or JS, bump that number so browsers pick the change up immediately instead
of serving a cached copy.

## Browser support

Modern Chrome, Safari, Firefox and Edge, including iOS Safari and Android Chrome.
The layout is tested from 375 px phones through tablets to wide desktops.
