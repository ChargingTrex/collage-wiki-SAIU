# Animation & Transitions — Technical Reference

What actually exists in code today: the two shared systems every hero and
carousel is built on, the concrete motion techniques in use, what's still
just documented-but-unbuilt, and the real bugs already hit (and fixed) so
future work doesn't repeat them.

This is a reference, not a task list — for open decisions and unresolved
items, see [`animation-caveats.md`](animation-caveats.md), the authoritative
running log. This doc exists to answer "how does the animation system
actually work right now," so that log stays about decisions, not mechanics.

---

## 1. The two shared systems

Every animated surface on the site is built on exactly two hooks. No hero or
carousel reimplements playback, reduced-motion, or autoplay logic locally —
extending one of these two hooks is always the right move, never a per-
component patch.

### `useIntroMotion` (`src/components/useIntroMotion.js`)

Governs all 23 hero animations. One rule: **animate while the reader is
arriving, go still once they start working, replay on demand.**

- **Arrival:** plays automatically on mount, but only if `window.scrollY <=
  scrollThreshold` (default `24px`) at that moment — someone landing mid-page
  (deep link, refresh, browser scroll restoration) never saw the top of the
  page and isn't "arriving," so they don't get the intro.
- **"Working" (stop signal):** the first scroll past the threshold, wheel,
  touchmove, keydown, or pointerdown after mount. Each listener except
  `scroll` is `{ once: true }`. Once stopped, it does **not** auto-restart on
  scrolling back to the top — the reader already saw it.
- **Replay:** a plain `onClick` handler (see §5 for why this isn't hover)
  spread via `hoverProps` — the prop is still named `hoverProps` for
  call-site compatibility even though it's click-driven. Click toggles: click
  once to play, click again to stop early. `isReplaying` (`isClickPlaying`
  internally) is what heroes use to key-remount their SVG (`key={isReplaying
  ? 'hover' : 'intro'}`) so Framer restarts cleanly from frame one instead of
  animating from an arbitrary mid-state.
- **`prefers-reduced-motion`:** read once on mount via `matchMedia`. If set,
  `isPlaying` never becomes `true` — no intro, and the click handler becomes
  inert (`allowsMotion.current` gates it). This is a hard gate, not a
  softened animation.
- **`playOnVisible` option:** opt-in for below-the-fold heroes (currently
  only `GeneralFestHero`, homepage fest section). The default arrival check
  only reads scroll position once at mount (`0` on a fresh load regardless of
  where the hero sits), which would play the intro off-screen and have it
  finished before the reader scrolls down. With this on, an
  `IntersectionObserver` (`threshold: 0.3`, requires `intersectionRatio >=
  0.3`, not just any overlap) waits for the hero to actually enter the
  viewport before playing, then disconnects. The observer start is
  deliberately delayed 250ms past mount — web fonts loaded via `@import`
  swap in shortly after first paint and reflow the page, so observing
  immediately can lock in a stale "visible" verdict from the pre-font-swap
  layout.
- **Off-screen pause:** a second, always-on `IntersectionObserver`
  (`threshold: 0`, separate from `playOnVisible`'s one-shot start trigger)
  tracks whether the hero's root is currently intersecting the viewport at
  all, and gates the returned `isPlaying` on it (`isPlaying: (isIntroPlaying
  || isClickPlaying) && isVisible`). `containerRef` is now attached
  unconditionally (not just for `playOnVisible` heroes) since this observer
  needs it on every hero. See §7.
- **Keyboard access:** `hoverProps` also carries `role="button"`,
  `tabIndex={0}`, `aria-label="Replay animation"`, and an `onKeyDown` that
  mirrors `onClick` for Enter/Space — replay is reachable from the keyboard,
  not just mouse/touch.

### `useCarouselAutoplay` (`src/components/useCarouselAutoplay.js`)

Shared clock behind all three photo carousels (`ImageCarousel`,
`CoverflowCarousel`, `StackCarousel`).

- `setInterval`-driven advance, gated by `isPlaying && !reducedMotion &&
  !isHovered && itemCount > 1` — any one of those false stops the timer.
- **Reduced motion:** autoplay never runs at all, regardless of the
  `autoplay` prop or the play/pause button's own state — this is a hard
  disable, not a slow-down. Consumers are expected to hide the play/pause
  button entirely in this state (nothing for it to control).
- **Pause on hover:** independent of the play/pause toggle — a reader looking
  at a photo shouldn't have it yanked away mid-look.
- **WCAG 2.2.2 ("Pause, Stop, Hide"):** every carousel using this hook
  renders a visible play/pause control whenever autoplay is on.

---

## 2. Hero motion vocabulary — real techniques in use

Not a generic "spinning icon" library. Each hero's motion is built around
that club's actual activity, using whichever Framer Motion primitive fits.
Representative techniques, by pattern (not an exhaustive per-hero list — see
`animation-caveats.md` §6 for the full build/rebuild history):

- **`offsetPath` orbit binding** (`ScienceHero`) — electrons ride
  `offsetPath` bound to their own drawn ellipse's SVG arc command, with the
  ellipse's tilt baked directly into the path's x-axis-rotation parameter
  rather than applied as a separate CSS `rotate`. The combination of
  `offsetPath` + a standalone `rotate` doesn't compose reliably in Framer —
  the point ends up traveling the *unrotated* path while only its facing
  angle rotates, visibly cutting across the drawn shell. This is the one
  hero exempted from the play-once rule: a continuous orbit stopped mid-arc
  reads as a dot parked at random, so it loops (`repeat: Infinity`) while
  playing and parks at a deliberate `restAt` position when rested — still
  obeys the scroll-stop rule, just with a designed rest state instead of an
  arbitrary one.
- **Font-mask text reveal** (`LiteraryHero`) — real `Caveat`-font text
  revealed by a growing SVG `<mask>` rect, with a `Feather` icon quill
  riding `useMotionValue`/`useTransform` in lockstep with the mask's
  progress so the nib is always at the wet end of the line. Text width is
  measured at runtime (`getBBox()`) since the quote is an arbitrary-length
  prop, not a fixed viewBox constant. This is an explicitly acknowledged
  tradeoff, not a temporary placeholder: a left-to-right wipe, not a true
  pen stroke following letterforms. A traced-stroke upgrade path exists
  (`docs-internal/archive/traced-handwriting-guide.md`) but was judged worth
  doing once (Literary specifically), not 18 times.
- **Seeded-PRNG physical simulation** (`GeneralFestHero`) — confetti
  precomputed once at module load as a real ballistic arc (launch angle,
  peak, landing point, spin) using a `mulberry32` seeded PRNG, **not**
  `Math.random()`. This one is load-bearing, not a style choice: the module
  evaluates twice per page load (SSR/prerender, then again during client
  hydration), and `Math.random()` genuinely produces different sequences
  across those two evaluations — confirmed via this project's own Playwright
  suite to reproducibly throw a React hydration-mismatch (error #418). A
  fixed seed makes both evaluations byte-identical. Any future hero needing
  "randomized but deterministic across SSR/hydration" layout must follow this
  pattern, not reach for `Math.random()`/`Date.now()`.
- **Shared drop-and-settle primitive** (`primitives/Book.jsx`, used by
  `LibraryHero`/`ArchivesHero`) — a reusable `Book`/`Shelf` pair rather than
  a fixed icon, because a shelf needs varying spine width/height/lean plus a
  title that animates separately from the spine. One behavior is
  load-bearing across every caller: the title fades in **after** the book
  settles (`titleDelay`, must stay `> 0`), never simultaneously — that gap is
  what reads as "being catalogued" rather than a label that was always
  there. Drop uses a mild-overshoot ease (`[0.34, 1.2, 0.64, 1]`), not a
  cartoon bounce.
- **Parent-orchestrated stagger** (`GeneralFestHero`'s bunting/text,
  and elsewhere) — Framer `variants` + `staggerChildren`/`delayChildren` on
  a parent, rather than each child computing its own per-index delay offset
  by hand. Preferred pattern for any new multi-element entrance.
- **`whileHover` layered on top of the click-replay contract** — a hero can
  have a small `whileHover` micro-response (e.g. `GeneralFestHero`'s popper
  bump) as an immediate reaction to a direct hover, distinct from and
  layered on top of the full click-to-replay behavior the whole card gets
  from `useIntroMotion`. Hover micro-interactions on a *sub-element* are
  fine; hover-driven replay of the *whole hero* was tried and reverted (§5).

---

## 3. Carousels & drag

`ImageCarousel` (Fade), `CoverflowCarousel`, `StackCarousel` share one
`images` prop shape and one navigation model: prev/next buttons plus
drag-to-swipe using **Framer Motion's own built-in drag gesture system**
(`drag`, `dragConstraints`, `onDragEnd`'s velocity/offset) rather than
hand-rolled touch listeners. `AnimatePresence` + `motion.figure` (`x`/
`opacity`) drives the slide transition itself.

Reduced motion: the slide still changes on click/swipe (a deliberate user
action gets respected), it just doesn't animate — `transition: { duration:
0 }` rather than skipping the interaction entirely. This is a deliberately
different rule from hero intros (which skip entirely under reduced motion):
a carousel slide change is a direct response to the reader's own action, not
ambient motion happening to them.

---

## 4. Audio: click-to-play, one shared contract

Music Club (`MusicHero`) and all three fest heroes (via `FestSound.jsx`)
share one audio contract, applied consistently rather than reinvented per
component:

- Renders **nothing** unless an `audioSrc` prop is passed.
- **Click-to-play only, never autoplay.** Two concrete reasons on record
  (`animation-caveats.md` §7), not just a stylistic preference: hover fires
  accidentally when a cursor sweeps across a card on its way elsewhere (an
  18-card directory could trigger several at once), and browsers block audio
  before first user interaction anyway — a hover-triggered *first* play
  would be silent, reading as broken rather than as policy.
- `.play()` promise rejections are swallowed (`.catch(() => {})`) so a
  blocked/failed attempt doesn't throw into the console.
- Each fest/club takes its own independent `audioSrc`; `FestSound.jsx` is
  only the shared button + `<audio>` element, carrying no audio itself.

**Not yet built:** animation-tied sound *effects* (terminal keystrokes,
confetti pop, camera shutter) distinct from the background theme toggle
above — see `animation-caveats.md` §12.

---

## 5. Why click, not hover — the one playback decision worth knowing

`useIntroMotion` used to replay on hover (`onPointerEnter`/`onPointerLeave`).
This was deliberately changed to click/tap during full hero integration,
after testing both: hover was stopping/replaying heroes on **incidental**
cursor drift (trackpad movement, a cursor merely passing through on its way
somewhere else), which read as broken rather than intentional, and hover
doesn't exist as a concept on touch devices at all. Click requires
deliberate intent and behaves identically across input types. The hook's
returned flag was renamed `isHovered` → `isReplaying` sitewide when this
landed, but the prop name `hoverProps` was kept for call-site compatibility
— don't read the prop name as evidence of current behavior.

(`docs-internal/animation-caveats.md` §4 still describes the old hover
behavior in its prose — that section predates the migration and is stale on
this specific point; the code and `CONTRIBUTING.md` are current.)

---

## 6. The fallback layer: documented, never actually built

`CLAUDE.md` specifies `motion.css`/`motion.js` as a **kept, not deprecated**
pure-CSS fallback layer for any effect with no Framer Motion equivalent, and
`docusaurus.config.js` is supposed to wire `motion.js` in via
`clientModules`. **Neither file exists in the codebase, and nothing
references them in config.** Framer Motion has covered every effect built so
far, so the fallback has never actually been exercised. This isn't a defect
to fix reflexively — it's a real gap between the documented architecture and
current reality worth knowing before assuming the fallback layer is
available: if a future hero needs it, it has to be built from scratch, not
extended.

---

## 7. Off-screen performance — resolved

Several heroes loop indefinitely (`repeat: Infinity` while `isPlaying`):
Science (electron orbits), Gaming (arcade chase), Art (brushstroke color
cycle), Music/Dance (waveform pulses), Oratory (rings), Film Society
(projector advance), plus Turingites' `setInterval`-driven generation
stepper. On a page stacking many heroes at once (the club/fest directory
grid, which mounts each club's real, full hero component via
`MiniHeroCard`'s CSS `transform` scale-down — not a lightweight separate
preview), that was a meaningful chunk of the 18 running continuously
off-screen.

**Status: built**, per §1 above — `useIntroMotion`'s second, always-on
`IntersectionObserver` gates `isPlaying` on actual viewport intersection,
once inside the hook rather than per-component, the same way
`playOnVisible`'s observer already worked. `MiniHeroCard`'s preview wrapper
is `inert` (removes focus/pointer interaction) but that doesn't affect
layout or intersection, so the observer measures it normally. See
`animation-caveats.md` §9 for the full account.

---

## 8. Footer easter egg animation

The hidden 🦖 trigger (`src/theme/Footer/index.js`) isn't Framer-driven —
it's a third-party game (`react-chrome-dino`) with two animation-adjacent
patches layered on top:

- **Recolor via `mix-blend-mode: color`** on a solid overlay div, not a CSS
  `filter`. `filter` flattened the whole grayscale canvas into one solid
  block; blend-mode preserves the dino/ground/clouds' light-dark contrast
  while only shifting hue — needed so the dino stays recognizable as it
  recolors between green (default) and the unified accent color.
- **A `CSSStyleSheet.prototype.insertRule` patch**, applied on module load.
  `react-chrome-dino`'s bundled Runner calls `insertRule(rule, 0)` on the
  page's first stylesheet the instant the game actually starts (first
  keypress), assuming index 0 is always a safe insertion point. It isn't
  here: `custom.css` opens with an `@import` for the handwriting fonts, and
  CSS requires `@import` to precede every other rule in its stylesheet, so
  inserting at index 0 throws `HierarchyRequestError`. The patch falls back
  to appending at the end when that happens, which is safe because rule
  *order* among non-`@import` rules doesn't matter for the `@keyframes` rule
  being inserted here.

---

## 9. Cross-cutting rules (apply to every animated surface)

- `prefers-reduced-motion` is read once per hook instance and gates hard —
  no animation plays, and the rested/default state renders immediately. A
  user action (click replay, carousel swipe) still changes state, it just
  doesn't animate through the change.
- Deterministic layout at module scope (confetti positions, any precomputed
  "random" arrangement) must use a seeded PRNG (`mulberry32` pattern), never
  `Math.random()`/`Date.now()` — see §2's seeded-PRNG note for why this is a
  hard requirement, not a preference.
- A `key={isReplaying ? 'hover' : 'intro'}` remount is how heroes restart
  Framer cleanly on replay. Whatever gets this `key`, its Framer elements
  need an explicit `initial` state that actually differs from the animated
  target (`initial="rested"` for a `variants` lookup, or the literal rest
  value object for a plain ternary `animate` prop) — see §10's Bug 3. A
  freshly mounted element with `initial={false}` has no "from" state to
  animate out of and will silently snap to its resting value with zero
  visible motion on every replay.
- Never combine a static `transform`/translate attribute with Framer-animated
  `x`/`y` on the *same* element — Framer needs to own `transform` itself, and
  the static offset silently drops. Put static positioning on a plain outer
  `<g>`, and let only the inner `motion.g` carry the animated `x`/`y` (or
  scale/opacity). See §10's per-hero fixes for two independent real
  instances of this bug.

---

## 10. Real bugs already hit — read before touching hero internals

These are documented so future animation work doesn't rediscover them the
hard way. Full detail in `changes.md`'s 2026-07-27 (CP3) and 2026-07-28
entries; distilled here as reusable lessons.

1. **Remount-replay silently didn't animate (sitewide).** `initial={false}`
   on a freshly-mounted Framer element (which every click-replay remount is,
   via the `key` swap) gives Framer no "from" state, so it settles instantly
   with no visible motion instead of animating through the `playing`
   variant. Fixed across every affected hero by using an explicit rest state
   as `initial` instead of `false`. This is now codified as a hard rule in
   §9 — don't reintroduce `initial={false}` on any element carrying a `key`
   that changes on replay.
2. **Static transform + Framer `x`/`y` conflict (found independently twice).**
   Photography's viewfinder corner brackets and Animal Welfare's paw-print
   trail both mixed a static `transform` attribute with Framer-animated
   `x`/`y` on the same element; the static offset was silently dropped both
   times, collapsing the effect to a single point at the SVG origin. Same
   fix both times: split into an outer plain `<g>` for static position and
   an inner `motion.g` for the animated properties. Now a named rule in §9.
3. **Fixed-dark-card heroes reading `--club-accent` in light site-mode.**
   `--club-accent` flips `.light`/`.dark` based on **site** theme, but most
   hero cards have a background that stays dark **regardless** of site
   theme (only Gardening/Literary/Library/Archives actually change
   background with the theme). In light site-mode this rendered
   headings/foreground elements in the `.light` accent value — sized for
   text-on-white — against a permanently dark card, dropping contrast as low
   as 1.77:1–2.98:1. Fix is `accent.dark` (already available off
   `useClubAccent()`) for any element on a permanently-dark card, not the
   theme-flipping CSS variable. **Now fully fixed** — `EntrepreneurshipHero
   .jsx`'s remaining four spots (an icon color, an SVG text fill, a path
   stroke, a circle fill) all migrated to `accent.dark`, matching the other
   17 heroes. Computed contrast confirms it: 11.71:1 now vs. the old bug
   value's measured 3.26:1; the same regression run across the other 15
   fixed-dark-card heroes shows 11 of them would have failed AA outright had
   the same mistake been made there. Full numbers in `animation-caveats.md`
   §15 and `docs-internal/HEROS-AUDIT-CRITIQUE.md` Part 3.
4. **Hydration mismatch from module-scope `Math.random()`.** See §2 — fixed
   with the `mulberry32` seeded-PRNG pattern, now the required approach for
   any deterministic-but-randomized layout precomputed at module load.
5. **`offsetPath` + separate CSS `rotate` doesn't compose.** See §2's
   Science orbit note — an electron following an `offsetPath` visibly cut
   across its own drawn (rotated) shell instead of tracing it, because the
   rotation was applied as a sibling CSS property instead of baked into the
   path's own arc command. Bake tilt/rotation into the path data itself for
   any future `offsetPath`-based motion.
6. **`border` Tailwind utilities rendering invisible (sitewide, 12 spots).**
   Not a Framer bug, but animation-adjacent (hit while building hero card
   borders): `corePlugins.preflight: false` means `border-style` never
   resets from its `none` initial value, so a bare `border`/`border-2`
   utility paints nothing without an explicit `border-solid`. Fixed narrowly
   (12 call sites), not with a global `* { border-style: solid }` reset,
   which broke Infima's own conditional borders. Relevant to any new hero
   card using a plain Tailwind border utility.

---

## 11. Known open items (pointers, not duplicated here)

Full detail and status lives in `animation-caveats.md`; flagging only what's
directly relevant to *future animation improvement work*:

- **§1 — Literary Club traced handwriting upgrade.** Font-mask is current
  and legible; a real pen-stroke trace is a scoped, one-hero upgrade with a
  documented workflow, not a systemic gap.
- **§10 — non-accent hardcoded colors survive unified mode.** Gaming's
  second ghost, Art's color-cycling stroke, and Fashion's gold gradient stay
  fixed even when a reader switches to unified accent mode, because the
  color *is* the effect for those three. Open decision: accept the
  inconsistency, or build reduced/mono variants for unified mode.
- **§11 — Fashion's hand-authored garment paths** are the roughest drawings
  in the hero set; same trace workflow as Literary's upgrade path would
  apply if crispness becomes a priority.
- **§14 — Dance Club audio** was wired then reverted (no audio file existed
  to back it); re-adding it is a known, proven pattern (§4 above), not new
  design work.
- **§16 — `MiniHeroCard` directory-grid sizing.** Not a hero-animation gap,
  but directly adjacent: the card is sized around the 17 club heroes sharing
  a fixed 192px/`h-48` height, not around Literary (the one hero with no
  fixed height), so Literary's card crops as an accepted tradeoff. A
  per-hero-height auto-fit (measure each hero's real rendered height,
  `ResizeObserver`, scale individually to fit) was scoped as the way to
  actually solve it for every hero at once, but not built.
- **§17 — Three new clubs (Chess, Pugwash, Sports Society) need hero
  animations**, following the same real-activity-not-icon convention as the
  other 20 — concepts requested and recorded, not yet built. Full site
  integration is separately blocked on real club data (team/contact info)
  this doc doesn't have.

(§9's off-screen pause and §15's `EntrepreneurshipHero` contrast fix, both
previously listed here as open, are now resolved — see §7 and the bug list
in §10 above.)
