# HANDOFF: Sai University Club & Event Wiki — Docusaurus Build

## 1. Project & Objective

Docusaurus v3 wiki for Sai University, Chennai: 18 student clubs, 400+ archived
events, hosted free on GitHub Pages, editable by non-technical club leads via
Decap CMS at `/admin`. Signature feature: 23 custom animated hero components
(18 clubs + Library + Archives + 3 fests) that animate each club's *actual
activity* (not a spinning icon), governed by two shared systems:
`useIntroMotion` (playback rule) and `useClubAccent` (per-club accent color).

Repo (pushed, live): `https://github.com/ChargingTrex/collage-wiki-SAIU`
Local path: `/Users/it/Documents/collage wiki`
Plan file: `/Users/it/.claude/plans/push-to-https-github-com-chargingtrex-co-spicy-star.md`
(follows `PROMPT.md`'s checkpoint workflow, one CP at a time, stop-and-report each)

## 2. Key Decisions / Constraints (locked, don't relitigate)

- **Framer Motion primary**; `motion.css`/`motion.js` fallback layer — neither
  file exists yet, not needed so far.
- **Design system** = `scholar-design-system-hybrid (1).html` (NOT `.md` —
  stale extension in all docs, `.html` is the real, authoritative file).
  Primary `#3b6af5`, secondary `#f77f0e`, accent/"Emerald Ivy" `#218A5E`.
- **Tailwind required, Shadcn removed.** `docusaurus-plugin-tailwindcss`
  (named in CLAUDE.md) **does not exist on npm** — used a local
  `configurePostCss` plugin instead (see §3).
- GitHub org/repo: `ChargingTrex/collage-wiki-SAIU`, project site (not org
  root) → `url: 'https://chargingtrex.github.io'`, `baseUrl: '/collage-wiki-SAIU/'`.
- **Decap CMS auth backend deferred** — CP5 will write a decision doc
  (GitHub+OAuth-proxy vs git-gateway+Netlify Identity), not wire it yet;
  hosting for auth still TBD.
- **Homepage = mini-heroes** (scaled-down real hero components per club card),
  not static cards.
- **All 23 heroes confirmed to exist** (5 were briefly thought missing —
  Dance/Theatre/Photography/Oratory/Martial Arts — all located; Dance was
  sitting in `~/Documents/` one level up, now moved in).
- **`animation-caveats (3).md`** is canonical (supersedes `(1)`/`(2)`).
- Fashion hero: garment paths get swapped for a standard/simple outline (not
  full retrace) at CP3, plus a note added to `animation-caveats (3).md`
  flagging a proper hand-drawn path is needed in future.
- 6 heroes loop forever with no off-screen pause yet: **Science, Gaming, Art,
  Music, Dance, Oratory, Film Society**. Off-screen `IntersectionObserver`
  pause is CP7b in the plan, but we agreed to **re-raise the timing decision
  right after CP3** confirms all 23 heroes render, to decide if it should move
  earlier.
- File dedup/renames done: `LibraryHero-v2.jsx`→`LibraryHero.jsx` (old
  deleted), `LiteraryHero-fontmask.jsx`→`LiteraryHero.jsx` (old + dup
  deleted), `ArchivesHero 2.jsx` deleted (dup), `useIntroMotion (1).js`
  deleted (dup).
- **Memory saved:** never use a color ramp's `-950` step for brand
  colors/buttons (reads as black) — see
  `~/.claude/projects/-Users-it-Documents-collage-wiki/memory/feedback_css_ramp_950.md`.
  Also a project memory noting a **second, concurrent Claude session** is
  independently working on this same repo (wrote `CONTRIBUTING.md`,
  `blog/tags.yml` real tag taxonomy, a WCAG audit in `changes.md`) — check
  `git status`/`changes.md` before assuming exclusive ownership of files.

## 3. Technical Stack / Structure (current state)

- **Docusaurus 3.10.2**, React 19, Node v26.5.0 / npm 11.17.0 (installed via
  **ARM** Homebrew — confirmed arm64, not Rosetta).
- **Tailwind v3.4.19** (not v4) — `tailwind.config.js` has `corePlugins:
  {preflight:false}` (avoids fighting Infima's reset) and absolute-path
  `content` globs (relative globs silently matched nothing under Rspack
  workers). Wired via **`src/plugins/tailwind-plugin.js`** (local
  `configurePostCss` hook pushing `tailwindcss(tailwindConfig)` +
  `autoprefixer`) since the npm package CLAUDE.md names doesn't exist.
  **Critical fix**: `custom.css` needed literal `@tailwind base/components/
  utilities;` directives — without them Tailwind had nothing to inject into
  and silently generated **zero** utility classes for days of debugging (this
  was the real bug, not Rspack — see below).
- `docusaurus.config.js`: `future: { v4: true }` — **Rspack/SWC/Lightning CSS
  bundler is ACTIVE** (v4's `fasterByDefault`); was temporarily disabled while
  misdiagnosing the Tailwind bug, then re-enabled and reverified once the real
  fix (the `@tailwind` directive) landed — confirmed working either way.
  `deploymentBranch: 'gh-pages'`. Decap CMS footer link is commented out
  (uncomment at CP5 once `/admin` exists — linking to it early broke
  `onBrokenLinks: 'throw'`).
- `package.json` name: `"saiu-wiki"`.
- **`src/css/custom.css`**: full `--ds-*` token set (light+dark) mapped onto
  Infima (`--ifm-color-primary*`, `--ifm-color-secondary*`, emphasis scale,
  fonts, radius, shadows). Key fixes baked in:
  - **Accent bridge bug**: `:root { --club-accent: var(--club-accent-light) }`
    doesn't work — `--club-accent-light/-dark` are only ever set *inline* per
    hero, and CSS var substitution resolves at declaration point (`:root`),
    not at use point, so it was permanently invalid (rendering as SVG default
    black). Fixed with a **universal selector**: `* { --club-accent:
    var(--club-accent-light); } [data-theme='dark'] * { --club-accent:
    var(--club-accent-dark); }`.
  - WCAG AA button-contrast fix, **scoped narrowly** to `.button--secondary`/
    `.button--primary` classes only (not the whole `--ifm-color-secondary`
    token, which other UI also uses) — per explicit user instruction.
  - `.tech-club` typography override (Space Grotesk/IBM Plex) for
    Turingites/FOSS pages.
  - `--astronomy-dot-color` (new): `#94a3b8` (slate) in light mode, `#fde047`
    (yellow, matches star color) in dark mode — Astronomy's card bg is fixed
    dark navy regardless of site theme, so this tracks *site* theme, not the
    club's own per-club accent.
- **File layout achieved so far**:
  ```
  src/components/
    useIntroMotion.js, useClubAccent.js, clubAccents.js
    LibraryHero.jsx, ArchivesHero.jsx
    primitives/Book.jsx
    fests/FestSound.jsx
    clubs/AstronomyHero.jsx   ← fully integrated + fixed (see §4)
    clubs/LiteraryHero.jsx    ← renamed, not yet doc-paged
  docs/clubs/astronomy-club.mdx   (smoke test page, hide_title:true)
  docs/clubs/_category_.json
  ```
  **Still sitting at project root**, not yet moved into `src/components/clubs/`
  (CP3's job): `ArtHero.jsx, GardeningHero.jsx, GamingHero.jsx,
  EntrepreneurshipHero.jsx, FashionHero.jsx, ScienceHero.jsx, MusicHero.jsx,
  FilmSocietyHero.jsx, TuringitesHero.jsx, AnimalWelfareHero.jsx, FossHero.jsx,
  OratoryHero.jsx, TheatreHero.jsx, PhotographyHero.jsx, MartialArtsHero.jsx,
  DanceHero.jsx, TechFestHero.jsx, GeneralFestHero.jsx, CulturalFestHero.jsx`.
- **`AstronomyHero.jsx` specific fixes applied** (in `src/components/clubs/`):
  - Added `const STAR_COLOR = '#FDE047'` — constellation stars + connecting
    line now hardcoded yellow (not tied to `--club-accent`, since "stars are
    yellow" is a fixed fact, same pattern as Gaming/Art/Fashion's documented
    hardcoded-color exceptions). Heading still uses `var(--club-accent)` →
    Indigo (`clubAccents.js` reverted back to Indigo `#4338CA`/`#A5B4FC` after
    a wrong detour where I'd changed it to yellow, which broke the heading
    color — reverted).
  - Background `FIELD` dots: bumped radii up ~50% (bigger, per request), now
    use `fill="var(--astronomy-dot-color)"` (see custom.css above).
  - Changed `initial={false}` → `initial="rested"` on 5 motion elements
    (thought this fixed a hover-replay bug; **turned out the original bug
    report was a false alarm** — my test used a bad `:has()` CSS selector
    that matched 15 ancestor elements and hovered the wrong one. The fix is
    harmless/kept, but hover-replay was likely never actually broken).
  - `docs/clubs/astronomy-club.mdx` frontmatter needs `hide_title: true`
    whenever a hero renders its own `<h1>` (Docusaurus otherwise also renders
    the frontmatter `title:` as a second, duplicate `<h1>`).
- **Testing infra used** (not part of the project, all cleaned up after):
  Playwright (`npm install --no-save playwright` + `npx playwright install
  chromium`) driven via a disposable batch-mode Node script (readline-based
  REPLs race against heredoc stdin-close — a plain `fs.readFileSync(0)` +
  sequential `for` loop is the robust pattern). Screenshots went to
  `/tmp/shots/`. All temp files (`.tmp-driver.mjs`) and the playwright
  install have been removed/uninstalled — not part of the shipped project.

## 4. Exact Current State (just finished, NOT yet committed)

**CP0 and CP1 are committed and pushed to GitHub main.** CP2 is **complete and
verified but sitting uncommitted** — last message ended with me asking the
user "commit now, or review first?" (unanswered as of this handoff).

CP2 scope done: shared hooks/primitives moved into `src/components/`,
dedup/renames done, `DanceHero.jsx` moved in from `~/Documents/`, Astronomy
Club wired as the one-club smoke test, and all four required playback
behaviors verified live in a real (Playwright-driven) Chromium browser:
- **Load-animate**: confirmed (screenshot at ~0s empty, at ~4.5s fully
  revealed).
- **Still-on-scroll**: confirmed (scrolling early freezes to rested state,
  identical screenshots 4s apart after scroll).
- **Hover-replay**: confirmed correct AFTER fixing my own bad test selector —
  `transform: translateX(-46px) translateY(-16px) scale(1.9)` captured
  immediately post-hover, matching the "playing" variant's held keyframe.
- **Reduced-motion**: confirmed (`reducedMotion:'reduce'` context → `transform:
  none` on load AND hover does not override it).

Also fixed two infra-wide bugs discovered via this smoke test (both affect
**all 23 heroes**, not just Astronomy):
1. The `--club-accent` CSS variable indirection bug (universal-selector fix).
2. Tailwind generating zero utility classes (missing `@tailwind` directive).

Docusaurus's Rspack/SWC "faster" bundler was re-enabled (user explicitly asked
for the speed benefit) and reverified working correctly with Tailwind after
the real fix — confirmed via both `npm run build` (checked compiled CSS for
utility classes) and a fresh dev-server run showing `Rspack 1.7.12` active.

## 5. Immediate Next Steps

1. **Answer pending**: commit CP2 now, or review first? (Blocking — ask user.)
2. **CP3** (per plan): integrate remaining 22 heroes into `src/components/
   clubs|fests/`, build all 18 `docs/clubs/<slug>.mdx` pages (slugs table is
   in project `CLAUDE.md`). While integrating `FashionHero.jsx`, swap its
   garment paths for a standard outline + note in `animation-caveats (3).md`.
   Give `ArchivesHero.jsx` the same `initial={false}` review as Astronomy got
   (same key-remount hover pattern) — verify with a *correct* selector this
   time, not assume it's broken.
3. Once all 23 heroes confirmed rendering in CP3, **stop and re-raise** the
   off-screen `IntersectionObserver` pause timing (currently CP7b) — decide
   together whether it should move earlier given 6 heroes loop forever.
4. **CP4**: mini-hero homepage cards, place 3 fest heroes with `audioSrc`
   stubbed (no audio files exist yet; nothing should autoplay).
5. **CP5**: blog structure + co-located images, Decap CMS `/admin` scaffolded
   structurally, write (don't wire) the auth-backend decision doc, uncomment
   the Decap CMS footer nav link once `/admin` exists.
6. **CP6**: footer easter egg — swizzle `Footer --wrap`, adapt the spec's
   *floating-corner* reference code into the locked *in-flow bottom-of-page*
   placement, keep "charging trex..." tooltip, dino green-default/recolors on
   unified accent mode, `react-chrome-dino` first (React 19 compat untested —
   flagged risk).
7. **CP7**: (a) accent unified-mode toggle UI, confirm dino recolors with it;
   (b) off-screen pause (timing per #3 above).
8. **CP8**: GitHub Pages deploy walkthrough — **no push/deploy without
   explicit user confirmation each time**, per project convention.
