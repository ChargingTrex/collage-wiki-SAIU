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

## 3. Library vs. Archives — split confirmed

- **Library hero:** a shelf fills with 3–4 books of differing heights, and the
  spines gain their titles as the books settle. One idea: *the collection
  assembling itself.*
- **Archives:** the original books-flying-past effect from the motion guide
  gets reused here instead. Different page, different metaphor, no conflict.

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
