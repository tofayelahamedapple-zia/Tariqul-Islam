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

The admin opens a sign-in page. The password is read from, in order:

1. the `ADMIN_PASSWORD` environment variable,
2. `content/.admin-password` — a one-line file, git-ignored, so the password never
   reaches GitHub,
3. the built-in fallback `tariqul`.

Set your own either way:

```bash
echo "your-password" > content/.admin-password
```

The server prints which of the three it used when it starts.

To use a different port: `PORT=8080 node server.js`.

> Content saved from the admin rebuilds the site immediately, but the running server
> holds `build.js` in memory — **restart it after editing `build.js`, `server.js` or
> the templates**, or the next admin save will regenerate the page from the old one.

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

## Publish on a Hostinger VPS

The whole application goes to the server — the site **and** the admin panel — so the
client edits the content in a browser and the pages rebuild themselves on the server.
Nothing but Node is needed; there are no dependencies to install.

### 1. Put the repository on GitHub

The deploy key for this project is `~/.ssh/tariqul_portfolio_deploy`. Add its public
half to the repository under **Settings › Deploy keys › Add deploy key**, and tick
**Allow write access** so pushes from this machine are accepted.

```bash
git remote add origin git@github-tariqul-portfolio:<user>/<repo>.git
git push -u origin main
```

`github-tariqul-portfolio` is an alias in `~/.ssh/config` that points at github.com
and forces that one key, so this repository never borrows another project's key.

### 2. Pull it onto the VPS

```bash
ssh root@<your-vps-ip>
git clone git@github.com:<user>/<repo>.git /var/www/tariqul
cd /var/www/tariqul
node -v            # must be 18 or newer
```

The VPS needs its own deploy key for a private repository: run `ssh-keygen -t ed25519
-C "vps"` there and add that public key to GitHub the same way.

### 3. Set the password and start it

```bash
printf '%s' '<the admin password>' > content/.admin-password
chmod 600 content/.admin-password

npm install -g pm2
PORT=4900 pm2 start server.js --name tariqul
pm2 save && pm2 startup
```

`content/.admin-password` is in `.gitignore` and never travels through the repository,
so it has to be written once on the server.

### 4. Put the domain in front of it

Point the domain's A record at the VPS, then have nginx pass `:80`/`:443` through to
`127.0.0.1:4900`, and issue a certificate with `certbot --nginx`. The application reads
`PORT` and `HOST` from the environment, so no code changes are needed.

### Updating later

```bash
cd /var/www/tariqul && git pull && pm2 restart tariqul
```

**One thing to watch.** Once the client starts editing through the admin panel, the
server's own `content/site.json` is the newest copy — a `git pull` would overwrite it.
Either edit only through the admin panel and pull the file back down before changing it
locally, or edit only locally and push. Do not do both at once.

> **বাংলায়:** VPS-এ পুরো অ্যাপটাই চলে — সাইট আর admin panel দুটোই। GitHub-এ deploy key
> বসান (write access সহ) → push করুন → VPS-এ clone করে `pm2` দিয়ে চালু করুন →
> পাসওয়ার্ড ফাইলটা সার্ভারে একবার লিখে দিন → nginx দিয়ে ডোমেইন বসান। পরে আপডেট করতে
> `git pull && pm2 restart`। **সাবধান:** client admin panel দিয়ে কিছু বদলানোর পর
> `git pull` করলে সেটা মুছে যাবে — তাই একসাথে দুই জায়গায় সম্পাদনা করবেন না।

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

### Which one a visitor sees first

English is the site's default. A visitor whose device reports a time zone in one of
the Arab countries of the Middle East opens the site in **Arabic** instead:

`Asia/Riyadh` · `Asia/Dubai` · `Asia/Qatar` · `Asia/Kuwait` · `Asia/Bahrain` ·
`Asia/Muscat` · `Asia/Aden` · `Asia/Baghdad` · `Asia/Amman` · `Asia/Damascus` ·
`Asia/Beirut` · `Asia/Gaza` · `Asia/Hebron` · `Africa/Cairo`

The time zone is the closest thing to a country a static page can read: it needs no
server, no IP lookup and no third-party service, and nothing about the visitor leaves
their browser. The list lives in `ARAB_ZONES` in `public/js/i18n.js` — add a zone there
to cover more countries.

The order of precedence is:

1. `?lang=en|bn|ar` in the address — so a shared link always opens as intended;
2. whatever this visitor last picked with the switcher (kept in `localStorage`);
3. Arabic in the zones above, English everywhere else.

Search-engine crawlers normally report UTC, so they index the English page.

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
| `wikipedia-logo.webp` | 128×128 | the Wikipedia mark on the contact card |
| `quran-rehal.png` | 760×573 | the Mushaf beside the About heading |
| `blog/*.png` | 1200×672 | blog post covers |
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

The hero band shows **one photograph at a time**, changing every 5.2 seconds with a
slow cross-fade. **Hero → Hero photographs** holds the list: upload 3:4 images and they
take their turn. A row of small bars beneath them shows which one is up and jumps
straight to any of them. With a single photograph the band simply holds it.

It pauses while the pointer is over it, and while the browser tab is in the background,
so nothing runs unseen.

Upload them as **16:9 banners**, not portraits. The band fills itself with
`object-fit: cover`, so a tall photograph would be cropped into; a wide one fills the
band edge to edge with no gaps at the sides. The three that ship are 1760×990.

The three that ship are his own photograph with the clothing and background changed.

**Which model does this matters.** `gpt_image_2_5` treats a reference photograph as
inspiration and redraws the face, so the man in the result is not him. `nano_banana_pro`
holds the face across the edit. Every candidate here was cropped to the face and put
beside the original before being chosen; the ones that had drifted were thrown away.
If these are regenerated, check the faces the same way. See **Pictures made with AI**.

> **বাংলায়:** **Hero → Hero photographs**-এ ৩:৪ অনুপাতের ছবি যোগ করুন। একটা করে ছবি
> দেখাবে, ৫ সেকেন্ড পর পর নিজে নিজে বদলাবে; মাউস রাখলে থেমে যাবে।

### Gallery photographs

In the admin, open **15 Gallery** and use **Upload…** on any photograph slot; the file
lands in `public/assets/gallery/` and is selected for you. Add or delete slots with the
buttons on each card.

Each entry has a `cat` (`awards`, `studies`, `imam`, `competitions`, `teaching`,
`events`) that drives the filter buttons, plus `title` and `sub` captions in all three
languages. Every tile is **4:3**, cropped with `object-fit: cover`, so a photo of any
shape drops in without breaking the grid. No HTML changes needed.

The grid shows **four photographs** (three on phones); the rest sit behind **See more**,
which re-counts every time a filter is picked — so a category with four or fewer photos
shows no button at all.

### Areas of focus, and their pages

**07 Qira'at → Areas of focus** holds one row per topic. Each is a chip in the Qira'at
section and a page of its own at `/focus/<address>.html`, with an Arabic name, a
one-line summary and as many paragraphs as you want, all in the three languages.

Ten ship with the site: Qira'at al-'Ashr, Riwayat, Usul al-Qira'at, Farsh al-Huruf,
Tajweed, Waqf & Ibtida', Maqamat and Ijazah & Sanad. Add a row and a ninth chip and
page appear; delete one and both go. `public/focus/` is rebuilt from scratch on every
save, so nothing in it should be hand-edited.

The calligraphy panel beside them uses `public/assets/qiraat-frame.png`, an illuminated
Mushaf frontispiece border. **The Arabic on it is live text in the Amiri font, not part
of the picture** — image models render Arabic script unreliably, so the border was
generated empty and the words are set over it. Replace the border freely; do not
replace it with one that has writing baked in.

> **বাংলায়:** **07 Qira'at → Areas of focus**-এ প্রতিটি বিষয়ের নিজস্ব পেজ তৈরি হয়।
> ক্যালিগ্রাফির আরবি লেখাটা ছবির অংশ নয় — ফন্টে বসানো, তাই সবসময় শুদ্ধ থাকে।

### Organisation logos

Six lists carry an optional **Organisation logo**: 04 International, 05 National,
06 Current studies, 09 Aspirations, 11 Teaching and 12 Judging. Upload a file and a
small mark appears beside that entry; leave it empty and the entry looks exactly as it
did before. Every logo sits on a white tile, so the same file reads on a cream card and
on the slate band behind the aspirations. A study card gets a wider tile than the rest,
because the marks that land there carry lines of script rather than a single emblem.

Eight ship with the site:

| Logo | Where it appears | Source |
|---|---|---|
| Dubai International Holy Qur'an Award | 04 International | mediaoffice.ae |
| Kuwait Ministry of Awqaf & Islamic Affairs | 04 International | awqaf.gov.kw — the ministry that runs the competition |
| PHP Qur'an-er Alo | 05 National, 12 Judging | Wikipedia (bn) |
| Circles of the Qur'an at the Prophet's Masjid | 06 Current studies | qm.edu.sa |
| Holy Quran Academy, Sharjah | 06 Current studies | holyquran.shj.ae |
| Islamic University of Madinah | 09 Aspirations | Wikipedia |
| Qatar University | 09 Aspirations | Wikimedia |
| Madrasa-tus-Suffa | 12 Judging | supplied by the client |
| Markazut Tahfiz Foundation | 11 Teaching, 12 Judging | tahfizbadda.com |
| Nashrul Quran Organization | 11 Teaching, 12 Judging | supplied by the client |

**Still missing: the Sheikh Jassim Qur'an Competition (Qatar) and Abu Jafor Academy.** These are the
organisations' own trademarks, used to identify them — the same footing as the
broadcasters' strip.

> **বাংলায়:** ছয়টা তালিকায় **Organisation logo** ফিল্ড আছে। খালি রাখলে আগের মতোই
> দেখাবে, ফাইল দিলে পাশে ছোট লোগো বসবে।

### The broadcasters' logo strip

**14 Media → TV networks** holds one row per channel: a **Channel** name and a **Logo**.
The strip drifts past below the video tiles, each logo on a light tile so a dark mark
and a pale one read the same against the section's dark background. Leave the logo
empty and that tile shows the channel's name set in the display face instead, so a
missing logo never leaves a gap.

All twelve logos ship with the site: nine taken from each broadcaster's own website,
Deepto TV's, Jamuna TV's and Somoy TV's from Wikimedia, and Asian TV's from a link the
client supplied. Each was trimmed of its padding and normalised to 120px tall; the whole
set is 384 KB. **They are the broadcasters' trademarks**, used
here only to identify the channels that carried his recitation — the same use as an
"as seen on" strip. Any broadcaster that objects can be reduced to a name tile by
clearing its logo field.

> **বাংলায়:** **14 Media → TV networks**-এ প্রতিটি চ্যানেলের নাম ও লোগো আছে। লোগো
> খালি রাখলে সেই টাইলে চ্যানেলের নাম দেখাবে — এখন Asian TV, Deepto TV ও Somoy TV
> সেভাবেই আছে, ওদের সাইটে পৌঁছানো যায়নি।

### The full Qur'an, juz by juz

**15 Full Qur'an → The thirty juz** holds one row per juz: a name in the three
languages, an optional caption, and a **Recording**. Leave the recording empty and the
tile shows **Soon** and cannot be clicked.

One `<audio>` element serves all thirty: picking a juz points it at that file, shows
the player bar at the top of the section and starts playing. When a juz finishes it
rolls on to the next one that has a recording.

#### Where to put the audio

The **Recording** field takes any of three things:

**Upload it here** — the button uploads straight into `public/assets/audio/`, with a
progress readout, up to **300 MB** a file. The server streams it to disk rather than
holding it in memory, and serves it with HTTP range requests, so seeking inside a long
recording works. This is the best option **if the site is hosted somewhere with disk
space** — a VPS or shared host. It will *not* work on GitHub Pages: a repository caps
files at 100 MB and 30 juz runs to well over a gigabyte. The folder is in `.gitignore`
for that reason, so the recordings never enter the repository.

**Paste a link to a proper audio host** — anything that serves the file directly, for
example `https://archive.org/download/…/juz-01.mp3`. Archive.org is free, has no size
limit, and supports range requests, which makes it the best fit when the site itself is
on GitHub Pages.

**Paste a Google Drive link** — a `drive.google.com/file/d/…/view` address is rewritten
at build time into the direct `uc?export=download&id=…` form, so it will play. Be aware
of what Drive does to a large file, though: it has no proper range support, so **seeking
inside a recording will not work**, it interposes a virus-scan warning page above a
certain size, and it rate-limits a file that gets popular. It is fine for trying things
out and poor as the permanent home.

> **বাংলায়:** তিনটা উপায়ই কাজ করে — (১) **Upload…** দিয়ে সাইটে আপলোড (৩০০ MB পর্যন্ত,
> তবে GitHub Pages-এ হোস্ট করলে চলবে না), (২) archive.org-এর মতো আসল অডিও হোস্টের লিংক
> — **এটাই সবচেয়ে ভালো**, (৩) Google Drive-এর লিংক — চলবে, কিন্তু মাঝখানে টেনে এগোনো
> (seek) কাজ করবে না আর ফাইল বড় হলে Drive সতর্কবার্তার পেজ দেখায়।

### Blog

Add them in the admin: **14 Media → Video tiles → Add**. Each tile takes a caption in
all three languages and a **Video link** — paste the YouTube, Facebook or channel URL
and Save; the page is rebuilt straight away. Reorder with ↑ ↓, duplicate with ⧉,
remove with ✕.

The section shows **four tiles** (three on phones). Anything beyond that sits behind
the **See more** button, which appears on its own once a fifth video exists and
disappears again if you delete back down to four.

The four tiles currently link out to the YouTube channel. To embed a clip inline
instead of linking away, give that video an `embed` URL in `content/site.json`:

```json
{ "href": "https://www.youtube.com/watch?v=VIDEO_ID",
  "embed": "https://www.youtube.com/embed/VIDEO_ID",
  "label": { "en": "…", "bn": "…", "ar": "…" } }
```

> **বাংলায়:** অ্যাডমিনে **14 Media → Video tiles → Add** — ক্যাপশন তিন ভাষায় আর
> **Video link**-এ ভিডিওর লিংক দিন। চারটির বেশি হলে **See more** বোতামটা নিজেই চলে আসে।

### Social profiles

**17 Contact → Social profiles** holds them. Each row has:

- **Show this profile on the site** — untick to hide it from the contact card, the
  footer and the `sameAs` search-engine data, without losing the link. Tick it again
  to bring it back.
- **Network** — this name picks the brand icon, so spell it exactly: `YouTube`,
  `Facebook`, `Instagram`, `Telegram`, `Spotify`, `LinkedIn` or `Wikipedia`. A name outside that
  list still works, it just shows no icon; add its mark to `SOCIAL_ICONS` in
  `build.js` to give it one.
- **Shown as** — the handle or page name the card displays.
- **Link** — the profile URL.

Wikipedia is deliberately left out of the footer and of `sameAs`, since it is a
reference about him rather than a profile he runs.

Five of the marks are inline SVG in `build.js`. The Wikipedia one is the real puzzle
globe, saved locally as `public/assets/wikipedia-logo.webp` (128×128, transparent) —
made from [Wikipedia-logo-v2.svg](https://commons.wikimedia.org/wiki/File:Wikipedia-logo-v2.svg)
on Wikimedia Commons. It is a Wikimedia Foundation trademark, shown here only to label
the link to his article.

> **বাংলায়:** **17 Contact → Social profiles**-এ প্রতিটি প্রোফাইলের পাশে একটা চেকবক্স
> আছে — টিক তুলে দিলে সেটা সাইট থেকে লুকিয়ে যায়, ডিলিট করতে হয় না।

### Blog posts

**17 Blog → Posts** holds them. Each post has:

- **Published** — unticked, the post is kept in `site.json` but no page is generated
  and nothing about it appears on the site. This is how you draft.
- **Address** — the post is served at `/blog/<address>.html`, so keep it to letters,
  numbers and hyphens.
- **Date** — `YYYY-MM-DD`. It is printed in each language's own numerals
  (10 September 2026 · ১০ সেপ্টেম্বর, ২০২৬ · ١٠ سبتمبر ٢٠٢٦).
- **Cover picture**, **Title**, **Summary**, and **Paragraphs** — the body, one
  translatable paragraph per row.

Saving regenerates `public/blog/`: an index at `/blog/` listing every published post,
one page per post, and the Bangla and Arabic dictionaries those pages load. The home
page shows the newest four with a link through to the index.

`public/blog/` is rebuilt from scratch on every save, so do not hand-edit anything in
it — unpublishing a post deletes its page.

> **বাংলায়:** **17 Blog → Posts**-এ লেখা যোগ করুন। **Published** টিক না দিলে লেখাটা
> ড্রাফট হিসেবে থাকে, সাইটে আসে না।

### Social preview image

`public/assets/og-image.jpg` (1200×630) is in place — the name, roles and the Dubai
placing set beside the portrait on the site's own dark panel. Replace the file to change
it; the dimensions are what Facebook, WhatsApp and X expect.

### Pictures made with AI

Four pictures on this site were generated rather than photographed, and one was
altered. They are listed here so nobody has to guess:

| File | What it is |
|---|---|
| `portrait-1/2/3.webp` | **His own photograph, edited.** From the photograph the client supplied: the clothing changed to a thobe, ghutra, agal and bisht, and the background to an old Arabian village thrown out of focus. Made with **Nano Banana Pro**, which holds a face across an edit — every candidate was compared against the original before being used |
| `portrait-real.webp` | the same photograph with **nothing changed but the canvas**, widened to 16:9. Kept as the unedited alternative — point the hero at it in the admin and the site uses the plain photograph |
| `quran-rehal.png` | a generated photograph of a Mushaf on a rehal, background removed |
| `qiraat-frame.png` | a generated illumination border — deliberately empty, the Arabic over it is live text |
| `blog/*.png` | two generated photographs used as blog covers |

The hero portraits are the ones worth a decision: they are a wardrobe and background
edit of a real photograph of a real person. That is ordinary retouching for a portfolio
**as long as he is happy with it** — show him before the site goes live. `portrait.jpg`
is still in `public/assets/`, so going back to the original is one field in the admin.

### Starter blog posts — read these before launch

Two posts ship written in all three languages, on beginning Tajweed and on keeping
hifz alive. **They were drafted by the developer, not by MD Tariqul Islam.** They are
published so the blog can be seen working; read them and either rewrite them in his own
words or untick **Published** before the site goes live.

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
| Strip | `#322B23` | the hero's credential band, a step up from the hero so it reads as its own surface |
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

`build.js` carries three counters at the top: `CSS_V`, `JS_V` and `IMG_V`. Bump the one
that matches what changed and every link to it gains a fresh `?v=`. `IMG_V` is the one
to remember when a photograph is **replaced under the same filename** — the file is
served with a week of cache, so without it visitors keep the old picture.

`index.html` links assets as `css/styles.css?v=21`, `js/main.js?v=2` and so on. After
editing CSS or JS, bump that number so browsers pick the change up immediately instead
of serving a cached copy.

## Motion

Six pieces of movement, all of them tied to what the visitor is doing rather than
running on a timer:

| | |
|---|---|
| **Reading progress** | a 2px sand rule across the top of the header, drawn to how far down the page you are |
| **Staggered grids** | the children of a grid arrive one after another, 65ms apart, capped at ten steps so a thirty-tile grid does not leave the last one waiting |
| **Counting figures** | the hero figures count up the first time they are scrolled into view; `1st` is left alone, because an ordinal counting from zero reads as "0st" |
| **Drawing rules** | the short rule beside each section number draws itself out from the start edge, mirrored in Arabic |
| **Hero cross-fade** | one photograph at a time, changing every 5.2 seconds, paused on hover and on a hidden tab |
| **Broadcaster strip** | the channel logos drift past below the videos on a seamless loop, paused on hover |
| **Lifting Mushaf** | the cut-out beside the About heading lifts a few pixels as the section arrives |

Anything already scrolled past counts as seen, so jumping straight to `#contact`
never leaves the sections above it blank.

**All of it is off under `prefers-reduced-motion: reduce`** — the progress bar is
hidden, the portrait stops, and everything that fades in is simply there. The figures
show their final values rather than counting. Nothing is hidden behind an animation
that a visitor cannot switch off.

> **বাংলায়:** ছয় রকম মুভমেন্ট আছে, সবই স্ক্রল করার সাথে যুক্ত — টাইমারে চলে না। যার
> ডিভাইসে "reduce motion" চালু, তার কাছে সব স্থির দেখাবে, কিছুই লুকোবে না।

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
