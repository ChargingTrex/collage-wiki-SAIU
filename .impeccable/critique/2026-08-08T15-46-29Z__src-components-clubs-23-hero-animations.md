---
target: 23 hero animation components (clubs+fests+Library+Archives)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-08T15-46-29Z
slug: src-components-clubs-23-hero-animations
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
