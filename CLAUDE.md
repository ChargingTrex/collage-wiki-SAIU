# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A **Docusaurus v3** wiki for **Sai University, Chennai**: 21 student clubs, 400+
archived events, hosted free on **GitHub Pages**, editable by non-technical club
leads via **Decap CMS** at `/admin`. The signature feature is **26 custom
animated hero components** (21 clubs + Library + Archives + 3 fests), each built
around the club's *actual activity* rather than a spinning icon, all governed by
one shared playback rule and one shared accent-color system.

### Content model
- `/docs` = permanent structured pages (constitutions, exec boards, directories)
  for **clubs**, **committees**, and **fests**
- `/blog` = chronological posts, images **co-located** beside each
  `index.md` so Docusaurus auto-compresses them and URLs never break
- `/events` and `/student-voices` (navbar label "Blog") are **built** —
  custom pages (`src/pages/events.js`, `src/pages/student-voices.js`) that
  read every `/blog` post's frontmatter `tags:` via `club-events-plugin.js`
  and filter by tag. There is no separate `/events` content directory — the
  "400+ archive" is aspirational; it has not been imported into `/blog` yet
  (only a handful of posts exist today, so no backfill/migration step is
  needed for tag changes — see Tag taxonomy below).

### Tag taxonomy — `blog/tags.yml`

Every `/blog` post is classified purely by frontmatter `tags:` — no separate
linking field. `club-events-plugin.js` reads `blog/tags.yml` + every post's
tags at build time and exposes `{posts, postsByTag, tagsMeta}` via
`usePluginData('club-events-plugin')`; `/events`, `/student-voices`, each
club/committee's `events.mdx`, and the homepage Recent Activity strip all
read from that one source.

- **Organizer tags** — one per club (21), one per committee
  (`cultural-committee`, `student-government`), one per fest
  (`tech-fest`/`general-fest`/`cultural-fest`) — no generic `fest` tag;
  `general-fest` already covers fest content not tied to one specific fest.
- **Event-type tags** — `workshop`/`competition`/`talk`/`screening`/
  `exhibition`/`performance`/`hackathon`.
- **Content-type tags** — `blog` (general club writing, not a dated event)
  vs. `events` (explicit event-coverage marker). These decide which sitewide
  page a post surfaces on: `/events` shows everything except `blog` and
  `student-voices` (`NON_EVENT_TAGS` in `src/pages/events.js`);
  `/student-voices` shows only `blog` + `student-voices` (`BLOG_TAG_IDS` in
  `src/pages/student-voices.js`). A post carrying only a club/fest/committee/
  event-type tag and no explicit `blog`/`events` tag still defaults to
  `/events` — no forced retagging of older posts.
- **`student-voices`** — individual student writing, not on behalf of any
  club/committee/fest.
- Keep `static/admin/config.yml`'s tags `select` options in sync manually —
  Decap can't read `blog/tags.yml` directly.

## Source-of-truth docs (read before building)

Read in order. Where they conflict, the earlier one wins.

1. **`docs-internal/archive/BUILD-BRIEF (1).md`** — master decisions document.
   Build is complete; kept for the build order (§5), file inventory (§4), and
   verification checklist (Appendix B) that shaped it.
2. **`scholar-design-system-hybrid (1).md`** — the chosen design system
   (`--ds-*` tokens). Map onto Infima in `custom.css`. **Palette is decided.**
3. **`docs-internal/archive/saiu-collage-wiki-easter-egg.md`** — the hidden
   footer Chrome-dino game. Build is complete; kept for the spec that shaped it.
4. **`docs-internal/animation-caveats.md`** — authoritative open-issues log;
   consult when any motion decision needs detail.

Reference / context (partly superseded, archived under `docs-internal/archive/`):
- `docs-internal/archive/sai-uni-wiki-spec.md` — blog + Decap CMS + co-located image pipeline, and the
  original homepage (`index.js`). Referenced by build order step 10.
- `docs-internal/archive/sai-uni-wiki-motion-guide.md` — the original motion
  guide, largely superseded by the Framer rebuild; kept for rebuild rationale.
- `docs-internal/archive/traced-handwriting-guide.md` — handwriting-font
  technique for Literary/blog.

If any of docs 1–3 is missing from the handoff, **stop and ask** rather than
guessing its contents.

## Decisions already made — do not relitigate

- **Framer Motion is the primary animation system.** Use it wherever possible.
  **Fallback:** if no Framer equivalent exists for a specific effect, fall back
  to `motion.css` / `motion.js`. **Neither file has ever actually been created**
  — Framer has covered every effect built so far, so this fallback layer is
  specified but unbuilt. If a future hero needs it, build it from scratch;
  don't assume it already exists.
- **Design system** = the Scholar hybrid doc. Anchors: primary `#3b6af5` (blue),
  secondary `#f77f0e` (orange), accent `#218A5E` (green), full light/dark ramps.
  Ignore the Marginalia / Scholar / Sai Crimson alternatives (Appendix C).
- **Tailwind is required** — the hero components use utility classes.
- **Shadcn is removed from the stack.** Do not install or init it. Any earlier
  spec mention is void.
- **All 26 heroes exist**, including `TuringitesHero`, `ChessHero`,
  `PugwashHero`, and `SportsHero` — none are missing.
- **Audio never autoplays.** Players are click-to-play and render only when an
  `audioSrc` is passed. Audio files are the user's to supply (licensing).

## Tech stack

```
Docusaurus v3          core
Tailwind CSS           via docusaurus-plugin-tailwindcss (REQUIRED by heroes)
framer-motion          all hero animations (primary)
motion.css / motion.js specified fallback, never built — see above
lucide-react           icons within heroes
react-chrome-dino      footer easter-egg game (swap later only if it errors)
Decap CMS              /admin editing (scaffolded, auth not wired — see
                        docs-internal/decap-cms-auth-todo.md)
GitHub Pages           hosting, auto-deployed via GitHub Actions on push to main
```

## Setup

This repo already exists and is fully scaffolded — don't re-run
`create-docusaurus`. Real dev flow:

```bash
git clone https://github.com/ChargingTrex/collage-wiki-SAIU.git
cd collage-wiki-SAIU
npm install
npm start            # http://localhost:3000/collage-wiki-SAIU/, hot reload
```

Real `docusaurus.config.js` values (for reference, don't hand-edit without
reason):
```js
url: 'https://chargingtrex.github.io',
baseUrl: '/collage-wiki-SAIU/',
organizationName: 'ChargingTrex',
projectName: 'collage-wiki-SAIU',
deploymentBranch: 'gh-pages',
```

Handwriting fonts — top of `custom.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&display=swap');
```

**Deploy is automatic** — GitHub Actions deploys on every push to `main`
(`.github/workflows/deploy.yml`). Don't run `npm run deploy` manually; per
Conventions below, it needs explicit maintainer sign-off (it pushes straight
to `gh-pages`, bypassing CI).

## The two shared systems (read before touching heroes)

### Playback — `useIntroMotion`
Every hero animates **while the reader arrives**, then goes still on
scroll / click / key / touch. **Click/tap replays from the start** — hover-to-
replay was tried and deliberately reverted (fired on incidental cursor drift,
and doesn't exist on touch at all).
```jsx
const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
```
`hoverProps` is spread on the hero's root element regardless of the name (kept
for call-site compatibility) — it wires `onClick`, plus `role="button"`,
`tabIndex`, `onKeyDown` (Enter/Space), and `aria-label="Replay animation"` so
replay is keyboard-reachable too. Baked in: no auto-restart on scroll-to-top;
mid-page landings never play the intro; `prefers-reduced-motion` gets the
rested state and a click does not override it; an always-on
`IntersectionObserver` pauses `isPlaying` whenever the hero scrolls off-screen
(covers looping heroes on the directory grid).

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

## Remaining infra tasks

Both items below are **done** — kept as a record, not a to-do list:

1. **Accent unified-mode toggle UI** — built (`AccentModeToggle.jsx`, wired
   into the navbar); `useAccentMode()` persists to localStorage.
2. **Off-screen `IntersectionObserver` pause** — done, once inside
   `useIntroMotion` (see "Playback" above), not per component.

## Component integration notes

- All 26 heroes are pre-built and self-contained.
- Homepage `index.js` is a plain Infima `hero hero--primary` header (title,
  subtitle, stat row, CTAs) — real content, not hardcoded `ClubCard`s; the
  club directory grid lives at `/clubs` via `MiniHeroCard.jsx`.
- Motion comes from the club's *activity*, not from spinning its noun. Preserve
  the per-hero rationale in each file's header comment.
- Do reduced-motion, hydration, and off-screen behavior **once in the shared
  hooks** — never per component.

## Directory structure

Don't duplicate the tree here — `CONTRIBUTING.md`'s "Where things live"
section (§3) is the maintained, accurate map of `src/`, `docs/`, `blog/`,
`static/`, `tests/`, and `scripts/`. Read that instead of trusting a second
copy that will drift out of sync with it.

Accent bridge in `custom.css`:
```css
:root               { --club-accent: var(--club-accent-light); }
[data-theme='dark'] { --club-accent: var(--club-accent-dark); }
```

## The 21 clubs — slug / accent

| Club | Slug (`/docs/clubs/<slug>`) | Accent |
|---|---|---|
| Literary Club | `literary-club` | Sepia |
| Art Club | `art-club` | Fuchsia |
| Chess Club | `chess-club` | Slate |
| Dance Club | `dance-club` | Rose |
| Gardening Club | `gardening-club` | Green |
| Astronomy Club | `astronomy-club` | Indigo |
| Theatre Club | `theatre-club` | Purple |
| Photography Club | `photography-club` | Cyan |
| Gaming Club | `gaming-club` | Violet |
| Oratory Club | `oratory-club` | Blue |
| Entrepreneurship Club | `entrepreneurship-club` | Emerald |
| Fashion Club | `fashion-club` | Pink |
| Pugwash Society | `pugwash-society` | Olive |
| Science Society | `science-society` | Teal |
| Sports Society | `sports-society` | Gold |
| Music Club | `music-club` | Orange |
| Film Society | `film-society` | Crimson |
| Turingites CS Society | `turingites-computer-science-society` | Terminal |
| Animal Welfare Society | `animal-welfare-society` | Amber |
| Martial Arts Club | `martial-arts-club` | Red |
| FOSS Club | `foss-club` | Sky |

Hex values live in `clubAccents.js`. Chess Club, Pugwash Society, and Sports
Society (pulled from the companion `campus-club-ui` component library) were
added after the original 18; team/contact data for all three is still
placeholder — see `docs-internal/animation-caveats.md` §17.

## Committees — slug

Standing bodies distinct from the 21 clubs; same tag/directory mechanism
(`docs/committees/<slug>/` mirrors `docs/clubs/<slug>/`: `index.mdx` +
`contact.mdx` + `events.mdx`), no dedicated accent or hero component —
`useClubAccent` falls back to the unified/monochrome accent for any slug not
in `CLUB_ACCENTS`.

| Committee | Slug (`/docs/committees/<slug>`) |
|---|---|
| Cultural Committee | `cultural-committee` |
| Student Government | `student-government` |

Contact/team data is placeholder (`src/data/clubContacts.js`,
`src/data/teams/<slug>.mjs`), same convention as every newly added club.
`scripts/rollover.mjs` has a `committee` type (`npm run rollover -- committee
cultural-committee 2025-26`) that reads `docs/committees/<slug>/
_category_.json` for label/icon and `src/data/committeeMeta.mjs` for the
per-committee heading word ("Committee" vs. "Government") and role examples.

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

Build per `docs-internal/archive/saiu-collage-wiki-easter-egg.md` (authoritative). A 🦖 icon opens the
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

- [x] Styling from `scholar-design-system-hybrid (1).md`; accent bridge present
- [x] Framer primary; `motion.css`/`motion.js` specified as fallback, never built
- [x] Infra hooks import cleanly; all club pages integrated
- [x] All 26 heroes render, animate on load, still on scroll, replay on click/tap
- [x] Accent unified-mode toggle built and persists
- [x] Off-screen `IntersectionObserver` pause added to `useIntroMotion`
- [x] Reduced-motion path verified
- [ ] Fest audio wired (once supplied); nothing autoplays — mechanism built,
      files not yet supplied (licensing, see "Fest audio wiring" above)
- [x] Footer easter egg: in-flow bottom, tooltip kept, dino recolors on unified
- [x] `LibraryHero-v2`→`LibraryHero`, `LiteraryHero-fontmask`→`LiteraryHero`
- [ ] Decap CMS reachable at `/admin`; **auth not wired, can't save yet** —
      see `docs-internal/decap-cms-auth-todo.md`
- [x] Deploys to GitHub Pages (automatic via GitHub Actions on push to `main`)
