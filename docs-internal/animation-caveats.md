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
  scrolls back to the top. Only hover brings it back.
- Anyone landing mid-page (deep link, refresh, browser scroll restoration)
  never sees the intro play — they aren't "arriving."
- `prefers-reduced-motion` users get the rested state immediately and hover
  does **not** override it.

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

**Still open:**
- The settings UI itself doesn't exist yet — only the hook and storage layer.
  Needs a toggle somewhere in the navbar or a settings page.
- Accent contrast hasn't been checked against final light/dark backgrounds.
  Several (Sepia, Crimson, Terminal) are close to their surfaces and may need
  adjusting once the site palette is locked.
- 18 distinct hues is near the limit of what stays distinguishable. If clubs
  are ever added, the set likely needs regrouping by category rather than
  extending.

---

## 6. Hero build progress

**Built — all 18 clubs + Library + Archives (20 heroes):**
Library, Archives, Literary, Astronomy, Gardening, Music, Science, Film Society,
FOSS, Dance, Oratory, Photography, Theatre, Martial Arts, Gaming, Art, Fashion,
Entrepreneurship, Animal Welfare.

**Remaining fest heroes (3):** General Fest, Tech Fest, Cultural Fest.

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

## 9. Off-screen performance — deferred, now more pressing

Individually the heroes are cheap, but the directory page stacks many at once,
and several now **loop indefinitely** and will animate even when scrolled out
of view: Science (orbits), Gaming (arcade chase), Art (brushstroke color cycle),
Music/Dance (waveform pulses), Oratory (rings), Film (projector advance).

That's a meaningful chunk of the 18 running continuously. Planned fix: extend
`useIntroMotion` with an `IntersectionObserver` so a hero pauses when off-screen.
Do it once in the hook, not per-component. **This is now the highest-value piece
of remaining infra work** given how many looping heroes exist.

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

## 15. `EntrepreneurshipHero` — light-mode contrast fix left half-applied

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

All four should become `accent.dark` to match the rest of the file.

**Not a bug:** `GardeningHero` and `LiteraryHero` still use
`var(--club-accent)` throughout and should stay that way — their card
background is theme-adaptive (`bg-emerald-50/50` ↔ `dark:bg-emerald-950/25`),
not fixed-dark, so the accent swap is correct there. Confirmed contrast
4.9–6.9:1 (light) / 12+:1 (dark).
