# Test Report — Sai University Club & Event Wiki

Generated after building the site's first automated end-to-end test suite
(Playwright), run before starting the next checkpoint. All 57 tests pass,
verified stable across 3 consecutive full runs.

## How to run it

```bash
npm run test:e2e          # builds the site, then runs the suite
npm run test:e2e:report   # opens the last HTML report
```

Runs against the real production build (`docusaurus build` + `docusaurus
serve`), not the dev server — dev mode serves a near-empty CSR-only shell,
so testing the build is closer to what a real visitor gets and is what
`onBrokenLinks: 'throw'` already gates on. `npm run test:e2e` rebuilds
automatically (`pretest:e2e`); running `npx playwright test` directly
requires `build/` to already exist.

## Coverage summary (57 tests)

| File | Count | Covers |
|---|---|---|
| `docs.spec.js` | 21 | `/docs/intro` content + links, sidebar has no leftover tutorial entries, `/docs/resources/archives`, all 18 club doc pages + their `events` subpages |
| `navigation.spec.js` | 10 | Navbar item order/targets, footer "Wiki" column parity, footer GitHub/issue links, no premature Decap CMS link |
| `misc-routes-and-theme.spec.js` | 7 | All 3 fest doc pages, raw `/blog` still resolves, MoSAIc is the real Cultural Fest name, dark/light theme toggle (site + footer) |
| `events-and-blog.spec.js` | 6 | `/events` shows only the 28 real club/fest/event-type tags (never `student-voices`, never a student-only post), Clear/Select-all mechanics, `/student-voices` shows all 29 tags and links out correctly |
| `clubs-and-fests.spec.js` | 5 | `/clubs` renders all 18 mini-hero cards + working links, `/fests` renders all 3 fest heroes, no autoplaying audio |
| `hero-playback.spec.js` | 4 | The full `useIntroMotion` contract on Astronomy Club: plays on arrival, stops on scroll, replays on click, `prefers-reduced-motion` respected (and not overridden by a click) |
| `homepage.spec.js` | 3 | Homepage hero/stats/Recent Activity/Contribute render, CTA targets, no autoplaying audio |
| `explore.spec.js` | 1 | `/explore` renders all 18 club cards + 3 fest heroes + the Events/Blog/Archives icon cards with correct targets |

Every test also asserts **zero unexpected console/page errors** on the
routes it visits (a shared `trackConsoleErrors` helper filters out exactly
one already-documented, expected exception — see below).

## Real bugs found and fixed by this suite

Writing the tests surfaced two genuine site bugs, independent of the test
code itself:

1. **Hydration mismatch on `/fests` and `/explore`** (React error #418).
   `GeneralFestHero.jsx`'s confetti layout (`PIECES`) was generated with
   `Math.random()` at module scope, under a comment claiming this was
   "deterministic so SSR and client agree." That's not correct: the module
   evaluates twice per page load — once during server-side prerendering,
   once again in the browser during hydration — and `Math.random()`
   produces a different sequence each time it's *called*, not each time the
   *page* loads. Fixed by replacing it with a seeded PRNG (`mulberry32`,
   fixed seed), which produces byte-identical output on both evaluations.
   Confirmed fixed: the React error is gone from both routes across
   repeated runs.
2. **Confirmed correct, not a bug**: `/events`'s tag-filtered feed currently
   shows "No posts match the selected tags" regardless of which tags are
   selected, because the archive has zero posts carrying a real club/fest/
   event-type tag yet (only a leftover Docusaurus tutorial posts and one
   `student-voices`-only post exist). The relevant test was rewritten to
   check the Clear/Select-all buttons' actual checkbox mechanics rather
   than assuming visible content — the empty state is expected here until
   real events get backfilled and tagged.

## Test-infrastructure bugs found and fixed (not site bugs)

Several early failures (51 of 57 tests, on the very first run) turned out
to be problems with the test suite itself, not the site:

- **`baseURL` + leading-slash `page.goto()` silently lands on the wrong
  page.** `playwright.config.js`'s `baseURL` has its own path segment
  (`http://localhost:3100/collage-wiki-SAIU`, matching Docusaurus's
  `baseUrl`). Per WHATWG URL resolution, `page.goto('/clubs')` treats the
  leading `/` as absolute-from-origin, silently dropping `/collage-wiki-SAIU`
  and requesting `http://localhost:3100/clubs` instead — which the static
  server's SPA fallback served as the *homepage*, with a 200 status and no
  console errors, so a shallow status-only check couldn't tell the
  difference. Every `.spec.js` file's `page.goto()` calls were changed to
  drop the leading slash (`page.goto('clubs')`), and `baseURL` gained a
  trailing slash to make that resolve correctly. The navbar-link test was
  also strengthened to assert the resulting URL, not just a 200 status —
  the exact gap that let this hide in the first place.
- **A live third-party API call (the GitHub navbar badge) rate-limited
  itself under test parallelism.** `static/js/github-badge.js` fires a real
  `fetch('https://api.github.com/...')` on every page load; running dozens
  of page loads in parallel tripped GitHub's unauthenticated rate limit
  (403) within the run. Fixed with a `page.route` mock (`tests/e2e/base.js`)
  so every test gets a canned response instead of hitting the real API —
  makes the suite deterministic and stops it from hammering a third-party
  service as a side effect of testing.
- **Accessible-name collisions** on `getByRole('link', {name: ..., exact:
  true})` where the same label (e.g. "Clubs", "Blog", "GitHub") legitimately
  appears in the navbar, sidebar, footer, *and* body content at once —
  fixed by scoping those locators to `article`/`main`/`footer` as
  appropriate instead of searching the whole page.
- **Click on a `pointer-events-none` element.** The hero SVGs have
  `pointer-events-none` (the actual click handler lives on the parent div,
  per `useIntroMotion`'s `hoverProps`) — a real click there passes through
  to the div underneath, but Playwright's actionability check flags that as
  "intercepted." Fixed with `{force: true}`.
- **Screenshot-diff timing flakiness.** A single before/after pixel-hash
  pair can land on two identical frames by chance (e.g. both samples
  catching the same brief hold in a keyframe timeline), reporting "no
  motion" for a hero that's genuinely animating. Replaced with a
  multi-sample helper (6 samples over ~700ms, checks that *any* pair
  differs) — confirmed stable across 3 repeated full runs afterward.
- **The theme toggle is a 3-way cycle** (system → light → dark → system),
  not a simple on/off — starting from "system" (which resolves to "light"
  in this environment), one click just locks in "light" explicitly (no
  visible change), and it takes a second click to actually reach "dark".
  Fixed by clicking until `data-theme="dark"` is observed (capped at 3
  tries) instead of assuming one click suffices.

## Known, deliberate gaps (not tested — nothing to test yet)

- **Decap CMS** — no `/admin` UI existed when this suite was written.
  See `changes.md`'s Decap CMS entry for what's scaffolded and what a test
  should eventually cover.
- **Footer dino easter egg** — not built yet (`CP6`, still open).
- **Accent unified-mode toggle** — not built yet (`CP7a`, still open).
- **Off-screen `IntersectionObserver` pause** — not built yet (`CP7b`,
  still open); no test for it because there's no behavior to assert.
- Only Astronomy Club is covered by `hero-playback.spec.js`'s detailed
  playback-contract tests. The other 22 heroes share the same
  `useIntroMotion` hook and are covered by the lighter "renders with zero
  console errors" checks in `docs.spec.js`/`misc-routes-and-theme.spec.js`,
  but not the full play/stop/replay/reduced-motion sequence individually.
