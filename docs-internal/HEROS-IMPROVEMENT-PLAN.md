# Hero Animations — Improvement Plan

A prioritized backlog for the 23 existing hero components. For what each
hero currently does and why, see [`HEROS.md`](HEROS.md) (the reference).
For the running "still open" log the team already maintains, see
[`animation-caveats.md`](animation-caveats.md) — several items below are
promoted from that log with a severity tag and a recommended fix path;
others are new findings from this pass.

## Method and its limits

This is a **source-level read** — every finding below is grounded in the
actual component code, `useIntroMotion.js`/`useClubAccent.js`, and
`PRODUCT.md`/`DESIGN.md`. It borrows the vocabulary of Impeccable's two
evaluation commands (`critique`'s heuristic UX read, `audit`'s five
technical dimensions) so findings are prioritized and phrased the same way
this project already phrases its own contrast/WCAG work — but it is **not**
a substitute for either command's real run. Neither `critique` nor `audit`
executed here: both require live browser inspection plus the bundled
mechanical detector (`detect.mjs`), and this pass didn't render the site.
Treat the dimension scores below as a source-code estimate, not a verified
score, and re-run `/impeccable audit` against the live site once a dev
server is available to confirm or correct them.

Every finding is tagged **P0–P3** (P0 blocking → P3 polish, same scale
`audit.md` uses) and, where one applies, mapped to the Impeccable command
that owns the fix.

## Estimated dimension scores (source-level, unverified)

| # | Dimension | Est. | Why |
|---|---|---|---|
| 1 | Accessibility | 3/4 | `prefers-reduced-motion` handled once, centrally, and correctly (Do's/Don'ts, `PRODUCT.md`). Contrast has been actively audited and fixed in most heroes — but one fix is documented as *half-applied* (P1 below), and hero replay has no keyboard path at all (P1 below). |
| 2 | Performance | 2/4 | No off-screen pause exists yet; several heroes loop `Infinity` while playing, and a page stacking many heroes (the directory) pays for all of them running until the reader scrolls. Individually each hero is cheap. |
| 3 | Theming | 3/4 | The `--club-accent` custom-property bridge is a genuinely clean token pattern. Deducted for: an unreachable settings toggle (the mode-switch code exists, but nothing calls it), and a motion side that has no token layer at all (durations/eases are ad hoc per file) even though color/radius/spacing do. |
| 4 | Responsive | unscored | No breakpoint behavior for the heroes specifically was found in the files read (Docusaurus's own sitewide breakpoint is generic, not hero-authored). This needs an actual viewport check before scoring — flagged as an audit gap, not asserted as a failure. |
| 5 | Implementation Integrity | 4/4 | Strikingly coherent for a 23-component set: one shared playback contract, one shared accent system, documented rationale in every file header, real bug-fixes-as-comments (transform ownership, `offsetPath` + rotate, hydration-safe PRNG) that read as institutional memory rather than noise. |

---

## P1 — fix before calling any hero "done"

### 1. Hero replay has no keyboard path
**Where:** `useIntroMotion.js`, `hoverProps` (returns `{ onClick, ...ref }`
only — no `tabIndex`, `role`, or `onKeyDown`), spread onto a plain `<div>`
in every hero.
**Impact:** every hero's replay is reachable by mouse click and by touch
tap, but a keyboard-only visitor has no way to trigger it at all — the root
element isn't in the tab order and has no key handler. This is the one
concrete a11y gap in an otherwise carefully reduced-motion-aware system, and
it directly contradicts `PRODUCT.md`'s own principle that "accessibility...
support are baseline requirements applied once in shared code" — this one
slipped through the shared code itself.
**Fix path:** add `tabIndex={0}`, `role="button"` (or a real `<button>`
wrapper with `all: unset` styling), an `aria-label` describing what replay
does, and an `onKeyDown` that fires on Enter/Space, all inside
`hoverProps` — one change, all 23 heroes inherit it.
**Command:** `/impeccable harden` (this is exactly the class of gap that
command is for: production-readiness, not new design).

### 2. Off-screen heroes keep animating
**Where:** `useIntroMotion.js` has no `IntersectionObserver`-based pause;
promoted from `animation-caveats.md` §9.
**Impact:** Science's orbit, Gaming's chase, Art's color cycle, Oratory's
rings, and Film's frame-advance all loop with `repeat: Infinity` for as long
as `isPlaying` is true — which, on first arrival, is until the reader
scrolls, regardless of whether the hero itself is on screen. A directory
page stacking many heroes at once (the worst case named in the caveats log)
pays the animation cost for all of them simultaneously.
**Fix path:** exactly as `CLAUDE.md`'s own remaining-infra-task #2 specifies
— one `IntersectionObserver` added once inside `useIntroMotion`, not
per-component.
**Command:** `/impeccable optimize`.

### 3. `EntrepreneurshipHero`'s WCAG contrast fix is half-applied
**Where:** `EntrepreneurshipHero.jsx` — the `<h1>` (line 42) was migrated to
`accent.dark`; four more spots were missed: the `Lightbulb` icon color
(line 53), the `$` `<motion.text>` fill (line 74 — a real ~3.26:1 contrast
failure, not a theoretical one), the growth-line stroke (line 108), and the
final point's fill (line 129). All four still read `var(--club-accent)`,
which flips to the light-mode hex (designed for text-on-white) against this
hero's permanently-dark card.
**Impact:** direct WCAG 2.1 AA violation (1.4.3, Contrast Minimum) in light
mode, on a hero that otherwise already got the fix applied everywhere else
in the file. This is the one hero in the "fixed-dark-card" cohort (10+
others: Astronomy, Film Society, Fashion, Art, etc.) that didn't finish the
migration.
**Fix path:** swap all four remaining `var(--club-accent)` references to
`accent.dark`, matching the rest of the file and every sibling hero that
already got the full pass.
**Command:** `/impeccable harden` (or fold into the audit's contrast pass,
item 5 below).

### 4. Unified-accent-mode toggle has no UI
**Where:** `useClubAccent.js` / `clubAccents.js` — `useAccentMode()` and
`setAccentMode()` are fully implemented and correctly wired to
`localStorage` and a cross-tab `storage`/`sai-accent-change` event, but
**nothing in the app calls `setAccentMode`.**
**Impact:** a real, shipped, tested-at-the-hook-level feature is completely
unreachable by any actual visitor. This is `CLAUDE.md`'s own remaining
infra task #1 and the highest-priority item in that checklist for a reason
— every other accent-system decision downstream (which heroes opt out, how
contrast was audited) assumes a reader can actually reach unified mode, and
today none can.
**Fix path:** a settings control (navbar item or a small settings page)
calling `setAccentMode('unified' | 'per-club')`, persisted via the hook
that already exists.
**Command:** `/impeccable shape` first (this is a UI surface that doesn't
exist yet — decide navbar item vs. settings page before building), then
build directly.

---

## P2 — real gaps, not urgent

### 5. Accent contrast hasn't been audited end-to-end
**Where:** all 18 entries in `clubAccents.js`.
**Impact:** `animation-caveats.md` §5 already flags Sepia, Crimson, and
Terminal as "close to their surfaces" without having been checked against
the *final* locked light/dark backgrounds. Given that item 3 above shows a
contrast bug can ship even after an audit pass claims completion for a
file, a systematic re-check (all 18 accents × both card-background types —
fixed-dark cards vs. theme-adaptive cards) is worth doing as one pass
rather than trusting per-hero self-report.
**Command:** `/impeccable audit` (Accessibility dimension), run against the
live site once available.

### 6. No shared motion-token layer
**Where:** every hero file, individually. Durations range from Oratory's
1.8s ring cycle to Entrepreneurship's 3.4s full sequence, with eases
hand-picked per file (`easeOut`, `easeInOut`, custom cubic-beziers like
`[0.34, 1.4, 0.64, 1]` for overshoot, `[0.4, 0, 0.3, 1]` for the Art Club
wipe) — each one plausibly reasoned about in isolation, but none of it
routes through a shared constant the way color/radius/spacing already must
under `DESIGN.md`'s Token-Only Rule.
**Impact:** not a bug — every duration/ease reads as a deliberate per-hero
choice in the code comments, and `HEROS.md` documents the reasoning behind
several of them. But there's no way to answer "is our overshoot ease
consistent across heroes" except by grepping 23 files, and a future
site-wide motion-speed change (e.g., a "reduce intensity" setting beyond
the binary reduced-motion switch) has nowhere to hook in.
**Fix path:** not urgent enough to force a rewrite of working heroes.
Worth doing opportunistically: a small `src/components/motionTokens.js`
(a handful of named durations/eases) that *new* heroes and any hero touched
for another reason adopt, rather than a forced pass across all 23.
**Command:** `/impeccable extract` (pulling reusable values out of existing
components into a shared token file is exactly that command's job).

### 7. Fest heroes borrow unrelated clubs' accents
**Where:** `TechFestHero` borrows Turingites' Terminal accent, `GeneralFestHero`
borrows Art Club's Fuchsia, `CulturalFestHero` borrows Theatre's Purple —
noted directly in each file's own code comments as a borrow, not a real
assignment.
**Impact:** functionally fine (the borrowed hues are already contextually
sensible — Tech/Terminal, General/festive-multi-hue via Art, Cultural/rich
purple via Theatre), but it means fests have no accent identity of their
own in `clubAccents.js`, and any future change to Turingites', Art's, or
Theatre's accent silently reflows onto an unrelated fest hero too.
**Fix path:** add three dedicated fest entries to `clubAccents.js` if fests
are ever meant to be color-independent from the clubs they currently borrow
from; otherwise, document the borrow as permanent and intentional rather
than provisional.
**Command:** none needed beyond a decision — flag to the team as a
this-or-that, not a build task.

### 8. Gaming Club's Pac-Man-adjacent color choice is a flagged, live risk
**Where:** `GamingHero.jsx` header comment, lines 8–14 — the muncher is
filled solid yellow (`#FACC15`) "at the requester's explicit direction,"
overriding an earlier deliberate off-yellow chosen specifically to avoid
Namco trade-dress association. The file itself says to "revisit if this
ships to a real public audience."
**Impact:** per `PRODUCT.md`, this **is** shipping to a real public
audience — a free, publicly hosted university wiki, not an internal
prototype. The risk was knowingly accepted once already; this is a flag to
re-confirm that acceptance now that the "real public audience" condition
the file's own comment names as the revisit trigger has been met, not a
claim that it's currently a problem.
**Fix path:** a one-line decision from whoever owns that call — keep as-is,
or shift the fill back toward the earlier off-yellow compromise.
**Command:** none — this is a risk-tolerance confirmation, not a design
task.

### 9. Fashion Club's garment paths remain the roughest hand-authored
drawings in the set
**Where:** `FashionHero.jsx`, `DRESS`/`SUIT` path constants (lines 20–32);
flagged twice already in `animation-caveats.md` §11 and §14, with a CP3 pass
already having swapped in a more standard/symmetric silhouette.
**Impact:** legible at hero size today, but visibly the weakest line-art
craft next to Astronomy's hand-placed constellation or Gardening's
leaf-hinge geometry, both of which read as considered rather than rough.
**Fix path:** documented and ready — trace properly using the exact
workflow in `docs-internal/archive/traced-handwriting-guide.md` (~20 min in
Figma per the Literary Club precedent), then swap the path data in.
**Command:** `/impeccable polish`.

### 10. `offsetPath` (Science hero) has no older-browser fallback
**Where:** `ScienceHero.jsx`; flagged in `animation-caveats.md` §8.
**Impact:** solid support in 2023+ Chrome/Safari/Firefox; no data exists on
what fraction of this site's actual visitors are on older engines, so this
is a real but currently unquantified risk, not a confirmed defect.
**Fix path:** a sin/cos-driven fallback binding electrons to their ellipses
manually, gated behind a feature check — not built yet, and per the caveats
log, intentionally deferred until there's a concrete reason to prioritize
it.
**Command:** `/impeccable adapt`, if and when browser-support data justifies
it.

---

## P3 — polish, do opportunistically

### 11. Literary Club's reveal is a wipe, not a true pen-stroke trace
Already fully documented with an upgrade path in
`docs-internal/archive/traced-handwriting-guide.md` and
`animation-caveats.md` §1 — a one-prop swap once someone spends the ~20
minutes tracing a real stroke path in Figma. Lowest urgency of the "known
craft debt" items because the current font-mask version is already legible
and editable.
**Command:** `/impeccable polish`.

### 12. Archives hero: hardcoded years, thin wall relative to the real
400+ event count
**Where:** `ArchivesHero.jsx`, `PULLS` array (hardcoded `2024`/`2025`/`2026`
labels) and `SPINES` (12 entries).
**Impact:** cosmetic only — 12 spines already reads as "a lot" at hero
size, and the years are plausible placeholders, not wrong data. But per
`animation-caveats.md` §3, driving the pulled years from real archive data
(or props) and adding a second spine row behind the first would make the
hero's "four hundred events, every one still here" tagline feel backed by
its own visual, rather than asserted next to an unrelated dense-but-generic
wall.
**Command:** `/impeccable harden` (props/data-wiring) or `/impeccable
delight` (the second-row density idea specifically).

### 13. Dance Club's audio path is half-wired, on purpose, waiting on an
asset
**Where:** `animation-caveats.md` §14 — a click-to-play button was built
during CP3 using the proven `MusicHero`/`FestSound` pattern, then reverted
the same session because no audio file existed yet.
**Impact:** none currently — correctly not shipped half-working. Listed
here only so it isn't lost: the wiring is proven and ready to re-add the
moment a royalty-free or original track is supplied.
**Command:** none until an audio asset exists.

### 14. No sound effects tied to the animation beats themselves
**Where:** `animation-caveats.md` §12 — explicitly distinct from the
background theme toggle (`FestSound`) that already exists on Music Club and
all three fests. Terminal keystrokes (Tech Fest), a confetti pop (General
Fest), a shutter click (Photography) are all named as unbuilt ideas.
**Impact:** a genuine delight opportunity, gated the same way the
background-audio feature is: needs actual short audio assets, which are a
licensing matter under this project's CC BY-NC-SA content license, not a
code task.
**Command:** `/impeccable delight`, once assets exist.

---

## Patterns worth naming

- **The half-finished-migration pattern (item 3) is the one repeat risk in
  an otherwise disciplined set.** Ten-plus heroes got a full contrast-fix
  pass; one didn't finish. That's not a design flaw so much as a process
  gap — nothing currently re-verifies that a documented "migrate these N
  spots" fix actually touched all N spots after the fact. Worth treating
  contrast fixes as checklist items with an explicit done-count next time,
  rather than a prose instruction trusted to be fully applied.
- **Every "the color is the concept" exception (items in `HEROS.md`'s
  cross-cutting section) is deliberate and already documented** — none of
  these read as accidental hardcoding, which is a meaningfully different
  finding than the same pattern would be in a less-documented codebase.
- **Bug-fix rationale lives in code comments, not just commit history**,
  across `PhotographyHero`, `AnimalWelfareHero`, `ScienceHero`, and
  `GeneralFestHero`. This is unusually good institutional memory for a
  23-component set and is worth explicitly preserving as a convention going
  forward, not just a nice accident of how these happened to get built.

## Positive findings (keep doing this)

- The two-hook architecture (`useIntroMotion`, `useClubAccent`) genuinely
  delivers on `DESIGN.md`'s promise that "bespoke-per-club craft never turns
  into per-club inconsistency" — reduced-motion, SSR-safety, and the
  stop-on-scroll rule are each solved exactly once and inherited by all 23.
- The click-over-hover replay decision is well-reasoned and already
  correctly documented in three places (`useIntroMotion.js`,
  `DESIGN.md`'s Do's and Don'ts, `HEROS.md`) — a rare case of a UX decision
  that was tried, measured against a real failure mode (incidental hover on
  a dense directory page), reverted, and left a paper trail explaining why.
- `GeneralFestHero`'s seeded-PRNG fix for the SSR/hydration mismatch is a
  genuinely sophisticated, correctly-diagnosed fix (confirmed via the
  project's own Playwright suite) — worth using as the reference example if
  another hero ever needs module-scope randomness.
- The deliberate "build once and hold" vs. "loop forever" choice is made
  per-concept, not by default, and each choice is justified against what the
  animation is supposed to mean (growth that resets isn't growth; an orbit
  that stops mid-arc is just a stray dot) — this is real motion-design
  judgment, not a technical shortcut.

## Recommended action order

1. **P1 #1** `/impeccable harden` — keyboard-operable hero replay (touches
   shared code once, fixes all 23 heroes at once).
2. **P1 #3** `/impeccable harden` — finish `EntrepreneurshipHero`'s contrast
   migration (four lines, already fully diagnosed).
3. **P1 #2** `/impeccable optimize` — off-screen `IntersectionObserver`
   pause in `useIntroMotion`.
4. **P1 #4** `/impeccable shape` → build — unified-mode settings toggle UI.
5. **P2 #5** `/impeccable audit` — full 18-accent × 2-card-type contrast
   pass, run against the live site.
6. **P2 #6–#10** — opportunistic, no forced schedule; fold into whichever
   hero is next touched for another reason.
7. **P3 #11–#14** — do when an idle pass or a supplied audio asset makes
   one cheap, not on a deadline.
8. Once P1s land: run **`/impeccable audit`** for real (browser + detector)
   against the live site to replace this doc's estimated scores with
   verified ones, then **`/impeccable polish`** as the final pass.
