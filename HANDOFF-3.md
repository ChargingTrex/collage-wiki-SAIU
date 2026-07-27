# HANDOFF-3: Sai University Club & Event Wiki — Docusaurus Build

## 1. Project & Objective

Docusaurus v3 wiki for Sai University, Chennai: 18 student clubs, 3 annual
fests, 400+ archived events, hosted free on GitHub Pages, editable by
non-technical club leads via Decap CMS at `/admin` (auth still deferred to
CP5). Signature feature: 23 custom animated hero components (18 clubs +
Library + Archives + 3 fests), each built around the club/fest's *actual
activity*, governed by two shared systems: `useIntroMotion` (playback rule)
and `useClubAccent` (per-club accent color).

Repo (pushed, live): `https://github.com/ChargingTrex/collage-wiki-SAIU`
Local path: `/Users/it/Documents/collage wiki`
Plan file: `/Users/it/.claude/plans/push-to-https-github-com-chargingtrex-co-spicy-star.md`
Prior handoffs: `HANDOFF-1.md`, `HANDOFF-2.md` (this doc continues from CP4 work).

## 2. Key Decisions / Constraints (locked, don't relitigate)

- **Framer Motion primary**; `motion.css`/`motion.js` fallback layer.
  **Tailwind required, Shadcn removed.** Design system = Scholar hybrid
  `--ds-*` tokens (primary `#3b6af5`, secondary `#f77f0e`, accent `#218A5E`).
- **Playback model changed this session: click/tap toggle, NOT hover.**
  Original spec was hover-to-replay; user explicitly rejected it ("remove
  hover to play as its causing the hero to stop even if i just touch by
  mistake") — incidental trackpad/touch drift was replaying heroes
  unintentionally. `isHovered` renamed to `isReplaying` across all 23 heroes.
  This is locked; do not reintroduce hover-replay.
- **`playOnVisible` opt-in added to `useIntroMotion`** for below-the-fold
  heroes (used by the 3 fest heroes only): `IntersectionObserver` gated on
  `entry.intersectionRatio >= 0.3` (NOT `isIntersecting` alone — that fires on
  any 1px overlap), with a 250ms setup delay to dodge a false-positive
  visibility reading caused by webfont-swap reflow just after mount.
- **Homepage/Clubs structural split** (diverges from the original single-page
  plan; confirmed with user via AskUserQuestion): lean `/` homepage (hero,
  stats, about, fests, contribute) + separate `/clubs` directory page (18
  mini-hero cards — real heroes scaled via CSS `transform`, not
  reimplemented) + separate `/fests` page (3 full-size fest heroes). The
  `/clubs` intro copy sits **above** the grid per explicit instruction.
- **Fests now have their own `docs/fests/*.mdx` pages**, mirroring
  `docs/clubs/`. Cultural Fest's real name is **MoSAIc** (was placeholder
  "VIBRANCE 2026"). Cultural Fest's icon-ring animation was enlarged
  (stage/ring/icons all scaled up); General Fest was reworked from "too
  plain" to include ambient glow blobs, a radial spotlight, a border, a
  bigger icon, and denser/wider-spread confetti; Tech Fest's scramble-text
  bug (last character never resolving) was fixed.
- **Nav/footer: "Events" vs "Blog" are deliberately distinct**, confirmed via
  AskUserQuestion — user's words: "blogs will show only student voices posts
  ,where as eents will show all the fests,clubs and general events". Events
  → `/blog` (full archive). Blog → `/blog/tags/student-voices` (individual
  student posts only, via the `student-voices` tag). A placeholder post
  (`blog/2026-07-28-student-voices-placeholder/`) exists solely so that tag
  page isn't a 404 (a zero-post tag generates NO page at all) — replace/
  delete once real student posts exist.
- **Homepage "sidebar" = floating icon quick-jump menu button**, confirmed via
  AskUserQuestion (not a docs-style permanent sidebar). Not yet built.
- **GitHub badge** keeps GitHub's authentic dark/gray styling (explicit user
  choice over re-skinning to site palette).
- **Social links are placeholders** — `PLACEHOLDER_LINKEDIN_URL`,
  `PLACEHOLDER_INSTAGRAM_URL`, `PLACEHOLDER_EMAIL` in
  `src/theme/Footer/index.js` (grep `PLACEHOLDER` to find/replace later).
- **A concurrent, independent session is also actively editing this repo**
  (built `ClubContact.jsx`/`clubContacts.js`, per-doc sidebar icons via
  swizzled `DocSidebarItem/Link`, `DocCard/Heading/Icon`). Nothing has been
  committed all session — deliberately holding off so their in-flight work
  isn't bundled/clobbered without asking. Last commit remains `d2c9967`.

## 3. Tech Stack / File Structure

```
docusaurus.config.js       navbar: Clubs/Fests/Docs/Events/Blog + GitHub badge (html item)
                            footer: Wiki(Clubs,Fests,Docs,Events,Blog) / More(GitHub,issue)
                            scripts: static/js/github-badge.js
                            onBrokenLinks: 'throw'
src/
  css/custom.css           --ds-* tokens, accent bridge, footer/badge/mini-hero-card CSS
                            (footer dark/light now literal hex, NOT --ds-neutral-* ramp —
                             that ramp is deliberately inverted under [data-theme='dark']
                             elsewhere in the file, so reusing it for footer picked the
                             wrong end; fixed with explicit hex per theme)
  theme/Footer/index.js    swizzled --wrap; contact icon row (LinkedIn/Insta/mail/GitHub/bug)
  theme/DocSidebarItem/Link/  swizzled (NOT mine — other session's per-doc sidebar icons)
  components/
    useIntroMotion.js      click-to-play toggle + playOnVisible opt-in (see §2)
    useClubAccent.js, clubAccents.js
    MiniHeroCard.jsx       SOURCE_WIDTH=560, SCALE=0.68; scales real hero via CSS
                            transform for grid cards; wrapper has pointer-events:none
                            so the outer Link is the sole click target
    clubs/*.jsx (18), fests/*.jsx (3: Tech/General/Cultural), primitives/Book.jsx
  data/
    clubDirectory.js       slug->{name,Hero} for /clubs grid (18 entries, mine)
    clubContacts.js, sidebarIcons.js   (other session's)
  pages/
    index.js               homepage (hero/about/fests/contribute)
    clubs.js                /clubs — 18 mini-hero cards, intro copy above grid
    fests.js                /fests — 3 full-size fest heroes + "View X →" links
docs/clubs/*.mdx (18, each now has other session's <ClubContact>)
docs/fests/*.mdx (3: tech-fest, general-fest, cultural-fest) + _category_.json
blog/                       tutorial placeholders + 1 real placeholder
                            (2026-07-28-student-voices-placeholder/)
static/js/github-badge.js, static/audio/ (empty, no real audio files supplied yet)
```

Known real bugs fixed this session:
- **IntersectionObserver misconception**: `entry.isIntersecting` is true for
  ANY overlap, not "at least `threshold`" — must check `intersectionRatio`
  explicitly (see `useIntroMotion.js` comment).
- **Webfont-reflow false positive**: the observer's very first callback (if
  started immediately on mount) can catch a pre-font-swap layout where a
  below-the-fold hero briefly measures as more visible than its true settled
  position — fixed with a 250ms delay before starting the observer.
- **TechFestHero scramble bug**: the interval built the display string, THEN
  incremented `frame`/`locked` and checked to clear — so the tick that
  finally reached the target length used the previous (still-one-short)
  `locked` value, and the last character never resolved. Fixed by advancing
  counters before building the string each tick.
- **CSS comment self-closing bug**: a comment containing the literal text
  `--ds-*/--club-accent` had its `*/` close the CSS comment early, corrupting
  everything parsed after it. Fixed by rewording.
- **Footer frozen dark regardless of theme toggle**: `footer.style: 'dark'`
  in config forces Infima's static dark variant, unrelated to the site's
  light/dark toggle — removed, replaced with `[data-theme]`-scoped custom
  properties (see custom.css note above).
- **`student-voices` tag page 404**: a custom `permalink` field in
  `tags.yml` does NOT change the generated route in this setup — the real
  route is the default `/blog/tags/student-voices`. Also, a tag with zero
  posts generates no page at all.

## 4. Current State (exactly where this session left off)

- Navbar: `Clubs | Fests | Docs | Events | Blog` + GitHub badge, confirmed
  rendering with zero console errors (Playwright-verified on port 3005 after
  a clean restart). Footer "Wiki" column updated to match — config change
  confirmed compiling, but the actual rendered footer was NOT re-screenshotted
  after the last restart (only the navbar was explicitly re-verified).
- Two dev servers were running in parallel this session (3000 = the other,
  concurrent session; 3005 = mine) — both had Rspack persistent-cache panics
  from concurrent cache writes to the same `node_modules/.cache/rspack`;
  fixed each time via `rm -rf node_modules/.cache/rspack .docusaurus` + clean
  restart of both.
- `npm run build` passed earlier in the session. **Nothing committed or
  pushed** — substantial uncommitted work (CP4 homepage/clubs split, fest
  hero fixes, navbar/footer, GitHub badge, footer contact icons) is sitting
  staged/unstaged pending a decision on how to handle the concurrent
  session's own in-flight files.
- `changes.md` has two dated entries appended this session documenting the
  above in full (GitHub badge/footer work, and the CP4 homepage/clubs/fests
  split), both explicitly noting the uncommitted state.

## 5. Immediate Next Steps

1. **In progress right now**: an "Explore" page (`/explore`) combining ALL 23
   heroes (18 club mini-cards, same pattern as `/clubs`, plus the 3 fest
   heroes) plus two additional non-hero cards with icons: "Blog" (→
   `/blog/tags/student-voices`) and "Archive" (→ an archive page that does
   **not yet exist** — `ArchivesHero.jsx` exists as a component but has no
   `docs/*.mdx` wiring yet, same gap noted for the `/clubs` page's unlinked
   Archives reference). Building the Archive doc page is a prerequisite for
   linking to it under `onBrokenLinks: 'throw'`.
2. Floating icon quick-jump menu button for the homepage — confirmed desired
   shape via AskUserQuestion, not yet built.
3. `IntersectionObserver` off-screen pause for looping heroes on
   many-heroes-at-once pages (`/clubs`, `/explore`) — repeatedly deferred,
   worth reconsidering now that `/explore` will mount up to 21 heroes at once.
4. Decide with the user how/when to commit the large amount of uncommitted
   work given the concurrent session's parallel edits to the same files
   (`docusaurus.config.js` navbar/footer entries layered on top of each
   other so far without apparent conflict).
5. Reconsider whether `/docs/intro` (leftover Docusaurus tutorial page) is
   really the best "Docs" nav destination, or whether a purpose-built docs
   landing page should replace it.
6. Real social URLs/email, real audio files, real student-voices posts, and
   Decap CMS auth (CP5) all remain outstanding placeholders.
