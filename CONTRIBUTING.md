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
  shows up on that club's own Events page automatically.

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
    EventCard.jsx             one event's summary card (date/title/description)
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
    ImageCarousel.jsx         prev/next + dot-nav photo carousel for blog/
                              event posts with more than one image — see
                              "Adding photos to an event post" below
    LibraryHero.jsx           the Blog hero (student writing — a shelf still
                              being filled). Shares a shelf-of-books motif
                              with ArchivesHero but is a separate hero for a
                              separate page — don't conflate the two
    ArchivesHero.jsx          the Archives hero (the completed event
                              history) — lives on docs/resources/archives.mdx
    primitives/Book.jsx       shared visual primitive
    clubs/                    18 club hero components
    fests/                    fest hero components + FestSound
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
  fests/
  resources/
    archives.mdx                the Archives hero's doc page
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
                              `scripts` array (see github-badge-guide.md)
  img/
tutorial-reference/           the stock Docusaurus classic-template tutorial
                              content, moved out of docs/ so it stops
                              cluttering the sidebar — not part of the live
                              site, not linked from anywhere
docs-internal/                 planning/decision docs about the project,
                              not site content — not part of the Docusaurus
                              build at all (outside docs/)
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

**More than one photo** — use `ImageCarousel`
(`src/components/ImageCarousel.jsx`), a small Framer Motion component built
for exactly this: prev/next buttons, dot navigation, drag-to-swipe, and an
animated slide transition between photos. Swipe uses Framer Motion's own
built-in drag gesture system (`drag`, `dragConstraints`, `onDragEnd`'s
velocity/offset) rather than hand-rolled touch listeners — this is the
pattern Framer Motion's own docs demonstrate for swipeable carousels. It
respects `prefers-reduced-motion` the same way every hero does — the slide
still changes on click/swipe, it just doesn't animate.

**Important — images must be `import`ed, not passed as bare path strings.**
The single-photo case above works because Docusaurus's Markdown processor
recognizes `![]()`/`<img>` syntax and rewrites the path for you. A custom
component like `ImageCarousel` just receives whatever you hand it as a
prop — a literal string like `'./photo.jpg'` is **not** resolved or copied
by the build and will 404. Import each image as a real ES module instead,
the same way you'd import an image in any other React file:

```md
---
title: Stargazing Night — March Meetup
tags: [astronomy-club, talk]
---

import photo1 from './telescope-setup.jpg';
import photo2 from './crowd-watching.jpg';
import photo3 from './saturn-through-the-lens.jpg';
import { ImageCarousel } from '@site/src/components/ImageCarousel';

<ImageCarousel images={[
  {src: photo1, alt: 'Setting up the telescopes on the observatory roof', caption: 'Setup, just after sunset'},
  {src: photo2, alt: 'A crowd gathered around the main telescope', caption: 'Queue for a look at Saturn'},
  {src: photo3, alt: 'Saturn and its rings, visible through the eyepiece'},
]} />

The Astronomy Club hosted...
```

`caption` is optional per image; `alt` isn't — always describe the photo
for screen readers, same as any other image on the web.

This works in plain `.md` blog posts, not just `.mdx` — Docusaurus's blog
plugin processes both as MDX by default, so `import` statements and JSX
work either way; you don't need to rename the file.

### Adding or editing a club page

Each club's page lives at `docs/clubs/<slug>/index.mdx` — a folder, not a
flat file. The hero component still goes at the top, same as before. Two
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

See the club table in the root `CLAUDE.md` for the correct slug and accent
name for each club.

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
- [ ] New club added: `docs/clubs/<slug>/` has `index.mdx`, `_category_.json`,
      and `events.mdx` (copy an existing club's folder as a template)
- [ ] No new audio autoplays — audio is click-to-play only
- [ ] `/admin` still loads, if you touched CMS config (it can't save yet —
      see §1 — so there's no "test edit" to try until auth is wired up)

## 7. What requires explicit sign-off

Don't do these without checking with a maintainer first: pushing to `main`,
running `npm run deploy`, deleting branches, or changing anything under
`static/admin` that affects what club leads can edit. These are called out
directly in the root `CLAUDE.md`.
