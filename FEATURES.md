# Features

A feature-by-feature rundown of the Sai University Club & Event Wiki. For
directory layout see [`README.md`](README.md#structure); for how to build or
extend any of this, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Hero animations

- **26 custom animated hero components** — one per club (21), plus Library,
  Archives, and 3 fests. Each is built around the club's *actual activity*
  (a telescope for Astronomy, a paintbrush stroke for Art, a script page for
  Theatre, etc.) rather than a generic spinning icon.
- **Shared playback rule** (`useIntroMotion`) — every hero plays its intro once
  on page load, goes still on scroll/click/key/touch, and replays on pointer
  hover (not touch). Respects `prefers-reduced-motion` (skips the animation
  entirely; hover doesn't override it). Pauses off-screen heroes via a shared
  `IntersectionObserver` so a page with many heroes (like the club directory)
  isn't animating dozens of things the reader can't see.
- **Shared accent-color system** (`useClubAccent`, `clubAccents.js`) — each
  club has its own accent color, applied as CSS custom properties so it's a
  one-variable swap. A handful of heroes deliberately keep their own palette
  even in unified mode (Gaming's second ghost, Art's color cycle, Fashion's
  gold, fest palettes) because the color *is* the concept there.
- **Mini-hero cards** (`MiniHeroCard.jsx`) — scaled-down versions of the real
  heroes power the directory/homepage card grids, reusing the same hooks
  rather than a separate static-icon implementation.

## Club & fest pages

- 21 club pages (`docs/clubs/<slug>/`), each with an `index.mdx` (hero +
  overview), a dedicated `events.mdx` (that club's paginated event feed), and
  a `contact.mdx` page.
- 3 fest pages (`docs/fests/`) with their own hero components and optional
  click-to-play audio.
- **`ClubContact`** — a shared contact block (email, socials, physical
  location where applicable) driven by one data file (`clubContacts.js`) so
  every club's page stays in sync with a single source of truth.
- **`TeamSection`** — renders a club or fest's current board/committee, with
  placeholder photos until a real one is added (see the Team Photos guide).

## Homepage & directory

- Homepage recent-activity feed (`RecentActivity.jsx`) — the 5 most recent
  posts site-wide, any club or fest, with feature-image thumbnails where set.
- `/clubs`, `/fests`, `/explore` — directory pages built on the mini-hero
  grid, generated icons, and per-club accent colors.
- `/events` vs `/student-voices` (labeled "Blog" in the nav) — both powered by
  the same tag-filtering plugin and `TagFilteredEvents` component, but scoped
  differently: Events excludes student-voices-only and leftover tutorial
  posts; Blog shows everything, tag picker included.

## Events, blog & archive

- Event write-ups live in `blog/`, one folder per post, with images
  **co-located** next to the post so they never break as the archive grows
  (400+ events and counting).
- **`club-events-plugin.js`** — reads every post's frontmatter tags at build
  time and groups them by club/fest/event-type, powering each club's Events
  page, the sitewide Events/Blog feed, and the homepage Recent Activity list
  from one shared data source.
- **Event Archives** (`docs/resources/archives.mdx`, `ArchivesHero`) — the
  standing, permanent record behind the day-to-day Events feed.
- **Leadership rollover** (`scripts/rollover.mjs`) — snapshots a club or
  fest's outgoing board into `docs/archive/<slug>/<year>-board.mdx`, then
  resets the live team-data file to a fresh placeholder shape for the
  incoming board. Events stay tag-based in `blog/` (unaffected); only
  leadership boards get this yearly snapshot-then-reset treatment.

## Photos & media

- **Three photo carousels** (`ImageCarousel`, `CoverflowCarousel`,
  `StackCarousel`) — Fade, Coverflow, and Stack styles respectively, all
  sharing the same `images` prop shape, prev/next + drag-to-swipe navigation
  (Framer Motion's native drag gestures), and `prefers-reduced-motion`
  handling.
- **Autoplay** (`useCarouselAutoplay.js`) — optional on any of the three
  carousels, with a required play/pause button (WCAG 2.2.2), auto-pause on
  hover, and no autoplay at all under reduced motion.
- **Feature images** — an optional single thumbnail per post, shown on the
  homepage, that club's Events page, and the sitewide feed — separate from
  any photos inside the post body itself.
- Two tutorial docs per photo feature: a technical version in
  `CONTRIBUTING.md` and a plain-language version in `docs/resources/` for
  club leads with no coding background (adding photos, feature images, team
  photos).

## Content editing

- **Decap CMS** at `/admin` — a form-based editor for the Events collection
  (title, date, tags, description, feature image, body), so club leads can
  add event write-ups without touching Markdown or Git. Club/fest pages
  themselves are not yet exposed to the CMS (they're MDX with component
  imports the CMS's generic body widget would strip).
- **`docs/resources/`** — Adding Photos, Event Archives, Adding a Feature
  Image, Adding a Team Member's Photo — alphabetically ordered cards with
  icons, linked directly from the navbar and footer as "Resources" (and
  "Archive" links straight to the Event Archives page).

## Footer easter egg

- A hidden 🦖 icon at the very bottom of every page (in-flow, only found by
  scrolling all the way down — not a floating corner icon) opens the classic
  Chrome dino runner in a full-screen overlay. "charging trex..." tooltip on
  hover; click anywhere to close. The dino is green by default and recolors
  to the site's unified accent color when unified accent mode is on.

## Design system & accessibility

- Tailwind CSS + a custom design-token system (`--ds-*` tokens in
  `custom.css`), mapped onto Infima, with full light/dark ramps.
- Handwriting fonts (Caveat, Dancing Script, Great Vibes) for Literary Club
  and blog flourishes.
- Reduced-motion, hydration-safe rendering, and off-screen animation pausing
  are all handled once in the shared hooks, never re-implemented per hero.
- Audio never autoplays anywhere on the site — fest/club audio players are
  click-to-play only.

## Licensing

- **Dual license**, split across four files so GitHub's automatic license
  detector can name each one specifically instead of falling back to a
  generic label:
  - `LICENSE` — pure GPL-3.0 text, covering `src/`, `tests/`, and config
    files.
  - `COMMONS-CLAUSE.md` — the Commons Clause restriction (no commercial
    resale) layered on top of the GPL-3.0 code license.
  - `LICENSE-CREATIVE-COMMONS.md` — pure CC BY-NC-SA 4.0 text, covering
    `docs/`, `blog/`, `static/img/`, `static/audio/`.
  - `CONTENT-LICENSE-NOTE.md` — scope note and attribution for the content
    license, split out for the same GitHub-detection reason.
- Both `LICENSE` and `LICENSE-CREATIVE-COMMONS.md` are verified byte-for-byte
  identical to their official upstream sources (gnu.org, creativecommons.org).

## Testing & deployment

- **Playwright end-to-end suite** (`tests/e2e/`) covering navigation, all 18
  club pages, all 3 fest pages, the Events/Blog tag-filtering split, the full
  `useIntroMotion` playback contract, hero playback, the leadership rollover
  flow, theme toggling, and the footer dino easter egg.
- Deploys automatically to **GitHub Pages** via **GitHub Actions** on every
  push to `main`.

## Known gaps (tracked, not yet built)

- **Accent unified-mode toggle UI** — the `useClubAccent`/`useAccentMode`
  hooks and localStorage layer exist, but there's no settings control yet
  that actually calls `setAccentMode` to flip per-club ↔ unified mode.
- **Decap CMS auth backend** — `/admin` renders the Events form but has no
  auth wired up yet, so it can't actually save a change (see
  `docs-internal/decap-cms-auth-todo.md`). Content edits currently go through
  a developer via PR.
- Club/fest pages aren't editable via the CMS (see "Content editing" above).
