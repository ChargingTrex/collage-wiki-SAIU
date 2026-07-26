# Changes

## 2026-07-26 — Real blog tag taxonomy

File: `blog/tags.yml` (was still tutorial placeholders — `facebook`, `hello`,
`docusaurus`, `hola`)

Replaced with the real taxonomy: one tag per club (18), one tag per fest (3:
`tech-fest`, `general-fest`, `cultural-fest`), a set of event-type tags
(`workshop`, `competition`, `talk`, `screening`, `exhibition`, `performance`,
`hackathon`), and a standalone `student-voices` tag for posts an individual
student writes on their own rather than on behalf of a club.

Tags double as the club/fest → event listing mechanism discussed for the
docs/clubs/schools/fests reorg (still unimplemented, see project memory): a
post tagged `art-club` automatically shows up on `/blog/tags/art-club`, so no
separate `club:`/`fest:` frontmatter field is needed to link an event back to
its club or fest.

Not yet done: `blog/authors.yml` is still Docusaurus tutorial placeholder
authors (Yangshun Tay, Sébastien Lorber) — needs real club accounts and a way
to represent individual student authors before this is usable.

## 2026-07-26 — WCAG 2.1 AA button contrast fixes

File: `scholar-design-system-hybrid (1).html`

- **`.btn-secondary`** — background/border changed from `--ds-secondary-500`
  (`#f77f0e`) to `--ds-secondary-700` (`#b54607`); hover changed from
  `--ds-secondary-600` (`#db6204`) to `--ds-secondary-800` (`#93360d`).
  White button text on `-500`/`-600` measured 2.63:1 / 3.65:1, both below the
  WCAG 2.1 AA minimum of 4.5:1 for normal text. `-700` measures 5.46:1 (AA),
  `-800` measures 7.57:1 (AAA).

- **`.btn-primary`** — added a dark-mode-only override pinning the button
  fill to `--ds-primary-600` / `--ds-primary-700` instead of
  `--ds-primary-500`. In dark mode, `--ds-primary-500` is redefined to a
  brighter blue (`#5c88ff`) so it stays legible as text/links on dark
  surfaces, but that same brightening dropped white button text to 3.27:1
  when reused as a solid button fill (fails AA). `-600`/`-700` are not
  brightened in dark mode, so they stay `#2549d4`/`#1d38ab` in both themes
  and hold 7:1+ contrast with white text. Light mode is unchanged
  (`-500` already passed at 4.60:1).

**Update 2026-07-26 (later same day):** now applied to the live site. See
"CP1: Docusaurus scaffold + Tailwind" below — `src/css/custom.css` is no
longer the default scaffold file; it has a scoped `.button--secondary`/
`.button--primary` fix carrying forward this exact contrast finding (using
Infima's actual button class names, not the demo file's `.btn-*` names).

### Still open (found during the same audit, not yet fixed)
- `--ds-text-tertiary` (`neutral-500`, `#848da8`) on light backgrounds:
  3.14–3.30:1, fails AA for the captions/labels/metadata it's used on.
- `accent-500` (`#218A5E`) as link/text on white: 4.32:1, marginal fail.
- Semantic tag colors (success/warning/error/info) used as text directly on
  their `-bg` tokens: 1.79:1–4.24:1, all fail AA (warning is worst, ~invisible).
- Input/card/button borders (`--ds-border` on `--ds-bg`): 1.25–1.6:1, fails
  the 3:1 non-text contrast minimum (WCAG 1.4.11) for UI component boundaries.

## 2026-07-26 — CP0: repo init + push

Files: `.gitignore`, `README.md`, `requirements.txt` (new)

Initialized git, committed the pre-scaffold handoff materials (heroes, hooks,
planning docs) as the first commit, pushed to
`https://github.com/ChargingTrex/collage-wiki-SAIU`. `requirements.txt` is a
plain-text prerequisites list (Node/npm/git), not a pip manifest — this is a
Node/Docusaurus project with no Python component.

## 2026-07-26 — CP1: Docusaurus scaffold + Tailwind

Files: `docusaurus.config.js`, `package.json`, `src/css/custom.css`,
`src/plugins/tailwind-plugin.js`, `tailwind.config.js` (new), `docs/`,
`blog/`, `src/pages/`, `src/components/HomepageFeatures/` (scaffolded)

Scaffolded Docusaurus v3.10.2 (classic template) in place over the existing
pre-built files — nothing was overwritten. `organizationName: 'ChargingTrex'`,
`projectName: 'collage-wiki-SAIU'`, `url: 'https://chargingtrex.github.io'`,
`baseUrl: '/collage-wiki-SAIU/'`, `deploymentBranch: 'gh-pages'`.

**`docusaurus-plugin-tailwindcss` (named in CLAUDE.md/BUILD-BRIEF) does not
exist on npm** — confirmed via direct registry lookup and search; the only
similarly-named package is a year-old, Docusaurus-v2-only, Tailwind-v2-pinned
package, too stale to use. Wired Tailwind instead via a local
`configurePostCss` plugin (`src/plugins/tailwind-plugin.js`), the officially
documented alternative — functionally identical, just not that specific
(nonexistent) package name.

`custom.css` authored fresh from `scholar-design-system-hybrid (1).html`'s
full `--ds-*` token set (not copied from the stale, wrong-accent
`scholar-custom.css`, which encodes `#1aa4bb` teal instead of the locked
`#218A5E` green), mapped onto the actual Infima variables Docusaurus renders
with (`--ifm-color-primary*`, `--ifm-color-secondary*`, emphasis scale,
fonts, radius, shadows, transitions), plus the `--club-accent` bridge and the
`.tech-club` typography override for Turingites/FOSS. Tailwind's `preflight`
disabled (`corePlugins.preflight: false`) so it doesn't fight Infima's base
reset.

**Bug found and fixed:** Tailwind was compiling but generating **zero**
utility classes in the actual build (confirmed via the Tailwind CLI directly
against the same config — it worked fine standalone, proving the config/
content globs were correct). Root cause: `custom.css` never had the literal
`@tailwind base; @tailwind components; @tailwind utilities;` directives —
without them Tailwind's PostCSS plugin has no injection point to expand into.
Docusaurus v4's `fasterByDefault` (Rspack/SWC bundler, on by default via
`future: { v4: true }`) was briefly suspected and disabled while debugging
this, then confirmed innocent and re-enabled once the real fix landed —
Tailwind compiles correctly under Rspack too.

## 2026-07-26 — CP2: shared infra integrated, Astronomy Club smoke-tested

Files: `src/components/**` (reorganized), `docs/clubs/astronomy-club.mdx`
(new), `docs/clubs/_category_.json` (new)

Moved `useIntroMotion.js`, `useClubAccent.js`, `clubAccents.js`,
`Book.jsx`→`primitives/`, `FestSound.jsx`→`fests/` into `src/components/`.
Renamed `LibraryHero-v2.jsx`→`LibraryHero.jsx` and
`LiteraryHero-fontmask.jsx`→`clubs/LiteraryHero.jsx` (old pre-accent-hook
versions deleted). Deleted byte-identical duplicates: `ArchivesHero 2.jsx`,
`useIntroMotion (1).js`, `LiteraryHero (1).jsx`. Moved `DanceHero.jsx` in from
`~/Documents/` (was sitting one level above the project root). Wired
Astronomy Club as the one-club smoke test (`docs/clubs/astronomy-club.mdx`,
`hide_title: true` since the hero renders its own `<h1>` — Docusaurus
otherwise duplicates it from frontmatter).

**Bug found and fixed (affects all 23 heroes, not just Astronomy):**
`--club-accent` was invalid everywhere. `useClubAccent.js` sets
`--club-accent-light`/`-dark` inline per hero; `custom.css` had
`:root { --club-accent: var(--club-accent-light) }`, but CSS custom-property
substitution resolves at the point of *declaration* (`:root`, where
`--club-accent-light` is undefined), not point of *use* — so it was
permanently invalid, rendering as SVG default black regardless of theme.
Fixed with a universal-selector rule instead:
`* { --club-accent: var(--club-accent-light) }` /
`[data-theme='dark'] * { --club-accent: var(--club-accent-dark) }`, so every
element (including each hero's own root) recomputes the variable from
whatever is locally in scope.

**AstronomyHero.jsx specifics:** constellation stars + connecting line now a
hardcoded `STAR_COLOR = '#FDE047'` (yellow) instead of `var(--club-accent)` —
stars are yellow independent of the club's actual accent (Indigo, still used
for the heading), same pattern as Gaming/Art/Fashion's documented hardcoded-
color exceptions. Background scatter dots use a new `--astronomy-dot-color`
token (slate `#94a3b8` in light site-mode, yellow `#fde047` in dark
site-mode — the hero's card background is fixed dark navy regardless of site
theme, so this tracks site theme rather than the per-club accent). Dot radii
increased ~50%. `initial={false}` → `initial="rested"` on 5 motion elements —
harmless, kept, though the hover-replay bug this was meant to fix turned out
to be a false alarm (a bad test selector, not a real defect — see verification
notes in the CP2 report).

Verified live in a real browser (Playwright): load-animate, still-on-scroll,
hover-replay, and reduced-motion (no animation + hover doesn't override) all
confirmed working.

## 2026-07-27 — CP3: all 23 heroes integrated, playback model changed, three sitewide bugs found and fixed

Files: `src/components/clubs/*.jsx` (16 moved in), `src/components/useIntroMotion.js`,
`docs/clubs/*.mdx` (16 new, plus the previously-missing `literary-club.mdx`),
`src/components/clubAccents.js` (unchanged), fest heroes (`*FestHero.jsx`,
`src/components/ArchivesHero.jsx`, `src/components/LibraryHero.jsx`)

All remaining club heroes moved from the project root into
`src/components/clubs/` and given a `docs/clubs/<slug>.mdx` page: Art, Dance,
Gardening, Theatre, Photography, Gaming, Oratory, Entrepreneurship, Fashion,
Science, Music, Film Society, Turingites, Animal Welfare, Martial Arts, FOSS.
`docs/clubs/literary-club.mdx` was also discovered missing from CP2 and added
— the component was integrated but never got a docs page.

Fashion's garment paths were swapped for a standard, symmetric outline per
the locked plan decision (original hand-authored paths were the roughest in
the set); a note is in `animation-caveats (3).md` §14 flagging the future
traced-path upgrade.

### Playback model changed: hover-to-replay → click-to-play

`useIntroMotion.js`'s hover-based replay (`onPointerEnter`/`onPointerLeave`)
was replaced with a click/tap toggle (`onClick`), at the requester's explicit
direction after testing both — hover was stopping/replaying heroes on
incidental cursor drift (trackpad, cursor passing through), which read as
broken rather than intentional. Click requires deliberate intent and works
identically on touch (which has no hover concept at all). The returned
`isHovered` flag was renamed to `isReplaying` throughout every hero (still
drives the `key={isReplaying ? 'hover' : 'intro'}` remount-on-replay
pattern) — a scripted rename across all 23 files, verified with a full
build afterward.

### Bug 1 (sitewide): `border-*` Tailwind utilities were invisible

Every hero using a bare `border`/`border-2`/`border-b` utility (12 spots
across 10 files: Oratory's reverb rings, and the outer card borders on
Literary/Gardening/Library/Archives/Fashion/Foss/Turingites/TechFest/
CulturalFest/Music) rendered with zero visible border. Root cause:
`corePlugins.preflight: false` (set in CP1 to avoid fighting Infima) means
`border-style` is never reset from its CSS initial value of `none`, so
`border-width` alone paints nothing. A global `* { border-style: solid }`
fix was tried first and reverted immediately — it also made Infima's own
conditional borders (focus rings, hover states) permanently visible
sitewide. Fixed instead with the scoped Tailwind utility `border-solid`
added to each of the 12 spots — same principle as the earlier `-950` ramp
finding: fix narrowly, not globally.

### Bug 2 (sitewide): light-mode heading/accent contrast

`useClubAccent`'s `--club-accent` flips between `.light`/`.dark` based on
**site** theme, but most hero cards have a **fixed** dark background
regardless of site theme (only Gardening/Literary/Library/Archives actually
change background with the theme). In light site-mode, these fixed-dark
cards were rendering headings/foreground SVG elements in the `.light` accent
value — a deep shade meant for *text on white* — against a permanently dark
card, reading as low-contrast/near-invisible. Fixed across all 17 affected
heroes (Astronomy, Art, Film Society, Fashion, Entrepreneurship, Dance,
Gaming, Music, Oratory, Photography, Science, Theatre, Foss, Animal Welfare,
Martial Arts, Turingites, plus TechFest/GeneralFest) by using the club's
`accent.dark` value directly instead of the theme-flipping CSS variable, for
any element on a permanently-dark card. Dark mode was already correct and is
unchanged by this fix. Verified with a full 18-club × light/dark screenshot
pass (36 checks, zero console errors, all headings legible in both themes).

### Bug 3 (sitewide): remount-replay silently didn't animate

Clicking (or, previously, hovering) a hero to replay its intro correctly
remounted the SVG (`key={isReplaying ...}`) but the keyframe animation
itself never played — elements snapped straight to their resting values
with no visible motion. Root cause: `initial={false}` on a **freshly
mounted** Framer Motion element gives Framer no "from" state to transition
out of, so it settles immediately instead of animating through the
`playing` variant's keyframes. This affected every hero using
`initial={false}` (confirmed empirically on Dance and Astronomy with
frame-by-frame sampling — Astronomy, which already used `initial="rested"`,
animated correctly; Dance, using `initial={false}`, didn't move at all).
Fixed by changing `initial={false}` → `initial="rested"` everywhere a
`variants` prop exists, and → the literal matching rest-value object (e.g.
`initial={{ x: 240 }}`) everywhere the animate prop is a plain ternary
object instead of a variants lookup (Gaming's muncher/ghosts/pellets,
Photography's flash, Fashion's shimmer, Art's brush tip/stroke/clip-rect,
Film Society's strip, Oratory's rings, Science's electrons, GeneralFest's
confetti, TechFest's title fade). Verified end-to-end with time-sampled
computed-style checks (not just before/after screenshots) showing genuine
mid-animation values, not just a single jump.

### Per-hero fixes and polish

- **Photography** — added the requested viewfinder square connecting the
  four corner brackets, inset slightly inside the square rather than sitting
  on top of it. While adding it, found and fixed a real pre-existing bug:
  the four corner brackets were diagonally mislabeled (`tl`'s offset pointed
  bottom-right, etc.), so all four rendered at the wrong corner facing the
  wrong way — only one was ever visible in the right place by coincidence.
  Also found the brackets mixed a static `transform` attribute with
  Framer-animated `x`/`y` on the same element, which silently drops the
  static offset (Framer needs to own `transform` itself); fixed by moving
  the static translate to a plain outer `<g>` and animating only `x`/`y` on
  the inner `motion.g`.
- **Animal Welfare** — same static-transform-attribute bug as Photography,
  independently present on the paw-print trail: every print rendered
  stacked at the SVG's own origin (visible as a single small paw print
  clipped at the card's top-left corner) instead of walking across the
  frame. Same fix (outer plain `<g>` for position, inner `motion.g` for
  scale/opacity only). Also fixed a `Paw()` helper function referencing
  `accent` from outside its own scope (a latent crash) by passing color as
  a prop, and a subtitle/paw-trail text overlap (same category as the Music/
  FOSS fix below) by constraining the text column width and nudging the
  trail's start position right.
- **Science Society** — electrons visibly cut across their drawn elliptical
  shells instead of tracing them. Root cause: the orbit combined an
  axis-aligned `offset-path` with a separate CSS `rotate` property meant to
  fake the shell's tilt — that combination doesn't compose reliably in
  Framer. Fixed by baking each shell's rotation directly into the SVG arc
  command's own x-axis-rotation parameter, so the path itself is already
  tilted and the electron genuinely follows it.
- **Astronomy** — the enlarged mid-animation observer/telescope was
  overlapping the subtitle text; reduced its peak scale/translate (1.9→1.35,
  -46/-16→-6/-6) so it stays clear of the heading column.
- **Literary Club** — the hand-authored quill path read as a plain triangle
  at render size; replaced with Lucide's `Feather` icon. Found and fixed two
  more bugs while doing this: the feather's plume extended above the
  viewBox's y=0 top edge and was clipped (viewBox given headroom via a
  negative y-origin), and the quote text itself — sized off two hardcoded
  constants — was wider than the container for the actual default quote and
  got clipped regardless of animation state. Replaced the fixed constants
  with a `getBBox()` measurement of the rendered text, so the mask/viewBox/
  quill-travel range now size themselves to whatever `quote` prop is passed
  instead of silently truncating longer text.
- **Music Club / FOSS Club** — subtitle text was overlapping the waveform /
  commit-graph graphic at typical card widths; constrained each hero's text
  column to `max-w-[42%]`/`max-w-[48%]`.
- **Dance Club** — was looping forever (`repeat: Infinity`), reported as
  distracting; changed to `repeat: 1` (two total beats) so it plays twice
  then holds still until clicked again.
- **Gaming Club** — enlarged the whole arcade scene (h-16→h-24), added a
  third ghost, and gave the muncher and each ghost their own distinct fixed
  color (previously the muncher and one ghost both used the same club-accent
  value, reading as one blurred hue). The muncher's fill was changed to
  yellow at the requester's explicit direction — flagging that this reverses
  an earlier deliberate choice to avoid Pac-Man's specific color scheme
  (Namco trade-dress risk on a real public site); shape stays generic.
- **Oratory Club** — reduced from 3 rings to 2, enlarged both the rings
  (40px→56px, scale 2.4→3.2) and the mic icon (h-12→h-16).
- **Entrepreneurship** — enlarged the lightbulb (h-10→h-14) and the `$`
  glyph (fontSize 34→48).
- **Film Society** — pull-down duration shortened (3.6s→2.6s) and eased with
  `easeOut` instead of `easeInOut` for a snappier claw-grab feel.

Not yet re-verified: the 6-heroes-loop-forever `IntersectionObserver`
off-screen-pause question flagged in §9 — still open, to be raised with the
requester now that all 23 heroes are integrated and confirmed rendering.
