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
