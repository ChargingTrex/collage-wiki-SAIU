# HANDOFF-4: Sai University Club & Event Wiki — Docusaurus Build

## 1. Project & Objective

Docusaurus v3 wiki for Sai University, Chennai: 18 student clubs, 3 annual
fests, 400+ archived events. **Now live and public**:
`https://chargingtrex.github.io/collage-wiki-SAIU/`. Repo:
`https://github.com/ChargingTrex/collage-wiki-SAIU` (public since CP8).
Local path: `/Users/it/Documents/collage wiki`.

Signature feature: 23 custom animated hero components (18 clubs + Library +
Archives + 3 fests), each built around the club/fest's *actual activity*,
governed by two shared systems (`useIntroMotion`, `useClubAccent`). Editable
by non-technical club leads via Decap CMS at `/admin` (structurally
scaffolded, auth NOT wired yet — see §5).

Prior handoffs: `HANDOFF-1.md`/`HANDOFF-2.md`/`HANDOFF-3.md` — now archived
in `docs-internal/archive/` (gitignored, local-only, not in the public
repo). This doc supersedes them; read it, not them.

Build proceeds one checkpoint at a time (CP0–CP8). **Status: CP0–CP6 and
CP8 done. CP7a and CP7b are the only build-plan items still open.**

## 2. Key Decisions / Constraints (locked, don't relitigate)

- **Framer Motion primary**; `motion.css`/`motion.js` fallback (neither
  file exists — not needed so far). Design system = Scholar hybrid
  `--ds-*` tokens (primary `#3b6af5`, secondary `#f77f0e`, accent
  `#218A5E`/green). Tailwind required, Shadcn removed.
- **useIntroMotion: click/tap to replay, NOT hover.** Hover was tried and
  explicitly rejected (incidental trackpad/touch drift caused unwanted
  replays). `playOnVisible` opt-in exists for below-the-fold heroes
  (fest heroes use it) via `IntersectionObserver` + a 250ms startup delay
  (avoids a false-positive visibility read during webfont-swap reflow).
- **Library vs. Archives are separate heroes, not duplicates.** Both share
  a shelf-of-books visual motif deliberately, but: `LibraryHero` = the
  **Blog** hero (individual student writing, `/student-voices`);
  `ArchivesHero` = the **Archives** hero (completed event history,
  `/docs/resources/archives`). Don't conflate them.
- **Events vs. Blog nav split is deliberate**, confirmed via explicit
  back-and-forth: **Events** (`/events`, custom page) = real content only —
  every tag in `blog/tags.yml` *except* `student-voices` (28 tags: 18
  clubs + 3 fests + 7 event-types). **Blog** (`/student-voices`, custom
  page with `LibraryHero`) = all 29 tags, is where individual student
  writing lives. A post can appear on both if it carries both a club tag
  and `student-voices`. Neither page points at Docusaurus's raw
  `/blog`/`/blog/tags/*` routes directly (those still exist underneath,
  just not the nav targets).
- **Homepage structure evolved mid-session**: a concurrent collaborator
  session replaced the original homepage fest-hero showcase with
  `RecentActivity` (5 most recent posts sitewide, via `club-events-plugin`).
  Mini-hero grid moved to `/clubs`; fest heroes live on `/fests`,
  `/explore`, and their own `docs/fests/*.mdx` pages.
- **Decap CMS: only the Events collection is exposed**, deliberately.
  Club/fest pages (`docs/clubs/*`, `docs/fests/*`) are MDX with
  hero-component imports (`<ClubContact>`, hero JSX) — Decap CMS
  collections replace a file's *entire* frontmatter+body with only what's
  in the field config, so a generic body widget would silently strip those
  imports. Needs a content-model change (prose pulled into plain
  frontmatter fields) before it's safe, not just a CMS-config change.
- **GitHub Pages hosting is locked in** (not Netlify) — this resolves
  `docs-internal/decap-cms-auth-todo.md`'s hosting fork in favor of
  **Option A: GitHub backend + OAuth-proxy** (Option B/Netlify Identity is
  no longer viable since the site itself deploys via GitHub Pages).
- **Public repo, history left as-is.** Repo made public for CP8. A private
  mirror (`ChargingTrex/collage-wiki-SAIU-archive`) was taken first and
  verified commit-identical. When asked whether old planning docs visible
  in past commits should be scrubbed from history, the explicit decision
  was **leave history as-is** (not secrets, not worth a force-push
  rewrite) — only *current* tracking changed (see next point).
- **`docs-internal/archive/` and two loose root files are gitignored, not
  deleted.** `HANDOFF-1/2/3.md`, old `animation-caveats (1)/(2).md` drafts,
  `club homepage.md`, `homepage-content.md`, the theme-toggle doc, plus
  `prompt library.md` and a duplicate motion-guide file — all exist
  **locally on disk only**, untracked (`git rm --cached` + `.gitignore`
  entries), never `git rm`'d outright. **Hard lesson from a real mistake
  this session**: `git rm` deletes from disk too, not just from tracking —
  two files got genuinely deleted by mistake, had to be restored from git
  history (`git show <parent-commit>:<path> > <path>`) and re-added to
  `.gitignore` instead. Always use `git rm --cached` when the goal is
  "stop tracking," never plain `git rm`.
  `docs-internal/animation-caveats.md` and
  `docs-internal/decap-cms-auth-todo.md` **stay tracked** — actively cited
  from `CLAUDE.md`/`CONTRIBUTING.md`, needed by a fresh clone.
- **Three carousel components, not one, sharing one `images`/`autoplay`
  prop shape**: `ImageCarousel` (Fade — plain crossfade, most accessible,
  the default), `CoverflowCarousel` (3D coverflow, adapted from
  `sai-uni-wiki-motion-guide.md` §5), `StackCarousel` (a draggable
  Tinder-style deck, not in any source doc — added specifically because 3
  distinct types were requested and it's a well-known, officially-
  documented Framer Motion pattern in its own right). All three: images
  must be `import`ed as ES modules, never passed as bare path strings
  (Docusaurus's Markdown processor only resolves paths inside real
  `![]()`/`<img>` syntax, not arbitrary component props — confirmed this
  fails with a 404 before documenting the correct pattern). Swipe uses
  Framer's own built-in drag gesture system (`drag`, `dragConstraints`,
  `onDragEnd` velocity/offset), not hand-rolled touch listeners.
- **Autoplay is a shared hook** (`useCarouselAutoplay.js`), not
  per-component: play/pause state, the interval, a hard
  `prefers-reduced-motion` gate (autoplay never runs at all for those
  visitors, and the pause button doesn't even render), and pause-on-hover.
  A visible pause/play toggle is mandatory whenever autoplay is on (WCAG
  2.2.2) — every carousel using the hook renders one automatically.
- **Non-technical documentation lives on the live site, not in
  `docs-internal/`.** `docs/resources/adding-photos.mdx` was almost
  written into `docs-internal/` before catching that the whole point of
  that folder is "not part of the build" — exactly wrong for something a
  non-technical club lead needs to actually find. Real pages under
  `docs/resources/` are the right home for anything club-lead-facing.

## 3. Tech Stack / File Structure

```
docusaurus.config.js   navbar: Explore, Clubs, Fests, Docs, Events, Blog + GitHub badge
                        footer: Wiki(same 6) / More(GitHub, issue)
                        onBrokenLinks: 'throw'; url/baseUrl match GH Pages exactly
                        plugins: tailwind, club-events-plugin,
                        @docusaurus/plugin-ideal-image (responsive/lazy/blur
                        for in-body markdown images, zero content changes)
.github/workflows/deploy.yml   GitHub Actions -> Pages (upload-pages-artifact +
                        deploy-pages), triggers on push to main + workflow_dispatch
playwright.config.js   e2e suite runs against the PRODUCTION build (docusaurus
                        serve), not dev server; baseURL needs a TRAILING SLASH
                        (WHATWG URL resolution gotcha — page.goto('/x') vs 'x')
package.json            scripts: build, serve, test:e2e (builds first via
                        pretest:e2e), test:e2e:report
tests/e2e/              63 Playwright tests across 9 spec files — see
                        TEST_REPORT.md for full coverage table
src/
  css/custom.css        --ds-* tokens, accent bridge, footer/dino/mini-hero CSS
  plugins/club-events-plugin.js   reads blog/**/*.md frontmatter at build time,
                        groups by tag -> {posts, postsByTag, tagsMeta} via
                        usePluginData('club-events-plugin'). Also resolves
                        each post's optional image: frontmatter to a real
                        URL, copying co-located files into
                        static/img/_event-thumbnails/<post-folder>/
  theme/
    Footer/index.js     swizzled --wrap: contact icons row + hidden 🦖 dino
                        easter egg (in-flow at bottom, NOT floating). Tints via
                        mix-blend-mode:color (NOT CSS filter — filter flattened
                        the whole grayscale canvas to one solid block)
    DocSidebarItem/Link/, DocSidebarItem/Category/, DocCard/Heading/Icon/
                        ejected — render a lucide icon from a doc's
                        sidebar_custom_props.icon frontmatter (works identically
                        for flat docs and category folders)
  components/
    useIntroMotion.js   click-to-play + playOnVisible opt-in
    useClubAccent.js    useClubAccent(slug) + useAccentMode() -> {mode,
                        setAccentMode}; mode is 'per-club'|'unified', persisted
                        to localStorage key 'sai-wiki-accent-mode'
    TagFilteredEvents.jsx   tag picker + feed, powers /events (tagIds=28,
                        excludes student-voices) and /student-voices (all 29)
    MiniHeroCard.jsx, LibraryHero.jsx, ArchivesHero.jsx, clubs/*.jsx (18),
    fests/*.jsx (3), EventCard.jsx (now renders an optional feature-image
    thumbnail via @theme/IdealImage), ClubEventsList.jsx, RecentActivity.jsx,
    useLoadMore.js, ClubContact.jsx, ImageCarousel.jsx, CoverflowCarousel.jsx,
    StackCarousel.jsx, useCarouselAutoplay.js
  data/clubDirectory.js, clubContacts.js, sidebarIcons.js (SIDEBAR_ICONS map
                        + slugFromHref helper)
  pages/index.js, clubs.js, fests.js, explore.js, events.js, student-voices.js
docs/
  intro.mdx             "Docs" nav target — REAL wiki overview (not stock
                        Docusaurus tutorial, which lives in tutorial-reference/
                        at repo root now, outside docs/ entirely)
  clubs/<slug>/          index.mdx + _category_.json + events.mdx per club
  fests/*.mdx (3)        each has sidebar_custom_props.icon now (Rocket/
                        PartyPopper/Music) — cards on /docs/category/fests
  resources/archives.mdx   sidebar_custom_props.icon: Archive
  resources/adding-photos.mdx   club-lead guide: in-body photos + carousels
  resources/feature-images.mdx  club-lead guide: card-thumbnail image (new)
blog/                   YYYY-MM-DD-<slug>/index.md, tags from blog/tags.yml
static/admin/           config.yml (real, "Events" collection wired) +
                        index.html — Decap CMS, NOT yet authenticated
docs-internal/          animation-caveats.md, decap-cms-auth-todo.md (tracked)
                        + archive/ (gitignored, local-only)
```

## 4. Current State (exactly where this left off)

- **Live and deployed.** Every push to `main` auto-triggers the Actions
  workflow; last several runs all green (build ~30–46s, deploy ~10s).
  Verified via real HTTP + Playwright: `/`, `/blog`, `/clubs`, `/fests`,
  `/explore`, `/events`, `/student-voices` all 200; a deep link
  (`/docs/clubs/art-club/events`) survives a hard refresh; unknown paths
  hit the real 404 page; GitHub navbar badge shows real star/fork counts
  (repo is public now, no more placeholder `—`).
- **Last pushed commit: `40610a3`** ("Add autoplay + 2 more carousel
  types..."). Everything through and including the three carousel
  components, the shared autoplay hook, and both carousel tutorial docs
  (technical + non-technical) is committed and pushed. `63/63` e2e tests
  passing on that commit, verified stable.
- **Uncommitted right now** (a concurrent collaborator session's
  in-progress work, sitting in the working tree alongside this one — not
  authored here, left alone rather than bundled into any commit from this
  session): card thumbnails ("feature images") for Recent Activity/Events/
  Blog list cards. `docusaurus.config.js`/`package.json` (new
  `@docusaurus/plugin-ideal-image` dependency), `static/admin/config.yml`
  (new Feature Image CMS field), `src/plugins/club-events-plugin.js`
  (resolves a post's optional `image:` frontmatter, copying co-located
  files into `static/img/_event-thumbnails/`), `src/components/
  EventCard.jsx` (renders it via `@theme/IdealImage`), new
  `docs/resources/feature-images.mdx` tutorial, and a real `image:` line
  added to the one genuinely-authored post (`stop-asking-ai-for-answers`)
  as a live test case.
- **This uncommitted feature-image work has now been verified against the
  full stack**: both `npm run build` and the full Playwright suite
  (`npx playwright test`, all 63) were re-run against the current working
  tree (carousels + feature-images together) specifically to close out
  the "not yet re-run against Playwright" gap the other session's own
  `changes.md` entry flagged — **63/63 still pass** with both bodies of
  work present. No new spec was added for feature-images specifically
  (not this session's work to test); this was a verification pass, not new
  test authorship.
- Two small cross-reference/consistency fixes made to the non-technical
  docs while reconciling both sessions' work: `docs/resources/
  adding-photos.mdx` (carousels) now links to `docs/resources/
  feature-images.mdx` and vice versa, so a club lead landing on the wrong
  one of the two (easy to conflate — both are "put an image on a post")
  finds their way to the right page.
- Earlier this session (still part of the pushed `40610a3` and before):
  added `sidebar_custom_props.icon` to the 3 fest docs and the Archives
  doc, matching the existing per-club icon pattern — `/docs/category/
  fests` and `/docs/category/resources` show real lucide icons on their
  cards (and sidebar) instead of generic file icons.
- **Earlier fix, also already pushed**: two files (`prompt library.md`, a
  duplicate motion-guide file) were accidentally hard-deleted via plain
  `git rm` during the CP8 cleanup, when the actual intent was just to
  untrack them. Restored to disk from git history, `.gitignore`'d
  properly this time.

## 5. Immediate Next Steps / Open Tasks

In rough priority order:

0. **Commit the feature-image work** described above (not this session's
   to commit unilaterally — it's a concurrent collaborator's in-progress
   changes) — now verified (build + full e2e suite both green against the
   combined working tree), so it should be safe to commit and push once
   whoever's driving it is ready. Consider a dedicated
   `tests/e2e/feature-images.spec.js` at that point, since none exists yet.
1. **CP7a — Accent unified-mode toggle UI.** The hook/localStorage layer
   (`useAccentMode`, `setAccentMode`) fully exists and works (verified via
   the dino easter egg's tint, which already responds correctly to the
   `sai-wiki-accent-mode` localStorage key) — **nothing calls
   `setAccentMode` from any UI control yet.** Needs a settings toggle
   (navbar item or settings page) that flips per-club ↔ unified and
   persists. This is explicitly called out in `CLAUDE.md` as the
   highest-priority remaining infra task.
2. **CP7b — Off-screen `IntersectionObserver` pause.** Looping heroes
   (`repeat: Infinity`) keep animating when scrolled out of view — wasteful
   on pages with many heroes at once (`/clubs`, `/explore` now mount up to
   18–21 heroes simultaneously, more than when this was last deferred).
   Add the observer **once inside `useIntroMotion`**, not per component.
3. **Decap CMS OAuth-proxy** (the one concrete item left in
   `docs-internal/decap-cms-auth-todo.md`, now that hosting is settled on
   GitHub Pages/Option A): stand up a small OAuth-proxy service (Cloudflare
   Worker / Vercel function / small Node service) implementing Decap's
   GitHub OAuth handshake; wire `base_url`/`auth_endpoint` into
   `static/admin/config.yml`'s `backend:` block; re-enable the
   commented-out Decap CMS link in `docusaurus.config.js`'s footer once it
   actually works.
4. **Club/fest MDX CMS-editing gap** — separate from #3, a content-model
   problem: club/fest pages can't be safely exposed to Decap CMS until
   their prose is pulled out of hand-written MDX (with hero imports) into
   plain frontmatter fields the JSX reads from.
5. **Real content backfill** — the event archive currently has **zero**
   posts with real club/fest/event-type tags (only tutorial-scaffold posts
   and one genuine `student-voices` post exist), so `/events` shows an
   empty state regardless of tag selection. This is expected/documented,
   not a bug, but is the next real content task once infra work above is
   done.
6. **Real social links** — `PLACEHOLDER_LINKEDIN_URL`,
   `PLACEHOLDER_INSTAGRAM_URL`, `PLACEHOLDER_EMAIL` in
   `src/theme/Footer/index.js` still need Sai University's actual URLs
   (grep `PLACEHOLDER`).
7. Real fest/club audio files still need to be supplied (`static/audio/`
   is currently empty/`.gitkeep` only) — nothing autoplays either way, this
   just means the sound-toggle buttons currently have nothing to play.

Not blocking, just worth knowing: `blog/authors.yml` is still Docusaurus
tutorial placeholder authors (Yangshun Tay, Sébastien Lorber) — needs real
club accounts / a way to represent individual student authors.
