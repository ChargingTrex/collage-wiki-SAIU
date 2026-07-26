# BUILD BRIEF — Sai University Club & Event Wiki

**Audience:** Claude Code (implementation agent).
**Purpose:** everything needed to scaffold and build this project. This is a
*decisions* document, not a discussion. Where something is genuinely unresolved,
it is marked **⚠ BLOCKER — ask the user**. Do not invent an answer for those.

Design deliberation and rejected alternatives are in **Appendix C** and can be
ignored for implementation. Read them only if a decision seems arbitrary.

### Required companion docs (read first — provided alongside this brief)

Two documents were authored separately and are **authoritative**; where they
conflict with this brief, they win:

1. **`scholar-design-system-hybrid (1).md`** *(delivered as
   `scholar-design-system-hybrid__1_.html`)* — the design system to follow:
   a Scholar-derived `--ds-*` token system. Verified anchors: primary
   `#3b6af5` (blue), secondary `#f77f0e` (orange), accent `#218A5E` (green),
   with full light/dark ramps, semantic colors, spacing/radius/shadow tokens.
   Typography is a **hybrid** of the two Scholar type systems (Playfair
   Display / Spectral / Inter / JetBrains Mono blended with Space Grotesk /
   IBM Plex) — follow the doc's exact `--ds-font-*` definitions. **This is the
   chosen visual direction; blocker #1 is resolved.** Map these `--ds-*` tokens
   onto Infima (`--ifm-color-primary` etc.) in `custom.css`.
2. **`saiu-collage-wiki-easter-egg.md`** — a hidden **Chrome dino game**: a 🦖
   button in the footer opens the runner in a full-screen overlay (click
   anywhere to close), with a "charging trex..." hover tooltip. Built by
   swizzling `Footer --wrap` + the `react-chrome-dino` package. Not decorative
   motion — an actual playable overlay. Integration in §9.

If either doc is missing from the handoff, **stop and ask the user** rather than
guessing its contents.

### Source documents & precedence

This brief is the entry point, but it does not replace the two foundational docs
from the project. Read them; where they carry more detail, they are authoritative:

- **`sai-uni-wiki-spec.md`** — the canonical project spec. **Authoritative for:**
  the exact directory structure, the 18-club roster and route slugs, the
  original `src/pages/index.js` homepage code, the Decap CMS `static/admin`
  setup, image co-location rules, and the `docusaurus.config.js` deploy block.
  Where this brief summarizes any of those, the spec is the source of truth.
- **`sai-uni-wiki-motion-guide.md`** — the original animation guide. Its 18
  club-hero *implementations* are **superseded** by the rebuilt components in §4
  (do not use the old spinning-icon versions). But it remains **authoritative
  for several components that were never rebuilt and may still be wanted:**
  `ThemeToggle` (sun/moon), `SplitText`, `ScrambleText`, the handwriting/
  calligraphy pieces (`AnimatedSignature`, `HandwrittenCallout`), the
  `ScrollHighlightText` scroll-reveal, and the `CoverflowCarousel` for event
  galleries. It's also the port-source for `TuringitesHero` (§5 step 6). Treat
  its font-import CSS and the `.mdx` embedding examples as still valid.

**Precedence, highest first:** the two companion docs above
(`scholar-design-system-hybrid`, `saiu-collage-wiki-easter-egg`) → this brief →
`sai-uni-wiki-spec.md` → `sai-uni-wiki-motion-guide.md` → `animation-caveats.md`
(for rationale) → Appendix C (history, ignorable).

---

## 0. TL;DR — what you're building

A Docusaurus v3 wiki for Sai University, Chennai: 18 student clubs, 400+
archived events, hosted on GitHub Pages, editable by non-technical club leads
via Decap CMS. The distinctive feature is a set of **23 custom animated hero
components** (18 clubs + Library + Archives + 3 fests), each built around the
club's actual activity rather than a spinning icon. All animations follow one
shared playback rule and one shared accent-color system.

**Build order:** §5. **Files you already have:** §4. **Blockers to resolve
first:** §1.

---

## 1. ⚠ BLOCKERS — resolve with the user before/early in the build

1. **Site palette / design system.** Follow **`scholar-design-system-hybrid
   (1).md`** — it is the chosen direction and supersedes the Marginalia/Scholar
   explorations in Appendix C. Build `custom.css` and all component styling from
   that doc. (If that doc is absent from the handoff, this reverts to a blocker:
   ask the user which of the Appendix C.1 palettes to use.)
2. **Two incompatible animation systems exist.** `motion.css` + `motion.js`
   (pure-CSS, Infima) were built early; ALL 23 hero components use Framer
   Motion. **Framer Motion is the live decision** — treat `motion.css`/`motion.js`
   as deprecated unless the user says otherwise. Confirm, then delete or keep.
3. **Tailwind + Shadcn are in the stack but unused.** The hero components use
   Tailwind utility classes (so Tailwind is required). Shadcn is specced but no
   component uses it yet. Confirm whether to wire Shadcn now or defer.
4. **Audio files don't exist** and are a licensing matter (§7). The player is
   built; the files are the user's to supply.

---

## 2. Project overview

- **Institution:** Sai University, Chennai
- **Repo:** `sai-uni-wiki`
- **Scale:** 18 clubs, 400+ archived events, ~2 new events/month/club
- **`/docs`** = permanent structured pages (constitutions, exec boards, directories)
- **`/blog`** = chronological event posts
- **Images co-located** with their markdown (`index.md` + photos in same folder)
  so Docusaurus auto-compresses them and URLs never break
- **Decap CMS** at `/admin` so club leads publish without touching Git

---

## 3. Tech stack & setup

```
Docusaurus v3          (core)
Tailwind CSS           (via docusaurus-plugin-tailwindcss) — REQUIRED by heroes
Shadcn UI              (Radix primitives) — specced, not yet used (blocker #3)
framer-motion          (all hero animations)
lucide-react           (icons within heroes)
Decap CMS              (/admin editing)
GitHub Pages           (hosting)
```

Setup commands:
```bash
npx create-docusaurus@latest sai-uni-wiki classic
cd sai-uni-wiki
npm install framer-motion lucide-react
npm install react-chrome-dino   # footer easter-egg game (§9)
npm install -D tailwindcss postcss autoprefixer docusaurus-plugin-tailwindcss
npx shadcn@latest init   # Default style, Slate neutral, CSS variables = Yes
npm run start
```

Add to `docusaurus.config.js`:
```js
plugins: ['docusaurus-plugin-tailwindcss'],
clientModules: [/* see blocker #2 before adding motion.js */],
```

Deploy config:
```js
url: 'https://sai-university.github.io',
baseUrl: '/',
organizationName: 'sai-university',
projectName: 'sai-uni-wiki',
deploymentBranch: 'gh-pages',
```
Deploy: `cmd /C "set GIT_USER=YOUR_GITHUB_USERNAME && npm run deploy"`

Fonts — add to top of `custom.css` (handwriting faces used by Literary and
optional blog components):
```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&display=swap');
```

---

## 4. File inventory (already produced — integrate these)

### Infrastructure (required by every hero)
| File | Target location | Purpose |
|---|---|---|
| `useIntroMotion.js` | `src/components/` | Shared playback rule (see §6) |
| `clubAccents.js` | `src/components/` | 18-club color registry |
| `useClubAccent.js` | `src/components/` | Accent resolution + unified-mode hook |
| `Book.jsx` | `src/components/primitives/` | `Book` + `Shelf` SVG primitives |
| `FestSound.jsx` | `src/components/fests/` | Shared click-to-play audio control |

### Hero components (23)
Clubs (`src/components/clubs/`): `AnimalWelfareHero`, `ArtHero`,
`AstronomyHero`, `DanceHero`, `EntrepreneurshipHero`, `FashionHero`,
`FilmSocietyHero`, `FossHero`, `GamingHero`, `GardeningHero`, `LiteraryHero`
(use `LiteraryHero-fontmask.jsx`), `MartialArtsHero`, `MusicHero`,
`OratoryHero`, `PhotographyHero`, `ScienceHero`, `TheatreHero`,
`TuringitesHero` (**not yet rebuilt — see §5 step 6**).

Library/Archives (`src/components/`): `LibraryHero` (use `LibraryHero-v2.jsx`),
`ArchivesHero`.

Fests (`src/components/fests/`): `TechFestHero`, `GeneralFestHero`,
`CulturalFestHero`.

**Rename on integration:** `LibraryHero-v2.jsx` → `LibraryHero.jsx` (delete the
old one); `LiteraryHero-fontmask.jsx` → `LiteraryHero.jsx` (delete the old
squiggle version).

### Homepage & styling
| File | Note |
|---|---|
| `index.js` | Original homepage from spec — 18 hardcoded ClubCards, native `.card`/`.button`, inline styles. **Needs reconciling** with the hero components and chosen palette. |
| `custom.css` | Marginalia palette — only use if Marginalia is chosen (blocker #1) |
| `scholar-custom.css` / `scholar-custom-old.css` | Scholar palettes — only if Scholar chosen |
| `preview.html`, `scholar-design-system*.html` | Standalone design references, not shipped |

### Deprecated (see blocker #2)
`motion.css`, `motion.js`, `motion-notes.md` — pre-Framer-Motion. Likely delete.

### Reference docs (context, not shipped)
`sai-uni-wiki-spec.md`, `sai-uni-wiki-motion-guide.md` (original guide, partly
superseded), `animation-caveats.md` (the authoritative open-issues log),
`traced-handwriting-guide.md`, `HANDOFF.md`, `design-system.md`.

---

## 5. Build order

1. **Resolve blockers §1** with the user (at minimum: palette + confirm Framer).
2. **Scaffold** Docusaurus + Tailwind + fonts (§3).
3. **Write `custom.css`** following **`scholar-design-system-hybrid (1).md`**,
   including the accent bridge:
   ```css
   :root            { --club-accent: var(--club-accent-light); }
   [data-theme='dark'] { --club-accent: var(--club-accent-dark); }
   ```
4. **Drop in infrastructure** (§4 infrastructure table). Verify `useIntroMotion`
   and `useClubAccent` import paths resolve.
5. **Integrate the 22 built heroes.** Each is self-contained; wire one club page
   as a smoke test before doing all 18.
6. **Build the one missing hero: `TuringitesHero`.** The original
   terminal-with-blinking-cursor was assessed as already good; either port it
   from `sai-uni-wiki-motion-guide.md` into the current pattern (accent hook +
   `useIntroMotion` + hover replay) or ask the user if they want it redesigned.
   The Tech Fest terminal is a good reference for the styling.
7. **Club pages** — create `docs/clubs/<slug>.mdx` for all 18 (slugs in §8, and
   canonically in `sai-uni-wiki-spec.md`), each importing and rendering its hero
   at the top.
8. **Homepage** — the original `src/pages/index.js` is in `sai-uni-wiki-spec.md`
   (also delivered as `index.js`). Reconcile it with the chosen palette and link
   cards to the club pages. Decide whether cards show mini-heroes or stay static.
9. **Fests** — place the 3 fest heroes on their pages; wire `audioSrc` once the
   user supplies audio (§7).
10. **Blog + Decap CMS + co-located images** per §2 and `sai-uni-wiki-spec.md`.
11. **Footer easter egg** — build per `saiu-collage-wiki-easter-egg.md` (§9).
12. **Optional extras from `sai-uni-wiki-motion-guide.md`** (not yet built,
    build if wanted): `ThemeToggle`, `SplitText`/`ScrambleText` for headings,
    handwriting components + font imports for blog posts, `ScrollHighlightText`,
    and `CoverflowCarousel` for event photo galleries. Port each into the §6
    conventions (accent hook, `useIntroMotion`, reduced-motion) as you go.
13. **Infra polish** — settings toggle UI (§6), off-screen pause (§6), then
    deploy.

---

## 6. The two shared systems (read before touching heroes)

### Playback rule — `useIntroMotion`
Every hero animates **while the reader is arriving**, then goes still once they
scroll / click / key / touch. Hovering replays from the start. Contract:
```jsx
const { isPlaying, isHovered, hoverProps } = useIntroMotion();
<div {...hoverProps}>
  <motion.g key={isHovered ? 'hover' : 'intro'}
            animate={isPlaying ? 'playing' : 'rested'} variants={...} />
</div>
```
Decisions baked in: no auto-restart on scroll-to-top; mid-page landings never
play the intro; hover is pointer-only (excludes touch); `prefers-reduced-motion`
gets rested state and hover doesn't override it.

**⚠ Not yet built — off-screen pause.** Many heroes loop (Science, Gaming, Art,
Music, Dance, Oratory, Film). On the directory page they'll all animate off
screen. Extend `useIntroMotion` with an `IntersectionObserver` to pause when
off-screen — **do this once in the hook**, not per component. Highest-value
infra task.

### Accent color — `useClubAccent`
Each club has its own accent (default); a settings toggle switches to **unified
mode** (everything = site palette, motion still differs). Colors are CSS custom
properties, so unified mode is one variable swap. Contract:
```jsx
const { accentStyle, accentName, isUnified } = useClubAccent('astronomy-club');
<div style={accentStyle}><circle fill="var(--club-accent)" /></div>
```
Also exports `useAccentMode()` → `{ mode, setAccentMode }`.

**⚠ Not yet built — the settings UI.** The hook + localStorage layer exist;
nothing calls `setAccentMode`. Build a toggle (navbar item or settings page).
Note: hook always renders `per-club` on first paint to avoid hydration
mismatch, and fires a `sai-accent-change` event on change (because `storage`
events don't fire in the originating tab).

**⚠ Some heroes intentionally ignore unified mode** (Gaming's 2nd ghost, Art's
color cycle, Fashion's gold, fest festive palettes) — the color IS the concept
there. Unified mode won't fully flatten them. Decide with user: accept, or build
mono variants.

---

## 7. Audio

`FestSound.jsx` (fests) and `MusicHero`'s built-in control are click-to-play,
**never autoplay**, and render only if an `audioSrc` is passed. Each fest takes
its OWN file:
```jsx
<TechFestHero     audioSrc="/audio/innovision-theme.mp3" />
<GeneralFestHero  audioSrc="/audio/fest-fanfare.mp3" />
<CulturalFestHero audioSrc="/audio/vibrance-anthem.mp3" />
<MusicHero        audioSrc="/audio/music-club-sample.mp3" />
```
**⚠ Files are the user's to supply** — cannot be generated, and recognizable
tracks on a public site are a licensing risk. Use royalty-free (Pixabay Music,
incompetech, Free Music Archive) or club-made audio. Animation-synced SFX
(keystroke clicks, shutter, confetti pop) are a separate, unbuilt feature.

---

## 8. The 18 clubs — slugs & routes

| # | Club | Slug (`/docs/clubs/<slug>`) | Accent |
|---|---|---|---|
| 1 | Literary Club | `literary-club` | Sepia |
| 2 | Art Club | `art-club` | Fuchsia |
| 3 | Dance Club | `dance-club` | Rose |
| 4 | Gardening Club | `gardening-club` | Green |
| 5 | Astronomy Club | `astronomy-club` | Indigo |
| 6 | Theatre Club | `theatre-club` | Purple |
| 7 | Photography Club | `photography-club` | Cyan |
| 8 | Gaming Club | `gaming-club` | Violet |
| 9 | Oratory Club | `oratory-club` | Blue |
| 10 | Entrepreneurship Club | `entrepreneurship-club` | Emerald |
| 11 | Fashion Club | `fashion-club` | Pink |
| 12 | Science Society | `science-society` | Teal |
| 13 | Music Club | `music-club` | Orange |
| 14 | Film Society | `film-society` | Crimson |
| 15 | Turingites CS Society | `turingites-computer-science-society` | Terminal |
| 16 | Animal Welfare Society | `animal-welfare-society` | Amber |
| 17 | Martial Arts Club | `martial-arts-club` | Red |
| 18 | FOSS Club | `foss-club` | Sky |

(Accent hex values in `clubAccents.js`.)

---

## 9. Footer easter egg — hidden Chrome dino game

Build per **`saiu-collage-wiki-easter-egg.md`** (authoritative — follow its
code). It's a 🦖 icon in the footer that opens the classic Chrome dino runner
in a full-screen overlay on top of the current page (no navigation), click
anywhere to close, with a "charging trex..." tooltip on hover.

```bash
npm install react-chrome-dino
npm run swizzle @docusaurus/theme-classic Footer -- --wrap
```

The doc's `src/theme/Footer/index.js` wraps (not replaces) the default footer,
adds a fixed-position 🦖 button, and conditionally renders `<ChromeDinoGame />`
in an overlay. Decisions left open in the doc, confirm with user if it matters:
floating corner icon (visible always, more discoverable) vs. in-flow (only at
scroll bottom, more "hidden"); whether to keep the hover tooltip; and whether to
restyle the plain inline styles to the chosen palette or leave it theme-agnostic
as a hidden joke. **Verify `react-chrome-dino` builds against the site's React
version** (Docusaurus v3) — the doc flags it as a possible risk.

---

## Appendix A — directory structure (target)

```
sai-uni-wiki/
├── docusaurus.config.js
├── tailwind.config.js
├── sidebars.js
├── static/
│   ├── admin/index.html          # Decap CMS
│   ├── audio/                     # user-supplied fest/music audio
│   └── img/
├── src/
│   ├── css/custom.css            # chosen palette + accent bridge
│   ├── components/
│   │   ├── useIntroMotion.js
│   │   ├── useClubAccent.js
│   │   ├── clubAccents.js
│   │   ├── primitives/Book.jsx
│   │   ├── LibraryHero.jsx
│   │   ├── ArchivesHero.jsx
│   │   ├── clubs/               # 18 club heroes
│   │   └── fests/
│   │       ├── FestSound.jsx
│   │       ├── TechFestHero.jsx
│   │       ├── GeneralFestHero.jsx
│   │       └── CulturalFestHero.jsx
│   └── pages/index.js            # homepage
├── docs/
│   ├── resources/
│   └── clubs/                    # 18 .mdx pages
└── blog/
    ├── authors.yml
    └── YYYY-MM-DD-<event>/index.md + co-located images
```

## Appendix B — verification checklist

- [ ] Styling built from `scholar-design-system-hybrid (1).md`; accent bridge vars present
- [ ] Framer Motion confirmed; `motion.css`/`motion.js` deleted or justified
- [ ] Infra hooks import cleanly; one club page smoke-tested
- [ ] All 18 club heroes render, animate on load, still on scroll, replay on hover
- [ ] `TuringitesHero` built (the one missing hero)
- [ ] Reduced-motion path verified (no motion, hover doesn't override)
- [ ] Accent unified-mode toggle built and persists
- [ ] Off-screen `IntersectionObserver` pause added to `useIntroMotion`
- [ ] Fest audio wired (once files supplied); nothing autoplays
- [ ] Footer easter egg built per `saiu-collage-wiki-easter-egg.md`
- [ ] Renamed `LibraryHero-v2`→`LibraryHero`, `LiteraryHero-fontmask`→`LiteraryHero`
- [ ] Decap CMS reachable at `/admin`; co-located image build works
- [ ] Deploys to GitHub Pages

## Appendix C — design deliberation (ignore for implementation)

**C.1 — Palettes not chosen.** *Marginalia*: index-card light / chalkboard
dark, pencil-underline links, library-stamp tags (files: `custom.css`,
`design-system.md`, `preview.html`). *Scholar*: institutional/letterhead, four
distinct typefaces (Playfair Display / Spectral / Inter / JetBrains Mono), two
palette variants (`scholar-custom.css` blue/orange/teal;
`scholar-custom-old.css` indigo/gold/emerald). *Sai Crimson*: named in the spec,
never built. **Full detail in `design-system.md` and the `scholar-*.html`
references.**

**C.2 — Why heroes aren't spinning icons.** Governing principle: *motion should
come from the club's activity, not from spinning its noun.* A spinning vinyl is
a picture of music; a responding waveform IS music. The original guide's 18
near-identical spinning-icon heroes were rebuilt on this basis. Rationale per
hero is in each file's header comment.

**C.3 — Library vs Archives.** Originally shelving→Archives, flowing-books→
reading club. Library took shelving first, so Archives became *retrieval*
(pull-out) to avoid two near-identical shelving animations. Pair now reads as
put-in vs get-out. Flowing-books reserved for a future reading club.

**C.4 — Full open-issues log** lives in `animation-caveats.md` — the
authoritative source for every deferred decision, browser caveat, and
hardcoded-color exception. Read it if any §1 or §6 blocker needs detail.
