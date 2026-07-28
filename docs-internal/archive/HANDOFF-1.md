# HANDOFF: Sai University Wiki — Design System & Motion Work

Paste this into a new chat to resume. Written 2026-07-24.

---

## 1. Core project goals

Building **sai-uni-wiki** — a student club and event wiki for **Sai University,
Chennai**. Docusaurus v3, hosted on GitHub Pages.

- **18 active student clubs**, 400+ archived events, ~2 new events/month/club
- `/docs` = permanent structured pages (constitutions, exec boards, directories)
- `/blog` = chronological event posts
- Images **co-located** with their markdown (`index.md` + photos in same folder),
  so Docusaurus auto-compresses them and URLs never break as the archive grows
- **Decap CMS** at `/admin` so non-technical club leads publish without touching Git

Two reference docs already produced and should be treated as source material:
`sai-uni-wiki-spec.md` (full project spec) and `sai-uni-wiki-motion-guide.md`
(the original animation guide as supplied — note it is now partly superseded,
see §2).

---

## 2. Key decisions and constraints

### Motion philosophy (the governing rule)

> **Motion should come from the club's activity, not from spinning its noun.**
> A vinyl record spinning is a *picture* of music. A waveform responding *is*
> music. The second is harder and much better.

The original motion guide had 18 near-identical heroes: dark rounded box, title
left, one Lucide icon right, looping `rotate: 360` forever. That is the pattern
being replaced.

### Playback rule — decided and implemented

Heroes animate **while the reader is arriving**, then go still once they scroll,
click, key, or touch. Hovering replays on demand. Specific behaviors:

- Once stopped by scrolling, does **not** auto-restart on scrolling back up
- Anyone landing mid-page (deep link, refresh, scroll restoration) never sees
  the intro — they aren't "arriving"
- Hover **replays from the start**, not resume-from-frozen
- Hover is pointer-only, filtered on `pointerType !== 'touch'` (on mobile a tap
  would otherwise both stop and instantly replay)
- `prefers-reduced-motion` gets rested state immediately; hover does **not**
  override it

### Per-club accent color — decided and implemented

Each club keeps its **own accent** (default) so the directory is scannable by
color as well as alphabetically. A settings option flips to **unified mode**
(everything uses the site palette; motion still differs, only color unifies).

Implemented as **CSS custom properties**, not Tailwind classes — unified mode
is a one-variable swap, not 18 class rewrites. Accents are assigned so
alphabetically adjacent clubs don't land on near-identical hues.

### Three book animations — homes finally resolved

| Effect | Home | Status |
|---|---|---|
| Shelf fills, spines gain titles | **Library** | Built |
| Volume slides out, shows year, settles back | **Archives** | Built |
| Books flowing past | **Future book reading club** | Reserved, unbuilt |

*This departs from the original plan* (which put shelving on Archives). Library
took shelving first and was approved; rather than ship two near-identical
shelving animations, Archives became **retrieval**. The pair now reads as a real
opposition: Library = *putting in* (accumulation), Archives = *getting out*
(findability).

### Styling direction — STILL UNDECIDED

Three palette/system explorations exist but **none is chosen**:

- **Marginalia** — index-card light / chalkboard dark; pencil-underline links,
  library-stamp tags. Files: `custom.css`, `design-system.md`, `preview.html`
- **Scholar** — institutional/letterhead. Two palette variants:
  `scholar-custom.css` (blue/orange/teal) and `scholar-custom-old.css`
  (Indigo Seal / Brass Gold / Emerald Ivy)
- **"Sai Crimson"** — named in the project spec, never actually built

Four-role typography was established in Scholar (display / heading / body /
mono as four *distinct* typefaces, e.g. Playfair Display / Spectral / Inter /
JetBrains Mono). Whether this survives into the final direction is open.

### Known conflict to resolve

`motion.css` + `motion.js` (pure CSS + Docusaurus client module, Infima-based)
were built **before** the Framer Motion direction. They are **not compatible**
with the Framer Motion hero components. One approach must win. Current work is
all Framer Motion.

---

## 3. Technical stack

```
Docusaurus v3
Tailwind CSS (via docusaurus-plugin-tailwindcss)
Shadcn UI (Radix primitives)  ← in spec, not yet actually used anywhere
framer-motion + lucide-react  ← all hero animations
GitHub Pages + Decap CMS
```

`npm install framer-motion lucide-react`

### File structure of work produced

```
src/
├── components/
│   ├── useIntroMotion.js        # playback rule — shared by ALL heroes
│   ├── useClubAccent.js         # accent resolution + unified-mode hook
│   ├── clubAccents.js           # 18-club color registry
│   ├── primitives/
│   │   └── Book.jsx             # exports Book + Shelf
│   ├── LibraryHero.jsx          # (delivered as LibraryHero-v2.jsx)
│   ├── ArchivesHero.jsx
│   └── clubs/
│       ├── LiteraryHero.jsx     # (delivered as LiteraryHero-fontmask.jsx)
│       ├── AstronomyHero.jsx
│       └── GardeningHero.jsx
└── css/
    └── custom.css               # needs the accent bridge, see below
```

**Required in `custom.css`:**

```css
:root            { --club-accent: var(--club-accent-light); }
[data-theme='dark'] { --club-accent: var(--club-accent-dark); }
```

### Core API — `useIntroMotion`

```js
const { isPlaying, isHovered, hoverProps } = useIntroMotion();
// spread hoverProps on the hero root; drive variants off isPlaying;
// use isHovered as a React key to force full replay
<div {...hoverProps}>
  <motion.g key={isHovered ? 'hover' : 'intro'}
            animate={isPlaying ? 'playing' : 'rested'} variants={...} />
</div>
```

### Core API — `useClubAccent`

```js
const { accentStyle, accentName, isUnified } = useClubAccent('astronomy-club');
<div style={accentStyle}>            {/* sets --club-accent-light/dark */}
  <circle fill="var(--club-accent)" />
</div>
```

Also exports `useAccentMode()` → `{ mode, setAccentMode }` for the settings UI.
Note: always renders `per-club` on first paint before reading localStorage, to
avoid hydration mismatch on prerendered pages. Fires a `sai-accent-change`
custom event on change, because `storage` events don't fire in the originating tab.

### Core API — `Book` / `Shelf`

```jsx
<Shelf books={[{ title:'ARCHIVE', width:22, height:84, tone:'amber' }]}
       baseline={118} startX={70} animate={isPlaying ? 'playing' : 'rested'} />
```

`titleDelay` (default 0.45) **must stay > 0** — the gap between a book landing
and its title appearing is what makes it read as *catalogued* rather than
pre-labelled.

---

## 4. Exact state of what's finished

**Infrastructure (done):**
- `useIntroMotion.js` — scroll-to-still + hover-replay, reduced-motion safe
- `clubAccents.js` + `useClubAccent.js` — 18 accents, unified-mode opt-out
- `primitives/Book.jsx` — `Book` + `Shelf`, configurable width/height/lean/tone

**Heroes (5 of ~21 done):**
- **Library** — books drop into shelf, spines gain titles after settling
- **Archives** — static wall of 12 spines, 3 pull out showing years (2024/25/26),
  hold, settle back. Shelf lip drawn *last* so pulls pass behind it — that
  overlap is what makes them read as coming out of the shelf
- **Literary** — quill travels L→R, `Caveat` text unmasked beneath it. Uses
  **font-mask**, not traced path (see caveat below)
- **Astronomy** — observer at telescope, camera pulls back, constellation lines
  draw between hand-placed stars, then soften to a faint trace. Zoom done by
  scaling two groups in opposite directions from shared origin (**not** viewBox
  animation, which forces layout every frame)
- **Gardening** — stem draws upward, leaves unfold hinged from their attachment
  points (per-leaf `originX/originY`, not center), bud opens. **Rested state is
  the grown plant** — growth that resets is a pulse, not growth

**Docs:**
- `animation-caveats.md` — running log of open decisions
- `traced-handwriting-guide.md` — how to upgrade Literary to a real traced path

**Deliberate non-sharing:** `ArchivesHero` does *not* reuse `Book`. `Book` is
drop-in-and-settle with delayed title; Archives is slide-out-and-return with a
label tied to the pull. One component doing both would need a prop switching
between unrelated behaviors.

---

## 5. Immediate next steps / open tasks

### Blocking-ish
1. **Pick the styling direction** (Marginalia / Scholar / Sai Crimson). Blocks
   accent contrast verification and any Shadcn work.
2. **Resolve the motion.css vs Framer Motion conflict** — two incompatible
   animation systems currently coexist.
3. **Build the settings toggle UI** — `useAccentMode()` exists but nothing
   calls `setAccentMode`. Needs a home (navbar item? settings page?).

### Next build candidates (user was choosing between these)
4. **Fest heroes** — General / Tech / Cultural. *Tech Fest especially needs
   cutting down*: it currently runs a drone, a terminal, a click interaction,
   and a payload metaphor simultaneously. Should be one idea.
5. **Weakest club heroes first** — Music, Science, Film, FOSS are literally the
   same spinning icon in different hues. Highest improvement per unit effort.

### Remaining clubs (15 of 18 unbuilt)
Animal Welfare, Art, Dance, Entrepreneurship, Fashion, Film, FOSS, Gaming,
Martial Arts, Music, Oratory, Photography, Science, Theatre, Turingites.

*(Turingites' terminal + blinking cursor, Dance's equalizer bars, and Oratory's
expanding soundwave rings were assessed as the three original animations that
already earn their motion — they may need less rework than the rest.)*

### Known caveats
6. **Literary uses font-mask, not a traced path.** Real legible `Caveat` text
   wiped open L→R. A true pen-stroke needs ~20min tracing in Figma — steps in
   `traced-handwriting-guide.md`, swap is one prop. Worth it for Literary; not
   worth doing 18×. **`AnimatedSignature` in the original motion guide has the
   same placeholder-squiggle problem and still needs fixing.**
7. **Accent contrast unverified.** Sepia, Crimson, Terminal sit close to their
   surfaces; recheck once the palette is locked.
8. **Archives years are hardcoded** (2024/25/26). Could be props or driven from
   real archive data.
9. **`LibraryHero-v2.jsx` supersedes `LibraryHero.jsx`** — rename and delete the
   old one on integration.
10. **Icon licensing** — free to combine Lucide/Phosphor/Tabler/Heroicons etc.,
    but most are MIT/Apache-2.0; verify per library and keep attribution where
    required.

### Working style note
The user wants **genuine back-and-forth**, not order-taking: flag weak ideas,
name tradeoffs, disagree where warranted, and ask before building at scale.
Metaphor coherence has been the recurring theme — e.g. conveyor-belt motion was
rejected for Archives because "things in transit" is the opposite of "archived."
