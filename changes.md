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

Not yet applied: these fixes exist only in the spec/demo file. The live
site's `src/css/custom.css` is still the default Docusaurus scaffold —
`scholar-custom.css` (the intended drop-in) doesn't define `.btn-primary`/
`.btn-secondary` at all yet, so this hasn't reached the actual site.

### Still open (found during the same audit, not yet fixed)
- `--ds-text-tertiary` (`neutral-500`, `#848da8`) on light backgrounds:
  3.14–3.30:1, fails AA for the captions/labels/metadata it's used on.
- `accent-500` (`#218A5E`) as link/text on white: 4.32:1, marginal fail.
- Semantic tag colors (success/warning/error/info) used as text directly on
  their `-bg` tokens: 1.79:1–4.24:1, all fail AA (warning is worst, ~invisible).
- Input/card/button borders (`--ds-border` on `--ds-bg`): 1.25–1.6:1, fails
  the 3:1 non-text contrast minimum (WCAG 1.4.11) for UI component boundaries.
