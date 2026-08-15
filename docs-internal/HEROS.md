# Hero Animations — Reference

Detailed record of what each of the 26 hero components animates, why it
animates that way, and the decisions/tradeoffs behind it. Source of truth for
*intent* — if this doc and a component's own header comment disagree, trust
the code (it's newer) and fix this doc.

Read [`docs-internal/animation-caveats.md`](animation-caveats.md) alongside
this file — that's the running log of *open* issues; this file is the
settled record of *what was built and why*.

---

## The two shared systems every hero sits on

### Playback — `useIntroMotion` (`src/components/useIntroMotion.js`)

One rule: **animate while the reader is arriving, go still once they start
working, replay on demand.**

- "Working" = scroll past `scrollThreshold` (24px default), wheel, touch-move,
  keydown, or pointerdown. Once any of those fires, the hero freezes for the
  rest of the page visit — it does **not** resume if the reader scrolls back
  to the top, because they've already seen it.
- **Replay is click/tap, not hover.** Hover-to-replay was built, tried, and
  deliberately dropped: an incidental hover (trackpad drift, cursor passing
  through on the way elsewhere) would stop/restart a hero the reader never
  meant to touch. Click is a toggle — click to play, click again to stop
  early. The returned object is still named `hoverProps` for API stability
  (every hero already spreads it as `<div {...hoverProps}>`), but it wires an
  `onClick`, not hover handlers.
  - **Note:** the project's root `CLAUDE.md` still documents this as
    hover-replay. The code and this doc are the current behavior; that file
    is stale on this specific point.
- Someone landing mid-page (deep link, refresh, scroll-restoration) never
  sees the intro play — they aren't "arriving." Click still works for them.
- `prefers-reduced-motion` is read once on mount; those readers get the
  rested state immediately and a click does **not** override it.
- `playOnVisible: true` (opt-in, needs `containerRef` attached) defers the
  intro until the hero actually scrolls into view at ≥30% visibility, for
  heroes placed below the fold (homepage fest section). Without it, the
  default mount-time scroll check only looks at scroll position once at
  mount — always 0 on a fresh load — so a below-the-fold hero would play
  immediately, off-screen, and be finished before the reader ever scrolls to
  it. The visibility check is itself delayed ~250ms past mount because
  webfonts (Playfair Display, Spectral, Caveat, etc., loaded via `@import` in
  `custom.css`) swap in shortly after first paint and reflow the page —
  observing immediately risked reading a pre-font-swap layout and locking in
  a premature "visible" verdict.
- Off-screen `IntersectionObserver` pause (heroes stop animating when
  scrolled out of view) is **not yet built** — tracked as the top remaining
  infra item in `CLAUDE.md` and caveats §9.

### Accent color — `useClubAccent` / `clubAccents.js`

Each club owns a fixed accent (light + dark hex, see table below), exposed as
CSS custom properties (`--club-accent-light` / `--club-accent-dark`) rather
than Tailwind classes, so a reader's **unified mode** toggle is a one-variable
swap instead of rewriting 21 components. `custom.css` picks the theme-correct
variable:
```css
:root               { --club-accent: var(--club-accent-light); }
[data-theme='dark'] { --club-accent: var(--club-accent-dark); }
```
- Mode is stored in `localStorage` (`sai-wiki-accent-mode`), read as
  `per-club` on the server/first paint always (avoids a hydration mismatch),
  then corrected client-side. A `sai-accent-change` event keeps same-tab
  listeners (and other open tabs, via the native `storage` event) in sync.
- Accents are hand-assigned so alphabetically adjacent clubs don't land on
  near-identical hues.
- **The settings UI to flip modes doesn't exist yet** — only the hook and
  storage layer. This is the #1 remaining infra task per `CLAUDE.md`.
- Three heroes (Gaming, Art, Fashion) and two fest heroes (General, Cultural)
  deliberately keep fixed non-accent colors that unified mode won't flatten —
  the color *is* the concept in each case. Documented per-hero below.
- Several heroes use a fixed dark card background regardless of site theme
  (Astronomy, Art, Film Society, Fashion, Entrepreneurship, and others). Those
  use `accent.dark` directly instead of `var(--club-accent)` for
  text/fills — `var(--club-accent)` flips with *site* theme, and in light
  mode resolves to the deep, text-on-white-optimized hex, which is
  low-contrast against a card that's always dark. `GardeningHero` and
  `LiteraryHero` are the exception: their card backgrounds are genuinely
  theme-adaptive, so `var(--club-accent)` is correct there.

---

## Club heroes

### Literary Club — `LiteraryHero.jsx`
A quill travels left to right; a line of real poetry appears beneath its nib
as it passes, in the `Caveat` handwriting font.

- **Mechanism:** font-mask, not a traced stroke. The quote is real, editable
  text; an SVG `<mask>` rectangle widens left-to-right to reveal it, driven by
  a single `progress` motion value (`useMotionValue` + `useTransform`) that
  also drives the quill's x/y position and a slight wrist-rotation wobble
  (dead-straight travel read as robotic).
- **Decision — font-mask over a true pen-stroke trace:** the original
  approach (hand-authored squiggle SVG path) was handwriting-*ish* but didn't
  actually spell the quote — illegible by design flaw, not intent. A real
  traced stroke that follows actual letterforms is a drawing task outside
  code; tracing 21 quotes wasn't worth it for one hero. Font-mask is legible,
  needs no tooling, and the quote is a prop. **Tradeoff:** the reveal is a
  wipe, not a pen stroke — it won't follow the loops and lifts of real
  handwriting. Upgrade path is documented in
  `docs-internal/archive/traced-handwriting-guide.md` (~20 min in Figma, one
  prop to swap in) — worth doing here specifically, not worth doing 21 times.
- **Decision — measure the text, don't hardcode a width:** the quote is an
  arbitrary-length prop, so the mask width, quill end-point, and viewBox are
  all computed from `textRef.current.getBBox().width` via `useLayoutEffect`,
  with a 260px fallback for the one frame before it's measured. A fixed
  number would clip longer quotes or a translation.
- **Decision — a real `Feather` icon, not a hand-rolled quill path:** an
  earlier custom leaf-shaped path (even with an asymmetric curve) still read
  as a plain triangle/arrowhead at render size. A properly designed icon
  holds up at 20px where hand-drawn curves didn't.
- **Playback nuance:** unlike most heroes, stopping mid-scroll doesn't freeze
  this one half-written — it finishes the reveal fast (0.45s) instead,
  because a stalled half-line reads as a bug, not a pause. Hover/click replay
  rewinds to blank and rewrites the whole line (2.6s, faster than the initial
  3.4s arrival).
- **Tradeoff, still open:** garment/handwriting-adjacent caveat — see
  animation-caveats.md §1.

### Art Club — `ArtHero.jsx`
A broad brushstroke paints itself across the frame, its width swelling and
thinning like real pressure, its color cycling through a small palette. A
faint CRT scanline wash sits underneath.

- **Decision — the act is the stroke, not a spinning palette icon.** Pigment
  laid down with intent is the concept; it draws once and stays painted (a
  stroke that erases itself isn't painting).
- **Mechanism:** width variation is faked with a tapered *filled shape*, not a
  stroked line — a stroke can only be uniform width. A clip-path rectangle
  animates its width to wipe-reveal the shape left to right, giving the
  impression of a moving brush rather than a fade-in. The fill color loops
  through `#f472b6 → #a78bfa → #38bdf8` on an independent 3.2s linear cycle
  while playing, "loading a fresh color mid-stroke."
- **Decision — hardcoded color cycle, not `--club-accent`:** a
  single-color "color-changing" stroke would be a contradiction — the shifting
  hue is the concept. Consequence: unified accent mode won't flatten this
  hero's signature effect (only its heading conforms). See caveats §10.
- A brush-tip glyph (ferrule + bristles) rides the leading edge of the wipe
  and fades out just before the stroke finishes.

### Astronomy Club — `AstronomyHero.jsx`
Two beats: an observer at a telescope, small against the frame; then the
camera pulls back, the figure recedes, and a star field takes over with
constellation lines drawing themselves between stars.

- **Decision — deliberately slow (3.2s):** stargazing is a patient activity;
  a fast version of this would read as a loading spinner.
- **Mechanism — "zoom out" via scale, not viewBox animation:** the foreground
  (observer) group scales down and the star group scales up from a shared
  origin. Cheaper and steadier than animating the SVG `viewBox`, which forces
  layout recalculation every frame.
- **Decision — hand-placed stars, not random:** loosely traces a
  plough/dipper shape so the constellation actually resolves into something
  recognizable rather than random dots joined by lines.
- **Decision — fixed yellow star color (`#FDE047`), not the club accent
  (Indigo):** stars are yellow because that's what stars look like — same
  reasoning as Gaming's second ghost / Art's cycling color / Fashion's gold.
- **Contrast fix:** heading uses `accent.dark` (light indigo) unconditionally
  since the card is a fixed dark navy regardless of site theme — see shared
  systems note above.
- **Scale-tuning note:** the observer group's peak scale/offset was
  deliberately kept modest — an earlier, larger swing grew the figure far
  enough left to overlap the heading/subtitle text.

### Gardening Club — `GardeningHero.jsx`
A stem draws upward, leaves unfold along it in the order they'd actually
appear (lowest first), a bud opens at the tip. **Stays grown** — it does not
reset.

- **Decision — grown is the rested state, not the seed.** Growth that resets
  is a pulse, and a pulse reads as breathing or a loading spinner, neither of
  which is gardening.
- **Mechanism:** the stem is a single path animated via `pathLength` (0→1),
  which normalizes timing independent of the path's actual geometric length.
  Each leaf scales from its own hinge point (`originX`/`originY` set to its
  stem attachment coordinate), so leaves pivot outward like real leaves
  rather than ballooning from their own centers.
- **Theme handling:** this is one of two heroes (with Literary) whose card
  background is genuinely theme-adaptive (`bg-emerald-50/50` /
  `dark:bg-emerald-950/25`), so it correctly uses `var(--club-accent)`
  throughout rather than a fixed `accent.dark` — confirmed contrast
  4.9–6.9:1 light / 12+:1 dark.

### Dance Club — `DanceHero.jsx`
Rhythmic equalizer bars, shaped into a phrase — build, peak, drop — rather
than random per-bar bounce.

- **Decision — the original "bars as rhythm" idea was kept; only the motion
  shape changed.** Random per-bar heights read as noise; a shaped pulse
  reads as a beat you could move to. Bars are pre-shaped with center bars
  swinging hardest ("the energy lives in the middle of the phrase") and each
  bar's beat is offset by distance from center so the pulse visibly ripples
  left-to-right rather than pumping in unison.
- **Decision — plays twice then holds, not an infinite loop
  (`repeat: 1`):** an infinite pulse read as distracting/relentless rather
  than musical. Stays stopped until hover/click replay.
- **Audio caveat:** a click-to-play "Hear the beat" button was added during
  CP3 integration using the exact `MusicHero`/`FestSound` pattern, then
  reverted the same session at the requester's instruction — no audio file
  existed yet (`static/audio/` was empty), so it clicked correctly but
  produced no sound. Not carried half-wired. See caveats §14 for the
  re-add path if revisited.

### Entrepreneurship Club — `EntrepreneurshipHero.jsx`
Three beats telling the arc of a venture: an idea (bulb flickers on) →
becomes a business (crossfades to a currency mark) → grows (a line plots
upward point by point to a final high, then holds).

- **Decision — the value is the sequence, not any one shape.** Flagged in
  the component's own header as "the least visually distinct concept of the
  set" — idea → money → growth is meant to read as a small story. It builds
  once and holds on the final plotted point; a growth chart that resets
  undercuts "it grew."
- **Mechanism:** all three beats are driven off one shared `duration: 3.4`
  timeline using `times: [...]` arrays, so the bulb, the `$` mark, the axis,
  the growth line, and the final point are all keyframed against the same
  clock rather than independently delayed — keeps the handoffs (bulb fading
  as `$` appears) precisely synchronized.
- **Known incomplete fix (caveats §15):** a WCAG contrast audit found several
  fixed-dark-card heroes were using `var(--club-accent)` where they needed
  `accent.dark`. This file's `<h1>` got fixed; four more spots were
  missed — Lightbulb icon color, the `$` `<motion.text>` fill (a real
  ~3.26:1 contrast failure), the growth-line stroke, and the final point's
  fill. All four should migrate to `accent.dark` to match the rest of the
  file and the sibling heroes that got the full pass (Astronomy, Film
  Society, Fashion, Art, and 10 others).

### Fashion Club — `FashionHero.jsx`
Two garment sketches (a dress, a suit) draw themselves in a gold outline like
a designer's croquis pen, then hold as finished plates on a mood board.

- **Decision — line-art croquis, not a sparkle or a runway.** Flagged in the
  header as the hardest concept in the set to keep out of cliché: "a sparkle
  means nothing; a runway won't abstract." Drawing the garments as line art
  unambiguously says "fashion design" rather than "shopping."
- **Mechanism:** each garment is one continuous-ish outline path animated via
  `pathLength` so it draws like a pen stroke; the suit path is drawn second,
  offset 0.8s after the dress. A soft gold shimmer rect sweeps once across
  the finished sketches at the end (1.1s, delayed to 2.4s).
- **Decision — fixed gold gradient (`#fde68a → #d4af37 → #a97a1f`), not the
  club accent:** a metallic croquis outline *is* the look; the accent still
  colors the heading so the club stays identifiable. Consequence: unified
  mode won't flatten this signature color — see caveats §10.
- **Known weak point (caveats §11):** the garment paths are hand-authored and
  are, by the project's own admission, "the roughest hand-authored paths
  across all heroes" — legible at hero size but the one place in the club set
  most worth tracing properly if crispness matters later. A CP3 pass already
  swapped in a more standard/symmetric silhouette per a locked plan decision;
  a fully traced version is still a future upgrade, same workflow as
  `traced-handwriting-guide.md`.

### Film Society — `FilmSocietyHero.jsx`
A film strip advances through a projector gate one frame at a time — pulls
down, holds while that frame is "projected," pulls again — rather than a reel
spinning.

- **Decision — intermittent motion (move–hold–move) over continuous
  motion.** A spinning reel is a picture of the machine; cinema is the
  frames *advancing*. That specific move-hold-move pattern is literally how
  a mechanical projector works and is why film looks like film. A strip
  sliding smoothly would read as a conveyor belt.
- **Mechanism:** a `clipPath` "gate" window shows only the strip segment
  inside it, so frames genuinely enter and leave rather than fading; an
  infinite keyframe sequence (`times: [...]`, `repeatDelay: 0.15`) advances
  the strip by one frame height per pull with `easeOut` (not `easeInOut`) so
  each pull feels like one quick claw-grab snap rather than hesitant
  easing in and out. Each frame carries one of three simple abstract
  "images" (horizon line, tiny figure, circle) — anything more detailed
  turned to noise at this render size. Sprocket holes on both edges are
  called out as "the detail that makes it unmistakably film."
- **Contrast fix:** heading uses fixed `accent.dark` (light salmon) — the
  card is a fixed near-black regardless of site theme.

### FOSS Club — `FossHero.jsx`
A git commit graph builds itself: commits land on `main`, a feature branch
diverges, gets its own commits, and merges back.

- **Decision — draw the actual artifact, not a spinning `GitBranch`
  icon.** The original rotated a glyph, which is a picture of the concept.
  This draws the real shape — diverge, work, converge — legible to anyone
  who's looked at a network graph. Builds once and stays; a commit history
  that resets isn't history.
- **Mechanism:** three paths (`main`, branch-out, branch-back) draw via
  `pathLength` on staggered delays/durations; seven commit nodes pop in at
  individually authored `at` timestamps that are deliberately uneven ("real
  contribution is bursty rather than metronomic"), hollow-fill on `main` and
  solid-fill on the branch — the conventional visual distinction for "where
  work happened." The merge commit gets an extra pulsing ring as the visual
  payoff beat.

### Gaming Club — `GamingHero.jsx`
A retro arcade wedge-muncher eats a row of pellets left to right while three
ghosts trail behind, over a CRT scanline wash.

- **Decision — generic arcade energy, not a specific trademarked game.** The
  muncher's shape is deliberately generic.
- **Explicit, flagged risk-tradeoff on color:** the muncher is filled solid
  yellow (`#FACC15`) "at the requester's explicit direction — the closest
  color match to the genre's best-known character." Earlier drafts kept it
  off-yellow specifically to steer clear of Pac-Man trade dress; that
  tradeoff was knowingly overridden here per direct instruction and is
  flagged in the component's own header to revisit "if this ships to a real
  public audience and that risk tolerance changes."
- **Mechanism:** two independent timescales run simultaneously — the whole
  cast travels across the frame on a slow linear loop (4.2s) while the
  muncher's mouth chomps on a fast independent loop (0.32s) — "like the real
  thing." Pellets each blink out individually, timed to when the muncher's
  x-position reaches them.
- **Decision — each ghost gets its own fixed, non-accent, non-matching
  color** (`#67E8F9`, `#c4b5fd`, `#fda4af`): two ghosts sharing one color
  would read as a bug, not a stylistic choice. Consequence: unified mode
  won't fully flatten this hero — see caveats §10.

### Oratory Club — `OratoryHero.jsx`
A microphone throws expanding rings outward on a steady cadence, like a voice
carrying across a room.

- **Decision — a steady sequence of rings, not one lone pulse.** The
  original single-pulse idea was the right instinct; this staggers two
  emission timers (0s, 0.9s offsets) so at least one ring is always
  mid-flight, reading as continuous speech rather than an isolated blip.
- **Mechanism:** rings scale (0.6 → 3.2) and fade simultaneously — expanding
  *and* dissolving together is what makes them read as sound dissipating
  into a room rather than solid hoops flying off screen. The mic icon itself
  stays static — "it's the source, not the motion." This is the shortest
  file in the set (67 lines) — the simplest of the 21 club concepts.

### Photography Club — `PhotographyHero.jsx`
Four corner focus-brackets drift inward and lock onto a subject
(autofocus acquiring), a beat of stillness, then the shutter blinks and a
full-frame flash fires.

- **Decision — the act of taking a shot, not a camera icon.** Sequence:
  focus lock → shutter → flash is "the moment a photograph happens."
- **Decision — flash snaps on and falls off fast, not a fade:** a slow flash
  looks like a fade, not a strobe; the opacity keyframes are compressed into
  a short window (`times: [0, 0.6, 0.64, 0.78]` of a 2.4s cycle) for a sharp
  strobe feel.
- **Fixed bugs documented inline:** two coordinate-system pitfalls are
  called out directly in code comments as historical bugs, not just
  design notes — worth preserving here since they're easy to reintroduce:
  1. Each corner bracket's `from`/`to` offset sign has to match its label
     (top-left = negative x, negative y, etc.); these were previously
     swapped diagonally, putting every bracket at its *opposite* corner,
     facing the wrong way.
  2. Framer Motion needs to own the `transform` attribute itself to animate
     x/y on a `motion.g`; a static `transform="translate(...)"` on the *same*
     element gets silently dropped once Framer's own transform takes over
     (renders `transform: none` once settled). The fix used throughout this
     file (and reused verbatim in `AnimalWelfareHero`) is to put the static
     centering translate on a plain outer `<g>` and animate only x/y on an
     inner `motion.g`.

### Science Society — `ScienceHero.jsx`
An atom whose three electrons genuinely orbit — the nucleus holds still,
electrons travel independent elliptical shells at different periods and
tilts.

- **Decision — orbit is the one deliberate exception to "plays once and
  holds."** An orbit that stops mid-arc is just a dot sitting somewhere
  arbitrary, so this loops continuously while playing. It still obeys the
  shared stop-on-scroll rule, but its *rested* state parks each electron at
  a hand-chosen point (`restAt: '0%'/'35%'/'68%'`) rather than wherever it
  happened to freeze.
- **Mechanism — CSS `offsetPath` binds each electron to its actual drawn
  ellipse**, rather than approximating the orbit with sin/cos math, which
  drifts out of alignment the moment the ellipse is rotated. The three
  shells use different periods (3.4s/4.6s/2.9s) specifically so the trio
  doesn't read as one rigid object turning.
- **Documented technical dead-end, worth keeping as institutional
  memory:** drawing an axis-aligned ellipse and then trying to spin the
  traveling point afterward via a separate CSS `rotate` doesn't compose with
  `offsetPath` — the point ends up traveling the *unrotated* path while only
  its own facing angle rotates, visibly cutting across the rotated shell
  instead of tracing it. The fix bakes the tilt directly into the SVG arc
  command's own x-axis-rotation parameter (`ellipsePath()` helper) so the
  point genuinely follows the drawn, rotated shell.
- **Browser-support caveat (caveats §8):** `offsetPath` is solid in
  2023+ Chrome/Safari/Firefox; no sin/cos fallback has been built for older
  browsers. Flagged, not yet needed.

### Theatre Club — `TheatreHero.jsx`
Curtains part to reveal an empty stage; a spotlight fades up on the boards
*after* the curtains finish moving.

- **Decision — light comes strictly after the curtain motion settles, not
  during.** A spotlight appearing while curtains are still moving reads as a
  lighting glitch; one that fades up on the already-settled stage reads as
  "places, please" — the beat right before a performance starts, deliberately
  stopping short of showing any actor.
- **Mechanism:** curtains are two mirrored `motion.g` groups translating
  outward by `(1 - curtainOpen) * 50%` each, leaving a 14% sliver still
  visible at full-open (a realistic parted-curtain gap, not a full
  disappearance). The spotlight's opacity keyframes don't start ramping
  until `times: [0, 0.62, 1]` of the sequence — after the 1.4s curtain
  animation has had time to finish within the shared timeline.

### Turingites CS Society — `TuringitesHero.jsx`
Conway's Game of Life, actually simulated — a live cellular automaton, not a
static grid graphic.

- **Decision — computation itself is the hero, not a picture of a coder at a
  terminal.** Named for Turing; the concept is meant to *be* computation.
  Also deliberately avoids duplicating Tech Fest's terminal hero, which
  already covers the "coder at a terminal" territory.
- **Decision — a hand-seeded starting pattern, not a random board.** Flagged
  explicitly: a random Life board almost always decays into static debris
  within roughly 15 generations, which reads as broken rather than alive.
  The seed is composed of a glider (travels cleanly forever), a blinker, a
  beacon oscillator, and a second offset glider, chosen specifically so the
  board stays visibly, reliably in motion every single run.
- **Mechanism:** a real generation stepper implementing standard B3/S23
  rules on a **toroidal** (wrapping) 32×14 grid — wrapping keeps gliders
  traveling forever instead of sailing off the edge into an empty board.
  Ticks on a 190ms `setInterval` only while `isPlaying`; freezing mid-tick on
  scroll is treated as a perfectly fine rested state (a paused board), and
  hover/click replay re-seeds from scratch. This is the one hero with real
  per-frame JS simulation state rather than declarative Framer keyframes.
- Live cells fade toward the heading side via a linear gradient overlay so
  the grid never fights the title's legibility, and dead cells render as
  faint 1×1 dots (texture) rather than 448 full empty rects.

### Animal Welfare Society — `AnimalWelfareHero.jsx`
A trail of paw prints steps across the frame in sequence, then a small heart
rises where the trail ends.

- **Decision — keep the original walking-paws instinct, add the payoff.**
  The walk (care arriving) plus the heart (why) turns an okay idea into a
  small statement. Builds once and stays — a trail that erases itself loses
  the "someone was here caring" reading.
- **Mechanism:** six prints are placed with alternating y-offset and rotation
  (`±6`, `±12°`) so the trail reads as a left-right-left gait rather than a
  straight dotted line, appearing one at a time on staggered delays
  (`i * 0.24s`), followed by the heart popping in with a slight overshoot
  ease (`[0.34, 1.4, 0.64, 1]`).
- **Same transform-ownership fix as Photography** (see above): each print's
  static position lives on a plain outer `<g>` with the translate/rotate as
  an attribute, while Framer's animated scale/opacity live on an inner
  `motion.g` — putting both on one element silently drops the static
  attribute once Framer's own `transform` style takes over.

### Martial Arts Club — `MartialArtsHero.jsx`
A board break: a hand descends in one committed strike, connects, and the
plank snaps into two halves that fall away with a brief impact burst.

- **Decision — replaces the original's flame,** which had no connection to
  martial arts. A break is discipline made visible: one focused movement, a
  clear result, then stillness. The two halves stay broken — the point was
  landed, and resetting it would undercut that.
- **Decision — the strike itself is fast and eases *in* (accelerates toward
  impact); the recovery and falling halves are slower.** Matches how a real
  strike is watched: quick to land, and the aftermath is what your eye
  actually follows. All beats share one 1.4s timeline via `times: [...]`
  so the hand's descent, the plank's break, and the impact burst are
  precisely synced to the same contact moment.

### Gardening Club, Literary Club — see above (grouped with the other
early-batch heroes for narrative flow).

---

### The "weakest four" rebuild batch — Music, Science, Film Society, FOSS

Per `docs-internal/animation-caveats.md` §6, these four originally shared the
same generic spinning-icon pattern and were rebuilt around each club's real
activity: Music → waveform, Science → orbiting electrons, Film → frame
advance, FOSS → commit graph. Documented individually above; grouped here
only as a note on *why* these four look structurally different from a
"pick a Lucide icon and spin it" baseline.

### Music Club — `MusicHero.jsx`
A hand-shaped audio waveform envelope (32 bars) rises from a center line,
quiet-intro → swell → decay, like a playhead sweeping across a track.

- **Decision — a waveform responding IS music; a spinning vinyl is only a
  picture of music.** Bar heights follow a hand-authored envelope array
  (not random) so it reads as a shaped musical phrase rather than jitter.
- **Mechanism:** bars grow from the center line outward (`y`/`height`
  animate from a zero-height point at `CENTER_Y`) with a small per-bar delay
  (`i * 0.028s`) so the reveal sweeps left to right. At rest, bars stay at
  full drawn height rather than collapsing — "the shape of the piece, not an
  activity indicator."
- **Decision — audio is click-to-play, explicitly not hover-triggered,**
  despite the original request being for hover. Two concrete reasons kept in
  the header: (1) hover fires accidentally when a cursor sweeps across a card
  on the way elsewhere — risky on a 21-card directory page; (2) browsers
  block audio before first user interaction, so the *first* hover would be
  silently broken, reading as a bug rather than policy. `.play()` rejections
  are swallowed rather than thrown. The "Hear us" button and `<audio>` element
  render only when an `audioSrc` prop is passed — no prop, no button, no
  autoplay risk. This exact pattern (`audioRef` + `.play().catch(() => {})` +
  conditional render) was later reused verbatim for `FestSound.jsx`.

### Chess Club, Pugwash Society, Sports Society — added after the original 23

Three more club heroes, added later than the rest of this document and
sourced differently — pulled verbatim from
[`ChargingTrex/campus-club-ui`](https://github.com/ChargingTrex/campus-club-ui),
the MIT-licensed companion library this project's own heroes were extracted
into, rather than authored fresh in this repo. Full history, the accent
values, and the sidebar-icon decisions are in
`docs-internal/animation-caveats.md` §17 — summarized here to keep this
doc's own per-hero record complete.

**Chess Club — `ChessHero.jsx`.** A real 3-beat game, not a static board: a
pawn opens, a knight travels a true L (two straight segments, never a
diagonal) to capture an enemy pawn, then delivers checkmate and the enemy
king topples. Builds once and stays checkmated, same "a landed result
shouldn't reset" principle as Martial Arts' broken plank. The knight's
landing square is a verified genuine knight-move from the king — computed
directly rather than eyeballed, since an earlier draft placed the king a
diagonal (not a knight) move away and wasn't actually in check. Pieces are
lucide's real `ChessPawn`/`ChessKnight`/`ChessKing` glyphs, not hand-drawn
silhouettes, for the same reason Literary uses a real `Feather` icon. White
pieces carry the club's accent (Slate); the enemy side is a fixed muted
stone tone so the two sides read as opposing regardless of theme.

**Pugwash Society — `PugwashHero.jsx`.** A peace sign draws itself, centered
and alone, and holds — a symbol that redraws on a loop would read as
flickering, not resolve. The concept changed during development in the
source repo: earlier drafts paired the peace sign with a mushroom cloud
(literal to the club's real namesake, the Pugwash Conferences on Science and
World Affairs, founded to campaign against nuclear weapons), first as a
solid cloud that read as a tree, then as a corrected pictogram — both were
dropped in favor of the symbol alone, which still carries the club's real
subject without needing to draw the threat it's answering.

**Sports Society — `SportsHero.jsx`.** One continuous sequence, not four
separate icons: a kick launches a football, which becomes a cricket ball
that knocks over the stumps, hops on as a pickleball, and softens into a
shuttlecock for the final drop — four sports as a relay with real dwell
beats between each handoff, so every stage visibly lands before the next
begins, rather than one smeared blur. True shape-morphing between unrelated
silhouettes isn't practical as one continuous path, so one parent group
carries the real x/y flight path (including flat dwell segments) while four
independent children fade/pop in and out at their own checkpoint. The
football/cricket-ball/pickleball/shuttlecock keep their real colors rather
than the club accent — same tradeoff class as Gaming's ghosts or Fashion's
gold, the color *is* the identifying feature. Builds once and holds on the
landed shuttlecock; the whole point is a journey that arrives somewhere.

---

## Fest heroes

Fests don't have entries in `clubAccents.js`; each borrows an existing club's
accent for its heading rather than getting a dedicated one:
- **Tech Fest** borrows Turingites' Terminal accent (shared CS/terminal hue).
- **General Fest** borrows Art Club's Fuchsia accent.
- **Cultural Fest** borrows Theatre Club's Purple accent.

All three (plus Music Club) share `FestSound.jsx` — one click-to-play audio
control, rendered only when `audioSrc` is passed, `.play()` rejections
swallowed, never autoplaying. Each fest takes its own separate `audioSrc`
prop; the component carries no audio itself. See `CLAUDE.md`'s wiring
snippet and caveats §12 for licensing constraints (royalty-free or original
audio only — a recognizable track on a public university site is a takedown
risk).

### Tech Fest — `TechFestHero.jsx`
A simulated terminal: a boot-style command types itself out, then the output
floods in as scrambled characters that resolve, left to right, into a clean
title.

- **Decision — cut from four competing ideas down to one.** The header
  explicitly documents the discarded alternatives: a drone, a click-to-expand
  gate, and a payload-reveal metaphor were all dropped in favor of a single
  coherent beat — garble decoding into meaning, "exactly the 'hacker resolve'
  feeling a tech fest wants." No drone, no click, no reveal gate.
- **Mechanism:** two custom hooks. `useTypewriter` types the command
  character by character after a start delay; once it's done, `useScramble`
  takes over the title — each character slot cycles through random glyphs
  from a fixed charset until its own "lock" turn arrives, then locks to the
  real letter, left to right, at a `lockEvery` cadence.
- **Documented, fixed off-by-one bug worth preserving:** the scramble
  interval used to build the display string *before* advancing the
  frame/locked counters. That meant the tick that finally reached
  `locked >= target.length` cleared the interval using the *previous*,
  still-one-short `locked` value — so the very last character of the title
  was never actually rendered as resolved and stayed scrambled forever. Fixed
  by advancing `frame`/`locked` before building the string each tick.

### General Fest — `GeneralFestHero.jsx`
A popper fires; confetti launches upward under a real ballistic arc (launch →
peak → fall → settle) rather than floating; a bunting banner drops in across
the top first.

- **Decision — kept the "celebration is bursts of color" instinct, changed
  the physics.** The original random-floating confetti became a proper
  parabola: each piece gets a launch angle/power, a computed peak, and a
  landing spot, and the whole thing settles rather than looping forever.
- **Decision — a seeded PRNG (`mulberry32`), explicitly not
  `Math.random()`, for the confetti/pennant layout.** This is the most
  detailed technical rationale in the whole hero set, kept verbatim in the
  header: this module evaluates twice per page load — once during SSR
  (Docusaurus prerender) and again during client hydration — and
  `Math.random()` genuinely produces a *different* sequence each call, not
  just each page load. A fixed seed (`20260728`) makes both evaluations
  produce byte-identical pieces, which "precompute once at module load"
  actually requires. Plain `Math.random()` at module scope silently is *not*
  deterministic across SSR vs. hydration despite reading like it should be —
  confirmed via this project's own Playwright suite, which reproducibly hit
  a React hydration-mismatch (error #418) on `/fests` and `/explore` every
  run before the fix.
- **Decision — Framer variants + `staggerChildren`, not manual per-index
  delay math,** for both the bunting pennants and the title/tagline
  entrance. Lets one parent own the stagger timing instead of every child
  computing its own offset — a refactor applied here specifically because the
  confetti/bunting previously used manual delays and it was worth
  demonstrating the cleaner pattern.
- **Fixed layout bug worth preserving:** `preserveAspectRatio="none"` is
  deliberate, not an oversight — the card's real aspect ratio (~6:1, very
  wide) doesn't match the 300×200 viewBox (1.5:1). The default `"slice"`
  crops to the taller dimension, which was hiding the bunting entirely and
  dropping landed confetti below the visible band — the card read as
  visually plain not because the effects were missing, but because they were
  invisible.
- Also added on top of the base pass: a radial flash behind the popper timed
  to the pop (gives the borrowed Art accent an actual visual use instead of
  sitting in an unused CSS variable), and a `whileHover` bump on the popper
  icon as an immediate hover response layered on top of the card's full
  click-replay behavior.

### Cultural Fest — `CulturalFestHero.jsx`
Two phases on one timer: category icons (music, dance, vocals, gaming, chess,
boardgames) flash rapidly in a single slot (`cycling`), then the whole set
arranges itself into a composed ring (`settled`).

- **Decision — an intro-only cycle, not an endless one.** A cultural fest
  genuinely *is* many things at once, so rapid cycling is the right initial
  read — but cycling forever would be ambient noise. It runs through the set
  exactly twice (`CYCLES = 2`) at 260ms per icon, then transitions
  permanently into a settled ring showing the fest as a composed whole rather
  than a slideshow stuck on loop.
- **Mechanism:** `AnimatePresence mode="wait"` drives the single-icon flash
  during `cycling`; once the step counter hits `CATS.length * CYCLES`, phase
  flips to `settled` and all six icons animate outward to fixed
  angle-computed positions on a spring (`stiffness: 260, damping: 20`) with a
  small per-icon stagger.
- **Fixed non-accent colors:** each category icon has its own fixed hex
  (pink/amber/purple/blue/yellow/rose), and the title uses a fixed
  pink-to-gold gradient — festive multi-hue palettes that unified-accent mode
  won't flatten, same category as Gaming/Art/Fashion (caveats §10, §13).

---

## Library, Archives — the shelf pair

Both live outside `src/components/clubs/`, and both share one deliberate
design decision worth reading together.

### Student Voices (Blog) — `LibraryHero.jsx`
Books drop into a shelf one after another; each spine's title fades in just
after it lands.

- **Concept:** individual students adding their own writing over time — the
  shelf being filled.
- **Decision — `LibraryHero-v2` superseded and renamed to
  `LibraryHero.jsx`, original deleted.** Two versions existed during build:
  the original was fully self-contained (all drawing/layout/drop math
  inline); v2 extracted the drawing and layout into a reusable
  `Book`/`Shelf` primitive (`src/components/primitives/Book.jsx`) — about ⅓
  the length, describing only *which* books go on the shelf. v2 won because
  building that primitive was the whole point — `ArchivesHero` and any future
  book animation depend on it. This file (the one now on disk) is that
  canonical version; per `CLAUDE.md`'s integration checklist, the rename has
  already happened.
- **Decision — books vary in width/height, and the last one leans 8°.** A
  perfectly aligned shelf reads as stock art rather than a real, accumulated
  collection.
- Hovering/clicking replays the *entire* fill from an empty shelf, via a
  remount key on the animated group.

### Event Archives — `ArchivesHero.jsx`
A dense, static wall of book spines; one volume at a time slides partway out,
shows its year label, holds, then settles back — a different volume repeats
this a moment later.

- **Decision — retrieval, not transit.** Deliberately *not* the
  conveyor-belt "books flowing past" version, which was the original plan for
  this slot — that reads as material in transit, the opposite of archived.
  The point being made is findability: this is a body of material you can
  reach into and pull something specific out of.
- **How the split with Library actually happened:** the original plan
  assigned shelving to Archives and a flowing-books effect to a future
  "reading club" page. Library ended up built with shelving first and
  approved, which left Archives needing a different concept. Rather than
  ship two near-identical shelf-filling animations, Archives became
  retrieval — Library is *putting in* (the collection assembling), Archives
  is *getting out* (material you can reach into). The pair now reads as a
  genuine opposition instead of two variations on the same idea. The
  flowing-books effect remains reserved, unbuilt, for whenever a book-reading
  club page exists.
- **Decision — does *not* reuse the `Book` primitive**, unlike Library. Book
  is built around drop-in-and-settle with a title that fades in after
  landing; Archives needs slide-out-and-return with a label tied to the pull
  motion. Forcing one shared component to do both would mean a prop
  switching between two structurally unrelated behaviors — not a real
  abstraction, just a fork in disguise.
- **Mechanism:** 12 spines of varying width/height/tone sit in fixed
  precomputed x-positions (the wall never reflows). Three specific spines
  (indices 2, 7, 10) are designated pullers, each with a staggered `at` delay
  (0.5s / 2.3s / 4.1s) spaced along the wall so the movement visibly travels
  rather than clustering. Each pull is `y: [0, -14, -14, 0]` with an explicit
  *hold* at the top (`times: [0, 0.28, 0.72, 1]`) — the hold is what sells it
  as "being read" rather than "wobbling." The year label is rotated -90° and
  only appears once the spine has cleared its neighbors. The shelf lip is
  drawn last, after the spines, specifically so pulled volumes visually pass
  *behind* it on the way out — that overlap is what reads as "coming out of
  the shelf" rather than floating above it.
- **Still open (caveats §3):** the three years (2024/25/26) are hardcoded,
  not props or driven by real archive data. The wall is 12 spines — enough to
  read as "a lot" at this size, but to feel like the actual ~400 events, a
  second row behind the current one would be the way to add density rather
  than cramming more spines into one row.

---

## Cross-cutting decisions (apply to multiple heroes)

- **CRT scanline wash** (`repeating-linear-gradient`, ~10–12% opacity) sits
  under Art Club and Gaming Club specifically — both are retro/arcade-coded
  concepts where the texture reinforces the reference instead of feeling
  decorative.
- **Fixed non-accent, non-themeable colors**, because the color is the
  concept and flattening it under unified mode would break the effect:
  Gaming's second/third ghosts, Art's cycling stroke hue, Fashion's gold
  gradient, Astronomy's yellow stars, General Fest's confetti/pennant
  palette, Cultural Fest's per-category icon colors and title gradient. This
  is a deliberate, accepted inconsistency (caveats §10, §13) — unified mode
  still flattens each hero's *heading*, just not these signature marks.
- **The transform-ownership bug** (Framer Motion needs to exclusively own an
  element's `transform`; a static `transform` attribute on the same
  `motion.*` element as an animated x/y/scale silently gets dropped once
  Framer's own inline style takes over) was hit and fixed independently in
  both `PhotographyHero` (focus brackets) and `AnimalWelfareHero` (paw
  prints). Both now use the same pattern: static translate/rotate on a plain
  outer `<g>`, animated properties on an inner `motion.g`. Worth checking
  first if a future hero's positioned elements render stacked at the SVG
  origin instead of their intended spot.
- **`pathLength`-driven line drawing** is the shared technique for anything
  that should look hand-drawn/plotted: Gardening's stem, FOSS's commit lines,
  Fashion's garment croquis, Astronomy's constellation line, Entrepreneurship's
  growth line. It normalizes animation timing to the path's *parametric*
  length rather than its rendered pixel length, so timing tuning doesn't
  depend on the exact curve geometry.
- **Build-once-and-hold vs. continuous loop** is a deliberate per-hero
  choice, not a default: Gardening, FOSS, Entrepreneurship, Martial Arts,
  General Fest, and both shelf heroes explicitly stay in their finished
  state because resetting would undercut the concept (growth, history, a
  landed strike, a settled celebration, an assembled/retrieved collection).
  Science's orbit and Turingites' Life simulation are the only two
  continuous, indefinitely looping heroes at rest-while-playing — both
  because the concept itself (orbiting, evolving) is only legible in motion.
  Gaming's chase and Music/Dance's waveform pulses loop only *while
  playing*, then settle to a static rested frame once the intro window
  closes.
