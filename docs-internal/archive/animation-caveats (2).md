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

**Upgrade path documented** in `traced-handwriting-guide.md` — about 20 minutes
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
| Shelf fills, spines gain titles | **Library** | Built (`LibraryHero-v2.jsx`) |
| Volume slides out, shows year, settles back | **Archives** | Built (`ArchivesHero.jsx`) |
| Books flowing past | **Future book reading club** | Unassigned — club doesn't exist yet |

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

**Built (9):** Library, Archives, Literary, Astronomy, Gardening, Music,
Science, Film Society, FOSS.

**Remaining clubs (10):** Animal Welfare, Art, Dance, Entrepreneurship,
Fashion, Gaming, Martial Arts, Oratory, Photography, Theatre.

**Remaining fest heroes (3):** General Fest, Tech Fest, Cultural Fest.

The last batch (Music/Science/Film/FOSS) were the four flagged as weakest in
the original guide — all four were the same spinning-icon-with-a-different-hue
pattern. Each was rebuilt around the actual activity:
- **Music** — waveform on a shaped envelope (quiet→swell→decay), not a spinning
  record. Shaped rather than random, or it reads as a loading spinner.
- **Science** — electrons genuinely orbit via `offsetPath`, three shells at
  different periods, not a spinning atom glyph.
- **Film** — strip advancing through a gate with intermittent move-hold-move
  (real projector motion). The *hold* is what distinguishes it from a conveyor.
- **FOSS** — a commit graph that builds (diverge, work, merge), not a rotating
  git icon.

Three original animations were assessed as already earning their motion and may
need little rework: **Turingites** (terminal + blinking cursor), **Dance**
(equalizer bars), **Oratory** (expanding soundwave rings).

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

## 9. Off-screen performance — deferred, will matter on the directory

Individually the heroes are cheap, but the directory page could stack many at
once, and the heavier ones (Film's clipped multi-frame strip, anything looping
like Science's orbits) will animate even when scrolled out of view.

Planned fix: extend `useIntroMotion` with an `IntersectionObserver` so a hero
pauses when off-screen. Do it once in the hook rather than per-component. Not
urgent until the directory page exists with several heroes on it.
