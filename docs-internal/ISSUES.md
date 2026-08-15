# Open Issues — Master List

Every known outstanding issue across the project, in one place, ranked by
severity within each area. Each entry links to the doc with full detail —
this file is the scannable index, not the source of truth for any single
issue. Fixed items are left out entirely rather than marked done; see each
linked doc's own history for what's already resolved.

---

## Security

Full detail, exploit scenarios, and fixes: [`SECURITY-AUDIT.md`](SECURITY-AUDIT.md).

| # | Issue | Severity | Where |
|---|---|---|---|
| S1 | Path traversal → arbitrary file read via a blog post's `image:` frontmatter | **High** | `src/plugins/club-events-plugin.js`, `resolveImage()` |
| S2 | Decap CMS loaded from unpkg CDN with no Subresource Integrity, unpinned `^3.0.0` range | **Medium-High** | `static/admin/index.html` |
| S3 | OAuth `state` parameter generated but never validated on callback (CSRF) | **Medium** | `oauth-proxy/server.js` |
| S4 | No `.gitignore` in `oauth-proxy/` — real risk of committing `.env`/`node_modules` | **Medium** | `oauth-proxy/` (untracked directory) |
| S5 | CMS saves commit straight to `main`, no review/draft gate | **Medium** (by design — needs a deliberate decision) | `static/admin/config.yml` |
| S6 | Third-party OAuth error text reflected into an unescaped HTML response | **Low** | `oauth-proxy/server.js` line 70 |
| S7 | No security headers (CSP/HSTS/etc.) anywhere | **Low** (platform-limited on GitHub Pages; fixable at VPS migration) | sitewide |

---

## Hero animations

Full detail: [`HEROS-IMPROVEMENT-PLAN.md`](HEROS-IMPROVEMENT-PLAN.md) and
[`HEROS-AUDIT-CRITIQUE.md`](HEROS-AUDIT-CRITIQUE.md). P1s from that plan
(keyboard access, off-screen pause, `EntrepreneurshipHero` contrast,
unified-mode toggle UI) and the accent-contrast audit (item 5) are already
fixed — not relisted here.

| # | Issue | Severity | Where |
|---|---|---|---|
| H1 | No shared motion-token layer — every hero hand-authors its own durations/eases | **P2** | all 26 hero files |
| H2 | Fest heroes borrow unrelated clubs' accents (Tech Fest←Turingites, General←Art, Cultural←Theatre) instead of owning dedicated ones | **P2** | `TechFestHero.jsx`, `GeneralFestHero.jsx`, `CulturalFestHero.jsx` |
| H3 | Gaming Club's muncher color is a flagged, live trade-dress risk (explicitly overrode an earlier deliberate off-yellow choice) — needs a re-confirm now that this is a real public site | **P2** | `GamingHero.jsx` |
| H4 | Fashion Club's garment paths are the roughest hand-authored drawings in the set | **P2** | `FashionHero.jsx` |
| H5 | `ScienceHero`'s `offsetPath` orbit binding has no fallback for pre-2023 browsers | **P2** | `ScienceHero.jsx` |
| H6 | Literary Club's text reveal is a wipe, not a true pen-stroke trace (upgrade path already documented) | **P3** | `LiteraryHero.jsx` |
| H7 | Archives hero: pulled years are hardcoded (2024/25/26); wall is 12 spines vs. the real ~400-event count | **P3** | `ArchivesHero.jsx` |
| H8 | Dance Club's audio button is built and reverted, waiting on a real audio asset | **P3**, blocked on asset | `DanceHero.jsx` |
| H9 | No sound effects tied to animation beats (terminal keystrokes, confetti pop, camera shutter) — distinct from the background theme toggle that already exists | **P3**, blocked on assets | Tech Fest / General Fest / Photography |
| H10 | Responsive behavior at narrow viewports never verified live (no browser-automation tool was available for any audit this session) | **Unverified risk**, not confirmed | all 26 hero files — 22 of 26 have zero responsive (`sm:`/`md:`) classes |

---

## Tests / build

| # | Issue | Severity | Where |
|---|---|---|---|
| T1 | Navbar test expects 6 items; actual navbar has 8 (`Resources` and `Archive` predate this session, test fixture never updated to match) | **Pre-existing, unrelated to recent work** | `tests/e2e/navigation.spec.js` vs `docusaurus.config.js` |
| T2 | Two "Archive" links (navbar `Resources`-category link + footer's identical-labeled link) cause `getByRole('link', {name: 'Archive'})` strict-mode violations in 2 tests | **Pre-existing** | `tests/e2e/clubs-and-fests.spec.js`, `tests/e2e/leadership-rollover.spec.js` |
| T3 | FOSS Club's contact-page test fails: `@foss.saiu` Instagram link matches both the page's own `ClubContact` link and the footer's identical FOSS credit link | **Pre-existing** | `tests/e2e/clubs-and-fests.spec.js` |
| T4 | `build/clubs/index.html`'s static HTML output doesn't render any `MiniHeroCard` content server-side (only the wrapping `<Link>` and its `aria-label`) — confirmed via `git stash` A/B that this predates all of this session's work. Real browser visitors are unaffected (client-side hydration fills it in correctly) — this is an SEO/no-JS-crawler gap, not a user-facing bug | **Pre-existing, unconfirmed root cause** | `/clubs`, `/explore` static build output |

---

## Infra / deployment

| # | Issue | Severity | Where |
|---|---|---|---|
| I1 | Decap CMS backend not actually deployed — `base_url` in `config.yml` is still a placeholder, so production `/admin` loads but "Login with GitHub" fails | **Known, tracked** | `docs-internal/decap-cms-auth-todo.md`, `oauth-proxy/README.md` |
| I2 | VPS migration (`vps-hosting-plan.md`) is planning-only, nothing executed — site is still served from GitHub Pages today | **Known, tracked** | `vps-hosting-plan.md` |

---

## Suggested order if working through this list

1. **S1** (path traversal) — small, self-contained, real exploit path today.
2. **S4** (`oauth-proxy/.gitignore`) — one file, closes a landmine before that directory is ever committed.
3. **S2 + S3** — fix alongside the CMS backend deploy (I1), not necessarily before.
4. **T1–T3** — quick test-fixture fixes, unrelated to each other, all mechanical.
5. **H1–H5** — opportunistic, fold into whichever hero is next touched for another reason.
6. **H6–H9** — blocked on assets or low urgency; no forced schedule.
7. **T4, H10** — need a real browser/crawler check to even confirm scope; flagged, not yet actionable.
