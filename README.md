# MD TARIQUL ISLAM — Personal Portfolio

Premium personal portfolio website for **MD TARIQUL ISLAM**
— International Qur'anic Reciter · Hafiz of the Qur'an · Qari · Qur'an Educator.

Built with **plain Node.js and zero npm dependencies**. Everything the site needs lives
in `public/`, so the same folder runs locally behind `server.js` *and* publishes as-is to
GitHub Pages, Netlify, Vercel or any static host.

Every word on the site lives in **`content/site.json`**, in all three languages. Edit it
through the admin, and `build.js` regenerates the page from it.

---

## Run it locally

```bash
node server.js
```

- Site: <http://localhost:4900>
- Admin: <http://localhost:4900/admin>

The admin opens a sign-in page; the password is `tariqul`. **Change it** by starting
the server with your own:

```bash
ADMIN_PASSWORD="your-password" node server.js
```

To use a different port: `PORT=8080 node server.js`.

> **বাংলায়:** `node server.js` চালান → সাইট `localhost:4900`, অ্যাডমিন `localhost:4900/admin`।
> পাসওয়ার্ড `tariqul`। বদলাতে উপরের `ADMIN_PASSWORD` কমান্ডটা ব্যবহার করুন।

---

## Editing the content

The admin is a form over `content/site.json`. Every section of the site has a page in
the left-hand list, and every repeatable thing — awards, milestones, qualifications,
mosques, countries, photographs, menu items, social links — can be **added, reordered,
duplicated and deleted**.

At the top there are three language tabs. Switch to বাংলা or العربية and every box shows
that language, with the English printed underneath for reference, so nothing drifts out
of sync. Photographs — the hero portrait and every gallery slot — can be uploaded
straight from the form.

**Earlier versions** in the left-hand list restores any of the last 20 published
versions. **Sign out** is in the top bar; a session lasts 12 hours, and restarting the
server ends it.

**Save & publish** writes `content/site.json` and immediately regenerates:

| Generated file | From |
|---|---|
| `public/index.html` | the English text, baked in so crawlers and no-JS visitors see the full page |
| `public/i18n/bn.json` · `ar.json` | the Bangla and Arabic overlays |
| `public/data/gallery.json` | the gallery |

Those four files are **build output — do not edit them by hand**, they are overwritten on
every save. The previous version of `site.json` is kept in `content/backups/` (last 20).

You can also edit `content/site.json` in a text editor and run `node build.js` yourself.

> **বাংলায়:** অ্যাডমিনে বাঁ দিকের তালিকা থেকে সেকশন বেছে নিন। উপরে তিনটে ভাষার ট্যাব —
> বাংলা বা আরবিতে গেলে প্রতিটা ঘরের নিচে ইংরেজিটা দেখা যাবে। যেকোনো তালিকায় জিনিস
> **যোগ, সরানো, নকল ও মুছে** ফেলা যায়। **Save & publish** চাপলেই সাইট নতুন করে তৈরি হয়।
> `public/` ফোল্ডারের index.html আর i18n ফাইলগুলো হাতে এডিট করবেন না — ওগুলো প্রতিবার
> সেভে নতুন করে লেখা হয়।

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

Use the admin — pick the language tab and type. The keys in `public/i18n/*.json` are
generated from the content tree, so editing those files directly is pointless: the next
save overwrites them.

To add a fourth language: add it to every string in `content/site.json`, teach `build.js`
to emit a dictionary for it, then add `'ur'` (or whichever) to `SUPPORTED` in
`public/js/i18n.js` and a button in the header of `build.js`.

Keys currently in use: **304**, and both dictionaries carry exactly those — `build.js`
emits them together, so they cannot drift apart. To confirm:

```bash
node -e "const en=new Set(require('fs').readFileSync('public/index.html','utf8').match(/data-i18n=\"[^\"]*\"/g).map(s=>s.slice(11,-1))); const d=require('./public/i18n/bn.json'); console.log([...en].filter(k=>!(k in d)))"
```

---

## Adding your own content

### Portrait photograph

One 3:4 crop fills the mihrab niche at every breakpoint, so `object-fit: cover` has
nothing left to trim. The other crops are kept as spares from earlier layouts.

| File | Size | Used by |
|---|---|---|
| `portrait-arch.webp` | 900×1200 (3:4) | **the mihrab niche in the hero, at every breakpoint** |
| `og-image.jpg` | 1200×630 | the social link preview |
| `portrait-tall.webp` | 880×1577 (9:16) | spare — the outpainted tall crop |
| `portrait-wide.webp` | 1600×893 (16:9) | spare — the outpainted wide crop |
| `portrait.jpg` | 896×1200 (3:4) | spare — the original crop |
| `portrait-cutout.webp` | 900×939, transparent | spare — subject on a transparent background |

All of these come from one source photograph taken outside Al-Masjid an-Nabawi. The
background was replaced with a soft off-white wall carrying a low-relief Islamic
geometric pattern and the harsh midday shadows were evened out; the wider and taller
crops were then produced by **outpainting** that image, so the subject's own pixels are
untouched and only the wall is extended. Face, beard, sunglasses, igal and thobe are
unchanged from the original throughout.

`portrait-arch.webp` is a 3:4 crop of the outpainted tall image, framed so the head sits
about a third down — that is what the arch wants. Its ghutra was re-draped to a
reference the client supplied: the two front edges hang straight down alongside the
cheeks and meet near the chin, with the fabric falling forward over the chest. That was
a reference-guided edit of the source portrait, then outpainted and cropped through the
same pipeline, so the composition matches the earlier version exactly.

To swap the hero photo, replace it with your own 3:4 image and update the `width`/`height` on the `.hero__img` in
`public/index.html`. Its `src` carries a `?v=` query; bump it after replacing the file.

### Gallery photographs

In the admin, open **15 Gallery** and use **Upload…** on any photograph slot; the file
lands in `public/assets/gallery/` and is selected for you. Add or delete slots with the
buttons on each card.

Each entry has a `cat` (`awards`, `studies`, `imam`, `competitions`, `teaching`,
`events`) that drives the filter buttons, plus `title` and `sub` captions in all three
languages. Every tile is **4:3**, cropped with `object-fit: cover`, so a photo of any
shape drops in without breaking the grid. No HTML changes needed.

### Videos

The three media tiles currently link out to the YouTube channel. To embed a clip
instead, replace a tile's `<a class="video">…</a>` in `index.html` with:

```html
<div class="video"><iframe src="https://www.youtube.com/embed/VIDEO_ID"
  title="Qur'an recitation" allowfullscreen loading="lazy"></iframe></div>
```

### Social preview image

`public/assets/og-image.jpg` (1200×630) is in place — the name, roles and the Dubai
placing set beside the portrait on the site's own dark panel. Replace the file to change
it; the dimensions are what Facebook, WhatsApp and X expect.

### Before going live

Replace `https://example.com/` in `public/index.html` (the `canonical` tag),
`public/robots.txt` and `public/sitemap.xml` with the real domain. Nothing else is a
placeholder.

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
content/site.json          ← every word on the site, in all three languages
content/backups/           last 20 versions, written on each save (not committed)
build.js                   renders the site from site.json
server.js                  zero-dependency server: serves public/ and hosts the admin
admin/                     the content editor and its sign-in page (never published)
tools/extract-content.js   one-off migration that created site.json
.github/workflows/         GitHub Pages deployment
public/                    ← generated. The entire website; this is what gets published
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

**Cards on the dark bands** are filled opaque (`--card-night` `#2E2924`, `--card-mid`
`#473C33`, plus their hover steps) rather than with a translucent white overlay. An
overlay let the texture read straight through the cards and left them looking muddy;
the opaque fills match what those overlays rendered as, so the weight is unchanged.

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

**Hero.** Two columns: the copy leads, the photograph sits in the trailing column cut
to a **mihrab niche** — the pointed prayer-niche arch of a mosque. The photograph is
clipped with an inline `<clipPath clipPathUnits="objectBoundingBox">` so the shape
scales with any size, and an overlaid SVG traces it with twin sand rules (2.4px outer,
1px inner) using `vector-effect="non-scaling-stroke"` so the line stays even. That SVG
carries `viewBox="0 0 300 400"` with `preserveAspectRatio="none"`, and `.hero__media`
is locked to `aspect-ratio: 3/4` at every breakpoint, so the ratios always match and
nothing distorts. The arch is symmetric, so RTL needs no flip. A four-figure
**credential strip** — Hifz
year, Dubai placing, countries, years teaching — runs across the foot of the hero on a
hairline. Those four figures used to sit in the About column; they now appear once,
here, so About is purely narrative.

The copy is split into `.hero__head` (eyebrow, name, roles) and `.hero__body`
(paragraphs, buttons) with the photograph **between them in the document**. On desktop
that makes no difference — grid placement puts head and body in column 1 and the
photograph in column 2, centred across both rows. Below 920px the hero becomes a flex
column and the natural order puts the face directly under the name, where it is visible
without scrolling; the niche narrows to 320px and centres there, and the strip reflows
to a 2×2.

**Components.** Section numbers are small caps followed by a short rule. Cards are
10px-radius with a 1px border that warms to sand on hover — nothing moves. Lists
(awards, education, imam, judging) are hairline rows. Gallery captions sit **beneath**
each frame in serif with a sand subtitle, magazine-style, rather than overlaying the
image. The headline award carries a 2px sand rule in the margin.

**Rhythm.** night (hero) → cream → cream-alt → cream → night (Studies + Qira'at) →
cream → slate (Aspirations) → cream → cream-alt → night (Media) → cream → night
(Vision) → cream-alt → darkest (footer).

### Cache busting

`index.html` links assets as `css/styles.css?v=21`, `js/main.js?v=2` and so on. After
editing CSS or JS, bump that number so browsers pick the change up immediately instead
of serving a cached copy.

## Checks

Run through these after a change; all of them passed at the last audit.

- **Routes** — every file resolves, and an unknown path returns the styled 404.
- **Dead CSS** — no selector in `styles.css` is left without a match in the HTML or JS.
  `sr-only` is the one deliberate exception, kept as an accessibility utility.
- **Assets** — nothing referenced is missing. Four portrait crops are kept as documented
  spares and are not referenced; everything else is in use.
- **i18n** — the Bangla and Arabic dictionaries carry exactly the keys the HTML uses:
  259 each, none missing, none orphaned. Switching to a language leaves no English
  behind except `gal.note`, which quotes a file path on purpose.
- **Languages** — English (Fraunces), Bangla (Hind Siliguri) and Arabic (Reem Kufi, RTL)
  each load their own display face and none overflow.
- **Widths** — 375, 768 and 1440 all report no horizontal overflow. The credential strip
  reflows 4 → 2 columns, the nav collapses to the menu button below 1040px.
- **Behaviour** — gallery filters, scroll-spy, the sticky header and the mobile menu all
  respond; all 50 reveal animations fire.
- **Content** — the status labels below are present and correctly assigned, and the
  display name is spelled `MD TARIQUL ISLAM` everywhere it appears as the name.
- **Admin round trip** — reading, editing, saving and rebuilding leaves the site correct;
  invalid JSON and content missing its `sections` block are refused without touching the
  published files.
- **Admin access** — signed out, `/admin` serves the sign-in page and every API call is
  refused; a wrong password is rejected; signing out invalidates the session. Restore
  refuses a filename that is not one of the kept backups, and uploads refuse any folder
  outside the two allowed ones. The published site is reachable throughout.

## Browser support

Modern Chrome, Safari, Firefox and Edge, including iOS Safari and Android Chrome.
The layout is tested from 375 px phones through tablets to wide desktops.
