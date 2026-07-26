# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A **Docusaurus v3** wiki for **Sai University, Chennai**: 18 student clubs, 400+
archived events, hosted free on **GitHub Pages**, editable by non-technical club
leads via **Decap CMS** at `/admin`. The signature feature is **23 custom
animated hero components** (18 clubs + Library + Archives + 3 fests), each built
around the club's *actual activity* rather than a spinning icon, all governed by
one shared playback rule and one shared accent-color system.

### Content model
- `/docs` = permanent structured pages (constitutions, exec boards, directories)
  for **clubs** and **fests**
- `/blog` = chronological event posts, images **co-located** beside each
  `index.md` so Docusaurus auto-compresses them and URLs never break
- A separate `/events` section is planned for the **future** — do not build it
  now; the 400+ archive currently lives under `/blog`.

## Source-of-truth docs (read before building)

Read in order. Where they conflict, the earlier one wins.

1. **`BUILD-BRIEF (1).md`** — master decisions document. Follow its build order
   (§5), file inventory (§4), and verification checklist (Appendix B).
2. **`scholar-design-system-hybrid (1).md`** — the chosen design system
   (`--ds-*` tokens). Map onto Infima in `custom.css`. **Palette is decided.**
3. **`saiu-collage-wiki-easter-egg.md`** — the hidden footer Chrome-dino game.
4. **`animation-caveats.md`** — authoritative open-issues log; consult when any
   motion decision needs detail.

Reference / context (partly superseded):
- `sai-uni-wiki-spec.md` — blog + Decap CMS + co-located image pipeline, and the
  original homepage (`index.js`). Referenced by build order step 10.
- `sai-uni-wiki-motion-guide.md` — the original motion guide, largely superseded
  by the Framer rebuild; kept for rebuild rationale.
- `traced-handwriting-guide.md` — handwriting-font technique for Literary/blog.

If any of docs 1–3 is missing from the handoff, **stop and ask** rather than
guessing its contents.

## Decisions already made — do not relitigate

- **Framer Motion is the primary animation system.** Use it wherever possible.
  **Fallback:** if no Framer equivalent exists for a specific effect, fall back
  to `motion.css` / `motion.js` — but Framer is always the first choice. These
  two files are **kept**, not deprecated, purely as a fallback layer.
- **Design system** = the Scholar hybrid doc. Anchors: primary `#3b6af5` (blue),
  secondary `#f77f0e` (orange), accent `#218A5E` (green), full light/dark ramps.
  Ignore the Marginalia / Scholar / Sai Crimson alternatives (Appendix C).
- **Tailwind is required** — the hero components use utility classes.
- **Shadcn is removed from the stack.** Do not install or init it. Any earlier
  spec mention is void.
- **All 23 heroes exist**, including `TuringitesHero` — none are missing.
- **Audio never autoplays.** Players are click-to-play and render only when an
  `audioSrc` is passed. Audio files are the user's to supply (licensing).

## Tech stack

```
Docusaurus v3          core
Tailwind CSS           via docusaurus-plugin-tailwindcss (REQUIRED by heroes)
framer-motion          all hero animations (primary)
motion.css / motion.js pure-CSS fallback when no Framer equivalent exists
lucide-react           icons within heroes
react-chrome-dino      footer easter-egg game (swap later only if it errors)
Decap CMS              /admin editing
GitHub Pages           hosting
```

## Setup

```bash
npx create-docusaurus@latest sai-uni-wiki classic
cd sai-uni-wiki
npm install framer-motion lucide-react react-chrome-dino
npm install -D tailwindcss postcss autoprefixer docusaurus-plugin-tailwindcss
npm run start            # http://localhost:3000
```

`docusaurus.config.js`:
```js
plugins: ['docusaurus-plugin-tailwindcss'],
clientModules: [/* add motion.js here — it's the fallback layer */],
url: 'https://sai-university.github.io',
baseUrl: '/',
organizationName: 'sai-university',
projectName: 'sai-uni-wiki',
deploymentBranch: 'gh-pages',
```

Handwriting fonts — top of `custom.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&display=swap');
```

Deploy: `cmd /C "set GIT_USER=YOUR_GITHUB_USERNAME && npm run deploy"`

## The two shared systems (read before touching heroes)

### Playback — `useIntroMotion`
Every hero animates **while the reader arrives**, then goes still on
scroll / click / key / touch. Hover replays from the start.
```jsx
const { isPlaying, isHovered, hoverProps } = useIntroMotion();
```
Baked in: no auto-restart on scroll-to-top; mid-page landings never play the
intro; hover is pointer-only (excludes touch); `prefers-reduced-motion` gets the
rested state and hover does not override it.

### Accent color — `useClubAccent`
Each club has its own accent; a settings toggle switches to **unified mode**
(everything = site palette, motion still differs). Accents are CSS custom
properties, so unified mode is a one-variable swap.
```jsx
const { accentStyle, accentName, isUnified } = useClubAccent('astronomy-club');
// also: useAccentMode() -> { mode, setAccentMode }
```
Hook renders `per-club` on first paint (avoids hydration mismatch) and fires a
`sai-accent-change` event on change. Some heroes intentionally ignore unified
mode (Gaming's 2nd ghost, Art's color cycle, Fashion's gold, fest palettes) —
the color *is* the concept there.

## Remaining infra tasks — do in THIS order

1. **Accent unified-mode toggle UI** — the `useClubAccent` hook and its
   localStorage layer exist, but nothing calls `setAccentMode`. Build the
   missing settings control (navbar item or settings page) that flips per-club ↔
   unified and persists. Do this first.
2. **Off-screen `IntersectionObserver` pause** — looping heroes keep animating
   when scrolled out of view (wasteful, worst on the directory page with many
   heroes). Add the observer **once inside `useIntroMotion`**, not per component,
   to pause off-screen heroes.

## Component integration notes

- All 23 heroes are pre-built and self-contained. **Wire one club page as a
  smoke test before integrating all 18.**
- **Rename on integration:** `LibraryHero-v2.jsx` → `LibraryHero.jsx`;
  `LiteraryHero-fontmask.jsx` → `LiteraryHero.jsx` (delete the old versions).
- Homepage `index.js` uses hardcoded ClubCards + native `.card`/`.button` +
  inline styles — reconcile with the Scholar palette and hero components.
- Motion comes from the club's *activity*, not from spinning its noun. Preserve
  the per-hero rationale in each file's header comment.
- Do reduced-motion, hydration, and off-screen behavior **once in the shared
  hooks** — never per component.

## Directory structure (target)

```
sai-uni-wiki/
├── docusaurus.config.js  tailwind.config.js  sidebars.js
├── static/
│   ├── admin/index.html          # Decap CMS
│   ├── audio/                     # user-supplied fest/music audio
│   └── img/
├── src/
│   ├── css/custom.css            # Scholar hybrid palette + accent bridge
│   ├── theme/Footer/index.js     # swizzled --wrap for the easter egg
│   ├── components/
│   │   ├── useIntroMotion.js  useClubAccent.js  clubAccents.js
│   │   ├── primitives/Book.jsx
│   │   ├── LibraryHero.jsx  ArchivesHero.jsx
│   │   ├── clubs/                # 18 club heroes (incl. TuringitesHero)
│   │   └── fests/                # FestSound + 3 fest heroes
│   └── pages/index.js
├── docs/
│   ├── resources/
│   └── clubs/                    # 18 .mdx pages (hero at top of each)
└── blog/
    ├── authors.yml
    └── YYYY-MM-DD-<event>/index.md + co-located images
```

Accent bridge in `custom.css`:
```css
:root               { --club-accent: var(--club-accent-light); }
[data-theme='dark'] { --club-accent: var(--club-accent-dark); }
```

## The 18 clubs — slug / accent

| Club | Slug (`/docs/clubs/<slug>`) | Accent |
|---|---|---|
| Literary Club | `literary-club` | Sepia |
| Art Club | `art-club` | Fuchsia |
| Dance Club | `dance-club` | Rose |
| Gardening Club | `gardening-club` | Green |
| Astronomy Club | `astronomy-club` | Indigo |
| Theatre Club | `theatre-club` | Purple |
| Photography Club | `photography-club` | Cyan |
| Gaming Club | `gaming-club` | Violet |
| Oratory Club | `oratory-club` | Blue |
| Entrepreneurship Club | `entrepreneurship-club` | Emerald |
| Fashion Club | `fashion-club` | Pink |
| Science Society | `science-society` | Teal |
| Music Club | `music-club` | Orange |
| Film Society | `film-society` | Crimson |
| Turingites CS Society | `turingites-computer-science-society` | Terminal |
| Animal Welfare Society | `animal-welfare-society` | Amber |
| Martial Arts Club | `martial-arts-club` | Red |
| FOSS Club | `foss-club` | Sky |

Hex values live in `clubAccents.js`.

## Fest audio wiring (once files supplied)

```jsx
<TechFestHero     audioSrc="/audio/innovision-theme.mp3" />
<GeneralFestHero  audioSrc="/audio/fest-fanfare.mp3" />
<CulturalFestHero audioSrc="/audio/vibrance-anthem.mp3" />
<MusicHero        audioSrc="/audio/music-club-sample.mp3" />
```
Use royalty-free (Pixabay Music, incompetech, Free Music Archive) or club-made
audio — recognizable tracks on a public site are a licensing risk.

## Footer easter egg

Build per `saiu-collage-wiki-easter-egg.md` (authoritative). A 🦖 icon opens the
classic Chrome dino runner in a full-screen overlay (click anywhere to close).
Confirmed decisions:
- **Placement:** in-flow at the **bottom of each page** (hidden — only found on
  scroll to the end), NOT a floating corner icon.
- **Tooltip:** keep the "charging trex..." hover tooltip.
- **Dino color:** green by default; switches to the **unified accent color when
  the unified-mode toggle is enabled**. The Footer component reads
  `useAccentMode()` so the dino recolors with the site setting.
- **Package:** use `react-chrome-dino` for now; swap for a newer maintained
  runner later only if it throws build errors against React 18 / Docusaurus v3 /
  GitHub Pages static export.

```bash
npm run swizzle @docusaurus/theme-classic Footer -- --wrap
```
The swizzled `src/theme/Footer/index.js` wraps (not replaces) the default footer.

## Conventions

- Co-locate blog images with their post; never use absolute image paths that can
  break as the archive grows.
- Prohibited actions on the user's behalf (push, deploy, delete branches) require
  explicit confirmation.

## Verification checklist (Appendix B)

- [ ] Styling from `scholar-design-system-hybrid (1).md`; accent bridge present
- [ ] Framer primary; `motion.css`/`motion.js` retained as fallback only
- [ ] Infra hooks import cleanly; one club page smoke-tested
- [ ] All 18 heroes render, animate on load, still on scroll, replay on hover
- [ ] Accent unified-mode toggle built and persists (done before pause task)
- [ ] Off-screen `IntersectionObserver` pause added to `useIntroMotion`
- [ ] Reduced-motion path verified
- [ ] Fest audio wired (once supplied); nothing autoplays
- [ ] Footer easter egg: in-flow bottom, tooltip kept, dino recolors on unified
- [ ] `LibraryHero-v2`→`LibraryHero`, `LiteraryHero-fontmask`→`LiteraryHero`
- [ ] Decap CMS reachable at `/admin`; co-located image build works
- [ ] Deploys to GitHub Pages
