# Contributing to the Sai University Wiki

This is a Docusaurus v3 site for Sai University's 18 student clubs, fests, and
400+ archived events. It's built so **two very different kinds of people** can
contribute to it:

- **Club leads / non-technical editors** — add or update event posts and club
  info through a web form, no code required.
- **Developers** — work on hero animations, layout, the design system, or
  infra.

Pick the section below that matches what you're doing.

---

## 1. Editing content without touching code

> **Structurally scaffolded, not yet saveable.** `/admin` loads a real
> Decap CMS config now (`static/admin/config.yml`), but its backend has no
> auth wired up — the form renders, but there's nothing behind it that can
> actually commit a change yet. See `docs-internal/decap-cms-auth-todo.md`
> for exactly why (it's a hosting decision, GitHub OAuth-proxy vs Netlify
> Identity, not just a missing config value) and what unblocks it. Until
> then, content edits go through a developer via PR.

Go to `/admin` on the live site (or `http://localhost:3000/admin` locally).
This opens **Decap CMS**, a form-based editor. Right now it has one
collection wired up:

- **Events** — add a new dated event write-up (text + tags + images,
  through a form) under `blog/`. Tag it with the relevant club/fest so it
  shows up on that club's own Events page automatically. The optional
  **Feature Image** field sets the thumbnail shown on the homepage Recent
  Activity section, this club's Events page, and the sitewide Events/Blog
  feed — see the live [Adding a Feature
  Image](/docs/resources/feature-images) guide; that's separate from any
  photo added inside the post body itself.

**Club and fest pages (`docs/clubs/*`, `docs/fests/*`) are NOT editable via
the CMS** — those are MDX files with hero-component imports and a
`<ClubContact>` embed, not plain prose. Decap CMS collections replace a
file's entire frontmatter + body with only what's represented in its field
config; letting a non-technical editor save through a generic body widget
would silently strip those imports and break the page. Exposing that
safely needs the prose pulled out into plain frontmatter fields first — a
content-model change, not a CMS-config one (also noted in the auth-todo
doc). For now, club/fest page edits go through a developer via PR too.

You do not need to know Markdown, React, or Git to use the Events
collection. Images you upload are automatically stored next to the post
they belong to, so they keep working even as the archive grows.

If `/admin` won't load, that's a real bug — report it. If it loads but
won't save, that's expected right now (see above), not a bug to report.

---

## 2. Developer setup

```bash
git clone <repo-url>
cd sai-uni-wiki
npm install
npm start          # http://localhost:3000, hot reload
```

Other useful commands:

```bash
npm run build            # production build — must pass before any PR
npm run serve            # serve the production build locally
npm run clear            # wipe Docusaurus's cache if something looks stale
npm run test:e2e         # builds the site, then runs the Playwright suite
npm run test:e2e:report  # opens the last HTML report
```

Before opening a PR, always run `npm run build` **and** `npm run test:e2e`
locally. A page that only breaks in the production build (not `npm start`)
is a common way bugs slip through — the e2e suite runs against the
production build for exactly this reason. See `TEST_REPORT.md` for what's
covered (navigation, all 18 club pages, all 3 fest pages, the Events/Blog
tag-filtering split, the full `useIntroMotion` playback contract, theme
toggling, the footer dino easter egg) and what isn't yet (Decap CMS auth,
the accent unified-mode toggle UI, off-screen pause — none of those exist
yet, so there's nothing to test). Tests live in `tests/e2e/`; add one
alongside whatever you're changing rather than only relying on manual
verification.

---

## 3. Where things live

```
src/
  css/custom.css              site-wide styles + Scholar design tokens (--ds-*)
  plugins/
    club-events-plugin.js     reads blog frontmatter at build time, groups
                              posts by tag (club/fest/event-type) plus one
                              global recent-first list — powers
                              ClubEventsList and RecentActivity below via
                              `usePluginData('club-events-plugin')`
  theme/
    Footer/index.js           swizzled footer — wraps (not replaces) the
                              default Footer; adds the LinkedIn/Instagram/
                              mail/GitHub/report-an-issue icon row, AND the
                              hidden 🦖 dino easter egg (in-flow at the
                              very bottom — see saiu-collage-wiki-easter-egg.md).
                              Tints via `mix-blend-mode: color` on a solid
                              overlay div, not a CSS `filter` — filter
                              flattened the whole grayscale canvas to one
                              solid block; blend-mode preserves the
                              dino/ground's light/dark contrast while
                              shifting the hue.
    DocSidebarItem/Link/      swizzled (ejected) — renders a lucide icon
                              before a doc's sidebar label, from that doc's
                              `sidebar_custom_props.icon` frontmatter
    DocSidebarItem/Category/  swizzled (ejected), same icon behavior as
                              Link but for folder-based docs — needed
                              because a club becomes a sidebar *category*
                              once it has an Events subpage, and upstream's
                              Category component doesn't read
                              `customProps` the way Link does
  components/
    useIntroMotion.js         shared animation-lifecycle hook — all heroes use this
    useClubAccent.js          shared per-club accent-color hook
    clubAccents.js            the accent color for every club, one place
    useLoadMore.js            generic client-side "load more" pagination hook
    EventCard.jsx             one event's summary card (date/title/description
                              + an optional feature-image thumbnail, rendered
                              via @theme/IdealImage)
    ClubEventsList.jsx        renders a club's Events page — paginated list
                              of that club's tagged posts + a link to its
                              full tag-page timeline
    RecentActivity.jsx        homepage "Recent Activity" section — the 5
                              most recent posts site-wide, any club/fest
    TagFilteredEvents.jsx     tag picker + recent-posts feed, same plugin
                              data — powers /events (real content only,
                              excludes student-voices) and /student-voices
                              (all tags) via its `tagIds` prop
    MiniHeroCard.jsx          scales a real hero down for a directory grid
                              card (used by /clubs and /explore)
    ImageCarousel.jsx         3 photo carousels for blog/event posts with
    CoverflowCarousel.jsx     more than one image — Fade, Coverflow, Stack
    StackCarousel.jsx         respectively. See "Adding photos to an event
                              post" below (technical) or the live
                              docs/resources/adding-photos.mdx page
                              (plain-language, for non-technical editors)
    useCarouselAutoplay.js    shared autoplay/play-pause/reduced-motion/
                              pause-on-hover logic behind all 3 carousels'
                              `autoplay` prop — one place, not three
    LibraryHero.jsx           the Blog hero (student writing — a shelf still
                              being filled). Shares a shelf-of-books motif
                              with ArchivesHero but is a separate hero for a
                              separate page — don't conflate the two
    ArchivesHero.jsx          the Archives hero (the completed event
                              history) — lives on docs/resources/archives.mdx
    TeamSection.jsx           renders a club/fest's current board/committee
                              (name/role/photo?/contact?) — used on live
                              pages and permanent docs/archive/ snapshots
    contactIcons.jsx          ContactLink/InstagramIcon/LinkedinIcon shared
                              by ClubContact and TeamSection
    primitives/Book.jsx       shared visual primitive
    clubs/                    18 club hero components
    fests/                    fest hero components + FestSound
  data/
    teams/<slug>.mjs          one file per club/fest — CURRENT_TEAM array
                              consumed by TeamSection on that club/fest's
                              live page. `.mjs`, not `.js` — see "Leadership
                              rollover" below for why
    festMeta.mjs              per-fest label/description/icon, read only by
                              scripts/rollover.mjs when bootstrapping a
                              fest's first archive category
  pages/
    index.js                  homepage
    clubs.js                  /clubs — 18 club mini-hero cards
    fests.js                   /fests — 3 full-size fest heroes
    explore.js                 /explore — every hero + Events/Blog/Archives cards
    events.js                  /events — tag-filtered real-content feed
    student-voices.js          /student-voices — the Blog landing page (LibraryHero)
docs/
  intro.mdx                    "Docs" nav target — a real wiki overview, not
                                the stock Docusaurus tutorial (see
                                tutorial-reference/ below for that)
  clubs/<slug>/                one folder per club:
                                - index.mdx        the club page (hero at top)
                                - _category_.json  label/description/icon —
                                                   keep in sync with index.mdx
                                - events.mdx        thin ClubEventsList wrapper,
                                                   don't hand-edit its content
                                - contact.mdx       thin ClubContact wrapper —
                                                   a dedicated Contact page,
                                                   same data as index.mdx's
                                                   own inline Contact section
  fests/
  resources/
    archives.mdx                the Archives hero's doc page
    adding-photos.mdx           plain-language guide to in-body photos and
                              the 3 carousel components, for club leads
    feature-images.mdx           plain-language guide to the optional card-
                              thumbnail image, for club leads (new)
    team-photos.mdx               plain-language guide to replacing a team
                              member's placeholder photo with a real one,
                              for club leads (new)
  archive/<slug>/               one folder per club/fest that has ever been
                              rolled over: _category_.json + one
                              <year>-board.mdx or <year>-committee.mdx per
                              year. Never edited after creation. Bootstrapped
                              by scripts/rollover.mjs, not by hand
blog/
  YYYY-MM-DD-<event-slug>/    one folder per event, images co-located inside
static/
  admin/                       Decap CMS — structurally scaffolded (see
                              section 1); `config.yml`'s Events collection
                              works once a backend is wired up (still not —
                              see docs-internal/decap-cms-auth-todo.md);
                              club/fest pages deliberately NOT exposed here
  audio/                      fest/club audio files
  js/github-badge.js          navbar GitHub badge — date label + live star/fork
                              counts, loaded via docusaurus.config.js's
                              `scripts` array (see
                              docs-internal/archive/github-badge-guide.md)
  img/
tutorial-reference/           the stock Docusaurus classic-template tutorial
                              content, moved out of docs/ so it stops
                              cluttering the sidebar — not part of the live
                              site, not linked from anywhere
docs-internal/                 planning/decision docs about the project,
                              not site content — not part of the Docusaurus
                              build at all (outside docs/)
  leadership-rollover.md        maintainer-only rollover walkthrough —
                              deliberately not a public docs/resources/
                              page; running the script needs repo access
scripts/
  rollover.mjs                  snapshots an outgoing board/committee into
                              docs/archive/, resets src/data/teams/<slug>.mjs
                              — see "Leadership rollover" below
tests/e2e/                     Playwright suite — see TEST_REPORT.md and
                              this doc's "Developer setup" section
playwright.config.js
```

### Adding a new event post

Create `blog/YYYY-MM-DD-<event-name>/index.md` and put any images for that
post **in the same folder**. Never reference an image by an absolute path
(`/img/...`) from a blog post — always use a relative path to the co-located
file. This is what lets Docusaurus auto-compress images and keeps URLs stable
as the archive grows past 400 posts.

The blog isn't only for club-run events — **students can also write and
publish blog posts individually**, not on behalf of any club.

Every post needs a `tags:` field in its frontmatter, drawn from
`blog/tags.yml`:

```md
---
title: Stargazing Night — March Meetup
tags: [astronomy-club, talk]
---
```

- If the post is a club event, include that club's tag (e.g. `astronomy-club`)
  so it automatically appears both on that club's tag page
  (`/blog/tags/astronomy-club`) and on that club's own Events page
  (`/docs/clubs/astronomy-club/events`) — this is how a club's page can list
  its own events without any extra linking work. (A club's Events page shows
  "no events recorded yet" until at least one post carries its tag — that's
  expected, not a bug, while the archive is still being backfilled.)
- If it was part of a fest, add the fest's tag too (`tech-fest`,
  `general-fest`, or `cultural-fest`).
- Add one event-type tag if it fits: `workshop`, `competition`, `talk`,
  `screening`, `exhibition`, `performance`, `hackathon`.
- If it's an **individual student post with no club affiliation**, use the
  `student-voices` tag instead of a club tag.

Don't invent new tags ad hoc — add them to `blog/tags.yml` first so the tag
page gets a proper label and description.

**Where a post shows up depends on its tags, not its folder:** `/events`
(the "Events" nav item) only ever considers tags defined in `blog/tags.yml`
*other than* `student-voices` — a club tag, a fest tag, or an event-type tag.
`/student-voices` (the "Blog" nav item) considers every defined tag. A post
tagged only `student-voices` appears on Blog only; a post tagged
`astronomy-club, talk` appears on Events (and that club's own Events page)
but not Blog; a post carrying both a club tag and `student-voices` can appear
on both. Posts with tags that aren't in `blog/tags.yml` at all (e.g. the
leftover Docusaurus tutorial posts) never appear on either — that's the
filter working as intended, not a bug.

### Adding photos to an event post

**A single photo** — plain Markdown image syntax works exactly as you'd
expect, with a relative path to the co-located file:

```md
![Attendees setting up telescopes on the observatory roof](./telescope-setup.jpg)
```

Docusaurus finds and compresses this automatically because it's a real
Markdown image node, not a string.

**More than one photo** — use one of the three carousel components, all in
`src/components/`. **Not sure which one? See the live
["Adding Photos" guide](/docs/resources/adding-photos) for a plain-language,
non-technical walkthrough of each style, written for club leads, not
developers** — this section is the technical reference.

| Component | Style | Best for |
|---|---|---|
| `ImageCarousel` | Fade — one photo at a time, plain crossfade | The default choice; most accessible, least visually busy |
| `CoverflowCarousel` | Coverflow — several photos visible at once, tilted/scaled by distance from center | A fest recap, a "wall of photos" moment |
| `StackCarousel` | Stack — a draggable deck, swipe the top photo away to reveal the next | An informal, playful event recap |

All three share the same `images` prop shape (`{src, alt, caption?}[]`),
the same navigation primitives (prev/next buttons, drag-to-swipe using
Framer Motion's own built-in drag gesture system — `drag`,
`dragConstraints`, `onDragEnd`'s velocity/offset — rather than hand-rolled
touch listeners), and the same `prefers-reduced-motion` behavior: the slide
still changes on click/swipe (a deliberate user action), it just doesn't
animate — and autoplay (below) doesn't run at all.

**Autoplay** — pass `autoplay` (and optionally `autoplayInterval`,
milliseconds, default `4000`) to any of the three:

```jsx
<ImageCarousel autoplay autoplayInterval={5000} images={[...]} />
```

This adds a play/pause button automatically — required whenever content
moves on its own without the reader asking (WCAG 2.2.2, "Pause, Stop,
Hide"), so don't build a version without one. Autoplay also pauses
whenever the reader's mouse is over the carousel, and never runs at all
for `prefers-reduced-motion` visitors regardless of the prop — in that
case the play/pause button doesn't render either, since it wouldn't do
anything.

**Important — images must be `import`ed, not passed as bare path strings.**
The single-photo case above works because Docusaurus's Markdown processor
recognizes `![]()`/`<img>` syntax and rewrites the path for you. A custom
component like these just receives whatever you hand it as a prop — a
literal string like `'./photo.jpg'` is **not** resolved or copied by the
build and will 404. Import each image as a real ES module instead, the
same way you'd import an image in any other React file:

```md
---
title: Stargazing Night — March Meetup
tags: [astronomy-club, talk]
---

import photo1 from './telescope-setup.jpg';
import photo2 from './crowd-watching.jpg';
import photo3 from './saturn-through-the-lens.jpg';
import { ImageCarousel } from '@site/src/components/ImageCarousel';

<ImageCarousel autoplay images={[
  {src: photo1, alt: 'Setting up the telescopes on the observatory roof', caption: 'Setup, just after sunset'},
  {src: photo2, alt: 'A crowd gathered around the main telescope', caption: 'Queue for a look at Saturn'},
  {src: photo3, alt: 'Saturn and its rings, visible through the eyepiece'},
]} />

The Astronomy Club hosted...
```

Swap `ImageCarousel` for `CoverflowCarousel` or `StackCarousel` for a
different style — same `images` prop, same import, same `autoplay` flag.

`caption` is optional per image; `alt` isn't — always describe the photo
for screen readers, same as any other image on the web.

This works in plain `.md` blog posts, not just `.mdx` — Docusaurus's blog
plugin processes both as MDX by default, so `import` statements and JSX
work either way; you don't need to rename the file.

### Adding a feature image (card thumbnail) to a post

Separate from any photo inside the post body: an optional `image:`
frontmatter field sets the thumbnail shown wherever the post appears as a
*card* — the homepage Recent Activity section, that club's Events page,
and the sitewide Events/Blog feed. All three share one component,
`EventCard.jsx`, so setting this one field is all that's needed.

```md
---
title: Stargazing Night — March Meetup
tags: [astronomy-club, talk]
image: ./cover.jpg
---
```

Same co-located-file convention as any other post image — `cover.jpg`
lives directly in the post's own folder, next to `index.md`, never an
absolute `/img/...` path. Landscape photos (roughly 3:2/16:9) work best;
card thumbnails are small and wide, not tall. No feature image is required
— a post without one just renders as a plain text card, same as before
this existed. See the live [Adding a Feature
Image](/docs/resources/feature-images) guide for the non-technical,
CMS-first walkthrough.

Unlike `ImageCarousel`/`CoverflowCarousel`/`StackCarousel` above, this
path does **not** need an `import` statement — `club-events-plugin.js`
reads the frontmatter path directly and copies the file into
`static/img/_event-thumbnails/` itself at build time.

### Adding or editing a club page

Each club's page lives at `docs/clubs/<slug>/index.mdx` — a folder, not a
flat file. The hero component still goes at the top, same as before. Three
sibling files complete the folder and normally don't need touching beyond
keeping them in sync:

- `_category_.json` — `label`, `description`, and `customProps.icon`, copied
  from `index.mdx`'s own frontmatter. If you change the title, description,
  or icon on one, update the other to match, or the sidebar/generated-index
  card will show stale info.
- `events.mdx` — a thin wrapper (`<ClubEventsList clubSlug="<slug>" />`).
  Don't hand-edit its content; the list it shows comes from tagged blog
  posts (see "Adding a new event post" above), not from anything written
  directly in this file.
- `contact.mdx` — a thin wrapper (`<ClubContact clubSlug="<slug>" {...CLUB_CONTACTS['<slug>']} />`),
  giving the club a dedicated Contact page (`/docs/clubs/<slug>/contact`)
  alongside the same info already shown inline on `index.mdx`. To actually
  update a club's contact info, edit `src/data/clubContacts.js` — both this
  page and `index.mdx`'s inline section read from the same entry, so one
  edit updates both. A club with no `email`/`instagram`/`linkedin` set shows
  "No contact info published yet" rather than a blank page.

See the club table in the root `CLAUDE.md` for the correct slug and accent
name for each club.

### Leadership rollover (clubs & fests)

A club exec board or fest organisation committee changes every year. Unlike
event posts (permanently dated once published), a club/fest's live page
shows the *current* team — editing it in place for the new year would
silently destroy the previous team's record unless something snapshots it
first. The fix: snapshot the outgoing team into a permanent
`docs/archive/<slug>/<year>-board.mdx` (fests: `-committee.mdx`) file, then
reset `src/data/teams/<slug>.mjs` for the incoming team. Archive files are
never edited after creation.

**Using the script (preferred):**

```bash
npm run rollover -- club art-club 2025-26
npm run rollover -- fest tech-fest 2025-26
npm run rollover -- club art-club 2025-26 --dry-run   # preview, no writes
```

It validates the team data, refuses to overwrite an existing snapshot,
bootstraps `docs/archive/<slug>/_category_.json` the first time a slug is
rolled over, writes the year's snapshot `.mdx`, and resets
`src/data/teams/<slug>.mjs` to a fresh placeholder. See
`docs-internal/leadership-rollover.md` for the fuller walkthrough —
maintainer-only, not a public `docs/resources/` page, since running the
script needs repo access anyway.

**Manual fallback**, if the script isn't available or won't run:

1. Create `docs/archive/<slug>/<year>-board.mdx` (or `-committee.mdx` for a
   fest) by hand, frontmatter (**including an explicit `slug: <year>-board`/
   `-committee` field** — Docusaurus strips a leading `NNNN-word` pattern
   from a doc's default slug otherwise, silently dropping the year from the
   URL for a single-year `<year>` like `2026`; a year-range like `2025-26`
   is protected from this, but set `slug:` either way for safety) + a
   `<TeamSection clubSlug="<slug>" members={...} />` under a
   `## <year> Board` (or `Organisation Committee`) heading — copy an
   existing snapshot under `docs/archive/` as a template.
2. If `docs/archive/<slug>/` doesn't exist yet, also add a
   `_category_.json` (label/description/icon — copy the pattern from an
   existing one, e.g. `docs/archive/cultural-fest/_category_.json`).
3. Replace `src/data/teams/<slug>.mjs`'s `CURRENT_TEAM` with the incoming
   team's real names — copy another team file's placeholder shape
   (`name`/`role` mandatory, `photo`/`contact` optional) as a template. See
   the live [Adding a Team Member's Photo](/docs/resources/team-photos)
   guide for the photo field specifically.
4. `npm run build` to confirm nothing broke.

Why `.mjs`, not `.js`, for `src/data/teams/*.mjs`: the script is a
standalone `node scripts/rollover.mjs` process (not run through
Docusaurus's config loader), using Node's native `import()`. This
`package.json` has no `"type": "module"`, so plain `.js` is parsed as
CommonJS by default and throws on `export const` — `.mjs` is
unconditionally ESM regardless.

---

## 4. Working with the two shared systems

Every hero component is built on two hooks. **Don't reimplement their
behavior locally in a component** — extend the hook instead, so all 23 heroes
stay consistent.

```jsx
const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
const { accentStyle, accentName, isUnified } = useClubAccent('astronomy-club');
```

- `useIntroMotion` — plays the intro once on arrival, goes still once the
  reader scrolls/keys, and replays on **click/tap** (spread `hoverProps` on
  the hero's root element regardless of the name — it now wires `onClick`,
  not pointer-enter/leave). Hover-to-replay was tried and dropped: an
  incidental hover (trackpad drift, cursor passing through) stopped/replayed
  heroes the reader never meant to touch, and hover doesn't exist on touch
  devices anyway. Also respects `prefers-reduced-motion`. **Off-screen pause
  (`IntersectionObserver`) is not implemented yet** — heroes that loop
  (`repeat: Infinity` while `isPlaying`) keep animating even when scrolled
  out of view; this is deferred until after the homepage mini-hero cards
  land (see `docs-internal/animation-caveats.md` §9 and `changes.md`).
- `useClubAccent` — resolves the club's accent color, or the unified site
  color if the visitor has switched accent mode. Renders `per-club` on first
  paint to avoid a hydration mismatch.

Motion should come from what the club actually *does* (chess pieces moving,
brush strokes, telescope panning), not a generic spinning icon. If you're
adding a 24th hero, follow the pattern of an existing one in `src/components/clubs/`
rather than starting from scratch.

---

## 5. Design tokens and accessibility

All colors, type, spacing, and radii come from the `--ds-*` custom properties
defined in `src/css/custom.css` (ported from `scholar-design-system-hybrid (1).html`,
the source-of-truth spec — read it before adding new UI). **Never hardcode a
hex color in a component.** If a color you need isn't in the token set, add it
to the token file, not inline.

This site targets **WCAG 2.1 AA**. Concretely:

- Normal text needs **4.5:1** contrast against its background; large text
  (≥18.66px bold or ≥24px regular) needs **3:1**.
- Non-text UI boundaries (input borders, button edges, focus rings) need
  **3:1** against the adjacent color.
- Don't use color as the only signal for state (error/success/etc.) — pair it
  with text or an icon.
- Check any new color pair before using it. A quick way: relative-luminance
  contrast calculators are built into most browser DevTools color pickers, or
  ask whoever's doing the review to run the numbers.

Known example: the design-system spec originally had white text on
`--ds-secondary-500` (orange) for the "Secondary" button, which measured
2.63:1 — a real AA failure. It was moved to `--ds-secondary-700`, which
measures 5.46:1. See `changes.md` for the full record and for other contrast
issues found but not yet fixed (tertiary text color, semantic tag colors,
input border contrast) — check that list before you assume a token is safe to
reuse as-is.

---

## 6. Before opening a PR

- [ ] `npm run build` succeeds
- [ ] `npm run test:e2e` passes (add a test for what you changed if the
      suite doesn't already cover it)
- [ ] New/changed heroes: animate on load, go still on scroll, replay on
      **click/tap** (not hover — see §4), respect reduced motion
- [ ] Any random/non-deterministic value used during a hero's initial
      render (confetti-style layouts, etc.) uses a seeded PRNG, not
      `Math.random()`/`Date.now()` directly — those differ between SSR and
      client hydration and throw a React hydration-mismatch error. See
      `GeneralFestHero.jsx`'s `mulberry32` for the pattern.
- [ ] New colors are `--ds-*` tokens, not hardcoded hex, and meet the
      contrast rules above
- [ ] Blog images are co-located, not referenced by absolute path; images
      passed to `ImageCarousel` (or any component) are `import`ed, not
      passed as bare relative-path strings
- [ ] A post's feature `image:` frontmatter (if set) is a co-located
      relative path, same rule as body images
- [ ] New club added: `docs/clubs/<slug>/` has `index.mdx`, `_category_.json`,
      and `events.mdx` (copy an existing club's folder as a template)
- [ ] No new audio autoplays — audio is click-to-play only
- [ ] `/admin` still loads, if you touched CMS config (it can't save yet —
      see §1 — so there's no "test edit" to try until auth is wired up)
- [ ] If this was a leadership rollover, the outgoing team's data is in
      `docs/archive/<slug>/`, not still sitting in
      `src/data/teams/<slug>.mjs`

## 7. What requires explicit sign-off

Don't do these without checking with a maintainer first: pushing to `main`,
running `npm run deploy`, deleting branches, or changing anything under
`static/admin` that affects what club leads can edit. These are called out
directly in the root `CLAUDE.md`.
