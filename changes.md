# Changes

## 2026-08-21 — Homepage header redesign: display type, real gradient, 21-club foundation line

Files: `src/pages/index.js`, `src/pages/index.module.css`, `src/components/HomepageClubMarks.jsx` (new)

Requested: the homepage's first screen was a flat Infima `hero--primary`
block — solid color fill, default type, no motion, no motif — while every
other page on the site carries the Scholar system's own strongest moves.
Via `/impeccable bolder`: raise the section to what the rest of the system
already does, using only tokens/patterns it already owns, not new ones.

- **Title** now actually uses the Display role (Playfair Display, 700) —
  DESIGN.md reserves that role for "hero and cover-page titles only," and
  the one title built for it wasn't using it. Fluid `clamp(2.25rem, 1.2rem
  + 4vw, 3rem)` matches DESIGN.md's own documented mobile value exactly
  (first attempt used `2rem`, a close-but-different number the mechanical
  detector flagged — fixed to the value already specified in prose).
- **Background** is the existing `--ds-primary-600`→`-900` ramp as a
  gradient instead of one flat step; no new color introduced. Those steps
  hold their light-mode hex in dark theme too (only `-500` gets brightened,
  for on-dark text/links), so it reads consistently in both themes without
  a separate override.
- **Stat row** now uses the Label role (mono, uppercase, tracked) already
  used sitewide for this category of content (card sub-labels, tags).
  Dropped "400+ events archived" per review — also a real correction, not
  just trim: `PRODUCT.md`/`CLAUDE.md` already call that count aspirational
  and not yet imported into `/blog`, so the claim was false. Now "21 clubs
  · Chennai".
- **`HomepageClubMarks.jsx`** — the section's one authored element: a
  foundation line of 21 marks, one per real club, in that club's real
  accent color from `clubAccents.js` (the same data every hero reads),
  honoring the sitewide unified-accent toggle. Not decoration — each mark
  carries a native tooltip naming its real club, and the whole thing is the
  wiki's actual subject (21 distinct clubs, one shared record) rendered
  literally. First version dropped the marks in with a staggered
  Framer Motion entrance (reusing `primitives/Book.jsx`'s exact
  mild-overshoot ease); cut after review found the static marks already
  read as a considered minimal hero and the drop-in didn't earn its place
  — final version is plain positioned CSS circles, no Framer Motion
  dependency for this piece.

**Two real bugs found and fixed while building, not just decided against:**
1. First implementation rendered the marks as SVG `<circle>`s in a
   `preserveAspectRatio="none"` viewBox stretched to fill the full-bleed
   header. Since the header's rendered aspect ratio doesn't match the
   viewBox's, X and Y ended up scaled by different factors — circles
   rendered as tall ellipses. Fixed by switching to fixed-pixel CSS
   `border-radius: 9999px` divs, which stay circular regardless of the
   container's aspect ratio, instead of fighting SVG scaling.
2. The reduced-motion branch (before the entrance was cut entirely) set
   `initial`/`animate` to structurally-equal-but-distinct objects
   `{y:0, opacity:0.9}` in both the playing and not-playing cases, but
   `initial` still differed from `animate` in the not-playing case too —
   Framer still animates between distinct `initial`/`animate` values
   regardless of transition duration, so `prefers-reduced-motion` users
   would have still seen a fast drop instead of the required no-animation
   rest state. Caught before it shipped, fixed to match every other hero's
   pattern (`initial` already equals the rest state when not playing).

Verified via real headless-Chromium screenshots (desktop + mobile,
Playwright, no new tooling) at each stage, not just reasoning about the
CSS; zero console/page errors. Ran the Impeccable mechanical detector
(`detect.mjs`) after finishing — one real finding fixed (the `2rem` clamp
value above), one pre-existing/out-of-scope finding left alone
(`index.module.css`'s `.aboutLine` at `1.15rem`, off the DESIGN.md type
ramp but unrelated to this task).

## 2026-08-15 — Update FOSS Club and Fashion Club teams

Files: `src/data/teams/fashion-club.mjs`, `src/data/teams/foss-club.mjs`, `src/components/clubAccents.js`, `src/data/clubContacts.js`, `src/data/fossMembers.ts` (new), `src/components/MembersGrid/index.tsx` (new), `src/components/MemberCard/index.tsx` (new), `src/css/custom.css`, `docs/clubs/foss-club/index.mdx`

Requested: Update the Fashion Club and FOSS Club team information. For the FOSS Club, use the exact rendering code from the `y-bow.github.io/saiufosswiki` repository.

Covers: 
- Updated Fashion Club team data, club contacts, and accent colors.
- Pulled FOSS Club members data into `fossMembers.ts`.
- Brought over `MembersGrid` and `MemberCard` custom components to render FOSS club team with GitHub and FOSS United profile links.
- Included the associated custom CSS in `custom.css`.
- Updated the FOSS Club docs page to use the newly imported `MembersGrid` component instead of the default `TeamSection`.

## 2026-07-29 — Add FEATURES.md

Files: `FEATURES.md` (new)

Requested: a features document listing everything the wiki does. Surveyed
the actual codebase (`src/components/`, `src/theme/`, `src/pages/`,
`docs/`, `static/admin/`, `tests/e2e/`, the license files) rather than
working from memory, to keep it accurate — confirmed things like whether
the accent unified-mode toggle UI and the off-screen `IntersectionObserver`
pause actually exist before writing about them (the pause does; the toggle
UI doesn't yet).

Covers: the 23 hero animations and their two shared systems (playback,
accent color), club/fest pages, homepage/directory, events/blog/archive
+ the leadership rollover system, the three photo carousels + autoplay,
Decap CMS + the Resources tutorials, the footer dino easter egg, the
design system/accessibility conventions, the 4-file license split, and
the Playwright/deployment setup — plus an honest "Known gaps" section
(unified-mode toggle UI, CMS auth) instead of only listing what's done.

## 2026-07-29 — Basic SEO: robots.txt, structured data, Google Search Console verification

Files: `static/robots.txt` (new), `static/google07e076faf972a09c.html` (new),
`docusaurus.config.js`, `src/pages/index.js`

Requested: make the site show up for searches like "sai university wiki",
"sai university clubs", and "sai university student life"/"events". Ranking
for "Sai University" alone isn't realistic (that belongs to the university's
own domain), but these more specific phrases are — nothing was competing for
them, and the site's actual content is a direct match.

- Added `static/robots.txt`, explicitly allowing crawling and pointing at
  the sitemap (Docusaurus's classic preset already auto-generates
  `sitemap.xml`; it just wasn't linked from anywhere crawlers check first).
- Renamed the site `title` from "Sai University Club & Event Wiki" to
  "Sai University Wiki" — this suffixes every page's `<title>` tag, so it
  now matches the "sai university wiki" query on every single page, not
  just the homepage.
- Rewrote the homepage's tagline, hero subtitle, about-section copy, and
  meta description to naturally include "student clubs," "events," and
  "student life" alongside "Sai University," instead of a single generic
  sentence that only really hit "clubs."
- Added JSON-LD structured data (`WebSite` schema, `about` an
  `EducationalOrganization` named "Sai University") to the homepage via
  `@docusaurus/Head`, with `alternateName`s covering the target phrases —
  the clearest direct signal to Google about what this site is and which
  real institution it documents. Does not claim to *be* Sai University's
  official site, only names the real institution it's about.
- Added the Google Search Console verification file
  (`google07e076faf972a09c.html`, HTML-file method) to `static/` so it
  serves at the site root and Search Console can confirm ownership.

Verified via `npm run build`: title tag, meta description, and JSON-LD all
render correctly in `build/index.html`; verification file lands at
`build/google07e076faf972a09c.html`; `sitemap.xml` confirmed present and
complete.

## 2026-07-29 — Fix GitHub license-name detection for the content license too

Files: `LICENSE-CREATIVE-COMMONS.md` (renamed from `LICENSE-CONTENT.md`),
`CONTENT-LICENSE-NOTE.md` (new), `README.md`, `docusaurus.config.js`

GitHub's "Licenses found" popover was showing two entries: `GPL-3.0` (from
`LICENSE`, correctly detected) and a second, generic `License` pointing at
`LICENSE-CONTENT.md` — not specifically named as CC BY-NC-SA-4.0. Same root
cause as the earlier GPL-3.0 detection fix: the file had our own scope-note
and attribution text (`Content: ...` / `Licensor: ChargingTrex`) sitting
*before* the actual CC legal text, dropping the fuzzy-match confidence
below whatever threshold gives a specific SPDX name instead of a generic
"License" label.

Applied the identical fix used for `LICENSE`/`COMMONS-CLAUSE.md`: renamed
the file to `LICENSE-CREATIVE-COMMONS.md` and trimmed it to *only* the
official CC BY-NC-SA 4.0 legal text (re-verified byte-identical against a
fresh fetch of `creativecommons.org/licenses/by-nc-sa/4.0/legalcode.txt`
before and after the edit). The scope note and `Content:`/`Licensor:`
attribution moved into a new `CONTENT-LICENSE-NOTE.md`, mirroring
`COMMONS-CLAUSE.md`'s role for the code side. Updated the two places that
linked the old filename (`README.md`'s License section, the footer's
"Content License" link and copyright-bar text in `docusaurus.config.js`)
to point at the new one. Also clarified in passing that "Commons Clause"
(commonsclause.com, the code-license restriction) and "Creative Commons"
(creativecommons.org, the content license) are unrelated organizations
that only happen to share a word — a mix-up worth heading off given how
similar the file names now look side by side.

## 2026-07-29 — Compact footer credit line, FOSS Club footer contact, horizontal footer links

Files: `docusaurus.config.js`, `src/theme/Footer/index.js`, `src/css/custom.css`

**Footer copyright line replaced with a compact credit line**, styled after
the sibling FOSS Club wiki (github.com/y-bow/saiufosswiki, which renders
`SaiU FOSS Club · Content CC BY-SA 4.0 · MIT Licensed`). Adapted with this
project's actual facts, not copied verbatim — the reference's licenses
don't apply here (this project is CC BY-NC-SA content / GPL-3.0 code, not
CC BY-SA / MIT):

```
Sai University Wiki · Content CC BY-NC-SA 4.0 · Code GPL-3.0 Licensed
```

`copyright` is rendered as raw HTML by Docusaurus, so "CC BY-NC-SA 4.0" and
"GPL-3.0" are live links to `LICENSE-CONTENT.md`/`LICENSE` — same targets as
the existing "Code License"/"Content License" links in the footer's "More"
column, just surfaced in the one line every visitor actually reads instead
of only in a link list.

**Added a "Maintained by SaiU FOSS Club" credit** below the existing footer
icon bar, with FOSS Club's own email/LinkedIn/Instagram — same reference
site's pattern, reusing FOSS's real contact info (`src/data/clubContacts.js
['foss-club']`, the one club with real, verified data on file) rather than
duplicating it, so updating that one entry keeps this credit in sync too.

**Footer link columns ("Wiki"/"More") now wrap horizontally instead of
stacking one link per line.** With 8 links in "Wiki" and 5 in "More", the
vertical list was making the footer noticeably tall for how little content
it held. `.footer__items` switched from Infima's default block list to
`display: flex; flex-wrap: wrap`, so each column now wraps into 2-3 lines
instead of 5-8. Pure CSS change — hot-reloaded without a dev-server restart,
unlike the `docusaurus.config.js` edits above (config changes never
hot-reload; those needed a manual restart to verify live each time).

Verified all three end-to-end via Playwright screenshots against the
running dev server, plus a full `npm run build` for the config changes.

## 2026-07-29 — Name ChargingTrex as copyright holder in LICENSE

Files: `LICENSE`

Requested: make sure ChargingTrex's name appears in the GPL-3.0 license
too, matching `COMMONS-CLAUSE.md` and `LICENSE-CONTENT.md`, both of which
already name `Licensor: ChargingTrex`. `LICENSE` itself is kept as pure,
unmodified GPL-3.0 text so GitHub's license detector reads it correctly
(see the entry below) — adding a new line would diverge from that.

Filled in the two `<year>`/`<name of author>` placeholders already present
in the license's own "How to Apply These Terms to Your New Programs"
appendix instead — that's GPL-3.0's designated spot for a work's copyright
notice, so this stays a fill-in of existing template text rather than an
addition, and the rest of the file is still byte-identical to the official
GPL-3.0 text.

## 2026-07-29 — GitHub license-name detection fixed; missing archive-card icon fixed

Files: `LICENSE`, `COMMONS-CLAUSE.md` (new), `README.md`,
`docusaurus.config.js`, `docs/archive/cultural-fest/2026-committee.mdx`,
`scripts/rollover.mjs`

**GitHub showed no license name (`"Other"` / `NOASSERTION`) on the repo
page.** Root cause, confirmed via `gh api repos/ChargingTrex/collage-wiki-SAIU`:
`LICENSE` combined the Commons Clause restriction text directly in front of
the full GPL-3.0 body in one file. GitHub's `licensee` detector fuzzy-matches
a repo's `LICENSE` file against known SPDX templates; the prepended Commons
Clause text pushed the match below its confidence threshold, so it couldn't
recognize the GPL-3.0 body underneath and fell back to "Other." This isn't a
config bug — a combined "GPL-3.0 + Commons Clause" text genuinely isn't a
single recognized SPDX license — but it's fixable by *where* the text lives,
not what it says. Split into two files: `LICENSE` is now the pure,
byte-for-byte unmodified GPL-3.0 text (so `licensee` reads it cleanly),
and the Commons Clause condition moved to a new `COMMONS-CLAUSE.md`,
cross-referenced from both `LICENSE`'s neighbor `README.md` and from itself.
Same legal terms overall, just no longer sharing one file that defeats
automatic detection. Updated `README.md`'s License section and the footer's
"Code License" link (`docusaurus.config.js`) to reference both files
separately instead of one combined label. Verified: `npm run build` still
clean after the footer link split.

**A doc card inside the "MoSAIc Archive" page showed a generic default file
icon instead of something meaningful.** `docs/archive/cultural-fest/
2026-committee.mdx` had no `sidebar_custom_props.icon` set, unlike every
club/fest doc elsewhere on the site. Added `icon: UserRound` (already
available in `sidebarIcons.js`, semantically fits "a team roster snapshot").
This is a recurring pattern (`scripts/rollover.mjs` generates one such
snapshot doc per year per club/fest), so the same fix went into the
script's snapshot-content template too — otherwise every future rollover
would regenerate the same missing-icon gap. Verified live via the running
dev server: icon now renders both in the sidebar and on the card.

## 2026-07-28 — Resources: alphabetical card order + navbar/footer link

Files: `docs/resources/*.mdx`, `docusaurus.config.js`, `CONTRIBUTING.md`,
`README.md`

All four `docs/resources/` pages (`adding-photos`, `archives`,
`feature-images`, `team-photos`) already lived in the right place with
`sidebar_custom_props.icon` set — happened to sort alphabetically already
since none had an explicit `sidebar_position`. Made that intentional: added
`sidebar_position: 1–4` in alphabetical order, so the category's card grid
stays alphabetical even if a doc gets renamed later, instead of relying on
filename ordering as an accident.

**Added a "Resources" link to the navbar and footer** — there wasn't one
before; reaching these guides meant going through Docs → sidebar. First
attempt pointed both links at `/docs/resources`, which doesn't exist — the
category's `generated-index` page actually resolves to
`/docs/category/resources` (caught immediately by `onBrokenLinks: 'throw'`
during `npm run build`, across every page since navbar/footer are sitewide).
Fixed both to the real path, verified icons/order and the rendered `href`s
directly in the built HTML before treating this as done.

**Added an "Archive" link to the navbar and footer too**, pointing at the
existing `docs/resources/archives.mdx` (Event Archives / `ArchivesHero`)
page at `/docs/resources/archives` — same discoverability gap, now fixed
alongside Resources rather than as a separate pass.

## 2026-07-28 — EventCard: image beside title, size variant for homepage

Files: `src/components/EventCard.jsx`, `src/components/RecentActivity.jsx`

Reported bug turned out not to be one: asked to check "every club's contact
shows FOSS Club's info." Checked `src/data/clubContacts.js`, every club's
`docs/clubs/<slug>/index.mdx` invocation, and `ClubContact.jsx` itself —
all correctly scoped per club. Verified live against the actual running dev
server (Playwright against `localhost:3000`, not just static source
reading): `art-club`/`astronomy-club`/`oratory-club` each show their own
`<slug>@example.com` placeholder; only `foss-club` shows its real contact
info, which is correct — that's the one club with real data on file. Most
likely explanation is a stale view from before the concurrent session's
contact/team refactor (`ClubContact`/`TeamSection`/`contactIcons.jsx`/
`src/data/teams/*.mjs`) landed. No code changed for this — flagged back to
the requester to confirm which page/field they were actually seeing it on.

**`EventCard.jsx` layout changed from image-above-title to image-beside-
title**, per explicit request: image is now a fixed-size thumbnail to the
left (`h-20 w-20`, `sm:h-24 sm:w-24`), text content (date/title/description)
in a flex column to its right, instead of a full-width image stacked above
a padded text block. `overflow-hidden` dropped from the card wrapper since
the image no longer sits flush against the card edges.

**Added a `size` prop** (`"sm"` default, `"lg"`) so the homepage's
`RecentActivity` can render bigger cards (bigger thumbnail, more padding,
larger title/date/description text) without affecting `ClubEventsList`'s
compact default — a club's Events page can list many more of these at once,
so it keeps the smaller size. `RecentActivity.jsx` passes `size="lg"` and
widened its column (`col--8/offset-2` → `col--10/offset-1`) and card gap
(`gap-3` → `gap-5`) to give the larger cards room. Verified both changes
live via Playwright screenshot against the running dev server.

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

## 2026-07-28 — ImageCarousel gains drag-to-swipe; a missed source doc

After the entry above shipped, the requester pointed out `src/
components/fests/CulturalFestHero.jsx`'s "not a slideshow" comment isn't
the only carousel-related thing in this repo — `sai-uni-wiki-motion-guide.md`
(one of `CLAUDE.md`'s own listed source-of-truth docs) has a full §5,
"Event Gallery Carousels (3D Coverflow & Autoplay)," proposing a
`CoverflowCarousel`: multiple images visible at once, tilted/scaled/faded
by distance from center (`rotateY`, `scale`, spring physics), autoplaying
every 3.5s with a play/pause toggle. This should have been checked before
building `ImageCarousel` from scratch — it wasn't; only `src/components/`
itself was searched for an existing *built* component, not the planning
docs for an existing *spec*.

Surfaced the gap and the tradeoffs directly (3D coverflow + autoplay vs.
the simpler version already shipped vs. a coverflow-look/no-autoplay
hybrid) rather than silently picking one. Requester's actual answer:
"uses framer motion pre built componesnts where ever possibel" — i.e. lean
on Framer Motion's own built-in capabilities rather than hand-rolling
things it already solves. Framer Motion doesn't ship a prebuilt `Carousel`
component (it's a primitives library, not a UI kit), but it does have a
first-class **drag gesture system** (`drag`, `dragConstraints`,
`dragElastic`, `onDragEnd` with velocity/offset) that's exactly the
pattern Framer Motion's own docs use for swipeable carousels — that's
what was missing from the first version (click/dot navigation only, no
gesture support at all).

**Added drag-to-swipe** to `ImageCarousel.jsx`: `drag="x"` on the sliding
`motion.figure`, `dragConstraints={{left:0, right:0}}` +
`dragElastic={0.2}` for a rubber-band snap-back feel, `onDragEnd` checking
both `info.offset.x` and `info.velocity.x` against thresholds (50px /
500px per second) so a real swipe advances the slide but a small
accidental drag snaps back without navigating. `draggable={false}` on the
`<img>` itself to stop the browser's native "drag image to save/open in
new tab" affordance from competing with Framer's pointer-based drag.
`cursor: grab`/`grabbing` added for visual affordance.

Verified directly with simulated `page.mouse` drag sequences (not just
button clicks): swipe-left advances, swipe-right goes back, and — the
actual regression case worth checking — a small drag *below* the
threshold correctly does nothing rather than falsely triggering
navigation. Also re-confirmed button/dot navigation still works
unchanged (one test-script bug of my own along the way: forgot a wait
after a click before reading the resulting caption, which looked like a
navigation regression until the same check with a wait proved otherwise —
not a real bug, just an impatient test). Full e2e suite re-run (63/63).

Decided **not** to adopt the motion guide's full 3D-coverflow-with-autoplay
version: `CLAUDE.md` marks that whole doc as "largely superseded by the
Framer rebuild, kept for rebuild rationale," not a locked spec the way the
design-system doc is, and autoplaying carousels are a known accessibility/
UX concern (moving content the reader didn't ask to move) even with a
pause control. The drag addition is the part of that spec that's both
genuinely "a Framer Motion built-in" and uncontroversial to add; the 3D
coverflow visual and autoplay remain a deliberate, disclosed choice not
to build, not an oversight.

## 2026-07-28 — Feature-image card thumbnails, `@docusaurus/plugin-ideal-image`

Files: `docusaurus.config.js`, `package.json`/`package-lock.json` (new
`@docusaurus/plugin-ideal-image` dependency, pinned to `3.10.2` to match
`@docusaurus/core`), `static/admin/config.yml`,
`src/plugins/club-events-plugin.js`, `src/components/EventCard.jsx`,
`docs/resources/feature-images.mdx` (new),
`blog/2026-07-28-stop-asking-ai-for-answers/index.md`

Requested: a thumbnail image on the homepage's Recent Activity cards.
Audited first and confirmed **zero** image support existed anywhere in this
path: `EventCard.jsx` rendered only date/title/description,
`club-events-plugin.js`'s `loadContent()` never read `frontMatter.image`
at all, and `static/admin/config.yml`'s Events collection had no image
field for it either. Separately confirmed in-body post images (plain
markdown `![]()`) already worked fine and needed nothing — this is
specifically about the *card* thumbnail, a different thing from an
in-body photo or the `ImageCarousel`/`CoverflowCarousel`/`StackCarousel`
gallery components above.

**Installed `@docusaurus/plugin-ideal-image`**, registered in
`docusaurus.config.js`. This transparently upgrades every existing
in-body markdown image to responsive/lazy-loaded/blur-placeholder
versions with zero content changes — confirmed via a production build:
the existing body image in `stop-asking-ai-for-answers` now compiles
through the plugin's `responsive-loader`/`sharp` chain into a hashed
`/assets/images/...` asset, same post, no markdown edit.

**Card thumbnails needed a different path than body images, and this took
reading the plugin's own source to get right.** `club-events-plugin.js`
reads blog frontmatter directly off disk (`parseMarkdownFile`) rather than
through Docusaurus's own blog-plugin asset pipeline, so a relative
`image: ./cover.jpg` frontmatter value has no webpack-resolved URL the way
an in-body `![]()` does — forwarding it as-is would have been a broken
relative path on every page except the post's own. Fixed by having
`loadContent()` copy any co-located `image:` file into
`static/img/_event-thumbnails/<post-folder>/` and return the resulting
base-URL-prefixed path (`http(s)://` and already-absolute `/...` paths
pass through untouched, no copy needed). `EventCard.jsx` renders it via
`@theme/IdealImage`'s `<Image>` component — read its actual source first
rather than assuming the API: passing a plain string (not a webpack-
`require()`d module) hits a documented fallback branch that renders a
plain `<img>`, so this degrades safely without the responsive/blur
treatment (that part only applies to statically-imported images, which a
runtime frontmatter path can never be).

**`static/admin/config.yml`** gained an optional `Feature Image` field
(Decap `image` widget) on the Events collection, alongside the existing
title/date/tags/description/body fields — still can't actually be *saved*
through `/admin` until the CMS auth-proxy work happens, same limitation as
every other field on that form right now.

**New tutorial doc**, `docs/resources/feature-images.mdx` — club-lead-
facing: the CMS steps, the hand-edit-frontmatter fallback, and an explicit
"this is different from an in-body image" section so the two don't get
confused with each other or with the carousel components.

**Tested on real content**: added
`image: ./blind-reliance-vs-active-dialogue.png` to the one genuine
authored post (`stop-asking-ai-for-answers`) as a live, real example
rather than a throwaway test post. `npm run build` confirmed: the file
copies to both `static/` and `build/img/_event-thumbnails/...`, the
homepage's rendered HTML contains the correct
`<img src="/collage-wiki-SAIU/img/_event-thumbnails/.../blind-reliance-vs-active-dialogue.png">`,
and the existing in-body image on the same post now resolves through the
ideal-image asset pipeline too. **Not yet re-run against the Playwright
suite** — `npm run test:e2e` should be run before this is considered fully
verified, since `TEST_REPORT.md`'s existing coverage predates card
thumbnails entirely.

**Update, same day: tutorial doc rewritten to match `adding-photos.mdx`'s
established convention.** The first version of `feature-images.mdx` led
with `/admin` as if it could save an upload today, which isn't true for
any CMS field yet (auth still isn't wired — see CP5 status above); it
also skipped the "ask a developer / use GitHub's edit-this-page pencil
icon" two-option structure and "no coding background needed" framing that
`adding-photos.mdx` already established as the house style for these
club-lead-facing pages. Rewritten to match: Option A/B structure, a
forward-looking note that `/admin` will do this once CMS auth exists
rather than claiming it does now, and a `sidebar_custom_props.icon: Image`
(added to `SIDEBAR_ICONS` in `src/data/sidebarIcons.js`, distinct from
`adding-photos.mdx`'s existing `Images` plural icon so the two don't look
identical on the Resources category page).

## 2026-07-28 — Autoplay added; the 3D coverflow becomes a real component; a 3rd carousel type; docs for both audiences

Files: `src/components/useCarouselAutoplay.js` (new),
`src/components/ImageCarousel.jsx`, `src/components/CoverflowCarousel.jsx`
(new), `src/components/StackCarousel.jsx` (new), `src/css/custom.css`,
`src/data/sidebarIcons.js`, `docs/resources/adding-photos.mdx` (new),
`CONTRIBUTING.md`

Requested: add autoplay after all, cover "the 3 types of image carousels"
in the technical tutorial, and write a separate non-technical version for
club leads.

**Reconsidered the earlier "not adopting the 3D coverflow" call — this
session, not the last one.** The previous entry's reasoning (superseded
doc, autoplay accessibility concern) was about *defaulting* to that
version; asked for directly, both concerns are addressable rather than
disqualifying — autoplay done properly (pause control, reduced-motion
gate, pause-on-hover) satisfies WCAG 2.2.2 rather than violating it, and
"superseded rebuild-rationale" doesn't mean "must never build," just "not
a locked spec to default to." Built it as `CoverflowCarousel.jsx`,
adapted from §5's spec to this project's conventions (real `import`ed
images, the shared autoplay hook, `prefers-reduced-motion`).

**`useCarouselAutoplay.js` (new)** — one shared hook behind all three
carousels' `autoplay` prop, instead of three separate timers: play/pause
state, the interval, a `prefers-reduced-motion` gate (autoplay never runs
at all for those visitors, matching every other motion-sensitive piece of
this project), and pause-on-hover (a reader looking at a photo shouldn't
have it pulled away mid-look). Matches this project's own stated
convention of putting shared behavior in one hook rather than
per-component (`useIntroMotion`/`useClubAccent` already do this for
heroes).

**Three carousel types, one shared `images`/`autoplay` prop shape:**
1. `ImageCarousel` ("Fade") — existing, gained the autoplay hook +
   play/pause button.
2. `CoverflowCarousel` ("Coverflow", new) — the motion guide's §5 spec:
   multiple images visible at once, tilted/scaled/faded by distance from
   the centered one, spring physics. Reduced motion keeps the discrete
   tilted positions (removing them entirely would make off-center images
   an illegible pile-up) but swaps the spring transition for an instant
   snap.
3. `StackCarousel` ("Stack", new) — a third type not present in any
   source doc, added because "3 types" was the ask and a draggable
   Tinder-style card deck is a well-known, officially-documented Framer
   Motion pattern in its own right (their examples site has one under
   "swipe to remove cards"), giving genuine stylistic variety (calm vs.
   showy vs. playful) rather than three near-duplicates. Disclosed
   simplification, noted in the component's own header comment: a manual
   swipe plays a full fly-off-then-reveal-next animation; an
   autoplay-triggered advance just reshuffles depths without that same
   flourish — giving autoplay the identical animation would mean
   restructuring the shared hook for a polish-only difference, judged not
   worth it.

**Verified all three directly** (temporary local test post, not
committed): autoplay actually advances on its own timer and stops when
paused; the pause button is genuinely absent under `prefers-reduced-motion`
(checked, not assumed); Coverflow renders all images with the tilt/scale/
fade math; Stack's drag-to-dismiss correctly reveals the next card and
cycles; existing button/dot navigation on all three still works. One
transient full-suite flake (4 tests failed under full parallel load, all
passed individually and on a second full re-run) — logged as
load-related, not a regression, consistent with this project's own
documented history of `docusaurus serve` being a lightweight server that
occasionally struggles under this suite's parallelism.

**`docs/resources/adding-photos.mdx` (new)** — the actual answer to "a
separate tutorial doc for non-technical people." Initially drafted for
`docs-internal/` before catching that this repo's own convention marks
that folder "not site content, not part of the Docusaurus build at all" —
exactly wrong for something aimed at non-technical club leads who need to
*find* it on the live wiki, not dig through a git repo. Moved to
`docs/resources/` instead, a real page reachable at
`/docs/resources/adding-photos`, alongside the existing Archives page.
Written with zero unexplained jargon: describes the three styles in plain
terms (Classic Slideshow / Photo Wall / Swipe Deck, not "Fade/Coverflow/
Stack"), and is honest about a real constraint rather than glossing over
it — Decap CMS's markdown-body widget has no way to embed a React
component, so there's currently no true one-click self-service path;
the page offers two real options instead: ask a developer (with exactly
what to send them), or use the "Edit this page" link every doc already
has to open GitHub's own browser-based editor and paste a fill-in-the-
blanks template directly, explained as "copy this exactly, only change
the bracketed parts" without needing to understand what an import
statement or a component is.

Added `sidebar_custom_props: {icon: Images}` to the new page, matching the
existing per-doc icon convention — **caught and fixed a real miss before
it shipped wrong**: the icon didn't render (fell back to the generic file
icon on both the sidebar and the `/docs/category/resources` card) because
`Images` was never added to `sidebarIcons.js`'s `SIDEBAR_ICONS` lookup
table — confirmed via screenshot, then fixed and reconfirmed.

`CONTRIBUTING.md`'s "Adding photos to an event post" section rewritten to
cover all three components (a comparison table: style, description, best
use), the shared `autoplay`/`autoplayInterval` props, and a pointer to the
new non-technical page for anyone unsure which style to pick. The
directory-tree component list gained all three files plus
`useCarouselAutoplay.js`.

Noticed in passing, not touched: a concurrent session added
`@docusaurus/plugin-ideal-image` to `docusaurus.config.js` and a "Feature
Image" field to `static/admin/config.yml` (per a new
`feature-images-recent-activity-plan.md`), and a third Resources page,
"Adding a Feature Image to a Post" — unrelated to this work, left alone.

## 2026-07-28 — Doc sync (HANDOFF-4, tutorial cross-links) + combined-tree verification

Files: `HANDOFF-4.md`, `docs/resources/adding-photos.mdx`

Requested: bring `HANDOFF-4.md`, this file, `CONTRIBUTING.md`, and the
non-technical tutorial doc back in sync now that two sessions' work
(carousels + feature images) has landed in the same working tree.
`CONTRIBUTING.md` and this file were already current — the concurrent
session had kept both up to date for their own feature-image work, cross-
referencing the carousel section correctly. The two gaps found and fixed:

1. **`HANDOFF-4.md`'s "Current State"/"Next Steps" sections were stale** —
   still described card-thumbnails work as "most recent" and the carousel
   work wasn't mentioned as committed at all, even though the carousel
   commit (`40610a3`) landed and was pushed after that snapshot was
   written. Rewritten to reflect the actual, current git state: carousels
   committed/pushed, feature-images still uncommitted (a concurrent
   session's in-progress work, correctly left alone rather than bundled
   into a commit here).
2. **`docs/resources/adding-photos.mdx` and `docs/resources/
   feature-images.mdx` didn't link to each other** — two genuinely easy-
   to-confuse concepts ("photo inside the post" vs. "the one thumbnail
   used for the post's card"), each written by a different
   session/timeframe, with no way for a club lead who landed on the wrong
   one to find the right one. Added a short cross-reference at the top of
   each.

**Also re-verified the combined working tree** (carousels + the
concurrent session's still-uncommitted feature-image work together): full
`npm run build` and the complete Playwright suite (`npx playwright test`)
both run clean, 63/63 — closing out the "not yet re-run against
Playwright" gap the other session's own changes.md entry had flagged for
the feature-image work. This was a verification pass only; no new spec
was authored for feature-images (not this session's feature to test), and
the feature-image files themselves remain uncommitted, left for whoever
is driving that work to commit when ready.

## 2026-07-28 — Leadership rollover: `TeamSection`, 21 team-data files, `scripts/rollover.mjs`, archive tree

Files: `src/components/TeamSection.jsx` (new), `src/components/contactIcons.jsx`
(new, extracted from `ClubContact.jsx`), `src/data/teams/*.mjs` (21 new),
`src/data/festMeta.mjs` (new), `scripts/rollover.mjs` (new), `package.json`
(new `rollover` script), `docs/archive/_category_.json` (new) +
`docs/archive/art-club/`, `docs/archive/tech-fest/` (new, real worked
examples), all 18 `docs/clubs/<slug>/index.mdx` + all 3 `docs/fests/<slug>.mdx`
(wiring), `src/pages/clubs.js`, `tests/e2e/clubs-and-fests.spec.js`,
`tests/e2e/leadership-rollover.spec.js` (new, 9 tests), `CONTRIBUTING.md`,
`docs/resources/team-photos.mdx` (new), `docs-internal/leadership-rollover.md`
(new), `static/img/team/placeholder-avatar.svg` (new),
`leadership-rollover-plan.md` / `archive planning.md` (status headers)

Implemented `leadership-rollover-plan.md` in full (and, with it, `archive
planning.md`'s §2/§3) — the mechanism for snapshotting an outgoing club
board / fest organisation committee into a permanent archive page, then
resetting the live page for the incoming team. Requested with an explicit
instruction to ask clarifying questions and reach full context before
writing any code; four were asked and answered before starting: run the
rollover script for real (verified first against 2 disposable throwaway
slugs, cleaned up, then run for real against art-club/tech-fest as the
shipped worked examples — not a hand-scaffolded fake), generate an actual
placeholder avatar image rather than leave a 404 in the demo data, add
Playwright coverage (matching this repo's established convention), and
commit + push once everything passes.

**Deviated from the written plan in two places, both discovered while
implementing, not guessed at:**
1. Fest sidebar icons already existed (`Rocket`/`PartyPopper`/`Music`,
   added by other work between the plan being written and this session),
   not the plan's placeholder guess of `Sparkles` for Cultural Fest.
   `festMeta.mjs` was written to match the live icons instead of adding a
   fresh, conflicting choice.
2. **The plan's own per-club archive links (`/docs/archive/<slug>`) would
   have hard-failed the build.** Only a slug that has actually been rolled
   over gets a `docs/archive/<slug>/` folder — Docusaurus doesn't generate
   a route for an empty category, confirmed directly (a first `npm run
   build` attempt with all 21 pages linking to their own `/docs/archive/<slug>`
   failed with 21 broken-link errors, since only 2 of 21 slugs had actually
   been rolled over at that point). Fixed by pointing all 21 pages at the
   generic `/docs/archive` top-level index instead — always resolves, and
   naturally starts listing each club/fest's own sub-page the first time
   it's actually rolled over.

**`TeamSection.jsx`** renders `{name, role, photo?, contact?}[]` — no
heading of its own (same convention as `ClubContact`), so the `.mdx` author
supplies "Board" vs. "Organisation Committee" wording. No photo → a generic
`UserRound` icon in a `--club-accent`-tinted circle. Photo path resolution
uses `useBaseUrl()` (default options, not `forcePrependBaseUrl`) — checked
Docusaurus's own source first to confirm the default behavior already
skips re-adding the prefix for a path that already has it, so team-data
authors can write a normal `/img/team/<slug>/x.jpg` path without hardcoding
this deployment's `/collage-wiki-SAIU/` prefix, and nothing double-prefixes.

**`contactIcons.jsx`** — `ContactLink`/`InstagramIcon`/`LinkedinIcon` moved
out of `ClubContact.jsx` (which now imports them) so `TeamSection` doesn't
duplicate them.

**`scripts/rollover.mjs`** — standalone `node` script (`.mjs`, not `.js`,
since `package.json` has no `"type": "module"` and bare `.js` would parse
as CommonJS and throw on `export const` in the team-data files it
`import()`s). Validates `type`/`slug`/`year`, refuses to overwrite an
existing snapshot, bootstraps a slug's `docs/archive/<slug>/_category_.json`
the first time (label/icon sourced from the club's own `_category_.json` or
`FEST_META`), writes the year snapshot, and resets `src/data/teams/<slug>.mjs`
to a fresh placeholder. `--dry-run` and `--force` flags. Verified end to
end: dry-run against a real slug, then a real run (with `--force`) against
2 disposable throwaway slugs (one club-type using a temporary
`docs/clubs/test-club-zzz/_category_.json`, one fest-type using a temporary
`FEST_META` entry) to prove both code paths, confirmed re-running the same
slug/year refuses rather than clobbering, then deleted every trace of the
throwaway slugs before running it for real against art-club/tech-fest.

**Mid-session incident, caught and recovered, not silently worked around:**
partway through wiring the 21 pages, the entire working tree got reset to a
clean `git status` — all of this session's new/modified files (plus,
separately, several gitignored planning docs that should have stayed on
disk per their own `.gitignore` comments) disappeared. Traced via `git
reflog`: a concurrent session had taken a full working-tree safety-backup
commit (explicitly labeled as such, including "untracked WIP") onto a
now-deleted local branch before doing its own commit/cleanup work on
`main` — recovered every file from that still-reachable (if branch-less)
commit via `git checkout <sha> -- <paths>`, re-deleted the 2 disposable
test-slug files that the snapshot had happened to catch mid-test, and
continued from exactly where the session left off. No data was actually
lost; flagging this because it's a real, reproducible risk of concurrent
sessions sharing one working tree, not because anything here needs fixing
retroactively.

**Test coverage** — `tests/e2e/leadership-rollover.spec.js` (new, 9 tests):
Current Board/Committee sections render with placeholder data, no-photo
fallback renders no broken `<img>`, the demo photo+contact member renders
both, the `/clubs` Archive link navigates correctly, the top-level archive
index lists both rolled-over slugs, a per-club archive category lists its
snapshot, and both snapshot pages render under their own year heading. Hit
(and fixed) the exact kind of test-locator strictness issue this repo's own
`TEST_REPORT.md` debugging trail already warned about: a bare role/name
query for "Art Club Archive" or "2025-26 Board" matched 3 elements each
(sidebar menu link, generated-index card, "Next" pagination link) — fixed
by scoping to `.theme-doc-card-container`; a bare heading-name query for
"2025-26 Board" also matched the page's own `<h1>` title (which contains it
as a substring) — fixed with `{level: 2}`. Also updated
`clubs-and-fests.spec.js`'s pre-existing "Archives mention" test, since
this work intentionally changes both the link text ("Archives page" →
"Archive") and target (`/docs/resources/archives` → `/docs/archive`).

Verified end to end: `npm run build` clean, full `npm run test:e2e`
72/72 (63 pre-existing + 9 new).

**Update, same day: split the tutorial doc, and moved the one about
running the script itself out of the public site.** Originally wrote one
combined tutorial (`docs/resources/leadership-rollover.mdx`) covering both
running `scripts/rollover.mjs` and replacing a team member's photo.
Corrected per explicit direction into two separate concerns with different
audiences: **running the rollover script is maintainer-only** — it needs
repo/terminal access, so it has no business being a public
`docs/resources/` page every site visitor can find in the sidebar. Moved
to `docs-internal/leadership-rollover.md` (a plain `.md` file,
deliberately outside `docs/` so Docusaurus never builds it into a route —
confirmed via `find build -iname "*leadership-rollover*"` returning
nothing after rebuilding). **Adding a team member's photo, by contrast,
needs no script or repo tooling beyond editing one line and uploading a
file** — kept as a public, plain-language page,
`docs/resources/team-photos.mdx`, matching `adding-photos.mdx`'s and
`feature-images.mdx`'s existing club-lead-facing convention (Option
A/ask-a-developer, Option B/GitHub's edit-this-page flow). Removed the
`Users` sidebar icon from `sidebarIcons.js` (only used by the
now-non-public rollover page); kept `UserRound` (still used by the public
`team-photos.mdx`). Re-verified: `npm run build` clean, full
`npm run test:e2e` 72/72 unaffected by the split.

**Update, same day: the art-club/tech-fest worked examples were removed
entirely, and replaced with one real one — MoSAIc's actual 2026
Organising Committee.** Requested directly: showing fake
`PLACEHOLDER_NAME_*` data as if it were real archived history for two
specific, real, named clubs read as misleading on a public site, even
though the intent was always "mechanism only, placeholder data."

Deleting both examples left `docs/archive/` with zero children, and
Docusaurus's `generated-index` doesn't produce a route at all for an
empty category (confirmed directly — `npm run build` failed with 21
broken-link errors, one per club/fest page's "See the Archive" link,
the moment both were removed). Tried a hand-authored
`docs/archive/index.mdx` (`link: {type: 'doc'}`) as a stopgap so
`/docs/archive` would keep resolving with an honest "nothing archived
yet" message regardless of children count — then replaced *that* too,
once real content existed, with the simpler `generated-index` again
(safe now that MoSAIc's entry is real and permanent, so the category can
never be empty again).

**Real content, sourced directly from the fest's own Instagram
(`@mosaic.2026`)'s "Meet the Core Committee" post**, confirmed by the
wiki maintainer (WebFetch converts pages to text and can't OCR names
baked into a photo, so the actual 7 names + the "all use the same
generic role" decision came from the maintainer directly, not scraped) —
7 real people, `role: 'Organising Committee Member'` for all (no
per-person title available), no `photo`/`contact` fabricated for real
people with no actual source for either. `src/data/teams/cultural-fest.mjs`
→ `scripts/rollover.mjs -- fest cultural-fest 2026` →
`docs/archive/cultural-fest/2026-committee.mdx`.

**Real bug found and fixed while doing this, would have affected any
future single-year rollover, not just this one:** the resulting page's
URL silently dropped the year — `2026-committee.mdx` resolved at
`/docs/archive/cultural-fest/committee`, not `.../2026-committee`.
Traced to Docusaurus's own `numberPrefix.ts`: it strips a leading
`NNNN-word` pattern from a doc's default slug (for manual-ordering
filenames like `01-intro.md`), but its `ignoredPrefixPattern` only
protects `NNNN-NN-word` shapes as date/version-like — `2025-26-board`
(year-range) was safe, `2026-committee` (single year) wasn't. Worse than
just an ugly URL: two single-year rollovers for the same slug in
different years would have collided on the identical stripped slug.
Fixed by having the script set an explicit `slug:` frontmatter field
(`slug: <year>-<suffix>`) on every snapshot it writes, for both formats,
not just the one that broke — verified via `find build/docs/archive`
showing the correct `2026-committee` directory after the fix.
`CONTRIBUTING.md`'s manual-fallback steps updated with the same
requirement, plus its worked-example file reference repointed from the
deleted `docs/archive/art-club/_category_.json` to the real
`docs/archive/cultural-fest/_category_.json`. Also relaxed the script's
year-format validation (`/^\d{4}-\d{2}$/` → `/^\d{4}(-\d{2})?$/`) to
accept a bare year like `2026`, matching how MoSAIc is actually branded,
alongside the existing `2025-26` year-range style.

`tests/e2e/leadership-rollover.spec.js`'s archive-section tests rewritten
to match: the Archive index lists "MoSAIc Archive", the category lists
the "2026 Organisation Committee" snapshot, the snapshot itself renders
all 7 real names under its own year heading, and cultural-fest's *live*
page correctly shows placeholder data again (not the archived committee)
post-rollover. Verified end to end: `npm run build` clean, full
`npm run test:e2e` 72/72.

## 2026-07-28 — Dedicated Contact page per club

Files: all 18 `docs/clubs/<slug>/contact.mdx` (new), `src/components/ClubContact.jsx`,
`CONTRIBUTING.md`, `tests/e2e/clubs-and-fests.spec.js`

Requested: a basic Contact page per club, modeled on
`y-bow/saiufosswiki/about/contact` (the sibling FOSS Club wiki this
project already sources FOSS Club's real contact info from). Fetched that
page first to confirm its actual shape: a plain heading + email/Instagram/
LinkedIn links, nothing else — matches what `ClubContact.jsx` +
`clubContacts.js` already model, no new data shape needed.

**`contact.mdx`** added as a third thin-wrapper sibling to every club's
`index.mdx`/`events.mdx` (same pattern: `title`/`sidebar_label`/
`description` frontmatter, one import, one component call) — a dedicated
`/docs/clubs/<slug>/contact` route reading the exact same
`CLUB_CONTACTS[<slug>]` entry `index.mdx`'s own inline "## Contact"
section already uses, so there's exactly one place to edit
(`src/data/clubContacts.js`) for both to update together. Deliberately
left the inline section on `index.mdx` as well, rather than removing it in
favor of only the new page — not asked for, and removing it would be a
bigger, unrequested restructuring.

**Real bug fixed while building this, not introduced by it:**
`ClubContact` returned `null` when a club had no `email`/`instagram`/
`linkedin` set (17 of 18 clubs, today) — fine as an inline aside on
`index.mdx`, but a dedicated Contact page rendering nothing at all reads as
broken, not "not published yet." Fixed by rendering a
"No contact info published yet for this club — check back soon." message
instead, matching `ClubEventsList`'s existing empty-state convention
("No events recorded yet for this club — check back soon.") rather than
inventing new wording.

Verified: `npm run build` clean; `tests/e2e/clubs-and-fests.spec.js` gained
3 new tests (every club's `/contact` loads clean, FOSS Club's page shows
its real `fossclub@saiuniversity.edu.in`/`@foss.saiu` links, a
placeholder club shows the new fallback message) — full
`npm run test:e2e` 75/75 (72 pre-existing + 3 new).

## 2026-07-29 — Fixed a real crash in the footer dino easter egg

Files: `src/theme/Footer/index.js`, `tests/e2e/dino-easter-egg.spec.js`,
`CONTRIBUTING.md`, `TEST_REPORT.md`

Reported: the dino game crashes. Every existing `dino-easter-egg.spec.js`
test opened the overlay but never actually pressed a key to start
playing — confirmed the crash directly by scripting a real keypress in
Playwright (`page.keyboard.press('Space')`), which none of the existing
tests did, exactly why this shipped unnoticed.

**Root cause, traced to the exact line:** `react-chrome-dino`'s bundled
Runner only runs its `playIntro()` codepath on the game's first keypress.
That method calls `document.styleSheets[0].insertRule(keyframesRule, 0)`
to inject a one-off `@-webkit-keyframes intro` rule, assuming index 0 of
the page's first stylesheet is always a safe place to insert. It isn't
here: `custom.css` opens with `@import
url('https://fonts.googleapis.com/...')` for the handwriting fonts, and
the CSS spec requires `@import` rules to precede every other rule in a
stylesheet — inserting anything at index 0 (i.e. *before* that `@import`)
violates that ordering, so the browser throws `HierarchyRequestError`.
`react-chrome-dino` doesn't catch it, so it kills the whole game the
instant it tries to start.

**Considered replacing the package** (CLAUDE.md's own standing
instruction: swap `react-chrome-dino` only if it throws errors against
this stack, which it now does) — researched actively-maintained
alternatives first; none exist. Every fork on npm (`react-dino-game`,
`react-chrome-dino-ts`, `react-dinosaur-game`) vendors the same original
Chromium Runner source this bug lives inside, so swapping packages would
most likely just relocate the identical bug, not fix it. `patch-package`
isn't set up in this repo either, and adding it as a new dependency just
to patch one method felt like more moving parts than the fix needed.

**Fixed instead with a scoped runtime patch**, in `Footer/index.js`,
applied once on module load: wraps
`CSSStyleSheet.prototype.insertRule` so that specifically a
`HierarchyRequestError` (not any other error) falls back to appending the
rule at the end of the stylesheet instead of the requested index. This is
exactly equivalent for a `@keyframes` rule — rule *order* only actually
matters for `@import`/`@namespace` — so the intro animation still plays
correctly, just via a valid insertion point. Verified end to end:
reproduced the exact `HierarchyRequestError` stack trace before the fix
(via a throwaway repro test, deleted after confirming), confirmed zero
console/page errors and a real screenshot of the dino actually running
(tinted, score counting up, jumping) after the fix.

**New regression test** in `dino-easter-egg.spec.js` — presses a key
before asserting no console errors, closing the exact gap that let this
ship unnoticed in the first place.

Verified: `npm run build` clean; `dino-easter-egg.spec.js` 7/7 in
isolation. Full `npm run test:e2e` also run — 6 unrelated failures
present (a concurrent session added "Resources"/"Archive" navbar items to
`docusaurus.config.js` without updating `navigation.spec.js`'s expected
list, and the new navbar "Archive" link now name-collides with the
`/clubs` page's own "Archive" link that `leadership-rollover.spec.js`/
`clubs-and-fests.spec.js` target; one more, `hero-playback.spec.js`, is
timing-flaky under parallel load and passes alone) — none touched here,
not this task's scope.

## 2026-08-11 — PRODUCT.md/DESIGN.md captured, animation docs added, mini-hero-card clipping bug found and fixed

Files: `PRODUCT.md` (new), `DESIGN.md` (new), `.impeccable/design.json`
(new), `docs-internal/ANIMATION.md` (new), `docs-internal/ANIMATION-
IMPROVEMENTS.md` (new), `src/components/MiniHeroCard.jsx`, `src/css/
custom.css`

**Impeccable `init`/`document`.** Ran `/impeccable init` to capture
`PRODUCT.md` (primary user is public visitors, not the club leads who
publish content; positioning around the 23 bespoke hero animations plus
the free/self-serve content model). Ran `/impeccable document` to
extract `DESIGN.md` + its `.impeccable/design.json` sidecar from the
existing `scholar-design-system-hybrid (1).html` spec and `custom.css`
— tokens, components (buttons/cards/tags/inputs, plus hero animations,
carousels, mini-hero cards, the footer easter egg as signature
components), and Named Rules pulled from real code comments (the
WCAG button-contrast pins, the neutral-ramp inversion trap). Mid-build,
the shape language was changed from the source spec's sharp
"letterhead" radius scale (0.2–0.5rem) to a squircle system (0.5–1.25rem,
`corner-shape: squircle` with a circular-radius fallback) — both files
updated to match, including a renamed Named Rule (Letterhead Radius Rule
→ Squircle Rule).

**Two new animation docs in `docs-internal/`.** `ANIMATION.md` is a
technical reference of what actually exists: the `useIntroMotion` and
`useCarouselAutoplay` contracts, concrete per-hero techniques
(`offsetPath` orbit binding, font-mask text reveal, seeded-PRNG ballistic
confetti, the `Book`/`Shelf` drop-and-settle primitive), the click-vs-
hover replay migration, and — the one real surprise — confirmation that
the `motion.css`/`motion.js` fallback layer `CLAUDE.md` specifies as
"kept, not deprecated" doesn't exist anywhere in the repo and isn't wired
into `docusaurus.config.js`; Framer has covered every case built so far,
so the fallback has never actually been exercised. It also distills six
real bugs already hit and fixed (from `changes.md`'s own CP3/CP4 history)
into reusable lessons — the `initial={false}` remount bug, the static-
transform-vs-Framer-`x`/`y` conflict found independently twice, the
fixed-dark-card contrast bug (and its still-incomplete fix, 4 remaining
spots in `EntrepreneurshipHero.jsx`), the hydration-mismatch/seeded-PRNG
requirement, and the `offsetPath`+`rotate` composition bug. `ANIMATION-
IMPROVEMENTS.md` is a forward-looking, nothing-implemented-yet proposal
for a `usePageIntro` hook + `PageIntro`/`PageIntroItem` components to
stagger in page title/description text on first load — confirmed via the
actual homepage header (`src/pages/index.js`) and a club page's
description paragraph that both currently render with zero motion,
unlike the heroes above them.

**Mini-hero-card clipping bug in the `/clubs` directory grid.** Reported:
several heroes' animations (Astronomy, Gaming, Literary, others) were
visibly cut off in the directory grid. First attempt — reverting
`MiniHeroCard.jsx`'s `SCALE` from `0.68` back to `0.58` (matching a
`// was 0.58` comment in the code) — did not fix it; confirmed via
Playwright screenshots that Literary was still almost entirely clipped
and Astronomy/Gaming still partially clipped at the reverted size too.

**Root cause, found via DOM measurement, not guessing:** every hero's own
`my-6` margin (needed for spacing on its real, full-size page) was
collapsing straight through `.mini-hero-card__scale-wrap` — a plain
`<div>` with no border/padding/overflow to block collapse — and pushing
the scaled content down by 24px *before* any of it was visible, eating a
chunk of the fixed-height card's clipping budget from the top and cutting
each hero's own bottom edge off. This affected all 18 heroes identically;
it just wasn't visible for the ones with empty space at their own bottom
edge. Fixed by zeroing `margin-top`/`margin-bottom` on the scale-wrap's
child, scoped to the preview context only — the hero components
themselves keep `my-6` for their real pages, untouched.

**Checked real GitHub history before assuming anything was a regression**
— `git log` across `origin/main` and all three branches of the separate
`collage-wiki-SAIU-archive` repo (`main`, `snapshot-2026-07-28-2018`,
`context-2026-08-03`) shows exactly one commit ever touched
`MiniHeroCard.jsx` or its CSS (`2ed6f47`, CP4-CP5), and it shipped with
`0.68`/`381×131px` already baked in on every single branch. There is no
earlier `0.58` commit anywhere in real history — that value only ever
existed as an in-code comment describing pre-commit dev history that got
squashed before this file was ever committed. Also confirmed CP1
(`9a8959a`) had no club view at all (stock Docusaurus homepage) — despite
`CLAUDE.md`/`BUILD-BRIEF` describing an intermediate "hardcoded
`ClubCards`" phase, no such component ever existed in git history; CP4-CP5
went straight from the stock scaffold to the real-hero-preview
`MiniHeroCard` approach. Separately confirmed the margin-collapse bug is
unrelated to other uncommitted work already sitting in this working tree
(the off-screen `IntersectionObserver` pause and keyboard-accessibility
changes in `useIntroMotion.js`, and per-hero accent/contrast fixes) — none
of that touches margins or this component's CSS.

**Card sizing, iterated live against the real grid.** Literary Club is
the only one of the 18 club heroes with no fixed height (renders at
`308px` natural vs. the other 17's uniform `192px`/`h-48`), so no single
card size fits every hero without a tradeoff. Landed, after checking
column-count behavior against Infima's container breakpoints (`1248px`
and `1504px`, confirmed empirically at several viewport widths) so the
grid stays capped at exactly 3 cards per row even on wide monitors: card
is `416×143px`, sized around the 17 uniform-height heroes (no dead space
under them) rather than around Literary, which now crops again — a
deliberate tradeoff, not chased for a perfect fit on every hero.
`.explore-icon-card` kept in sync with the same footprint. The
per-hero-auto-fit-scale alternative (measuring each hero's real height
and scaling it individually so nothing ever crops, at the cost of
implementation complexity) was scoped but not built.

Verified throughout via a real headless-Chromium run against the actual
dev server (Playwright, already a project dependency — no new tooling
added), not just reasoning about the CSS: full-grid and per-card
screenshots at multiple viewport widths, plus direct DOM measurement
(`getBoundingClientRect`, computed styles) to find the margin-collapse
root cause rather than guessing from the box model on paper.

## 2026-08-11 — Hero reference docs, real audit/critique + WCAG run, keyboard access + discoverability built, unified-mode recolored to monochrome

Files: `docs-internal/HEROS.md` (new), `docs-internal/HEROS-IMPROVEMENT-
PLAN.md` (new), `docs-internal/HEROS-AUDIT-CRITIQUE.md` (new),
`.impeccable/critique/*` (new), `docs-internal/animation-caveats.md`,
`CONTRIBUTING.md`, `src/components/useIntroMotion.js`, `src/css/
custom.css`, `src/components/clubAccents.js`, `src/components/
AccentModeToggle.jsx` (new), `src/theme/NavbarItem/ComponentTypes.js`
(new), `docusaurus.config.js`, `src/components/clubs/
EntrepreneurshipHero.jsx`, `src/components/clubs/MartialArtsHero.jsx`,
`src/components/clubs/TuringitesHero.jsx`, `src/components/clubs/
MusicHero.jsx`, `src/components/fests/FestSound.jsx`,
`src/components/MiniHeroCard.jsx`

**`HEROS.md`** — a from-scratch reference reading all 23 hero source files
plus the two shared hooks, documenting each hero's animation sequence, the
specific decisions behind it, and cross-cutting patterns (the
transform-ownership bug hit independently in Photography/AnimalWelfare, the
`pathLength` line-drawing technique, the build-once-vs-loop-forever choice
made per-concept). **`HEROS-IMPROVEMENT-PLAN.md`** — a prioritized backlog
(P0–P3) built from that read plus `PRODUCT.md`/`DESIGN.md`, before any
browser tooling was available this session.

**Real `/impeccable audit` + `/impeccable critique` run, not just a
source-level estimate.** Two isolated sub-agents dispatched per
`critique.md`'s hard invariants (design review; detector + evidence).
Assessment A completed in full and independently found a real duplicate
accent color (`gardening-club`/`turingites-computer-science-society` both
`#15803D`) that the earlier source-level plan had missed. Assessment B hit
a session-limit API error mid-run after confirming the bundled detector's
11 findings (all in `CulturalFestHero.jsx`/`GeneralFestHero.jsx`'s already-
documented festive-palette exceptions, zero false positives) — its
unfinished live-evidence scope was completed in-context instead, against a
real production build (`npm run build`, not the dev server, which only
serves a client-rendered SPA shell to non-JS fetches — confirmed by
`curl`ing it and getting back the generic app shell with zero page-specific
content). A full WCAG 2.1 contrast audit was computed (relative-luminance
formula, all 18 accents × their real card backgrounds, both directions)
rather than estimated — headline result: all 16 fixed-dark-card headings
pass comfortably (5.8–12.3:1); the regression table (what happens if any of
them made `EntrepreneurshipHero`'s mistake) shows 11 of 16 would fail AA
*outright*, which is what made that fix worth prioritizing. Full report in
`docs-internal/HEROS-AUDIT-CRITIQUE.md`; findings folded into
`animation-caveats.md`.

**Keyboard access, previously entirely missing across all 23 heroes.**
`useIntroMotion.js`'s `hoverProps` only ever wired `onClick` — confirmed via
a real production build that the hero's root `<div>` had no `tabindex`/
`role` in rendered HTML (a page's `tabindex=0` matches all belonged to
Docusaurus's own sidebar nav, not the hero). Added `role="button"`,
`tabIndex={0}`, `aria-label="Replay animation"`, and an `onKeyDown`
mirroring `onClick` for Enter/Space — one shared-hook change, inherited by
all 23. Paired with a `[data-hero-replay]` CSS rule adding `cursor: pointer`
+ a `:focus-visible` ring, since nothing previously signaled a hero was
clickable at all (confirmed 0 `cursor-pointer` matches across all 23 files
before the fix).

This surfaced two real bugs, both found and fixed in the same pass:
- `MusicHero`'s "Hear us" button and `FestSound`'s "Play theme" button were
  bubbling clicks *and* keydowns up into the hero's own root — playing a
  sample also toggled the hero's replay. Fixed with `e.stopPropagation()`
  in both the click handler and an `onKeyDown` on the button itself.
- `MiniHeroCard` nests a full `<Hero />` inside a `<Link>`; once the hero's
  root became independently focusable, every directory card got two
  competing tab stops (the Link, then the hero's own replay button) for
  what a reader perceives as one clickable card. Fixed with `inert=""` on
  the scaled preview wrapper — confirmed this doesn't affect the
  `IntersectionObserver` off-screen-pause gate below, since `inert` only
  removes focus/pointer interaction, not layout or intersection
  measurement.

**Off-screen `IntersectionObserver` pause built** (the item tracked as
highest-priority remaining infra work since CP4-CP5): a second, always-on
observer in `useIntroMotion.js` (separate from the one-shot `playOnVisible`
start trigger) gates `isPlaying` on the hero's root actually intersecting
the viewport, so the `repeat: Infinity` loopers (Science, Gaming, Art,
Oratory, Film) and Turingites' `setInterval` stepper all stop when scrolled
out of view — confirmed via `MiniHeroCard.jsx` that this matters most on
`/clubs`/`/explore`, which mount each club's real, full hero component
(CSS-scaled, not a lightweight preview), not a hypothetical.

**Unified-accent-mode toggle finally has a UI.** `useAccentMode`/
`setAccentMode` existed in `useClubAccent.js` with no caller anywhere in the
app. Built `AccentModeToggle.jsx` (a navbar pill) and
`src/theme/NavbarItem/ComponentTypes.js` (swizzled, registers a
`custom-accentModeToggle` navbar item type — the standard Docusaurus
mechanism for a bespoke stateful navbar component), wired into
`docusaurus.config.js`. **Unified mode's color changed from the site's
primary blue to monochrome**, through a few rounds live with the requester:
requested as "white," implemented as pure white for both light/dark
variants, computed contrast flagged that white would be ~1:1 (unreadable)
against Gardening/Literary's near-white light-mode card backgrounds — the
only two heroes whose card genuinely changes with site theme — then
corrected to `light: '#000000'` / `dark: '#ffffff'` per explicit follow-up
("make light mode colour black"), briefly reverted back to white/white at
the requester's request, then reapplied as black/white for good. Final
state and full reasoning live in `clubAccents.js`'s own comment on
`UNIFIED_ACCENT`.

**Remaining P1/P2s from the audit fixed:** `EntrepreneurshipHero.jsx`'s
contrast migration finished (4 remaining `var(--club-accent)` spots →
`accent.dark` — icon color, `$` text fill, growth-line stroke, final-point
fill) and given the `role="img"`/`aria-label` it was missing; same missing
`role`/`aria-label` fixed on `MartialArtsHero.jsx` (the only other hero
without it); `TuringitesHero.jsx`'s subtitle contrast bumped
(`text-green-600/80` → `/90`, 4.30:1 → 5.26:1, closing a real if marginal
AA miss) and a stale doc comment corrected (said "hover," meant "click");
the duplicate accent hex fixed (Turingites' light value `#15803D` →
`#16A34A`, since Gardening already owned `#15803D`).

**Docs updated to match.** `animation-caveats.md` — corrected stale
"hover-replay" wording, marked §9 (off-screen pause) and §15
(`EntrepreneurshipHero` contrast) resolved with before/after numbers, added
§16 (the `MiniHeroCard` sizing round-by-round history, cross-referencing
the entry above) and §17 (three new clubs requested — see below).
`CONTRIBUTING.md` — added `AccentModeToggle.jsx`/`NavbarItem/
ComponentTypes.js` to the file-tree reference, documented the unified-mode
color decision, and noted the three new clubs as in-progress.

**Not yet built: three new club heroes.** Chess Club (an SVG chess game
actually being played), Pugwash (a peace sign with a mushroom cloud —
literal to the club's real subject, nuclear disarmament/science-policy
discussion, same principle as every other hero in this set), and Sports
Society (one continuous sequence: a leg kicking a football, transforming
into hitting a cricket stump, transforming into a pickleball, ending on a
shuttlecock — a single multi-sport beat, not four separate icons). Scoped
in `animation-caveats.md` §17; full site integration (doc pages, team/
contact data, directory listing) deliberately not fabricated without real
club information on file.

## 2026-08-15 — Chess, Pugwash, and Sports Society fully built and integrated

Files: `src/components/clubs/ChessHero.jsx`, `PugwashHero.jsx`,
`SportsHero.jsx` (new); `docs/clubs/chess-club/`, `docs/clubs/pugwash-
society/`, `docs/clubs/sports-society/` (new — `index.mdx`, `contact.mdx`,
`events.mdx`, `_category_.json` each, same shape as every existing club);
`src/data/teams/chess-club.mjs`, `pugwash-society.mjs`, `sports-
society.mjs` (new, placeholder board data); `src/components/clubAccents.js`,
`src/data/clubDirectory.js`, `src/data/clubContacts.js`,
`src/data/sidebarIcons.js`, `docs/clubs/_category_.json` (18 → 21 clubs).

The three heroes scoped as "not yet built" above are now built and wired
into the site end-to-end, following the same integration path as every
other club — no shortcuts taken for the newcomers:

- **Chess Club** — a real three-beat short game, not a static board: a pawn
  opens, a knight travels a geometrically real L to capture a pawn, then
  delivers check and the enemy king topples. Builds once and stays
  checkmated (same reasoning as Martial Arts' broken plank — a landed mate
  that reset would undercut). Uses lucide's own chess piece glyphs rather
  than hand-drawn silhouettes.
- **Pugwash Society** — landed on the peace sign alone, not paired with a
  mushroom cloud as originally scoped. Earlier drafts tried the mushroom
  cloud (the club's namesake Pugwash Conferences were founded in 1957 to
  campaign against nuclear weapons) but it read as a tree even after
  correction; dropped at the requester's direction since the peace sign
  alone still carries the subject without needing to draw the threat it
  answers. New hand-drawn `PeaceSign` sidebar icon (`sidebarIcons.js`) in
  lucide's own stroke style, since lucide-react has no literal glyph for it.
- **Sports Society** — one continuous path (not four separate icons):
  kick → football → a still beat at the stumps → smash into cricket → a
  still beat → hop into pickleball → a still beat → soften into a
  shuttlecock. True shape-morphing between unrelated silhouettes isn't
  practical as one SVG path, so a parent group carries the real, continuous
  x/y motion (including flat dwell segments) while four independent
  children fade/pop in and out at their own checkpoints — the dwells are
  what make the handoffs read as sequential events instead of a smear.

Each club got its own accent (Chess = Slate, Pugwash = Olive, Sports =
Gold), a placeholder team board and contact info matching the convention
every contact-less club already uses (`PLACEHOLDER_*` values, ready for
`scripts/rollover.mjs`), and directory/sidebar entries. Category
description updated from 18 to 21 clubs.

## 2026-08-15 — Sitewide 18→21 doc sync, e2e fixture fixes, sidebar icons swapped to a real chess piece + a hand-drawn peace sign

Files: `README.md`, `CLAUDE.md`, `PRODUCT.md`, `FEATURES.md`, `DESIGN.md`,
`CONTRIBUTING.md`, `docs/intro.mdx`, `docs-internal/animation-caveats.md`,
`docs-internal/HEROS.md`, `src/components/MiniHeroCard.jsx`, `src/css/
custom.css`, `src/data/sidebarIcons.js`, `docs/clubs/chess-club/*`,
`docs/clubs/pugwash-society/*`, `tests/e2e/fixtures.js`,
`tests/e2e/homepage.spec.js`, `tests/e2e/clubs-and-fests.spec.js`,
`tests/e2e/explore.spec.js`

The previous entry landed the three new clubs functionally; this pass swept
every doc and test that still said "18 clubs"/"23 heroes" instead of
21/26, requested as its own follow-up ("update change docs and all other
relevant docs").

**Icons refined, per explicit request:** Chess Club's sidebar/category icon
changed from a generic `Crown` to lucide's actual `ChessKnight` piece.
Pugwash Society's changed from `Handshake` to a real peace sign — lucide has
no literal peace-sign glyph, so a small `PeaceSign` component was hand-drawn
in `sidebarIcons.js`, matching lucide's own icon contract (24×24 viewBox,
`currentColor` stroke, round caps/joins) and reusing the *exact* circle +
Y-line geometry `PugwashHero.jsx` already draws for its hero, just at icon
scale — the sidebar icon and the hero are the same shape, not just
thematically related. Verified both render in a real production build
before/after.

**e2e suite: one real, caused-by-this-work failure found and fixed, three
confirmed pre-existing and unrelated.** `tests/e2e/fixtures.js`'s
`CLUB_SLUGS` (already commented "if a club is added, add it here too") was
missing all three new slugs — added them, which is what let
`clubs-and-fests.spec.js`'s and `explore.spec.js`'s already-dynamic
`toHaveCount(CLUB_SLUGS.length)` assertions pick up 21 without further
changes; only their test *titles* still said "18," fixed to "21" for
accuracy. `homepage.spec.js` had a hardcoded regex
(`/18 clubs.*400\+ events archived/`) that would have failed outright
against the homepage's now-21 stat row — updated to 21. Running the full
suite surfaced a fourth, genuine regression: "every club has a working
/contact page" iterates all `CLUB_SLUGS` sequentially and now exceeds
Playwright's default 30s per-test timeout at 21 clubs where it didn't at
18 — fixed with an explicit `test.setTimeout(60_000)` on that one test
rather than changing what it verifies. Confirmed via a full suite re-run
(75 passed) that the remaining 4 failures — two "Archive" link strict-mode
violations (the navbar already has both a `Resources`-category link and a
`docs/resources/archives` link both labeled "Archive," predating this
session), one FOSS-contact-page selector matching both the page's own link
and the footer's identical FOSS credit link, and a navbar-item-count test
expecting 6 items where "Resources" and "Archive" already existed as
separate navbar entries before this session — are all pre-existing and
untouched by anything in this arc; none reference club count.

**Doc sync, mechanical but thorough:** `README.md`/`CLAUDE.md`/`PRODUCT.md`/
`FEATURES.md`/`DESIGN.md`'s "18 student clubs"/"23 custom hero components"
lines all updated to 21/26. `CLAUDE.md`'s own club table gained three rows
(Chess Club, Pugwash Society, Sports Society, in slug-alphabetical position)
with a note that their team/contact data is still placeholder. `docs/
intro.mdx`'s live "all 18 student-led clubs" copy, `src/pages/clubs.js`
and `explore.js`'s header copy, and the homepage stat row (`18 clubs...`
→ `21 clubs...`) were already fixed in the prior entry's session but
re-verified here. `CONTRIBUTING.md` had the most scattered references (top
description, e2e-coverage summary, the `MiniHeroCard.jsx` sizing writeup's
"17 of 18" ratio, the file-tree's club counts, the shared-hooks section's
"23 heroes," and a "24th hero" onboarding note) — all corrected, and its
own "In progress, not yet done" callout for the three clubs rewritten to
"Done, but with placeholder data" now that they're fully integrated.
`MiniHeroCard.jsx` and `custom.css` both had a comment deriving the card's
height from "the 17 of 18 club heroes that share a fixed 192px (h-48)
height" — verified all three new heroes also use `h-48` before updating the
ratio to 20 of 21.

**`docs-internal/animation-caveats.md` §17** (previously titled "requested,
not yet built") rewritten to reflect what actually happened: sourced from
`campus-club-ui` rather than authored fresh, Pugwash's dropped
mushroom-cloud history, the accent/contrast numbers, the icon decisions, and
the full-integration landing — plus a cross-reference fix in §5 (the
"18 distinct hues near the limit" note, now accurately "21, already past
the point flagged at 18") and §6 (the hero-count tracker, now "26 heroes").

**`docs-internal/HEROS.md`** — this project's detailed per-hero reference —
gained full entries for all three new heroes (matching the depth of the
original 23, not just a pointer note), inserted after Music Club and before
the fest-heroes section, plus every "18 club(s)"/"23 hero" count elsewhere
in the file (the accent-swap explanation, the traced-handwriting-effort
rationale, Oratory's "simplest of the club concepts" line, the doc's own
opening line) updated to 21/26.

## 2026-08-15 — Decap CMS backend built, tested locally end-to-end, Student Voices support added

Files: `static/admin/config.yml`, `oauth-proxy/` (new: `server.js`,
`package.json`, `README.md`), `docusaurus.config.js`, `package.json`
(`decap-server` dev dependency, `cms:proxy` script), `blog/tags.yml`,
`docs-internal/decap-cms-auth-todo.md`.

**Backend switched from the `git-gateway` placeholder to the real `github`
backend** (Option A, confirmed in `decap-cms-auth-todo.md` once GitHub
Pages hosting was settled). Built the OAuth-proxy service that decision was
blocked on — `oauth-proxy/server.js`, a small standalone Express app
implementing Decap's documented popup handshake (`/auth` redirects to
GitHub, `/callback` exchanges the code and posts the token back to the CMS
popup via `window.opener.postMessage`). Not deployed anywhere yet —
`config.yml`'s `base_url` is a `REPLACE-WITH-DEPLOYED-OAUTH-PROXY-URL`
placeholder until a GitHub OAuth App exists and the proxy runs somewhere
reachable (the VPS, per `vps-hosting-plan.md`); `oauth-proxy/README.md` has
the exact deploy steps for whoever does that.

**Tested locally end-to-end for the first time** — not just wired blind.
Added `decap-server` as a dev dependency (`npm run cms:proxy`) alongside
`local_backend: true` in `config.yml`, so `/admin` can be exercised fully
without a GitHub account, OAuth App, or deployed proxy: it talks to a local
proxy that reads/writes this checkout's real files directly. Drove it with
a headless Playwright script (logged in, filled the real editor form,
published, inspected the resulting file on disk), which is how the
following were actually caught rather than assumed:

- **Config was failing schema validation before login even mattered.**
  Decap requires a root-level `media_folder`/`public_folder` even though
  the one collection defines its own per-post ones — `/admin` loaded a
  blank "Error loading the CMS configuration" screen until this was added.
  Nobody had hit this before because auth was never wired up far enough to
  reach it.
- **The re-enabled footer "Decap CMS" link broke the production build.**
  Docusaurus's broken-link checker (`onBrokenLinks: 'throw'`) only
  validates against its own generated routes, not raw files copied from
  `static/` — true for both `to` and `href`, contrary to an initial
  assumption that `href` alone would sidestep it. Fixed with Docusaurus's
  documented `pathname://` escape hatch (facebook/docusaurus#3309) for
  links that are real but deliberately outside the route graph; confirmed
  by running the actual build, not just the dev server.
- **A bare `authors: <name>` string is not a valid inline author.**
  Docusaurus's blog plugin always treats a bare string under `authors` as a
  lookup key into `blog/authors.yml`, never a literal name (by design, so a
  typo'd key doesn't silently become a "name" — confirmed by reading
  `@docusaurus/plugin-content-blog`'s own `authors.js`). A real `npm run
  build` failed with "author key not found" on the first attempt. Fixed by
  making the CMS field an `object` widget (`authors: {name: ...}`), which
  Docusaurus does accept as an inline, non-authors.yml author.

**Student Voices support added to the CMS**, per a direct request that the
CMS manage both club-lead event posts and individual student blog posts —
not two separate Decap collections (tried, but Decap's folder `filter`
only does exact-match, can't reliably split entries by array-tag
membership or exclude a tag, so two collections risked either an unfiltered
duplicate list or silently-wrong filtering); one collection instead, same
as the site's own model (`/events` and `/student-voices` are both just
tag-filtered views over one shared `blog/` folder, see
`src/pages/student-voices.js`). Added an optional "Author" object field
(blank for club events, filled in for a personal post) and updated the
collection description to explain the split to whichever audience opens it.

**Also fixed while in here:** the three new clubs (Chess/Pugwash/Sports,
added earlier the same day) were never added to `blog/tags.yml` or the
CMS's Tags dropdown — their club leads couldn't have tagged a post to their
own club at all. Added all three to both places.

Two throwaway test posts (`ZZTEST...`) created during verification were
deleted afterward; not part of the real archive.

## 2026-08-21 — Committee rollover support, real pagination + sort on Events/Blog, homepage hero polish

Files: `scripts/rollover.mjs`, `src/data/committeeMeta.mjs` (new),
`docs/resources/leadership-rollover.mdx`, `CONTRIBUTING.md`,
`docs-internal/leadership-rollover.md`, `src/components/
TagFilteredEvents.jsx`, `src/components/usePagination.js` (new),
`src/components/PageCounter.jsx` (new), `src/pages/index.js`,
`src/pages/index.module.css`, `src/components/HomepageClubMarks.jsx` (new),
`blog/tags.yml`, `static/admin/config.yml`,
`tests/e2e/events-and-blog.spec.js`, 23 new `blog/2026-08-16-*-intro/`
posts (one per club/committee)

**Leadership rollover now supports committees, not just clubs and
fests.** `docs/committees/cultural-committee/` and `docs/committees/
student-government/` already existed as real content — each committee's
own `src/data/teams/<slug>.mjs` file even already claimed "snapshotted at
rollover" in its own header comment — but `scripts/rollover.mjs`'s type
check only ever accepted `club` or `fest`, so a committee genuinely
couldn't be rolled over at all. `committee` is now a real third type,
resolved independently of both: its archive category sources from its own
`docs/committees/<slug>/_category_.json` (same pattern as clubs), and its
on-page heading word — which isn't uniform across committees the way
"Board" (club) and "Organisation Committee" (fest) are — is read per-slug
from the new `src/data/committeeMeta.mjs` ("Committee" for Cultural
Committee, "Government" for Student Government). Verified with `--dry-run`
against both real committees, plus a regression check that `club`/`fest`
still behave identically to before. Confirmed and documented explicitly, in
all three rollover docs: club, committee, and fest rollovers are three
separate, independent operations — one slug per invocation, deliberately no
"roll everything over at once" mode, so a mistake in one can't cascade into
another and a partially-done end-of-year pass is a normal state, not a
broken one.

**`/events` and `/student-voices` had a real, increasingly-active content
ceiling.** `TagFilteredEvents.jsx` (the shared component behind both pages)
hard-capped its result set at 10 posts total, revealed 5 at a time via a
"Load more" button — fine when only a handful of real posts existed, but
the 23 new club/committee intro posts below pushed the real archive past
that cap, making a growing share of real content permanently unreachable
regardless of how many times "Load more" was clicked. Replaced with real
page-number pagination: `usePagination.js` (new hook, a companion to
`useLoadMore.js` — that one stays exactly as-is for `ClubEventsList`, this
is specifically for a result set worth jumping around in rather than
appending to) and `PageCounter.jsx` (the page-number nav itself — Prev/Next
plus a windowed page-button display with "…" gaps once past 7 pages, so a
future 400-post archive doesn't render 40 buttons in a row). The `RESULT_CAP`
is gone entirely — every matching post is now reachable, just paginated
10-per-page instead of silently truncated.

**Added a sort dropdown** ("Newest first" / "Oldest first" / "Alphabetical
A–Z") next to the tag checkboxes on both pages, applied before pagination
splits the list into pages. Sorting on `date` compares the already-ISO-8601
string directly rather than parsing to a `Date` first (lexical order on ISO
8601 already matches chronological order); both `date` and `title` are
guaranteed non-null by `club-events-plugin.js`'s own fallback chain, so no
null-safety branch was needed. Changing either the tag selection or the
sort order resets pagination back to page 1 (one shared `resetKey`), so a
reader never lands on a stale page number that no longer lines up with the
new result set or ordering.

**Bundled in the same pass, reviewed for safety before committing** (this
session didn't author these, but they landed in the same working tree and
this was the first point they got committed): a generic `fest` tag (for
fest content not tied to one specific fest) was removed from `blog/
tags.yml` and `static/admin/config.yml`'s Tags dropdown — unused, and its
own description ("general fest-related content not tied to one specific
fest") duplicated what the three named fest tags already cover between
them; the homepage hero (`index.js`/`index.module.css`) gained a subtle
primary-color gradient background, the Display type role (Playfair
Display, previously unused anywhere despite being reserved sitewide for
"hero titles only") on the `<h1>`, a fluid clamp()'d title size, and
`HomepageClubMarks.jsx` — 21 static accent-colored marks across the hero
background, one per real club, reading real data (`CLUB_ACCENTS`) rather
than decorative confetti, honoring unified-accent mode like every hero
does; and 23 new blog posts (`2026-08-16-<slug>-intro/`), one per club and
committee, giving `/events` real content to paginate through for the first
time instead of the near-empty archive every test/screenshot before this
had to account for.

Full production build clean after every stage; `npm run test:e2e` run in
full afterward.
