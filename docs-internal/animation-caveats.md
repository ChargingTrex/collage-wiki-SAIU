# Sai Uni Wiki — Animation Caveats & Open Decisions

Running log of things that need a decision, need external tooling, or that I
couldn't fully deliver in code. Not a task list — a "don't forget this is
unresolved" list.

---

## 1. Literary Club — handwriting reveal

**Status:** resolved for now — using font-mask, traced path deferred.

The original `POETRY_PATH` was hand-authored squiggles: *handwriting-ish* at a
glance but not real letterforms — it did not spell the quote. I can't produce a
legible traced sentence as raw SVG path data; tracing is a drawing task.

**Current implementation:** font-mask. Real text in `Caveat`, revealed by a
mask that widens as the quill passes. Legible, editable via the `quote` prop,
no tooling. Tradeoff: the reveal is a left-to-right wipe, not a true pen stroke
following the letterforms.

**Upgrade path documented** in `docs-internal/archive/traced-handwriting-guide.md` — about 20 minutes
in Figma, and the swap into the component is one prop. Worth doing for the
Literary hero specifically; not worth doing 18 times.

**Same caveat applies to `AnimatedSignature`** in the original motion guide,
which still has the placeholder-squiggle problem and should either get the
font-mask treatment or a real trace.

---

## 2. Icon sourcing — noted, not a blocker

Confirmed I'm free to combine Lucide icons, compose multiple icons into one
mark, or pull SVG from any open-source icon library (Phosphor, Tabler,
Heroicons, Remix Icon, Iconoir, etc.), rather than being limited to one Lucide
glyph per club.

Where a club's motion is genuinely *about* a shape (a growing stem, a
constellation, a filling shelf), hand-authored SVG beats any icon library —
icons are designed to sit still.

**Licensing note:** most of the above are MIT or Apache-2.0, but check per
library before shipping, and keep attribution where the license asks for it.

---

## 3. Library / Archives / Reading Club — three book animations, resolved

Three book-based effects exist. Their homes, as finally decided:

| Effect | Home | Status |
|---|---|---|
| Shelf fills, spines gain titles | **Library** | Built (`LibraryHero-v2.jsx` — see note) |
| Volume slides out, shows year, settles back | **Archives** | Built (`ArchivesHero.jsx`) |
| Books flowing past | **Future book reading club** | Unassigned — club doesn't exist yet |

**⚠ Two LibraryHero files exist — v2 wins, rename on integration.**
- `LibraryHero.jsx` (original) — self-contained: all book drawing, x-offset
  math, drop animation, and title-fade logic inline. No dependencies.
- `LibraryHero-v2.jsx` (**canonical**) — same visual result, but the drawing
  and layout were extracted into the reusable `Book`/`Shelf` primitive
  (`src/components/primitives/Book.jsx`). ~⅓ the length; describes only *which*
  books go on the shelf.

**Decision:** v2 supersedes the original (it was the whole point of building the
`Book`/`Shelf` primitive, which `ArchivesHero` and any future book animation
also depend on). On integration: **rename `LibraryHero-v2.jsx` → `LibraryHero.jsx`
and delete the original.** v2's internal comment and export already say
`LibraryHero`. Note v2 **requires** `Book.jsx` to exist; the original is the
only dependency-free fallback if a standalone Library is ever wanted.

**Note on the change:** the original plan assigned *shelving* to Archives and
*flowing books* to the reading club. Library was built with shelving first and
approved, which left Archives needing something. Rather than give Library and
Archives two near-identical shelving animations, Archives became **retrieval**
— a static wall of spines with one volume pulling out to show its year.

The pair now reads as a genuine opposition: Library is *putting in*
(accumulation, the collection assembling), Archives is *getting out*
(findability, material you can reach into). That's a more useful distinction
than two variations on filling.

The flowing-books effect remains reserved and unbuilt.

**Deliberately not shared:** `ArchivesHero` does not reuse the `Book`
primitive. `Book` is built around drop-in-and-settle with a title that fades
in after landing; Archives needs slide-out-and-return with a label tied to the
pull. Forcing one component to do both would mean a prop switching between two
unrelated behaviors.

**Still open in Archives:**
- Years are hardcoded (2024/25/26). Could be props, or driven from real
  archive data so the animation reflects actual content.
- The wall is 12 spines — dense enough to read as "a lot" at this size. To
  feel like 400 events, add a second row behind it rather than more spines
  in this one.

---

## 4. Motion rule — current state

Heroes animate while the reader is arriving, then go still once they scroll,
click, key, or touch. Hovering the hero replays it on demand.

Deliberate choices inside `useIntroMotion` worth revisiting if they feel wrong
in practice:

- Once stopped by scrolling, it does **not** auto-restart when the reader
  scrolls back to the top. Only a click/tap brings it back (see below —
  hover-to-replay was tried and reverted).
- Anyone landing mid-page (deep link, refresh, browser scroll restoration)
  never sees the intro play — they aren't "arriving."
- `prefers-reduced-motion` users get the rested state immediately and a
  click does **not** override it.

**Update — replay is click/tap, not hover, and this doc's own earlier wording
was wrong to call it "hover":** hover-to-replay was tried and deliberately
dropped — an incidental hover (trackpad drift, cursor passing through on the
way elsewhere) restarted heroes nobody meant to touch, and hover doesn't
exist on touch devices at all. `hoverProps` is a legacy name kept only so
every hero's existing `<div {...hoverProps}>` didn't need a rename; it wires
`onClick`, not hover handlers.

**Update — keyboard access, previously entirely missing, now built:** every
hero's root element only ever had an `onClick` — no `tabIndex`, `role`, or
key handler, so a keyboard-only or screen-reader user could never discover
or trigger replay at all. `hoverProps` now also carries `role="button"`,
`tabIndex={0}`, an `aria-label="Replay animation"`, and an `onKeyDown` that
mirrors `onClick` for Enter/Space. A matching CSS rule
(`[data-hero-replay]` in `custom.css`) adds `cursor: pointer` and a
`:focus-visible` ring, since nothing previously signaled the hero was
clickable at all (0 `cursor-pointer` matches across all 23 files, confirmed
by grep before the fix).

This surfaced two real bugs, both fixed alongside it:
- `MusicHero`'s and `FestSound`'s inner "play sample"/"play theme" buttons
  were bubbling their click *and* keydown events up into the hero's own
  root — clicking/keying the audio button also toggled the hero's replay.
  Fixed with `e.stopPropagation()` in both.
- `MiniHeroCard` nests a full `<Hero />` inside a `<Link>`. Once the hero's
  root became independently focusable, that produced two competing tab
  stops per directory card (the Link, then the hero's own replay button) for
  what a reader perceives as one clickable card. Fixed with `inert=""` on
  the scaled preview wrapper — the Link stays the single interactive
  element there; replaying the animation isn't a feature that scaled-down,
  preview-only context needs.

---

## 5. Per-club accent color — resolved

Each club keeps its **own accent color** (default), so the directory can be
scanned and sorted by color as well as alphabetically. Readers who find that
busy can switch to **unified mode** in settings, which collapses every club to
the site palette — motion still differs per club, only color unifies.

Implemented in `clubAccents.js` + `useClubAccent.js`. Colors are CSS custom
properties (`--club-accent`), not Tailwind classes, so unified mode is a
one-variable swap rather than eighteen class rewrites.

Accents are assigned so alphabetically adjacent clubs don't land on
near-identical hues — otherwise the directory reads as a gradient smear
instead of 18 distinguishable entries.

**Resolved since first written:**
- The settings UI now exists: `AccentModeToggle.jsx`, a navbar pill wired via
  a swizzled `NavbarItem/ComponentTypes.js`, calling the `setAccentMode`
  that previously had no caller anywhere in the app.
- Accent contrast against final backgrounds has now actually been computed
  (WCAG relative-luminance formula, all 18 accents × their real card
  backgrounds) — the "close to their surfaces" worry was wrong: Sepia,
  Crimson, and Terminal all pass comfortably (9–12:1), nowhere near failing.
  Full numbers in `docs-internal/HEROS-AUDIT-CRITIQUE.md` Part 3. One real
  duplicate was found instead (not a contrast issue): `gardening-club` and
  `turingites-computer-science-society` shared the identical light-mode hex
  `#15803D` — Turingites' light value is now `#16A34A`.
- Unified mode's color changed from the site's primary blue to plain
  **monochrome**: `dark: '#ffffff'` (used by 16 of 18 club heroes — the ones
  with a permanently-dark card, always via `accent.dark` regardless of site
  theme) and `light: '#000000'` (used only by Gardening/Literary's
  `var(--club-accent)` in light site theme — their card backgrounds are
  genuinely theme-adaptive and near-white in light mode, so white text there
  would be ~1:1 contrast, unreadable; black is the correct pairing).
  Requested, tried as pure white for both, confirmed unreadable for
  Gardening/Literary specifically, then corrected to black for the light
  variant only — full reasoning in `clubAccents.js`'s own comment on
  `UNIFIED_ACCENT`.

**Still open:**
- 21 distinct hues (18 → 21 once Chess/Pugwash/Sports Society landed, see
  §17) is well past the point where "near the limit" was already flagged at
  18. If any more clubs are ever added, the set likely needs regrouping by
  category rather than extending further.

---

## 6. Hero build progress

**Built — all 18 clubs + Library + Archives (20 heroes):**
Library, Archives, Literary, Astronomy, Gardening, Music, Science, Film Society,
FOSS, Dance, Oratory, Photography, Theatre, Martial Arts, Gaming, Art, Fashion,
Entrepreneurship, Animal Welfare.

**Remaining fest heroes (3, since built):** General Fest, Tech Fest, Cultural
Fest — see §13.

**Built and integrated (3 more club heroes, since added):** Chess Club,
Pugwash Society, Sports Society — clubs that had no hero, doc page, or
directory entry at all until requested. See §17 for the full history.
**Total is now 21 clubs + Library + Archives + 3 fests = 26 heroes.**

Rebuild notes by batch:
- **Weakest four** (Music/Science/Film/FOSS) — were the same spinning-icon
  pattern; rebuilt around the real activity (waveform / orbiting electrons /
  film advancing through a gate / commit graph building).
- **Strong metaphors** (Dance/Oratory/Photography/Theatre/Martial Arts) —
  Dance = shaped equalizer, Oratory = staggered soundwave rings, Photography =
  focus-lock + shutter + flash, Theatre = curtains part then spotlight up,
  Martial Arts = board break (replaced the unrelated flame).
- **Trap set** (Gaming/Art/Fashion/Entrepreneurship/Animal Welfare) — Gaming =
  generic arcade chase, Art = self-painting brushstroke, Fashion = gold croquis
  sketches, Entrepreneurship = idea→money→growth sequence, Animal Welfare =
  paw trail + heart.

---

## 7. Music Club audio — click-to-play, not hover

**Status:** built into `MusicHero`, opt-in via prop.

Requested: a musical tune on hovering the Music logo. Implemented as
**click-to-play** instead of hover, for two concrete reasons:
- Hover fires accidentally when a cursor crosses the card on the way elsewhere;
  on an 18-card directory a sweep could trigger several.
- Browsers block audio before first user interaction, so the *first* hover
  would be silent — reading as broken rather than as policy.

A "Hear us" speaker button renders **only if** an `audioSrc` prop is passed:
```jsx
<MusicHero audioSrc="/audio/music-club-sample.mp3" />
```
`.play()` rejections are swallowed so a blocked attempt doesn't throw into the
console. If hover is still wanted later, the agreed compromise is: off by
default, opt-in in the same settings panel as the accent toggle.

---

## 8. `offsetPath` browser support (Science hero)

`ScienceHero` binds electrons to their ellipses with CSS `offsetPath`. Solid in
current Chrome/Safari/Firefox (2023+). If older-browser support becomes a
requirement, the orbits need a sin/cos fallback. Not built yet — flag if needed.

---

## 9. Off-screen performance — resolved

**Status:** built. `useIntroMotion` now runs a second, always-on
`IntersectionObserver` (separate from the one-shot `playOnVisible` start
trigger) that tracks whether the hero's root element is actually
intersecting the viewport at all, and gates the returned `isPlaying` on it:
`isPlaying: (isIntroPlaying || isClickPlaying) && isVisible`. A hero
scrolled fully out of view stops animating, including the `repeat: Infinity`
loopers (Science's orbits, Gaming's chase, Art's color cycle, Oratory's
rings, Film's projector advance) and Turingites' `setInterval` stepper.

This matters most on `/clubs`/`/explore`: confirmed by reading
`MiniHeroCard.jsx` that the directory grid mounts each club's **real, full**
hero component (scaled via CSS `transform`, not a lightweight separate
preview) — so without this gate, several infinite loops could run
simultaneously and indefinitely off-screen. Since `MiniHeroCard`'s preview
wrapper is also `inert` now (see §4's keyboard-access update), it still sits
in the DOM and gets measured by the observer normally — `inert` only removes
focus/pointer interaction, not layout or intersection.

---

## 10. Non-accent hardcoded colors (unified mode won't fully flatten these)

Three heroes deliberately use fixed colors that are NOT `--club-accent`, because
the color IS the concept and flattening them would break the effect:

- **Gaming** — second ghost is `#c4b5fd` (two ghosts one color reads as a bug).
- **Art** — the stroke cycles `#f472b6 → #a78bfa → #38bdf8` (a single-color
  "color-changing" stroke is a contradiction).
- **Fashion** — gold gradient outline (`#fde68a → #d4af37 → #a97a1f`); a
  metallic croquis is the whole look.

**Consequence:** when a reader picks **unified accent mode**, these three won't
fully conform — their headings will, but these signature colors persist. That's
arguably correct (the effect survives), but it's an inconsistency to decide on:
either accept it, or build reduced/mono variants of these three for unified mode.

---

## 11. Fashion garment paths are hand-authored (shakiest drawings in the set)

The dress and suit croquis in `FashionHero` are legible at hero size but are the
roughest hand-authored paths across all heroes. If crispness matters, this is
the one place in the club set worth tracing properly (same workflow as
`docs-internal/archive/traced-handwriting-guide.md`) rather than leaving hand-authored.

---

## 12. Fest audio — mechanism built, files & licensing are yours

All three fest heroes (and Music Club) accept an `audioSrc` prop and render a
click-to-play toggle via `FestSound.jsx`. **Never autoplay** — off by default,
click to start, `.play()` rejections swallowed.

**I cannot supply the audio files**, and this is also a **licensing matter**: a
recognizable track on a public university site needs a license or it's a
takedown risk. Safe sources: royalty-free libraries (Pixabay Music, Free Music
Archive, incompetech) or original audio made by a club. Keep whatever
attribution the source requires.

**Each fest takes its own separate `audioSrc`** — they are independent files, so
three different files = three different sounds. `FestSound.jsx` is only the
shared button + playback mechanism; it carries no audio itself. Wiring:
```jsx
<TechFestHero     audioSrc="/audio/innovision-theme.mp3" />
<GeneralFestHero  audioSrc="/audio/fest-fanfare.mp3" />
<CulturalFestHero audioSrc="/audio/vibrance-anthem.mp3" />
```

**Not yet built:** sound *effects tied to the animation itself* (terminal
keystroke clicks, confetti pop, camera shutter) — distinct from the background
theme toggle above. Flag if wanted.

---

## 13. Fest heroes — built, and how they changed

**All three built.** `FestSound.jsx` is the shared audio control.

- **Tech Fest** — cut from four competing ideas (drone + terminal + click-gate +
  payload) down to ONE: a terminal that types a command, then output scrambles
  and resolves into a clean title. No drone, no click, no reveal gate.
- **General Fest** — kept the celebration instinct; confetti now follows real
  ballistic arcs (launch, arc, fall, settle) instead of floating, and settles
  rather than looping.
- **Cultural Fest** — kept the rapid icon cycle but as an INTRO only: flashes
  through categories twice, then settles into a composed ring of all six rather
  than cycling forever.

**Note:** Tech Fest borrows the Turingites accent, General borrows Art's, and
Cultural borrows Theatre's, since fests don't have their own entries in
`clubAccents.js`. If fests should have their own accents, add them to the
registry. General and Cultural also use fixed festive multi-hue palettes
(confetti colors, category colors) that unified-accent mode won't flatten —
same situation as §10.

---

## 14. Dance Club audio — tried during CP3, reverted, deferred

A click-to-play "Hear the beat" button (same contract as Music Club/fest
audio — §7, §12: click-to-play, never autoplay, renders only when `audioSrc`
is passed) was added to `DanceHero` during CP3 integration, then reverted at
the requester's instruction the same session. No audio file existed to back
it (`static/audio/` was empty), so the button rendered and clicked correctly
but produced no sound — expected given no file, not a defect, but not worth
carrying half-wired.

If revisited: reuse the exact `MusicHero`/`FestSound` pattern already in the
codebase (`audioRef` + `.play().catch(() => {})` + button that only renders
when `audioSrc` is truthy) — the wiring is proven, only the prop, button copy,
and an actual royalty-free/original audio file need adding back.

---

## 15. `EntrepreneurshipHero` — light-mode contrast fix, now fully resolved

A Web Content Accessibility Guidelines (WCAG) 2.1 audit found that fixed-dark-card heroes (background stays dark
regardless of site theme) were coloring text/fills with `var(--club-accent)`,
which flips to the *light* accent hex in light site mode — designed for text
on white, not for a permanently-dark card. In light mode this dropped heading
contrast as low as 1.77:1–2.98:1 against a 3:1 (large text) / 4.5:1 (body)
bar. Dark mode was already fine everywhere (`accent.dark` is the
dark-optimized value and matches the card's fixed background).

Fix is `accent.dark` instead of `var(--club-accent)` (`accent` already comes
off `useClubAccent()`, no new import). Astronomy, FilmSociety, Fashion, Art,
and 10 other heroes got the full migration. `EntrepreneurshipHero.jsx` got the
`<h1>` (line 42) but missed four more spots still on `var(--club-accent)`:

- line 53 — `Lightbulb` icon `color`
- line 74 — `<motion.text>` "$" mark `fill` (literal SVG text, not just
  decorative — this one is a real contrast failure at ~3.26:1)
- line 108 — growth-line `<motion.path>` `stroke`
- line 129 — peak-point `<motion.circle>` `fill`

**Status: fixed.** All four now use `accent.dark`, matching the rest of the
file. Also fixed alongside it: the file's SVG had no `role="img"`/
`aria-label` at all (the only other file with this gap was
`MartialArtsHero.jsx` — both now fixed; every other SVG-based hero already
had it). Computed contrast confirms the fix: `accent.dark` on this card's
`bg-slate-900` measures 11.71:1; the old `var(--club-accent)` bug value
(`accent.light`, `#047857`) measured exactly the 3.26:1 this doc already
cited — and running that same regression across the other 15
fixed-dark-card heroes shows 11 of them would have failed AA *outright*
(not just marginally) had the same mistake been made there. Full numbers in
`docs-internal/HEROS-AUDIT-CRITIQUE.md` Part 3.

**Not a bug:** `GardeningHero` and `LiteraryHero` still use
`var(--club-accent)` throughout and should stay that way — their card
background is theme-adaptive (`bg-emerald-50/50` ↔ `dark:bg-emerald-950/25`),
not fixed-dark, so the accent swap is correct there. Confirmed contrast
4.9–6.9:1 (light) / 12+:1 (dark).

---

## 16. `MiniHeroCard` sizing — several rounds, current state

**Status:** settled, for now. The directory-grid card size went through
multiple back-and-forth iterations in one session; recording the reasoning
so a future change doesn't repeat the same trial and error.

**Original (unchanged since the CP4-CP5 commit that introduced
`MiniHeroCard.jsx`, and still what's on GitHub as of this writing):**
`SOURCE_WIDTH = 560`, `SCALE = 0.68` → card renders **381×131px**.

**Round 1 — fix clipping + wrong per-row count.** Reported symptom: the
directory grid was showing 4 cards per row (not the intended 3) with
animations visibly clipped. Root cause turned out to be two separate,
compounding issues: (a) a hero's own `my-6` margin was collapsing straight
through the plain `.mini-hero-card__scale-wrap` div and pushing content down
24px before any of it was even visible, eating into the fixed-height card's
clipping budget — fixed by zeroing margins on that wrapper's children,
preview-context-only; (b) the card was sized to match one hero's scaled
footprint, not the tallest one. Fix: **400×220px** — width chosen so 3 cards
+ 2 gaps never exceeds Infima's 1320px max container (usable ~1288px after
padding) at any breakpoint; height chosen to fit **Literary's** real natural
content height (~308px unscaled — the one club hero with no fixed height;
the other 17 all share a fixed 192px/`h-48`), scaled by the same factor, so
nothing clipped for any hero.

**Round 2 — "increase all cards equally."** Requested a proportional
size bump. Computed the ceiling: only ~4.8% headroom exists before a
proportional increase drops the grid from 3 cards per row to 2 on the widest
container — asked which tradeoff was wanted, got "small bump, keep 3/row."
Result: **416×229px** (416 = the max width that still guarantees 3-per-row;
229 = 220 scaled by the same 416/400 factor, still targeting Literary's
full height).

**Round 3 — the real problem was the opposite one.** Screenshot showed the
actual visual issue wasn't clipping at all — it was **dead space**: sizing
the card to fit Literary (the one outlier with tall content) left the other
17 heroes, all fixed at a much shorter 192px natural height, with a large
empty gap below their content, sitting flush at the top rather than
centered. Reader confirmed it was fine for Literary's own attribution line
to clip in exchange for fixing this for the majority. Re-targeted the height
constraint from Literary to the 17-hero majority: **416×143px** (143 = 192
scaled by 416/560) — current state. Literary's card now crops (roughly to
heading + subtitle, matching what the icon-only heroes show), and the other
17 fill their cards with no dead space.

**If revisited again:** the underlying tension (one hero — Literary — has
categorically different content height than the other 17) doesn't fully
resolve at any single fixed card height; 416×143 is a majority-optimized
compromise, not a universal fit. A per-hero-height masonry grid or a
Literary-specific compact variant would be the way to actually solve it for
both cases at once, if it's ever worth the complexity.

---

## 17. Three new clubs — Chess, Pugwash, Sports Society — built and fully integrated

**Status: done.** Chess Club, Pugwash Society, and Sports Society (whose
signature activity is the University Premier League) were missing heroes
entirely at first — no doc page, no `clubAccents.js` entry, no
`clubDirectory.js` entry, nothing. Requested concepts:

- **Chess Club** — an SVG animation of a chess game (moves actually being
  played, not a static board glyph — matching this set's own rule that
  motion comes from the real activity, e.g. FOSS's commit graph or Science's
  orbiting electrons, not an icon).
- **Pugwash** — a peace sign with a mushroom cloud. (Named for the Pugwash
  Conferences on Science and World Affairs — nuclear disarmament and
  science-policy discussion is the club's actual subject matter, so the
  imagery is literal to the club's real activity, same principle as
  everything else in this set.)
- **Sports Society** — a single motion sequence: a leg kicking a football,
  which transforms into hitting a cricket stump, transforms again into a
  pickleball, and ends on a shuttlecock — one continuous multi-sport beat
  rather than four separate static icons, matching the "sequence as a small
  story" technique already used by `EntrepreneurshipHero` and
  `TechFestHero`'s scramble-resolve.

**Source, not built from scratch:** rather than authoring these three fresh,
they were pulled verbatim from
[`ChargingTrex/campus-club-ui`](https://github.com/ChargingTrex/campus-club-ui)
— the MIT-licensed companion component library this project's own 23 original
heroes were extracted into, kept in sync with this repo's own conventions.
`ChessHero.jsx`/`PugwashHero.jsx`/`SportsHero.jsx` already matched every
convention established here (keyboard access, `cursor-pointer`, focus ring,
`role="img"`/`aria-label`, `useIntroMotion`/`useClubAccent`) with zero
adaptation needed — confirmed compatible (icon names, `--ds-primary-500`
token) before dropping in, then verified via a real production build.

**Pugwash's concept changed during that repo's own history**, per its own
file header: earlier drafts paired the peace sign with a mushroom cloud (the
club's namesake nuclear-disarmament subject) — first as a solid cloud that
read as a tree, then as a corrected mushroom-cloud pictogram. Both were
dropped in favor of the peace sign alone, which still carries the club's
real subject without needing to draw the threat it's answering.

**Accents added** (checked against all 21 for hex collisions — none):
Chess Club = Slate (`#334155`/`#CBD5E1`), Pugwash Society = Olive
(`#3F6212`/`#BEF264`), Sports Society = Gold (`#A16207`/`#FDE047`). All
three pass WCAG AA comfortably against their fixed-dark cards (11.3–13.7:1
computed).

**Sidebar icons:** Chess Club uses lucide's `ChessKnight`; Sports Society
uses `Trophy`. Pugwash needed a custom `PeaceSign` component (`sidebarIcons.js`)
since lucide has no literal peace-sign glyph — hand-drawn in lucide's own
24×24/`currentColor`-stroke style, using the exact same circle + Y-line
geometry as the hero's own peace sign, so the sidebar icon and the hero
visual are the same shape, not just thematically related.

**Full site integration landed** once "dummy data is fine" was confirmed:
`docs/clubs/chess-club/`, `docs/clubs/pugwash-society/`,
`docs/clubs/sports-society/` each got the full four-file folder
(`index.mdx`, `_category_.json`, `events.mdx`, `contact.mdx`), plus
`src/data/teams/<slug>.mjs` and `src/data/clubContacts.js` entries — all
using the exact same `PLACEHOLDER_NAME_N`/`PLACEHOLDER_ROLE`/
`<slug>@example.com`/`#` placeholder shape every other non-FOSS club already
used. `clubDirectory.js` now lists all 21, and every "18 clubs" reference
sitewide (homepage stat row, `/clubs`, `/explore`, `docs/intro.mdx`,
`CLAUDE.md`'s club table, `PRODUCT.md`, `README.md`, `FEATURES.md`,
`DESIGN.md`) was updated to 21. `tests/e2e/fixtures.js`'s `CLUB_SLUGS` grew
to 21 too, which surfaced one real, since-fixed side effect: the
"every club has a working /contact page" e2e test's default 30s timeout was
already tight at 18 sequential page loads and started failing at 21 —
bumped to 60s for that one test rather than changing what it checks.

Real team/contact info still isn't fabricated anywhere — swap the
placeholders in `src/data/teams/<slug>.mjs` /
`src/data/clubContacts.js` whenever it's actually available, same as any of
the other 17 non-FOSS clubs already waiting on the same thing.
