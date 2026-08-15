# Hero Animations — Audit + Critique + WCAG Report

Real `/impeccable audit` and `/impeccable critique` runs against the 23 hero
components (18 clubs + Library + Archives + 3 fests), plus a computed WCAG
2.1 contrast audit, requested as a follow-up to
[`HEROS-IMPROVEMENT-PLAN.md`](HEROS-IMPROVEMENT-PLAN.md) (that doc's
estimated scores are superseded by this one where they overlap).

**Method: dual-agent, partially degraded on B (A: independent design-review
sub-agent, completed in full · B: independent detector/evidence sub-agent,
confirmed the CLI detector findings before hitting a session-limit API error
mid-run) + parent-context WCAG computation + a real production build
(`docusaurus build`) fetched and grepped directly, since no
browser-automation tool (Playwright/Puppeteer/screenshot) is exposed in this
session and the dev server only serves a client-rendered SPA shell to
non-JS fetches.** The parent context independently completed the live-HTML
verification B was assigned, against real prerendered per-route output —
arguably stronger evidence than what B was instructed to attempt (curling
the dev server, which does not prerender). Where the missing browser tool
still limits what could be verified, that's stated explicitly — see
"Evidence limits" at the end.

---

## Part 1 — Design Critique

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Playing/rested is visually legible; nothing signals a replay capability exists |
| 2 | Match Between System and Real World | 4 | Strongest dimension — telescope pans, commit graphs, board breaks, claw-pull film advance |
| 3 | User Control and Freedom | 3 | Click toggles play/stop (`useIntroMotion.js`), but there's no visible way to discover that |
| 4 | Consistency and Standards | 3 | One shared hook/accent system, but Science's infinite-loop exception, General Fest's lone `whileHover` bump, and the Dance/Music bar-motif overlap are internal inconsistencies |
| 5 | Error Prevention | 3 | Real defensive fixes are in place and documented (Literary's dynamic text measurement, Photography's transform-ownership fix, General Fest's SSR/hydration seeded-RNG fix) |
| 6 | Recognition Rather Than Recall | 1 | Zero visible affordance across all 23 files — no `cursor-pointer`, no icon, no label hinting interactivity anywhere in the markup |
| 7 | Flexibility and Efficiency | 1 | `useAccentMode`/`setAccentMode` exist in `useClubAccent.js`, but nothing in the app calls `setAccentMode` — the documented per-club↔unified flexibility is unreachable by any visitor today |
| 8 | Aesthetic and Minimalist Design | 4 | Consistent squircle/shadow/type system; heroes stay visually disciplined against the Scholar chrome |
| 9 | Help Recognize/Diagnose/Recover from Errors | 3 | Audio `.play()` rejections are swallowed silently with no user-facing fallback state, but no other user-facing error states exist to fail |
| 10 | Help and Documentation | 1 | The click-replay interaction has no in-context hint (tooltip, label) anywhere, despite genuinely existing |

**Total: 26/40 (65%) — Acceptable band.** Both n/a-eligible heuristics (7, 10)
were deliberately scored rather than excused: a real, coded interaction
(click-replay) and a real, coded feature (accent-mode flexibility) both
exist in this surface — they're simply undiscoverable/unwired, which is
itself the finding, not a reason to exempt the surface from scoring.

### Design Specificity Verdict

**Assessment**: the core claim — "motion from what the club actually does,
not a spinning icon" — holds up under direct source inspection, and it's
backed by self-criticism in the code itself, not self-congratulation: the
component headers repeatedly flag their own weak points before a reviewer
would (Entrepreneurship's own comment calls itself "the least visually
distinct concept," Fashion's admits it was "the hardest to keep out of
cliché," Gaming's flags its own Pac-Man trade-dress risk). That's real
design judgment under time pressure, not a filled-in template.

Standouts for specificity: `FilmSocietyHero.jsx` (intermittent claw-pull
motion — the *pause* is the concept, not a spinning reel), `ScienceHero.jsx`
(electrons genuinely riding `offsetPath` orbits at different periods, with a
documented rejection of the naive sin/cos approach), `FossHero.jsx` (an
actual diverge/work/converge commit graph), `TuringitesHero.jsx` (a real
seeded B3/S23 Conway simulation).

Heroes flagged as generic or interchangeable:
- **`DanceHero.jsx` vs `MusicHero.jsx`** — both are rows of animated
  vertical bars (equalizer build-peak-drop vs. waveform envelope).
  Differently choreographed and colored, but the raw silhouette is the same
  "audio bars" cliché; swap the accent color and casual scanning wouldn't
  catch the difference.
- **`EntrepreneurshipHero.jsx`** — bulb → `$` → rising line chart is stock
  "startup" iconography, not distinctly *this* club. The file's own comment
  admits this and leans on sequencing-as-story to compensate — a reasonable
  mitigation, but the base vocabulary is generic.
- **`OratoryHero.jsx`** — a mic with expanding rings is a fairly standard
  "sound/voice" glyph; competently executed but the least activity-specific
  of the well-executed set (compare Theatre's curtain-then-spotlight, which
  is unmistakably that club's opening moment).

**Deterministic scan cross-check**: the bundled detector (`detect.mjs`)
independently flagged 11 advisory `design-system-color` findings — 10 in
`CulturalFestHero.jsx` (lines 21–26, 72, 131 — the six category-icon colors
and the title gradient stops) and 1 in `GeneralFestHero.jsx` (line 135, a
radial-gradient `rgba(0,0,0,0.16)` overlay). All 11 are colors outside the
`DESIGN.md` token palette. This corroborates, with file/line precision, what
both `HEROS.md` and `HEROS-IMPROVEMENT-PLAN.md` already documented as a
deliberate exception (festive multi-hue palettes where "the color is the
concept"), not drift — zero false positives here, but worth noting the
detector has no way to distinguish "intentional, documented exception" from
"accidental drift"; that judgment call is exactly what this critique layer
is for. Notably, the detector did **not** flag the other documented
hardcoded-color exceptions (Gaming's ghosts/muncher, Art's cycling stroke,
Astronomy's star yellow, Fashion's gold gradient) even in the same batch
scan — those values are either close to or exactly matching existing accent
tokens (e.g. Gaming's `#c4b5fd` ghost is the gaming-club dark accent's own
hex, case-folded), while the fest palettes are genuinely novel, untethered
one-offs. That's a real distinction, not a detector gap.

### Overall Impression

A genuinely well-crafted, unusually self-aware component set let down by
one specific, fixable gap: **the interaction layer (click-to-replay,
unified-accent mode) is real, coded, and completely undiscoverable or
unreachable.** The animations themselves are the strongest part of this
surface; the affordances around them are the weakest.

### What's Working

1. **`useIntroMotion.js` is bug-driven engineering, not spec-driven
   comments.** SSR guard, reduced-motion gating that also blocks click (not
   just the auto-intro), mid-page-landing detection, and a documented 250ms
   delay before the `playOnVisible` observer starts specifically to dodge a
   real webfont-swap-reflow bug — this reads as hard-won, not aspirational.
2. **The accent system is a genuinely clean one-variable architecture.**
   `--club-accent-light`/`--club-accent-dark`, resolved once, hydration-safe
   default, cross-tab sync via `storage` + a custom `sai-accent-change`
   event — exactly what `DESIGN.md` claims and verifiably true in the code.
3. **Per-hero self-criticism in the code comments** turns what could read as
   marketing copy into an honest, still-legible design log — a real asset
   for anyone maintaining this in a year.

### Priority Issues

- **[P1] No keyboard or screen-reader access to the replay interaction.**
  **Why it matters**: all 23 heroes spread `{...hoverProps}` onto a plain
  `<div>` — only `onClick` (and conditionally `ref`) is wired, with no
  `tabIndex`, `role`, or `onKeyDown`. A keyboard/screen-reader user can never
  focus, discover, or trigger replay, which doesn't meet the WCAG 2.1 AA
  target `PRODUCT.md` itself states as a requirement.
  **Fix**: add `role="button"`, `tabIndex={0}`, an `onKeyDown` for
  Enter/Space mirroring `onClick`, and an `aria-label` (e.g. "Replay
  animation") — once, inside `useIntroMotion.js`'s `hoverProps`.
  **Suggested command**: `/impeccable harden`.

- **[P1] Zero visible click affordance anywhere in the 23 files.**
  **Why it matters**: no `cursor-pointer`, no icon, no label anywhere —
  confirmed by direct grep across all 23 hero files (0 matches for
  `cursor-pointer`). A real, coded feature (`useIntroMotion.js`'s toggle) is
  functionally invisible, failing Nielsen heuristic 6 outright.
  **Fix**: add `cursor-pointer` plus a subtle, always-present (not
  hover-triggered) hint — e.g. a small persistent replay glyph in a corner —
  discoverable without reintroducing the hover-to-replay behavior that was
  already tried and deliberately reverted.
  **Suggested command**: `/impeccable delight` (this is exactly a
  discoverability/microinteraction gap, not a structural one).

- **[P2] Off-screen infinite loops still run.** `GamingHero.jsx`,
  `FilmSocietyHero.jsx`, `ScienceHero.jsx`, `ArtHero.jsx`, `OratoryHero.jsx`
  (confirmed via `grep -c "repeat: Infinity"`, 6 files including
  `TechFestHero.jsx`'s cursor blink) plus `TuringitesHero.jsx`'s
  `setInterval` stepper loop while playing, and no
  `IntersectionObserver`-based pause exists yet in `useIntroMotion.js`. This
  compounds directly on `/clubs`: `MiniHeroCard.jsx` mounts the **real, full
  hero component** for every listed club (scaled via CSS `transform`, not a
  separate lightweight rendering) — confirmed by reading that file — so a
  directory page can have several `repeat: Infinity` loops running
  simultaneously and indefinitely if the reader doesn't scroll.
  **Fix**: the observer already scoped in `CLAUDE.md`'s own remaining-infra
  task #2, added once inside `useIntroMotion`.
  **Suggested command**: `/impeccable optimize`.

- **[P2] Unified-accent toggle has no UI.** `useAccentMode`/`setAccentMode`
  are fully implemented but nothing in the app calls `setAccentMode` —
  confirmed absent via search of the component tree. The
  per-club↔unified promise stated in `PRODUCT.md`/`DESIGN.md` is half-shipped.
  **Fix**: build the settings control (navbar item or settings page).
  **Suggested command**: `/impeccable shape`, then build.

- **[P2] Duplicate accent color.** `clubAccents.js` gives `gardening-club`
  and `turingites-computer-science-society` the **identical** light-mode hex
  `#15803D` — confirmed by direct inspection of the token file. The file's
  own comment claims accents are spaced to avoid near-identical hues, but
  that check only guards against alphabetically-adjacent collisions; these
  two aren't adjacent, so the exact duplicate slipped through undetected.
  **Fix**: shift one value and re-verify all 18 pairwise for near-duplicates,
  not just adjacent ones.
  **Suggested command**: `/impeccable harden`.

### Persona Red Flags

- **Sam (accessibility-dependent — keyboard + screen reader)**: cannot
  access replay at all (see P1 above). The `<svg role="img"
  aria-label="...">` on most heroes conveys a one-time description, but that
  element isn't itself focusable or interactive, so Sam gets the
  description sighted mouse users get, minus the interaction they get.
- **Riley (stress-tester)**: rapidly browsing `/clubs` or `/explore`
  mounts many simultaneous real hero instances (`MiniHeroCard` confirmed to
  render the full component, not a lightweight copy), several running
  `repeat: Infinity` loops with no off-screen pause — a plausible jank
  source on lower-end devices, directly traceable to the still-open
  `IntersectionObserver` task.
- **Alex (power user)**: wants to turn off per-club color variation
  site-wide — a real, coded, but completely unreachable feature (`setAccentMode`
  has no caller anywhere in the UI).

### Minor Observations

- `MusicHero.jsx` / `FestSound.jsx` swallow `.play()` rejections silently
  (`.catch(() => {})`) — if blocked, the button appears to do nothing, with
  no user-facing state change communicating why.
- `GeneralFestHero.jsx`'s popper `whileHover` bump is the one
  hover-triggered effect among all 23 heroes — not a rule violation (the
  "no hover-to-replay" rule targets the *replay* mechanism specifically),
  but worth naming as the one outlier against an otherwise strict
  click-only interaction stance.
- Long-club-name defensiveness (a `max-w-[…]` clamp on the heading column)
  is only applied in a handful of files (`AnimalWelfareHero` 60%,
  `FossHero` 48%, `MusicHero` 42%); most others rely on `z-10` stacking
  alone with no width clamp. Low risk today since all copy is hardcoded and
  short, but fragile if club names or a translation ever change.
- `TuringitesHero.jsx` line 14's comment says the board "re-seeds and runs
  again on hover" — the actual mechanism is click (`isReplaying`), matching
  the shared hook and `DESIGN.md`'s explicit "don't wire hero replay to
  hover" rule. Harmless today, but misleading to the next person who reads
  it as spec.

### Questions to Consider

- What if below-the-fold heroes defaulted to `playOnVisible: true`
  everywhere instead of being an opt-in flag per hero — how often is the
  "arriving" intro currently being silently skipped by `scrollThreshold` for
  a reader who deep-links in from one of the 400+ blog posts?
- What if the replay affordance were made visible (cursor + icon) — would
  that shift the read from "delightful surprise" to "gimmick you're expected
  to poke," undercutting the deliberate restraint of today's invisible
  affordance? Worth deciding on purpose rather than by default.
- A reader who visits both `Turingites` and `Tech Fest` in one session sees
  the identical accent hue on both — does the fest still read as its own
  event, or as "the CS club's page again"?

---

## Part 2 — Technical Audit (5 dimensions)

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | Keyboard replay path missing sitewide (P1); one real WCAG contrast failure confirmed by computation (Entrepreneurship, 3.26:1); reduced-motion handling is centrally correct |
| 2 | Performance | 2/4 | 6 files loop `repeat: Infinity` while playing; `MiniHeroCard` mounts full live hero instances on the directory grid; no off-screen pause exists |
| 3 | Theming | 3/4 | Clean `--club-accent` token bridge; unified-mode toggle unreachable; one confirmed duplicate accent hex; motion has no shared duration/ease token layer |
| 4 | Responsive | 2/4 | 22 of 23 hero files carry zero responsive (`sm:`/`md:`/`lg:`) classes; only `TechFestHero.jsx` has 2 (font-size only, not layout) |
| 5 | Implementation Integrity | 4/4 | Coherent, self-documented system; detector found only 11 advisory findings, all in already-acknowledged deliberate exceptions |

**Total: 13/20 — Acceptable, significant work needed** (per the rating band:
10–13 = Acceptable). The two P1s below are what's holding this back from
"Good."

### 1. Accessibility — 2/4

**Confirmed via computation and source inspection:**
- `prefers-reduced-motion` is read once, correctly, in `useIntroMotion.js`
  and gates both the auto-intro and the click override — this is the one
  unambiguous strength in this dimension.
- **Keyboard operability**: confirmed absent. `hoverProps` in
  `useIntroMotion.js` returns only `{ onClick, ...(playOnVisible ? {ref} :
  {}) }` — no `tabIndex`, `role`, or key handler on any of the 23 heroes'
  root elements. This is a WCAG 2.1 SC 2.1.1 (Keyboard) gap on a real,
  coded interaction. **P1.**
- **Contrast — full computed pass, all 18 accents**: see Part 3 below for
  the complete numbers. Headline result: all 16 fixed-dark-card heroes'
  headings (using `accent.dark` correctly) pass AA comfortably, 5.8:1 to
  12.3:1. The one confirmed failure is `EntrepreneurshipHero.jsx`'s four
  remaining `var(--club-accent)` spots (icon color, `$` text fill, growth-line
  stroke, final-point fill) — computed at **3.26:1** in light site theme,
  below the 4.5:1 body-text AA threshold. **P1**, already scoped with exact
  line numbers in `HEROS-IMPROVEMENT-PLAN.md`.
- **New, previously undocumented finding**: `TuringitesHero.jsx`'s subtitle
  (`text-green-600/80` on `bg-black`, 14px/`text-sm`, not bold) computes to
  **4.30:1** — marginally below the 4.5:1 AA threshold for normal body text
  (it does clear the 3:1 large-text threshold, but this text isn't large).
  **P2.**
- **New, previously undocumented finding**: `MartialArtsHero.jsx` and
  `EntrepreneurshipHero.jsx`'s primary `<svg>` elements have **no**
  `role="img"`/`aria-label` — confirmed by direct source inspection; every
  other club hero with a custom SVG illustration (18 of the 20 that use one)
  does carry both. Given `DESIGN.md` treats the hero animation as
  meaningful signature content (not mere decoration), this is an
  inconsistency, not a correct decorative omission. **P2/P3.**
- ARIA/semantic pattern otherwise: SVGs correctly use `role="img"` +
  descriptive `aria-label` (18 of 20 SVG-based heroes, per source read);
  audio controls have `aria-label`s that flip with play state
  (`MusicHero.jsx`, `FestSound.jsx`).

### 2. Performance — 2/4

**Confirmed via `grep -c "repeat: Infinity"`:**
`GamingHero.jsx` (4), `FilmSocietyHero.jsx` (1), `ArtHero.jsx` (1),
`OratoryHero.jsx` (1), `ScienceHero.jsx` (1), `TechFestHero.jsx` (1, the
command-line cursor blink — low-impact, stops once typing finishes).
`TuringitesHero.jsx` additionally runs a `setInterval` generation-stepper
that ticks continuously while `isPlaying`, outside Framer's own loop
mechanism entirely.

**Confirmed via source read of `MiniHeroCard.jsx`**: the `/clubs`/`/explore`
directory grid does not render lightweight preview icons — it mounts the
*actual* hero component (`<Hero />`) at full logic, scaled down purely via a
CSS `transform: scale(0.68)` wrapper. This means every looping hero listed
above can be running simultaneously and indefinitely on the directory page
specifically, which is the worst-case surface for this issue and was
already correctly identified as the highest-risk page in
`animation-caveats.md` §9 and `CLAUDE.md`'s own task list — this audit
confirms the mechanism with a specific file citation
(`MiniHeroCard.jsx:20-30`), not just the general concern.

No `IntersectionObserver`-based pause exists in `useIntroMotion.js` —
confirmed absent by full read of that file. **P1**, already the top item in
`CLAUDE.md`'s remaining-infra list.

### 3. Theming — 3/4

- The `--club-accent-light`/`--club-accent-dark` bridge is a clean,
  single-variable-swap architecture — confirmed correct in
  `useClubAccent.js` and `custom.css`'s documented pattern.
- **New finding**: `gardening-club` and
  `turingites-computer-science-society` share the identical light-mode hex
  `#15803D` in `clubAccents.js` — confirmed by direct inspection (both
  entries read `light: '#15803D'`). The file's own header comment claims
  accents are spaced so alphabetically adjacent clubs don't collide; these
  two aren't adjacent, so an exact duplicate wasn't caught by that specific
  check. **P2.**
- Unified-mode toggle: implemented at the hook/storage layer, unreachable
  by any real visitor (confirmed absent UI caller). **P1** in the critique
  above; counted once here for the dimension score.
- No shared motion-token layer (durations/eases hand-authored per file) —
  a design-system gap in spirit, not a bug; already flagged as P2 in
  `HEROS-IMPROVEMENT-PLAN.md` item 6.

### 4. Responsive — 2/4 (newly scored; previously marked unscored)

**Confirmed via `grep -oE '\b(sm|md|lg|xl):' `**: of all 23 hero files, only
`TechFestHero.jsx` contains any responsive breakpoint classes at all — 2
instances (`sm:text-base`, `sm:text-3xl`), both font-size only, not layout.
The other 22 files have **zero** breakpoint-specific treatment.

This matters concretely, not just as a missing-checkbox: most heroes use a
fixed `flex items-center justify-between` layout with a heading column
(`text-3xl font-bold`, ~30px) sitting directly beside a `w-2/5`–`w-3/5` SVG
region, inside a fixed `h-48` card, with no `flex-wrap` and only a handful
of files (`AnimalWelfareHero`, `FossHero`, `MusicHero`) clamping the heading
column's max-width at all. On a narrow phone viewport, longer headings
("Entrepreneurship Club," "Animal Welfare Society," "Turingites Computer
Science Society" as body copy) have a plausible, code-indicated risk of
crowding or wrapping awkwardly against the animation region. **This is
inferred from the fixed-width/no-breakpoint code pattern, not confirmed via
an actual narrow-viewport screenshot — no browser tool was available this
session (see Evidence limits). Flagged as a real risk warranting a live
viewport check, not an asserted defect.** SVG content itself is inherently
scale-safe (`viewBox`-based), which is the main mitigating factor keeping
this from being a harder failure.

### 5. Implementation Integrity — 4/4

Strikingly coherent for a 23-component set: one shared playback contract,
one shared accent system, documented rationale in every file header, and
real bug-fixes preserved as comments (transform ownership in
Photography/AnimalWelfare, `offsetPath` + rotate composition in Science, a
hydration-safe seeded PRNG in General Fest) that read as institutional
memory, not noise. The detector's only 11 findings are all in
already-documented, deliberate exceptions (Part 1's design-specificity
section above) — no drift, no interchangeable-with-an-unrelated-product
structure found anywhere in the set.

### Patterns & Systemic Issues

- **The interaction layer is the one systemically weak area** in an
  otherwise strong set: three separate P1/P2 findings (no keyboard access,
  no visible affordance, unreachable unified-mode toggle) all point to the
  same root pattern — features that are fully *implemented* at the hook
  level but never wired into a discoverable, operable UI surface.
- **The half-finished-migration pattern is the one repeat correctness
  risk.** Ten-plus heroes got a full WCAG contrast-fix pass; Entrepreneurship
  didn't finish (4 of 5 spots). Nothing currently re-verifies a "migrate
  these N spots" instruction actually touched all N spots after the fact.

### Positive Findings

- The two-hook architecture genuinely delivers on its own promise: reduced
  motion, SSR safety, and stop-on-scroll are each solved exactly once and
  correctly inherited by all 23 heroes — confirmed, not just claimed.
- Every deliberate "the color is the concept" exception is documented in
  the code itself and was independently corroborated by the mechanical
  detector rather than contradicted by it.
- Real, hard-won bug fixes (webfont-reflow timing, transform-ownership,
  offsetPath+rotate composition, SSR/hydration-safe PRNG) are preserved as
  comments precisely where a future editor would need them.

---

## Part 3 — Full WCAG Contrast Audit (computed, WCAG 2.1 relative-luminance formula)

All ratios below computed directly from the exact hex values in
`clubAccents.js` and the exact Tailwind background classes in each hero's
source, using the standard WCAG relative-luminance/contrast formula (not
estimated). AA thresholds: **4.5:1** for normal text, **3:1** for large text
(≥18pt, or ≥14pt bold) and for non-text UI/graphical elements.

### Heading text (`accent.dark`) vs. each hero's actual fixed-dark card — all 16

| Hero | Accent | Hex | Card class | Card hex | Ratio | Verdict |
|---|---|---|---|---|---|---|
| AnimalWelfareHero | Amber | `#FBBF24` | `bg-amber-950` | `#451a03` | **8.97** | Pass (body) |
| ArtHero | Fuchsia | `#E879F9` | `bg-slate-900` | `#0f172a` | **7.25** | Pass (body) |
| AstronomyHero | Indigo | `#A5B4FC` | `bg-slate-950` | `#020617` | **10.12** | Pass (body) |
| DanceHero | Rose | `#FB7185` | `bg-rose-950` | `#4c0519` | **5.81** | Pass (body) |
| EntrepreneurshipHero | Emerald | `#6EE7B7` | `bg-slate-900` | `#0f172a` | **11.71** | Pass (body) |
| FashionHero | Pink | `#F9A8D4` | `bg-rose-950` | `#4c0519` | **8.62** | Pass (body) |
| FilmSocietyHero | Crimson | `#FCA5A5` | `bg-zinc-900` | `#18181b` | **9.33** | Pass (body) |
| FossHero | Sky | `#7DD3FC` | `bg-slate-900` | `#0f172a` | **10.71** | Pass (body) |
| GamingHero | Violet | `#C4B5FD` | `bg-violet-950` | `#2e1065` | **8.25** | Pass (body) |
| MartialArtsHero | Red | `#F87171` | `bg-red-950` | `#450a0a` | **5.84** | Pass (body) |
| MusicHero | Orange | `#FDBA74` | `bg-neutral-900` | `#171717` | **10.63** | Pass (body) |
| OratoryHero | Blue | `#93C5FD` | `bg-blue-950` | `#172554` | **8.15** | Pass (body) |
| PhotographyHero | Cyan | `#67E8F9` | `bg-slate-900` | `#0f172a` | **12.32** | Pass (body) |
| ScienceHero | Teal | `#5EEAD4` | `bg-cyan-950` | `#083344` | **9.06** | Pass (body) |
| TheatreHero | Purple | `#D8B4FE` | `bg-purple-950` | `#3b0764` | **8.48** | Pass (body) |
| TuringitesHero | Terminal | `#4ADE80` | `bg-black` | `#000000` | **12.05** | Pass (body) |

**All 16 pass AA comfortably.** This directly refutes the "may be close"
worry `animation-caveats.md` §5 flagged for Sepia, Crimson, and Terminal —
Crimson (Film Society, 9.33:1) and Terminal (Turingites, 12.05:1) are not
close to failing at all; that caveat looks to have already been resolved by
the `accent.dark` migration and can likely be closed or downgraded in the
caveats log.

### The regression case — what happens if `var(--club-accent)` (accent.light) is used instead of `accent.dark` on these same cards

This quantifies exactly how severe the `EntrepreneurshipHero` bug class is,
and shows it isn't an isolated fluke — it's what would happen to **any** of
these 16 heroes if the same mistake recurred:

| Hero | accent.light | Ratio on its own card | Verdict |
|---|---|---|---|
| AnimalWelfareHero | `#B45309` | 2.98 | **FAIL** |
| ArtHero | `#A21CAF` | 2.82 | **FAIL** |
| AstronomyHero | `#4338CA` | 2.55 | **FAIL** |
| DanceHero | `#BE123C` | 2.49 | **FAIL** |
| EntrepreneurshipHero | `#047857` | **3.26** | Large-text only — **this is the live, shipped bug** |
| FashionHero | `#9D174D` | 1.98 | **FAIL** |
| FilmSocietyHero | `#7F1D1D` | 1.77 | **FAIL** |
| FossHero | `#0369A1` | 3.01 | Large-text only |
| GamingHero | `#6D28D9` | 2.14 | **FAIL** |
| MartialArtsHero | `#B91C1C` | 2.50 | **FAIL** |
| MusicHero | `#C2410C` | 3.46 | Large-text only |
| OratoryHero | `#1D4ED8` | 2.19 | **FAIL** |
| PhotographyHero | `#0E7490` | 3.33 | Large-text only |
| ScienceHero | `#0F766E` | 2.45 | **FAIL** |
| TheatreHero | `#7E22CE` | 2.15 | **FAIL** |
| TuringitesHero | `#15803D` | 4.19 | Large-text only |

11 of 16 would fail AA outright; the other 5 (including Entrepreneurship's
actual, live values) only clear the large-text 3:1 threshold, never the
4.5:1 body-text bar. **Entrepreneurship's 4 remaining unmigrated spots
(icon color, `$` text fill, growth-line stroke, final-point fill — lines
53/74/108/129) render at exactly this 3.26:1 failure value today.**

### Secondary/subtitle text — sampled, alpha-composited onto card background

| Hero | Class | Ratio | Verdict |
|---|---|---|---|
| AnimalWelfareHero | `text-amber-200/80` on `bg-amber-950` | 8.17 | Pass |
| DanceHero | `text-rose-200/80` on `bg-rose-950` | 7.43 | Pass |
| FilmSocietyHero | `text-zinc-400` on `bg-zinc-900` | 6.91 | Pass |
| MusicHero | `text-neutral-400` on `bg-neutral-900` | 7.11 | Pass |
| AstronomyHero | `text-slate-300` on `bg-slate-950` | 13.59 | Pass |
| OratoryHero | `text-blue-200/80` on `bg-blue-950` | 7.15 | Pass |
| GamingHero | `text-violet-200/80` on `bg-violet-950` | 7.43 | Pass |
| **TuringitesHero** | `text-green-600/80` on `bg-black`, 14px normal weight | **4.30** | **Fails body-text AA (needs 4.5:1); clears large-text 3:1** |

Turingites is the one subtitle-contrast finding in this sample — small
margin (0.20 short of AA), but a real, computed failure, not a judgment
call. **P2.**

### Theme-adaptive heroes (Gardening, Literary) — not re-derived here

Both use `var(--club-accent)` directly against genuinely theme-adaptive
backgrounds (`bg-emerald-50/50`/`dark:bg-emerald-950/25` and
`bg-amber-50/60`/`dark:bg-amber-950/20`), which is architecturally correct
per the codebase's own contrast-fix precedent (`animation-caveats.md` §15
already states these were confirmed at 4.9–6.9:1 light / 12+:1 dark). Not
re-derived here because the opacity-over-opacity compositing against the
page's own background requires knowing the exact rendered page background
at that alpha stack, which weren't independently re-verified this pass —
flagged, not re-measured, to avoid asserting false precision.

### Accessible-name (SVG) audit

**Verified two ways**: source inspection, then cross-checked against real
prerendered HTML from a production `docusaurus build` (`grep -o 'role=img
aria-label="[^"]*"'` — Docusaurus's static renderer emits `role=img`
unquoted, which is valid HTML; both forms were checked). The build output
matched source in every case checked.

| Hero | `role=img` + `aria-label` on primary SVG? |
|---|---|
| `AstronomyHero.jsx` (control) | **Yes** — confirmed present in both source and the built `build/docs/clubs/astronomy-club/index.html` (`aria-label="An observer at a telescope beneath a constellation"`) |
| 17 of the remaining 19 SVG-based club/Library/Archives heroes | **Yes** — confirmed present in source |
| `MartialArtsHero.jsx` | **No** — confirmed absent in source **and** in the live build output (`build/docs/clubs/martial-arts-club/index.html`; zero `role=img` matches despite 9 `<svg>` tags on the page) |
| `EntrepreneurshipHero.jsx` | **No** — confirmed absent in source **and** in the live build output (same check, 9 `<svg>` tags, zero `role=img` matches) |
| `OratoryHero.jsx` | N/A — no custom SVG illustration (Lucide `Mic` icon + CSS-driven rings instead) |
| Fest heroes (Tech/General/Cultural) | Mixed — Tech Fest's visual is DOM text (inherently accessible), General/Cultural's confetti/icon SVGs are decorative-only and reasonably left unlabeled |

### Keyboard operability audit

**Verified against real prerendered HTML**, not just source: fetched
`build/docs/clubs/astronomy-club/index.html` and
`build/docs/clubs/martial-arts-club/index.html` from a production build and
isolated the hero's own root `<div>` (matched on its exact class string,
e.g. `rounded-2xl bg-slate-950`). Neither hero's root div carries a
`tabindex` attribute. Both pages do contain `tabindex=0` — 20 occurrences
each — but every one of those, confirmed by inspecting the surrounding
markup, belongs to Docusaurus's own sidebar navigation (`class="...
menu__link..."`), not the hero. `cursor-pointer` was searched for across
both full page bodies: **zero matches**, confirming the missing-affordance
finding live, not just in source.

| Interaction | Keyboard-reachable? |
|---|---|
| Club/fest page hero replay (bare `<div onClick>`) | **No** — confirmed absent `tabIndex`/`role`/`onKeyDown` in `useIntroMotion.js`'s `hoverProps` (source), and confirmed absent on the rendered hero `<div>` in a real production build (live evidence) |
| `/clubs` directory mini-hero card navigation (`<Link>` wrapping the hero) | **Yes** for navigation — the `<Link>` is a native, focusable anchor (source-level; not independently re-verified live this pass). The hero's own internal replay click handler is still not independently keyboard-reachable inside that card. |

---

## Evidence limits (stated plainly, not glossed over)

- **No browser-automation tool was available this session** (no
  Playwright/Puppeteer/screenshot capability exposed) — confirmed by tool
  search before starting this work. This means:
  - The contrast numbers in Part 3 are computed from source hex values via
    the standard WCAG relative-luminance formula, which is exact arithmetic
    for solid colors, but wasn't cross-checked against an actual rendered
    pixel sample (no screenshot capability existed to do that).
  - No true visual/screenshot evidence, no real browser console-error
    capture, no verification of focus-ring visibility or actual Tab-key
    traversal order on a live page — the keyboard findings above are based
    on presence/absence of `tabindex`/`role` attributes in real rendered
    HTML, which correctly predicts keyboard reachability but wasn't
    confirmed by literally pressing Tab in a browser.
  - No narrow-viewport screenshot to confirm the Responsive dimension's
    flagged risk (Part 2 §4) as an actual visual defect rather than a
    code-pattern-indicated risk — that item remains a flagged risk, not a
    confirmed one.
- **Docusaurus's dev server (`docusaurus start`) serves a client-rendered
  SPA shell to non-JS fetches** — an initial `curl` against it returned
  only the generic app shell (confirmed: page `<title>` read back as the
  site default, zero club-specific content in the raw response), not
  per-route content, since dev mode doesn't prerender each route to static
  HTML the way a production build does. **Recovered from this**: ran a real
  production build (`docusaurus build`, ~50KB of real per-route HTML per
  page) and grepped that output directly for every accessibility claim
  above — the keyboard-operability and SVG-accessible-name findings in Part
  3 are confirmed against genuine prerendered markup, not just source code,
  which is materially stronger evidence than a source-only read would be.
- Per Impeccable's own critique invariants, this run used **two isolated
  sub-agents**. Assessment A (design review) completed in full,
  independently, with no visibility into any other output. **Assessment B
  (detector + evidence) hit a session-limit API error partway through** —
  it had already confirmed the CLI detector findings (identical to the 11
  findings the parent context obtained independently, see Part 1) before
  failing, but did not complete its assigned live-evidence check. The
  parent context then performed that live-evidence verification directly
  (the production-build grep checks throughout Part 3), which is disclosed
  here rather than silently substituted — this run was **not** degraded on
  the "no sub-agent tool available" axis (both were genuinely dispatched as
  isolated sub-agents), but Assessment B specifically was interrupted and
  its remaining scope was completed in-context instead.
