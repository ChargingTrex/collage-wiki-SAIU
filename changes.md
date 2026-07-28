# Changes

## 2026-07-28 — Per-club Events pages, homepage Recent Activity, club-events-plugin

Files: `src/plugins/club-events-plugin.js` (new), `docusaurus.config.js`,
`package.json`, `src/components/useLoadMore.js`/`EventCard.jsx`/
`ClubEventsList.jsx`/`RecentActivity.jsx` (new), `src/theme/DocSidebarItem/
Category/*` (new, ejected+patched), `docs/clubs/*` (all 18, flat `.mdx` →
folder + `_category_.json` + `events.mdx`), `src/pages/index.js`

Closed the gap flagged back in CP4 (`changes.md`'s own 2026-07-28 CP4 entry:
"the blog plugin doesn't expose its post list via the standard `usePluginData`
global-data mechanism by default in this setup") by building a small custom
Docusaurus plugin, `club-events-plugin.js`, instead of trying to read the
blog plugin's own (unexposed) content. It globs `blog/**/*.{md,mdx}` directly,
parses frontmatter via `@docusaurus/utils`'s `parseMarkdownFile`/
`DEFAULT_PARSE_FRONT_MATTER` (the same utility the blog plugin itself uses
internally — no new parsing dependency needed), and groups posts by
whatever tag they carry (club/fest/event-type, per `blog/tags.yml`) plus one
global date-sorted list. Deliberately tag-agnostic, not "club-aware," so a
future sitewide Archives page (`ArchivesHero`, still unwired) can read the
same `usePluginData('club-events-plugin')` data with zero plugin changes.

**Permalink derivation had to byte-match the blog plugin's own default**
(this site has `onBrokenLinks: 'throw'`, so a wrong link is a hard build
failure, not a cosmetic bug). Copied `@docusaurus/plugin-content-blog`'s
`DATE_FILENAME_REGEX`/`parseBlogFileName` logic verbatim rather than
approximating it — verified by adding a throwaway slug-less, date-prefixed
test post, comparing the plugin's computed permalink against the URL the
real blog build actually served it at (`/blog/2024/01/15/plugin-verify-temp`
in both cases), then deleting the test post.

**Each club gets its own Events page** (`docs/clubs/<slug>/events`, e.g.
`/docs/clubs/art-club/events`), reading that club's tagged posts via
`ClubEventsList`, paginated client-side (`useLoadMore`, capped, "load more"),
with a "view full timeline" link out to Docusaurus's own auto-generated
`/blog/tags/<slug>` page. Converting each club from a flat `docs/clubs/
<slug>.mdx` into a folder (`index.mdx` + `_category_.json` + `events.mdx`,
smoke-tested on Art Club first, then rolled out identically to the other 17)
surfaced a real regression: a `type: 'doc'` sidebar item becomes `type:
'category'` once it's a folder, and this project's existing icon patch
(`DocSidebarItem/Link`, from the 2026-07-28 icons entry above) only
reads `sidebar_custom_props.icon` on the `Link` component — `Category` is
stock upstream and never reads `customProps` at all, so every club's sidebar
icon (and its `/docs/category/clubs` card description) would have silently
disappeared. Fixed with the same pattern already used for `Link`: ejected
`DocSidebarItem/Category`, threaded `customProps?.icon` through to render
the matching lucide icon before the category label. One-time shared fix,
applies to all 18 clubs.

**Bug found and fixed:** Docusaurus only generates a `/blog/tags/<tag>` page
for tags with at least one real post — with zero real event posts existing
yet (only the Docusaurus tutorial scaffold + one placeholder), the "view full
timeline" link would have pointed at a page that doesn't exist for all 18
clubs simultaneously, hard-failing the build. Fixed by only rendering that
link when a club actually has events; confirmed by temporarily tagging one
scaffold post `art-club`, rebuilding (link + target page both resolved
correctly), then removing the tag and reconfirming the empty-state message
takes over cleanly.

**Homepage's fest-hero showcase (`FestsSection`, 3 heroes) replaced with
`RecentActivity`** — the 5 most recent posts site-wide, same plugin/
`EventCard` as the per-club pages. Fest pages themselves untouched, still
reachable at `/docs/fests/<slug>` and via the navbar/footer `Fests` link.

Verified end-to-end in a real browser (Playwright + a static build): full
`npm run build` clean (zero broken links) after each stage and once more
with all 18 clubs converted; homepage screenshot shows the "Recent Activity"
heading and 5 dated post cards with no fest-hero markup left, zero console
errors apart from the already-documented (see the GitHub-badge entry above)
`api.github.com` 404 on a private repo. Hit one dev-server hiccup while
checking this live: another concurrently-running session had a half-finished
blog post (`blog/2026-07-28-stop-asking-ai-for-answers/`) referencing an
image that didn't exist yet, which hard-fails MDX compilation for the whole
site (not just that route); moved the post aside temporarily to verify the
homepage in isolation, and by the time verification finished the other
session had supplied the missing image itself — moved back and reconfirmed
with a clean restart. Not this session's file, not this session's fix.

Not yet done: the sitewide filterable Archives page (browse by club/fest/
year, `ArchivesHero`) — deliberately deferred; the plugin's data shape
(`{posts, postsByTag, tagsMeta}`) is already general enough for it.

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
the set); a note is in `docs-internal/animation-caveats.md` §14 flagging the future
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

**Update, same day:** re-raised with the requester. Decision: leave the
off-screen pause at CP7b as originally planned — the directory/clubs listing
page doesn't render a hero per card today, so the "many heroes looping at
once" cost doesn't actually exist yet. Revisit once CP4's mini-hero cards
populate that page.

## 2026-07-27 — GitHub badge, footer contact icons, footer theme fix

Files: `docusaurus.config.js`, `static/js/github-badge.js` (new),
`src/theme/Footer/index.js` (new — Footer swizzled with `--wrap`),
`src/css/custom.css`, `CONTRIBUTING.md`

Implemented the navbar GitHub badge from `github-badge-guide.md` as written
(repo name, month/year label, live star/fork counts fetched client-side, kept
GitHub's own authentic dark/gray styling rather than re-skinning to the
Scholar palette — the requester's explicit call). Hit one real bug while
wiring it: the CSS comment introducing the badge's stylesheet block
contained the literal text `--ds-*/--club-accent`, and that `*/` prematurely
closed the CSS comment mid-sentence, corrupting everything parsed after it
(surfaced as an unrelated-looking "unclosed string" error much further down
the file). Fixed by rewording the comment. Separately, the badge's date
field stayed empty in `npm start` (no SSR — the async script's
`DOMContentLoaded` fires before React has rendered the navbar HTML into the
DOM) but populates correctly in the actual production build, which does have
the badge markup present in the static HTML before any script runs — not a
real bug, just a dev-server-only artifact. Star/fork counts show `—`
placeholders because `api.github.com/repos/ChargingTrex/collage-wiki-SAIU`
currently 404s for unauthenticated requests — near-certainly because the
repo is private (GitHub returns 404, not 403, for private repos to avoid
confirming they exist) — the badge is behaving exactly per its designed
fallback in that case.

**Footer swizzled** (`--wrap`, per the easter-egg doc's already-documented
approach, though this was for contact icons, not the dino yet) to add a
LinkedIn / Instagram / mail / GitHub / report-an-issue icon row below the
standard footer. Discovered lucide-react (the icon library used everywhere
else in this project) doesn't include brand/company logos at all — it's a
generic icon set, confirmed by checking the installed package's icon files
directly — so LinkedIn/Instagram/GitHub are hand-embedded SVG paths inside
`src/theme/Footer/index.js` (GitHub reuses the same octocat path already in
the navbar badge), matching the one pattern already used in this codebase
for brand marks. LinkedIn and Instagram hrefs and the mailto address are
placeholders (`PLACEHOLDER_LINKEDIN_URL`, `PLACEHOLDER_INSTAGRAM_URL`,
`PLACEHOLDER_EMAIL` — grep "PLACEHOLDER" to find them) since Sai University's
real social URLs weren't available this session; GitHub and report-an-issue
both point at this repo's real URL.

**Found and fixed while doing this:** the footer was permanently dark
regardless of the site's light/dark toggle. Root cause was two-fold —
`docusaurus.config.js` had `footer: { style: 'dark' }`, which is a static
Infima style choice unrelated to the reader's theme preference (removed);
and the replacement custom CSS's first attempt used `--ds-neutral-900`,
which doesn't work as a "fixed dark" value the way it sounds — the whole
`--ds-neutral-*` ramp is deliberately *inverted* under `[data-theme='dark']`
elsewhere in `custom.css` (so components that use it for text/surface colors
don't need per-theme rewrites), which meant the footer's "dark" background
picked up the ramp's now-inverted (light) end specifically in dark mode.
Fixed with fixed hex values in explicit `[data-theme='dark']` /
`[data-theme='light']` blocks instead of the semantic ramp tokens.

**`CONTRIBUTING.md`** updated to match reality: the `useIntroMotion` example
and description referenced `isHovered`/hover-replay, both stale since
yesterday's click-to-play switch; corrected to `isReplaying`/click, and
noted the off-screen pause is still not implemented (was previously
described as already working). Also documented the new
`static/js/github-badge.js` and the now-swizzled `Footer` in the "where
things live" section.

**Not yet committed** — another session had files staged
(`github-badge-guide.md`, a "toggle ui dark/light mode" doc, plus new
untracked `ClubContact.jsx`/`clubContacts.js`/planning docs) at the point
this work finished, so committing was held off rather than bundling their
possibly-unfinished work in under this session's commit.

## 2026-07-28 — CP4: homepage/clubs split, fest heroes moved in, fests get their own doc pages

Files: `src/pages/clubs.js` (new), `src/pages/index.js`, `src/pages/index.module.css`,
`src/components/MiniHeroCard.jsx` (new), `src/data/clubDirectory.js` (new),
`src/components/fests/*Hero.jsx` (moved in from project root), `docs/fests/*.mdx`
(new), `src/components/useIntroMotion.js`

Another session left content drafts (`homepage-content.md`, `club homepage.md`)
proposing a different split than the original CP4 wording (mini-hero cards
directly on the homepage): a lean homepage focused on stats/activity/about,
with the 18-club mini-hero grid moved to its own `/clubs` directory page.
Confirmed with the requester and built it that way, with the club-homepage
copy (intro line, current-vs-past-team-roster note) placed above the grid on
`/clubs` per their explicit instruction.

**`MiniHeroCard.jsx`** renders each club's real hero (not a separate
mini-implementation) at natural size inside a fixed-width wrapper, scaled
down with a plain CSS `transform: scale()`, wrapped in a `Link` to that
club's doc page. The wrapper has `pointer-events: none` — the outer card is
the click target, not the hero's own internal click-to-replay handler, since
those would otherwise both fire on any click.

**Fest heroes** (`TechFestHero`/`GeneralFestHero`/`CulturalFestHero`) moved
from the project root into `src/components/fests/`, matching the file-
integration map. Placed on the homepage in a dedicated Fests section (full
size, not mini — each hero handles its own click-to-replay/sound-button
interactions, so it can't be wrapped in a page-level `Link` the way club
cards are; each gets a separate "View this fest →" link below it instead)
and given their own `docs/fests/<slug>.mdx` pages, mirroring `docs/clubs/`,
per explicit request ("fests should have a sep directory like clubs").

**Per-fest fixes/polish, per review:**
- **Cultural Fest** renamed to its real name, **MoSAIc** (was a placeholder
  "VIBRANCE 2026"); icon-ring animation enlarged (stage 128px→176px, ring
  radius 44→58, icon circles 36px→44px).
- **General Fest** was visibly plainer than its siblings (flat two-color
  gradient, single icon, no tagline) — added the same ambient-glow-blob
  depth technique already used on Cultural Fest, a radial spotlight behind
  the icon/title, a tagline line (previously had none), and richer confetti
  (22→34 pieces, wider settled spread — was clustered in a narrow band just
  below center, reading as sparse once at rest).
- **Tech Fest** — found and fixed a real, reproducible bug while checking
  whether its scramble effect ever fully resolves: the interval advanced
  `frame`/`locked`, built the display string, *then* checked whether to
  clear itself — so the exact tick that finally reached `locked >=
  target.length` cleared the interval using the *previous* tick's
  still-one-short `locked` value. The fully-resolved string was computed but
  never rendered before the interval died, so the very last character of
  the title stayed permanently scrambled (confirmed via frame-by-frame
  sampling: stuck on "INNOVISION 202+" indefinitely). Fixed by advancing
  frame/locked *before* building the string each tick.

**`useIntroMotion` gained an opt-in `playOnVisible` mode**, used only by the
3 fest heroes. The existing mount-time arrival check only looks at
`window.scrollY` once, at mount — for a hero below the fold on a page (the
homepage's Fests section), that's still 0 at a fresh page load regardless of
where the hero sits, so the intro played immediately, off-screen, and had
already finished by the time the reader scrolled down to see it. With
`playOnVisible: true`, the hero instead waits for an `IntersectionObserver`
to report it in view before starting. Two real bugs surfaced while building
and verifying this (confirmed with frame-by-frame position/timing sampling,
not just before/after screenshots):
1. `IntersectionObserver`'s `entry.isIntersecting` is true for *any* overlap
   at all, even one pixel — it does **not** mean "at least `threshold`
   visible" the way the option name suggests. Checking `intersectionRatio
   >= threshold` explicitly was required; using `isIntersecting` alone made
   the hero start playing as soon as a single pixel entered the viewport.
2. Even with the ratio check, the very first observer callback (fired
   shortly after mount) reported a **higher** ratio than the page's true
   settled position, because it ran before the `@import`ed Google Fonts
   (Playfair Display/Spectral) finished loading and swapped in — the
   pre-swap fallback-font layout was shorter, so the hero measured as more
   visible than it actually was once fonts settled. Since the observer
   disconnects on its first qualifying reading, that stale ratio locked in
   a premature "visible" verdict. Fixed by delaying observer setup by one
   beat (250ms) so it starts observing only after initial font/layout
   settling. Verified end-to-end: the hero now stays static through several
   seconds below the fold, then genuinely plays once scrolled into view.

Not done this session: pulling live "recent blog posts" onto the homepage
(a nice-to-have from the content draft) — the blog plugin doesn't expose
its post list via the standard `usePluginData` global-data mechanism by
default in this setup, and building a reliable version needs more
investigation than was worth risking on this pass. Kept a plain "Browse
Events" CTA instead.

## 2026-07-28 — Fests page, navbar Docs/Blog/Events, footer parity, Events vs Blog split

Files: `src/pages/fests.js` (new), `docusaurus.config.js`,
`blog/2026-07-28-student-voices-placeholder/index.md` (new)

**`/fests` page** built mirroring `/clubs`: the 3 fest heroes at full size
(not mini — same reason as the homepage's Fests section, they own their
click-to-replay/sound interactions and can't be `Link`-wrapped), each with a
"View X →" link to its `docs/fests/<slug>` page. Added to the navbar
(`{to: '/fests', label: 'Fests'}`) per explicit request that clicking Fests
in the header should land on an all-fest-heroes page "like the clubs" one,
not the docs category index.

**Navbar gained `Docs` (`/docs/intro`) and `Blog`**; footer's "Wiki" column
updated to match (Clubs/Fests/Docs/Events/Blog). Confirmed with the
requester via AskUserQuestion that **`Blog` and `Events` are two distinct,
non-overlapping nav items**, not a rename of one into the other — requester's
words: "blogs will show only student voices posts, whereas events will show
all the fests, clubs and general events." So `Events` → `/blog` (the full
chronological archive, unchanged), `Blog` → `/blog/tags/student-voices` (only
posts an individual student wrote on their own).

Wiring `Blog` to that tag route surfaced two real, non-obvious behaviors of
Docusaurus's blog-tag system: (1) `tags.yml`'s custom `permalink:
/student-voices` field does **not** change the tag's actual generated route
in this setup — it's still served at the default `/blog/tags/student-voices`
regardless; (2) a tag with **zero** posts using it generates **no page at
all** (plain 404), confirmed by checking before/after adding a real post.
Since no real student-authored post existed yet, added
`blog/2026-07-28-student-voices-placeholder/index.md` (tagged
`student-voices`, no `authors` field — deliberately not inventing a fake
student persona, body text clearly labels it a placeholder) purely so the
new `Blog` nav item has a real, non-broken destination. Replace/delete once
genuine student posts exist.

**Bug reported ("i cannt access docs at all"), diagnosed as not a real
bug**: root cause was the *other*, concurrently-running dev server (port
3000, started outside this session's control) had crashed from an earlier
Rspack cache panic and was never restarted. Verified this session's own
server (port 3005) was serving `/docs/*` correctly the entire time via direct
Playwright testing (page load, sidebar navigation, zero console errors)
before concluding there was no actual regression — fixed by restarting the
3000 server, not by changing any code.

**Floating icon quick-jump menu for the homepage**: requested alongside the
above ("add a side bar in the home page with a icon"); clarified via
AskUserQuestion that a floating quick-jump icon button was wanted, not a
permanent docs-style sidebar. **Not yet built** — remains open.

## 2026-07-28 — HANDOFF-3.md

Wrote `HANDOFF-3.md`, a fresh dense resume-context document (same 5-section
shape as `HANDOFF-1.md`/`HANDOFF-2.md`) covering everything from CP4 forward:
the homepage/clubs/fests split, the click-to-play/`playOnVisible` playback
changes, the Events-vs-Blog nav split, the GitHub badge/footer work, all
bugs found and fixed, and the still-uncommitted state pending the concurrent
session's parallel edits. Next up per that doc: an `/explore` page (all 23
heroes + Blog/Archive cards), the floating quick-jump menu, and revisiting
the off-screen `IntersectionObserver` pause now that multi-hero pages exist.

## 2026-07-28 — Explore page, Archives finally gets a doc page

Files: `src/pages/explore.js` (new), `docs/resources/archives.mdx` (new),
`docs/resources/_category_.json` (new), `src/css/custom.css`,
`src/pages/clubs.js`, `docusaurus.config.js`

**`ArchivesHero.jsx` had existed since CP2/CP3 with zero doc-page wiring** —
flagged as a known gap in `HANDOFF-3.md` (`/clubs`' own copy referenced "a
separate Archives page" as plain unlinked text for exactly this reason).
Fixed by adding `docs/resources/archives.mdx` (new `docs/resources/`
category, matching CLAUDE.md's target directory layout, position 4 after
Fests) wiring in `ArchivesHero` with no props — it already ships sensible
defaults. `src/pages/clubs.js`'s "Archives page" mention is now a real
`Link` to `/docs/resources/archives` instead of dead text.

**`/explore` page** built per request ("add explore page with all the
heroes, a blog and archive cards with icons"): reuses the exact same
`CLUB_DIRECTORY`/`MiniHeroCard` grid as `/clubs` (18 cards) and the same
full-size fest hero + "View X →" pattern as `/fests` (3 heroes), under
"Clubs"/"Fests" headings on one page. Two additional non-hero cards sit at
the end of the club grid — `Blog` (lucide `BookOpen` icon → `/blog/tags/
student-voices`, matching the navbar's Blog target) and `Archives` (lucide
`Archive` icon → the new `/docs/resources/archives`) — sized to match
`.mini-hero-card`'s footprint via a new `.explore-icon-card` class so they
sit flush in the same flex grid. Library's hero remains unwired (not
requested this round — only Blog/Archive cards were asked for); noted as
still-open.

One CSS pitfall avoided while building `.explore-icon-card`: initially set
the icon color to `var(--club-accent)`, matching the hero convention, but
`--club-accent-light`/`-dark` are **only ever set inline by `useClubAccent`
on a specific hero's own root** — outside any hero (as these cards are) the
variable is simply undefined, which would have made the icon color silently
invalid rather than erroring. Used `var(--ifm-color-primary)` instead, since
these cards aren't tied to any one club's accent.

**Added `/explore` to the navbar and footer** (first item, ahead of
Clubs/Fests), matching the precedent set earlier this session for every
other new top-level page (Clubs, Fests) — an unlinked page would otherwise
have no discoverable entry point.

Verified end-to-end with a real browser after a full dev-server restart
(config changes don't hot-reload): navbar order `Explore, Clubs, Fests,
Docs, Events, Blog`; `/explore` renders 18 mini-hero cards + 2 icon cards
under "Clubs", 3 fest heroes under "Fests"; clicking the Archives card
correctly lands on `/docs/resources/archives`, which renders the
`ArchivesHero` component with zero console errors. Also ran a full
`npm run build` afterward specifically to confirm the new routes don't trip
`onBrokenLinks: 'throw'` — passed clean.

Still not committed — same reason as every entry above this one this
session (concurrent session's parallel edits to shared files, holding off
until that's sorted out with the requester).

## 2026-07-28 — Library repurposed as the Blog hero, /student-voices landing page, tag-filtered recent-posts feed

Files: `src/components/LibraryHero.jsx`, `src/pages/student-voices.js` (new),
`src/components/TagFilteredEvents.jsx` (new), `docusaurus.config.js`,
`src/pages/explore.js`

**Clarified split, confirmed by the requester**: `LibraryHero` and
`ArchivesHero` are two separate heroes that happen to share a shelf-of-books
visual motif — Library = the Blog hero (individual student writing, a shelf
still being filled), Archives = the Archive hero (the completed event
history, already wired to `docs/resources/archives.mdx` earlier this
session). `LibraryHero.jsx`'s default `title`/`subtitle` had drifted to say
"Campus Library Archive" / "Four hundred events, catalogued and
searchable" — that's Archives' copy, not Library's — corrected to "Student
Voices" / "Writing, projects, and reflections — published by students, for
themselves." Its header comment and `SHELF_BOOKS` spine labels
(`ARCHIVE`→`ESSAYS`, `THESES`→`PROJECTS`) updated to match.

**`/student-voices` (new page)** — the requester wanted Blog to work "like
the clubs page": its own landing page with the hero up top, not a bare link
straight into Docusaurus's auto-generated tag listing. Structure: full-size
`LibraryHero`, a short blurb distinguishing it from Events, a link to the
underlying `/blog/tags/student-voices` listing, then the new tag-filter feed
(below).

**This changed an earlier locked decision** (Blog nav → `/blog/tags/
student-voices` directly, confirmed earlier this session via
AskUserQuestion) — flagged explicitly per the requester's standing
instruction to surface exactly this kind of conflict; re-confirmed via a
second AskUserQuestion and the requester chose the new landing page. Navbar
`Blog` item, footer's "Wiki" column `Blog` link, and the Explore page's Blog
icon-card all repointed from `/blog/tags/student-voices` to `/student-voices`.

**`TagFilteredEvents.jsx` (new)** — a tag picker + recent-posts feed, per
request ("give a provision to select all the tags [that] bring the last 5
to 10 blogs/events"). Reuses the concurrent session's `club-events-plugin`
data (`usePluginData('club-events-plugin')` → `{posts, tagsMeta}`, already
sorted newest-first) and its `EventCard`/`useLoadMore` components — same
data source as their `RecentActivity` (homepage) and `ClubEventsList`
(per-club events pages), not a second parallel blog-data reader. Opens with
every one of the 29 tags (18 clubs + 3 fests + 7 event-types +
`student-voices`) pre-selected, so it's populated immediately; unchecking
tags narrows the feed live. Results capped at 10, revealed 5 at a time via
`useLoadMore`'s existing "Load more" pattern. "Select all tags" / "Clear"
buttons for the two extremes.

**Found while wiring this in (not caused by, and not fixed as part of, this
work — flagging for awareness):** the dev server is currently failing to
hot-reload at all, sitewide, because `blog/2026-07-28-stop-asking-ai-for-
answers/index.md` (not part of this session's own work — appeared during
this session from elsewhere, most likely the concurrent session) references
a local image, `./blind-reliance-vs-active-dialogue.png`, that does not
exist in its post folder — the folder only contains `index.md`, no image.
Docusaurus's MDX loader hard-fails the whole blog compilation on this
(`onBrokenMarkdownImages` defaults to throw), which cascades into "Errors
while compiling. Reload prevented." for the entire site, not just that post.
Did not touch this file — it reads as someone else's in-progress post
missing an asset they haven't added yet, not something to silently delete
or paper over. Needs the real image added (or the reference/post removed)
before the dev server or a production build will run clean again.

Verified (aside from the above, pre-existing, unrelated breakage): navbar
`Blog` → `/student-voices` confirmed via direct href check; page renders the
`LibraryHero`, 29 tag checkboxes, and an initially-populated feed; `Clear`
correctly empties the feed and shows the empty-state message; `Select all
tags` correctly repopulates it.

## 2026-07-28 — Archive-planning doc, clubs-grid sizing, General Fest polish, Clubs nav/sidebar/card icons

Files: `archive planning.md` (new), `src/components/MiniHeroCard.jsx`,
`src/css/custom.css`, `src/components/fests/GeneralFestHero.jsx`,
`docusaurus.config.js`, `docs/clubs/*.mdx` (18, frontmatter only),
`src/data/sidebarIcons.js` (new), `src/theme/DocSidebarItem/Link/*` (new),
`src/theme/DocCard/Heading/Icon/*` (new)

**Archive planning.** Talked through (before writing anything) how the
400+ event archive and yearly club-leadership rollover should actually work,
since the two look similar but need different treatment: events are already
permanently dated once posted (`/blog` + `blog/tags.yml`, unchanged, never
moved — a future Archives page just layers a timeline/search UI over the
existing tags, using the still-unwired `ArchivesHero`), whereas a club's
*current* exec board is living state that gets silently overwritten unless
explicitly snapshotted first. Landed on snapshot-then-overwrite: at rollover,
copy the outgoing board into a permanent `docs/archive/<slug>/<year-range>-
board.mdx` (fests: `-committee.mdx`), then edit the live `docs/clubs/<slug>
.mdx` / `docs/fests/<slug>.mdx` page in place. Archive files live in one
central `docs/archive/` tree grouped by club/fest, not nested inside each
club's own folder. Written up in `archive planning.md`; planning only, not
implemented — content-sourcing the real historical events (mostly on
Instagram, incomplete) is a separate manual effort for later.

**Clubs directory grid read as too zoomed-out.** `MiniHeroCard.jsx` renders
each hero at natural size then scales it down with a plain CSS `transform`;
the scale factor (0.58) and the fixed card box in `custom.css` it was tuned
to (325×112px) both got bumped proportionally to 0.68 / 381×131px. Verified
in a real browser: grid still wraps cleanly, no clipping, hover lift
unaffected.

**General Fest Hero polish.** Another session was mid-edit on this exact
file for the same complaint when this work started (glow blobs, spotlight,
tagline, denser confetti); waited for it to finish, then added a bunting
banner and a radial flash behind the popper on top of that pass. **Real bug
found while verifying live:** the confetti/bunting `<svg>` used
`preserveAspectRatio="xMidYMid slice"`, but the card's actual rendered aspect
ratio (~6:1) is nothing like the 300×200 viewBox (1.5:1) — "slice" was
cropping to a ~50-unit sliver down the vertical center, so the bunting (near
the viewBox top) was invisible and confetti landed *below* that sliver once
settled. The card read as plain not because the effects were missing but
because they were being cropped out entirely; switched to
`preserveAspectRatio="none"` so the full viewBox always maps onto the real
card. Also added, per a follow-up request to use Framer features not already
in play: `variants`/`staggerChildren` orchestrating the bunting and a
title/tagline entrance (previously had *no* entrance at all — text just
appeared while everything else animated in), and a `whileHover` bump on the
popper layered on top of the card's existing hover-replay.

**Clubs navbar link, sidebar icons, card icons.** Three related fixes,
requested and verified one at a time in a real browser each time:
1. Navbar `Clubs` was `type: 'docSidebar'`, which lands on Docusaurus's
   plain auto-generated `/docs/category/clubs` index rather than the actual
   `/clubs` hero-grid page; changed to a direct link.
2. Added `sidebar_custom_props: { icon: <LucideName> }` to all 18 club docs'
   frontmatter and ejected `DocSidebarItem/Link` (`src/theme/`) to render
   the matching lucide icon before each sidebar label — upstream has no
   icon slot at all, it's plain text.
3. The `/docs/category/clubs` page itself (still reachable directly/via
   breadcrumbs even though the navbar no longer points at it) kept showing
   generic file icons after fix 2 — turned out to use a *different*
   component (`DocCard`), which derives its icon purely from a leading
   emoji in the label, not from `sidebar_custom_props`. Ejected
   `DocCard/Heading/Icon` too, same source of truth.
4. Both new icon components color themselves via `useClubAccent(slug)` —
   the same hook every hero already uses, keyed by the doc's own route slug
   — rather than a flat generic color, so a club's sidebar/card icon is
   always that club's real accent. Verified directly: Astronomy Club's
   sidebar icon and card icon are the same indigo as its hero's heading.

Dev-server verification note: hit a stale/leftover server still bound to
port 3000 from an earlier check mid-session — its log showed `[ERROR]
Something is already running on port 3000` while still serving requests, so
a screenshot briefly "passed" against pre-fix code. Caught by checking the
log instead of trusting a green screenshot; killing the port and confirming
a fresh `[SUCCESS] Docusaurus website is running` line before re-verifying
is now the pattern for any check that follows a same-session file edit.

## 2026-07-28 — Events page (real content only), Events on Explore, footer sync, tutorial content relocated

Files: `src/pages/events.js` (new), `src/components/TagFilteredEvents.jsx`,
`src/pages/explore.js`, `docusaurus.config.js`, `docs/intro.mdx` (rewritten),
`tutorial-reference/` (new — `docs/tutorial-basics/`, `docs/tutorial-extras/`,
old `docs/intro.mdx` moved here), `CONTRIBUTING.md`

**Events page was showing everything, not just real content.** The "Events"
nav item pointed straight at Docusaurus's stock `/blog` index, which lists
every non-draft post regardless of tag — including the four leftover
Docusaurus tutorial posts (`docusaurus`, `hello`, `hola`, `facebook` tags,
none of which are real taxonomy). Fixed by building a custom `/events` page
(same pattern as `/student-voices`): `TagFilteredEvents` gained an optional
`tagIds` prop bounding which tags it will ever match a post against (both
which checkboxes render and which posts are eligible) — `/events` passes
every `blog/tags.yml` tag *except* `student-voices` (18 clubs + 3 fests + 7
event-types = 28), so a post only appears there if it carries an actual
club/fest/event-type tag; `/student-voices` continues to pass no restriction
(all 29 tags), unchanged from how it already worked. Verified in a real
browser: `/events` renders exactly 28 tag checkboxes with no "Student Voices"
option; `/student-voices` still shows 29. Navbar/footer "Events" repointed
from `/blog` to `/events`; the raw `/blog` route itself is untouched (still
serves individual post pages, RSS/Atom feeds, and the tag pages other
components link out to — only the nav entry point changed).

**Events surfaced on the Explore page** — a third icon card (lucide
`CalendarDays`) alongside the existing Blog/Archives cards, linking to
`/events`.

**Footer's "Wiki" column "Events" link** updated to match the navbar
(`/blog` → `/events`).

**Leftover Docusaurus tutorial content moved out of `docs/`** into a new
`tutorial-reference/` folder at the project root (`docs/tutorial-basics/`,
`docs/tutorial-extras/`, and `docs/intro.mdx` itself — the "Tutorial Intro"
page, entirely about installing Docusaurus, not this wiki). This was also
the site's "Docs" nav destination (`/docs/intro`), a gap flagged but not
acted on earlier this session (`HANDOFF-3.md` §5: "worth reconsidering
later"). Since `sidebars.js` autogenerates from `docs/`'s folder structure,
moving these out also removes them from the sidebar with no config change.
Wrote a **new** `docs/intro.mdx` at the same route — a real overview linking
to Clubs/Fests/Resources/Explore/Events/Blog — so `/docs/intro` still
resolves and nothing links to a 404.

**Bug found and fixed while verifying:** the new `docs/intro.mdx` first
linked to `/docs/clubs`, `/docs/fests`, `/docs/resources` directly, which
`npm run build` immediately caught as broken links — a category folder's
`generated-index` page (no `index.mdx` of its own inside `docs/clubs/` etc.)
actually serves at `/docs/category/<slug>`, not `/docs/<slug>` (same
distinction another session's changes.md entry already hit for the Clubs
navbar item). Fixed by linking Clubs/Fests to their real hero-grid pages
(`/clubs`, `/fests`) instead, and Resources to `/docs/category/resources`.

**`CONTRIBUTING.md`** updated: directory tree now lists all the new
top-level pages (`events.js`, `student-voices.js`, `explore.js`, etc.),
`TagFilteredEvents.jsx`/`MiniHeroCard.jsx`/`LibraryHero.jsx`/`ArchivesHero.jsx`
in the component list (previous version was missing them and, for
`LibraryHero`, didn't clarify it's a *separate* hero from `ArchivesHero`
despite the shared shelf motif), the new `tutorial-reference/` folder, and a
corrected `static/admin` line — the old tree listed `admin/index.html` as if
Decap CMS were already scaffolded, but it isn't (no `static/admin/` exists
at all yet; section 1 of the same doc already said as much, the directory
tree just hadn't been kept in sync). Also added a short "where a post shows
up depends on its tags" note explaining the Events/Blog tag-filtering split
concretely, so a contributor tagging a real post can predict where it'll
land.

Verified end-to-end: full `npm run build` clean after all of the above
(zero broken links); dev-server browser check confirmed navbar order
(`Explore, Clubs, Fests, Docs, Events, Blog`), `/docs/intro`'s real heading,
`/events`'s 28-tag picker, `/student-voices`'s unchanged 29-tag picker, and
Explore's three icon cards (`Events`, `Blog`, `Archives`).

### Checkpoint status check (requested, not new work)

Reviewed the CP0–CP8 master plan
(`~/.claude/plans/push-to-https-github-com-chargingtrex-co-spicy-star.md`)
against actual repo state:

- **CP0–CP3**: done (git history has explicit CP0/CP1/CP2/CP3 commits,
  `d2c9967` is the last one — everything since is uncommitted).
- **CP4** (homepage mini-heroes + fests): partially superseded, not failed —
  the concurrent session replaced the homepage's fest-hero section with
  `RecentActivity`; the mini-hero grid and fest heroes both still exist and
  are reachable (`/clubs`, `/fests`, `/explore`), just not on the homepage
  itself anymore.
- **CP5** (blog + CMS): blog/co-located-images half is real and working
  (confirmed via `stop-asking-ai-for-answers`'s co-located PNG); **Decap CMS
  is not scaffolded at all** — no `static/admin/` directory exists yet.
  `CONTRIBUTING.md` §1 already said as much, but its directory-tree section
  had drifted and listed `admin/index.html` as if it existed — fixed as
  part of today's `CONTRIBUTING.md` update, above.
- **CP6** (footer easter egg): **not built.** `react-chrome-dino` is
  installed but nothing in `src/theme/Footer/index.js` references it —
  confirmed via direct grep, zero matches for "dino"/"chrome-dino".
- **CP7a** (accent unified-mode toggle UI): **not built** — `setAccentMode`/
  `useAccentMode` are only referenced inside `useClubAccent.js` itself (where
  they're defined), nothing calls them from any UI. Matches what
  `CLAUDE.md`'s own "Remaining infra tasks" section already flags.
- **CP7b** (off-screen `IntersectionObserver` pause, sitewide): **not
  built** — `useIntroMotion.js` only has the fest-specific `playOnVisible`
  opt-in from earlier this session; no generic pause for looping heroes
  exists yet.
- **CP8** (deploy): **not done** — no `gh-pages` branch exists locally, and
  nothing beyond the CP0 initial push has been pushed to `origin` at all.

Net: CP0–CP3 solid, CP4 evolved rather than regressed, CP5 half-done
(content side works, CMS side doesn't exist), CP6/CP7a/CP7b/CP8 all still
open. None of this is new work from this pass — just a status read, since
none of the day's other tasks touched CMS, the easter egg, the accent
toggle, the off-screen pause, or deployment.

## 2026-07-28 — First e2e test suite (57 tests), a real hydration bug found and fixed, Decap CMS scaffolded, CP5 auth-decision doc written

Files: `playwright.config.js` (new), `tests/e2e/*` (new, 8 spec files +
`base.js`/`fixtures.js`/`helpers.js`), `package.json` (new
`test:e2e`/`test:e2e:report`/`pretest:e2e` scripts, `@playwright/test`
devDependency), `TEST_REPORT.md` (new), `.gitignore`,
`src/components/fests/GeneralFestHero.jsx`, `static/admin/index.html` (new),
`static/admin/config.yml` (new), `docs-internal/decap-cms-auth-todo.md`
(new), `CONTRIBUTING.md`

Requested before starting the next checkpoint: a real, checked-in test
suite (not one-off ad hoc scripts) covering the whole site, a report, and
finishing CP5's Decap CMS decision doc — then push.

### Test suite

Built with `@playwright/test` (proper devDependency this time, not the
earlier ad hoc `--no-save` install from the Explore-page verification
pass), running against the actual **production build**
(`docusaurus build` + `docusaurus serve`) rather than the dev server —
dev mode serves a near-empty CSR-only shell in its raw HTML, so testing the
build is closer to what a real visitor gets and is what
`onBrokenLinks: 'throw'` already gates on. `npm run test:e2e` runs the build
first automatically (`pretest:e2e`). 57 tests across 8 files; see
`TEST_REPORT.md` for the full coverage table.

### Two real site bugs found by writing these tests

1. **Hydration mismatch on `/fests` and `/explore`** (React error #418,
   `onRecoverableError`). `GeneralFestHero.jsx`'s confetti (`PIECES`) was
   built with `Math.random()` at module scope, under a comment claiming
   this was "deterministic so SSR and client agree." That's incorrect: the
   module evaluates twice per page load — once during server-side
   prerendering, once again in the browser during hydration — and
   `Math.random()` produces a different sequence *each time it's called*,
   not each time the *page* loads, so the two evaluations never agreed.
   Fixed by replacing it with a seeded PRNG (`mulberry32`, fixed seed
   `20260728`), producing byte-identical output both times. Confirmed via
   the test suite: the React error is gone from both routes across
   repeated runs. **General lesson captured in `CONTRIBUTING.md`'s PR
   checklist**: any non-deterministic value computed during a hero's
   initial render needs a seeded PRNG, not `Math.random()`/`Date.now()`
   directly.
2. **Confirmed correct, not a bug**: `/events` currently shows "No posts
   match the selected tags" no matter which tags are selected, because zero
   posts in the repo carry a real club/fest/event-type tag yet (only
   tutorial-scaffold posts and one `student-voices`-only post exist). A
   test that assumed Select-All would surface visible posts was rewritten
   to check the buttons' actual checkbox mechanics instead — the empty
   state is the correct, already-documented behavior until the archive is
   backfilled.

### Test-infrastructure bugs found and fixed (not site bugs — a debugging trail worth keeping)

The first full run had 51 of 57 tests failing; tracking down why, rather
than assuming the site was broken, surfaced several real testing gotchas:

- **`baseURL` + a leading-slash `page.goto()` silently lands on the wrong
  page.** `baseURL` has its own path segment
  (`http://localhost:3100/collage-wiki-SAIU`, matching Docusaurus's
  `baseUrl`). Per WHATWG URL resolution, `page.goto('/clubs')` treats the
  leading `/` as absolute-from-origin, silently dropping
  `/collage-wiki-SAIU` and requesting `http://localhost:3100/clubs`
  instead — which the static server's fallback served as the *homepage*
  (200 status, zero console errors), so a shallow status-only check
  couldn't tell the difference; a `.mini-hero-card` count assertion could,
  and did (0 instead of 18), which is what actually surfaced this. Fixed by
  dropping the leading slash in every `page.goto()` call and adding a
  trailing slash to `baseURL`; strengthened the navbar-link test to assert
  the resulting URL, not just a 200, closing the exact gap that hid this.
- **A live third-party API call rate-limited itself under test
  parallelism.** The navbar's GitHub badge (`static/js/github-badge.js`)
  fires a real `fetch('https://api.github.com/...')` on every page load;
  running dozens of page loads in parallel tripped GitHub's unauthenticated
  rate limit (403) within the run. Fixed with a `page.route` mock
  (`tests/e2e/base.js`, a custom `test` fixture every spec file imports
  instead of `@playwright/test` directly) — deterministic, and stops the
  suite from hammering a real external service as a side effect of testing.
- **Accessible-name collisions.** `getByRole('link', {name: 'Clubs', exact:
  true})` (etc.) matched 3–4 elements at once (navbar, sidebar, footer,
  body) — fixed by scoping to `article`/`main`/`footer` per test. Also hit
  the reverse case: `getByRole('link', {name: 'GitHub', exact: true})`
  found *zero* matches, because the footer's external-link icon's
  `(opens in new tab)` alt text gets folded into the accessible name
  (`"GitHub (opens in new tab)"`) — fixed with a `/^GitHub/` regex instead
  of an exact string.
- **Clicking a `pointer-events-none` element.** Hero SVGs have
  `pointer-events-none` (the real click handler is on the parent div, per
  `useIntroMotion`'s `hoverProps`) — a real click there passes through to
  the div underneath, but Playwright's actionability check calls that
  "intercepted" and refuses. Fixed with `{force: true}`.
- **Screenshot-diff timing flakiness.** A single before/after pixel-hash
  pair can land on two identical frames purely by chance (both samples
  catching the same brief hold in a keyframe timeline), reporting "no
  motion" for a hero that's genuinely animating — confirmed by watching the
  same unchanged test flip between pass and fail across otherwise-identical
  reruns. Replaced with a multi-sample helper (6 samples over ~700ms,
  passes if *any* pair differs); stable across 3 repeated full runs
  afterward.
- **The theme toggle is a 3-way cycle** (system → light → dark → system),
  not on/off. Starting from "system" (resolves to "light" here), one click
  just locks in "light" explicitly — no visible change — and a second click
  is what actually reaches "dark". Fixed by clicking until
  `data-theme="dark"` is observed (capped at 3 tries).

### Decap CMS: structural scaffold + the CP5 decision doc

`static/admin/index.html` (loads Decap CMS via CDN script) and
`static/admin/config.yml` (real config, not a stub) — one working
collection, **Events** (`blog/`): title, date, a tag `select` (mirrors
`blog/tags.yml` — Decap can't read that file directly, so this list has to
be kept in sync by hand), description, markdown body, with uploads
co-located beside the post (`media_folder: ''`), matching the site's
existing image convention.

**Club and fest pages (`docs/clubs/*`, `docs/fests/*`) are deliberately NOT
exposed as CMS collections** — real constraint discovered while designing
this, not a stylistic choice: those are MDX files with hero-component
imports and a `<ClubContact>` embed, and Decap CMS collections replace a
file's *entire* frontmatter + body with only what's represented in
`fields:`. A non-technical editor saving through a generic body widget
would silently strip those imports and break the page. Safely exposing
club/fest editing needs the prose pulled out into plain frontmatter fields
the JSX reads from — a content-model change, not a CMS-config one — and
hasn't happened. `CONTRIBUTING.md`'s CMS section was corrected accordingly
(it previously claimed club-page editing would be supported).

`docs-internal/decap-cms-auth-todo.md` (new, outside `docs/` — not part of
the Docusaurus build) finishes the CP5 deliverable the build plan called
for: capturing why the GitHub+OAuth-proxy vs. git-gateway+Netlify-Identity
choice is genuinely blocked on a **hosting** decision, not just unmade —
Option A works with the current GitHub Pages plan (needs a small
always-on OAuth-proxy service); Option B fits non-technical editors better
but effectively requires moving hosting to Netlify, which is a bigger
architectural change than picking a CMS backend. Documents what concretely
unblocks each path. The footer's commented-out Decap CMS link stays
commented out — re-enabling it is explicitly listed as a follow-up step in
that doc, once auth actually works, not before.

Verified: `npm run build` clean with the new `static/admin/` files present
in `build/admin/`; full `npm run test:e2e` (57/57) re-run afterward to
confirm the CMS scaffold didn't change anything the suite checks (the "no
Decap CMS link yet" footer test still correctly passes — that link is
still commented out, on purpose).

Committed and pushed (`2ed6f47`, fast-forward onto `origin/main`) — this
entry and everything above it in this file, plus the concurrent
collaborator session's own bundled-in work, landed in that one commit. See
the commit message for the full attribution split.

## 2026-07-28 — CP6: footer dino easter egg, three real bugs found and fixed

Files: `src/theme/Footer/index.js`, `src/css/custom.css`,
`tests/e2e/dino-easter-egg.spec.js` (new), `CONTRIBUTING.md`,
`package.json`/`package-lock.json` (`react-chrome-dino` already installed
from an earlier session; unchanged here)

Built per `saiu-collage-wiki-easter-egg.md` and CLAUDE.md's locked
decisions: a 🦖 button added to the bottom of the already-swizzled
`Footer/index.js` (in-flow, below the existing contact-icon row — not a
floating corner icon, so it's only found by scrolling all the way down),
"charging trex..." tooltip on hover, click opens a full-screen overlay with
`react-chrome-dino`, click anywhere on the overlay background closes it.

**Three real, sequential bugs found and fixed while getting this working
end-to-end** (each one only surfaced by actually driving it in a real
browser — none would have been caught by a build check alone):

1. **Hover tooltip made the button permanently un-clickable.** The tooltip
   and button were flex siblings in a centered row (`justify-content:
   center`); the tooltip's insertion/removal on hover changed the row's
   total content width, nudging the button sideways every time it
   appeared or disappeared. That shift re-triggered `mouseenter`/
   `mouseleave` in a loop, and Playwright's actionability check (correctly)
   refused to click a target that kept moving — "element is not stable,"
   retrying for the full 30s timeout. A real user would have hit the same
   problem as a flicker/dodge instead of a hard failure, but it's the same
   underlying bug. Fixed by absolutely positioning the tooltip (`position:
   absolute; right: 100%`) so it floats without participating in the flex
   layout at all — the standard, correct way to build a tooltip.
2. **The game canvas was invisible — 0 width.** `react-chrome-dino` reads
   its own container's `offsetWidth` once at mount to size its `<canvas>`.
   The overlay wrapper had no explicit width (a flex column with
   `align-items: center`, which shrinks to its content — and there was no
   content yet to shrink to, a chicken-and-egg gap), so that read returned
   `0` and the canvas never got a visible size. Confirmed directly via
   `canvas.getBoundingClientRect()` before/after. Fixed by giving
   `.dino-overlay__game` an explicit `width: 600px` (capped by
   `max-width: calc(100vw - 2rem)` on small viewports).
3. **`filter`-based recoloring flattened the whole canvas to one solid
   block.** The dino sprite is grayscale line art with no color of its
   own — CLAUDE.md's "dino recolors to the unified accent" requirement
   needs *some* way to tint it. First attempt used a CSS `filter`
   (invert/sepia/hue-rotate chain, one hand-tuned recipe per target color);
   confirmed via screenshot this pushes the whole canvas toward one
   uniform saturated color, destroying the black/white contrast that makes
   the dino, ground line, and clouds legible as distinct shapes — it
   rendered as a flat solid-green (or, for the second recipe, solid
   *purple*, not even the intended blue) rectangle, no artwork visible at
   all. Replaced with a `mix-blend-mode: color` overlay instead: a solid
   div in the target color, blended with `color` mode, which recolors hue
   while preserving the backdrop's own luminosity — the dino stays visibly
   distinct as a darker shape against a lighter background, just tinted.
   Confirmed via screenshot in both states (green default, blue when
   `sai-wiki-accent-mode` is `unified`).

**Fourth thing found, not a bug**: the game draws nothing at all — not
even the classic static idle-dino frame — until the first keypress. Real
Chrome's offline page shows an idle dino immediately; this package
(`react-chrome-dino@0.1.3`) apparently doesn't draw anything until
`Runner.instance_.activated` flips true on first input. Confirmed this is
the package's own behavior (traced into its bundled source: `componentDidMount`
injects the original Chromium `Runner` class as a literal `<script>` string
and constructs `new Runner('.interstitial-wrapper')`, which itself gates
drawing on an `activated` flag) rather than anything wrong in this
integration. Left as-is — CLAUDE.md's guidance is to swap packages only if
one throws a *build* error against this stack, which this doesn't; a
player instinctively pressing space/up on a dino game (the muscle memory
this whole easter egg is riffing on) will trigger it immediately.

`tests/e2e/dino-easter-egg.spec.js` (new, 6 tests) covers: in-flow
placement (not `position: fixed`), the tooltip-doesn't-shift-the-button
regression specifically, overlay open/close (including "click the game
itself doesn't close it"), canvas actually has a real size (the bug-2
regression), and the tint color differing between default and unified
mode (bug-3's regression, read via `getComputedStyle` rather than a visual
diff). Full suite: 63/63 passing.

`CONTRIBUTING.md` updated — the `Footer/index.js` entry and the
`TEST_REPORT.md` coverage summary both previously said the dino easter egg
was "planned, not built yet."

## 2026-07-28 — CP8: repo made public, GitHub Pages live via GitHub Actions

Files: `.github/workflows/deploy.yml` (new), `.gitignore`, plus the doc
moves already covered in the previous two dated entries. Followed
`github-pages-hosting-plan.md` (Parts A–E) — a plan written up in an
earlier session specifically so this could be picked up without
re-deriving anything.

**Part A — private backup.** Created `ChargingTrex/collage-wiki-SAIU-archive`
(private) and mirror-pushed the source repo's full history into it
(`git clone --mirror` + `git push --mirror`) *before* any cleanup or
visibility changes. Verified identical: all 6 commit SHAs matched exactly
between source and archive, and root file counts matched (45/45).

**Part B — cleanup**, done as originally scoped in the plan: deleted two
files with zero project value (a broken-filename duplicate of
`sai-uni-wiki-motion-guide.md`, and a generic AI-prompting template
unrelated to the project); archived superseded session snapshots and
acted-on content drafts (`HANDOFF-1/2/3.md`, the numbered
`animation-caveats (1)/(2).md` drafts, `club homepage.md`,
`homepage-content.md`, the theme-toggle decision doc) into
`docs-internal/archive/`; renamed `animation-caveats (3).md` →
`docs-internal/animation-caveats.md` (`CLAUDE.md`/`BUILD-BRIEF`/`PROMPT.md`
already referred to the unnumbered name as if it were real — this makes
more existing references correct than it breaks); updated the actual
path-dependent references (`README.md`'s link, `CONTRIBUTING.md`,
`changes.md`, `FashionHero.jsx`'s code comment). Verified: `npm run build`
clean, full e2e suite (63/63), `git grep` clean for every moved/renamed
filename.

**Follow-up during Part B, after discussion**: initially left
`docs-internal/archive/` as *tracked* files (matching the plan's original
wording — "keep for history, just out of root clutter"), then reconsidered
per a direct ask not to have them visible in the public repo at all. Since
removing files from the current commit doesn't erase them from git
history (anyone can still browse an old commit once the repo is public),
this raised a real fork: squash/reset history entirely, surgically strip
just these files from every past commit (`git filter-repo`), or leave
history as-is since none of this is actually secret. Explicitly decided:
**leave history as-is** — these are planning docs, not secrets, and a
history rewrite (force-push, SHA changes) was judged not worth it for
that. Untracked `docs-internal/archive/` going forward instead
(`git rm -r --cached`, added `/docs-internal/archive/` to `.gitignore`) —
files stay on local disk, just stop appearing in *future* commits.
`docs-internal/animation-caveats.md` and `docs-internal/decap-cms-auth-todo.md`
stay tracked; they're actively cited from `CLAUDE.md`/`CONTRIBUTING.md` and
a fresh clone needs them. (Real gap caught in review: the `.gitignore` edit
was made but not staged in the commit that did the `git rm --cached` —
caught before the next push, folded into the following commit instead of
left silently uncommitted.)

**Correction, caught by the requester after the fact**: the two "delete"
items in Part B above (`prompt library.md`, the motion-guide duplicate)
were removed with plain `git rm`, which deletes from the local working
directory too, not just from git tracking. The requester never asked for
anything actually deleted from disk — only for unwanted files to stop
being tracked/published, exactly the `git rm --cached` + `.gitignore`
treatment already used for `docs-internal/archive/` just above. Restored
both files to disk from git history (`git show
350ad5e^:<path> > <path>`) and added them to `.gitignore` instead. The
commit that originally deleted them (`350ad5e`) is left as-is per the
"leave history as-is" decision already made above — only the current
working tree and going-forward tracking changed. Lesson for next time:
`git rm --cached`, never plain `git rm`, when the goal is "stop tracking,"
not "delete."

**Part C — made public.** Confirmed via `gh repo view`
(`isPrivate: false`) after the change.

**Part D — GitHub Actions deploy.** `.github/workflows/deploy.yml`: the
modern `actions/upload-pages-artifact` + `actions/deploy-pages` method
(not the classic `docusaurus deploy`-to-`gh-pages`-branch approach still
sitting in `package.json`'s `deploy` script) — needs no stored git
credentials, no branch, auto-adds `.nojekyll`. Triggers on push to `main`
plus manual `workflow_dispatch`; build job matches `package.json`'s
`engines.node` (20); `concurrency: {group: "pages", cancel-in-progress:
false}` avoids overlapping deploys racing. Repo's Pages source set to
"GitHub Actions" via `gh api -X POST repos/.../pages -f
build_type=workflow`, confirmed the returned `html_url` matches
`docusaurus.config.js`'s configured `url`/`baseUrl` exactly.

**Part E — first deploy, verified.** Pushed, watched the Action run
end-to-end (`gh run watch`) — build (46s) and deploy (10s) both green.
Live-site checks: `/`, `/blog`, `/clubs`, `/fests`, `/explore`, `/events`,
`/student-voices` all `200`; a direct deep link
(`/docs/clubs/art-club/events`) resolves correctly on a hard load (not
just client-side nav — confirms GitHub Pages' static routing actually
works, not only Docusaurus's own SPA router); an unknown path correctly
serves the generated 404 page (`Page Not Found` title). Real-browser pass
(not just status codes) confirmed the homepage's Recent Activity section
renders and zero unexpected console/page errors. Bonus
confirmation the visibility flip took effect: the navbar GitHub badge,
previously stuck on `—`/`—` placeholders because the private repo 404'd
unauthenticated API requests, now shows real star/fork counts (`0`/`0` —
correct for a brand-new public repo).

Live at `https://chargingtrex.github.io/collage-wiki-SAIU/`.

Not yet done, flagged by the plan itself as a natural follow-up rather
than in-scope here: standing up the Decap CMS OAuth-proxy — going public
on GitHub Pages resolves the "which hosting?" question in
`docs-internal/decap-cms-auth-todo.md` in favor of Option A (GitHub
backend + OAuth-proxy), but the proxy service itself is separate work.

## 2026-07-28 — Fests/Resources category cards get icons

Files: `src/data/sidebarIcons.js`, `docs/fests/tech-fest.mdx`,
`docs/fests/general-fest.mdx`, `docs/fests/cultural-fest.mdx`,
`docs/resources/archives.mdx`

Requested after seeing the live site: `/docs/category/fests` and
`/docs/category/resources` showed plain generic-file icons on every card,
unlike `/docs/category/clubs` (each club already had one, via
`sidebar_custom_props.icon` on its own frontmatter → the ejected
`DocSidebarItem/Link`/`DocCard/Heading/Icon` components from the earlier
"Clubs nav/sidebar/card icons" work). Fests and the Archives page are
flat `.mdx` files rather than folders, but the exact same mechanism
applies — `sidebar_custom_props.icon` reads identically whether the doc is
a plain file or a category, since `DocCard/Heading/Icon` just reads
`item.customProps.icon` regardless of item type.

Added `sidebar_custom_props: {icon: ...}` to all 4 docs, picking icons that
already match each hero's own visual identity rather than choosing
arbitrarily: `PartyPopper` for the Annual College Fest (the literal lucide
icon `GeneralFestHero.jsx` already animates), `Music` for MoSAIc (the first/
primary icon in `CulturalFestHero`'s cycling ring — Music, Users, Mic2,
Gamepad2, Crown, Dices), `Rocket` for Innovision (no existing icon in
`TechFestHero` to match, chosen fresh for the hackathon/build-something-
real energy), `Archive` for Event Archives (matching the icon already used
for its card on the `/explore` page). Added the three new icons to
`SIDEBAR_ICONS` in `sidebarIcons.js` (`Music` was already there for Music
Club). None of these are club slugs, so `useClubAccent` falls back to the
unified/site accent color for all four — expected, matches how the
lookup's own fallback is documented to behave for non-club docs.

Bonus, free from the same mechanism: these four now also show icons in the
left sidebar, not just their category-index cards — `sidebar_custom_props`
drives both, same as clubs.

Verified: `npm run build` clean, full e2e suite (63/63), and a real-browser
screenshot of both category pages confirming all icons render with zero
console errors.

## 2026-07-28 — ImageCarousel component + "adding photos" tutorial

Files: `src/components/ImageCarousel.jsx` (new), `src/css/custom.css`,
`CONTRIBUTING.md`

Requested: a way to add multiple photos to a blog/event post using Framer
Motion, plus a tutorial. No carousel/gallery component existed in the
codebase before this (checked first — nothing under `src/components/`
matched; a code comment in `CulturalFestHero.jsx` mentioning "slideshow"
was prose explaining why that hero *avoids* one, not a reusable
component).

**`ImageCarousel.jsx`** (new): prev/next buttons, dot navigation, and a
Framer Motion slide transition (`AnimatePresence` + `motion.figure`,
`x`/`opacity`) between images. Respects `prefers-reduced-motion` the same
way every hero in this project does — a click still advances the slide
(deliberate user action, not ambient motion), it just snaps instead of
animating (`transition: {duration: 0}`). Props: `images` (array of
`{src, alt, caption?}`), optional `className`.

**Real technical gotcha caught while verifying this, before it shipped
wrong**: images passed to a custom component **must** be `import`ed as ES
modules, not passed as bare relative-path strings. Docusaurus's Markdown
processor only rewrites/resolves paths inside actual `![]()`/`<img>`
syntax nodes — a string literal like `images={['./photo.jpg']}` is just a
plain JS value to the bundler and never gets resolved, giving a 404 at
runtime. Confirmed this failure mode directly: a first test pass used
`.svg` test fixtures and got `img src: null` with three 404s in the
console; switching to real `.jpg`/`.png` test images (matching what actual
event photos will be) and using proper `import photo from './photo.jpg'`
statements fixed it completely — confirmed via Playwright (correct
`data:image/png;...` src, working next/prev/dot navigation with correct
wraparound, zero console errors) and a screenshot. The `.svg`-first attempt
wasn't a red herring to note and move past — it's the exact mistake a
future contributor would make copying old habits from a plain-Markdown
image, so the tutorial leads with this as the one thing to get right.

**`CONTRIBUTING.md`**: new "Adding photos to an event post" section (right
after the existing tags guidance, before "Adding or editing a club page")
covering both cases — single photo via plain Markdown image syntax
(already documented, unchanged), multiple photos via `ImageCarousel` with
a full worked example (import statements, the component call, `alt`
required/`caption` optional). Notes this works in plain `.md` posts, not
just `.mdx` — Docusaurus's blog plugin MDX-processes both by default.
Added `ImageCarousel.jsx` to the "Where things live" component list and a
PR-checklist line about the import-not-string-path requirement.

Verified: built and served a temporary local test post (co-located real
`.jpg`/`.png` images, not committed — deleted after verification) to
confirm the whole documented pattern actually works end-to-end before
writing it up, not just that the component compiles. Full e2e suite
re-run afterward (63/63) to confirm nothing else regressed. No dedicated
Playwright test added for `ImageCarousel` itself — doing so would mean
committing permanent fixture images purely for testing a fairly simple,
self-contained component with no complex integration surface; judged not
worth the repo clutter given the thorough manual verification already
done. Noting the tradeoff here rather than silently skipping it.
