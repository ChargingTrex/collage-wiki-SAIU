# VPS hosting plan — self-hosted site, GitHub stays the content source

**Status: production target confirmed as a Hostinger VPS (provided by the
dean's office); the VPS itself not provisioned/reachable yet, but more of
the repo-side work is now built ahead of it than before.** Written because
the university (via the dean's office) has provisioned a VPS for hosting
this site. The VPS is **administered by someone else** (university IT) —
this repo has no SSH access to it and can't stand anything up directly.
This doc is meant to be handed to whoever administers the VPS as a concrete
request list, and to record the repo-side changes that follow once that
access exists.

**Netlify is a test environment only, not a hosting candidate.** A Netlify
deploy exists purely to exercise the build/deploy mechanics (and
eventually a real GitHub OAuth login) on a real public domain before the
Hostinger VPS is reachable — it is not being considered as where this site
actually ends up. That matters for the CMS-auth decision below: Option B
(`git-gateway` + Netlify Identity) stays off the table, because adopting it
would only make sense if Netlify *were* becoming the production host, and
it isn't. See "Netlify test deploy" below for what that prep actually
changed in the repo.

The Decap CMS OAuth-proxy this plan calls for (see "Architecture" below) has
already been written — `oauth-proxy/` (`server.js` + `README.md`) — and
`static/admin/config.yml`'s `backend.name` already switched from the old
`git-gateway` placeholder to `github`. Neither is deployed: the proxy has
nowhere to run until the VPS access below exists, and `config.yml`'s
`base_url` is still the literal placeholder
`REPLACE-WITH-DEPLOYED-OAUTH-PROXY-URL`. See
`docs-internal/decap-cms-auth-todo.md` for the full detail on that piece —
it's tracked there, this doc just needed to stop claiming it as unstarted.

Supersedes the GitHub Pages hosting decision recorded in
`docs-internal/decap-cms-auth-todo.md` (which was itself written against the
CP8 GitHub Pages plan, `github-pages-hosting-plan.md`). That doc's "Option
A vs Option B" fork for Decap CMS auth is revisited below — a VPS reopens
Option A in a materially better form.

## Goal

- The **site build** (Docusaurus static output) is served from the VPS
  instead of GitHub Pages.
- **GitHub stays the single source of truth for content.** The VPS never
  becomes a place someone edits files by hand — `main` on
  `ChargingTrex/collage-wiki-SAIU` is still what gets built and served.
- Decap CMS (`/admin`) writes land as real commits on GitHub, same as today
  — the VPS just makes the missing auth backend (see
  `docs-internal/decap-cms-auth-todo.md`) finally buildable, because it can
  now host the always-on service that backend needs.

## Architecture

```
club lead edits in /admin (Decap CMS)
        │
        ▼
  OAuth-proxy service (small Node process, runs on the VPS)
        │  handles the GitHub OAuth handshake
        ▼
  commit lands on GitHub (main branch, ChargingTrex/collage-wiki-SAIU)
        │
        ▼
  GitHub Actions: npm ci && npm run build
        │  (same as today's deploy.yml, minus the last two Pages-specific steps)
        ▼
  build/ output shipped to the VPS over SSH (rsync)
        │
        ▼
  nginx or Caddy on the VPS serves build/ as static files, TLS via Let's Encrypt
```

Two independent pieces of new infrastructure sit on the VPS:

1. **The static file host** — nginx/Caddy serving the built site. No
   database, no app server; it's the same `build/` directory GitHub Pages
   serves today, just handed to a different web server.
2. **The Decap OAuth-proxy** — a small always-on Node service (Decap's own
   `decap-cms-oauth-provider` reference implementation, or an equivalent
   minimal Express app) that does the GitHub OAuth code exchange so
   `/admin` can authenticate editors. This is the piece Option A was
   blocked on before (see "Why Option A reopens" below) — GitHub Pages had
   nowhere to run it; the VPS does.

Neither piece needs a database or persistent app state. Both can run behind
the same reverse proxy on the same box.

## Deploy mechanism: push-based (recommended)

Three ways to get `build/` onto the VPS after a merge to `main`; recommending
the first as the smallest change from what already exists:

**A. Push from CI (recommended)** — Keep `.github/workflows/deploy.yml`'s
build steps as-is (`npm ci`, `npm run build`), replace the final
`actions/configure-pages` + `actions/deploy-pages` steps with an
`rsync`-over-SSH step that copies `build/` to a path on the VPS (e.g.
`/var/www/wiki/`). Needs a deploy SSH key added as a GitHub Actions secret,
and a deploy user on the VPS with write access to that one path. No
long-running listener needed on the VPS beyond nginx.

**B. Pull-based via webhook** — A small listener on the VPS receives
GitHub's push webhook, then runs `git pull && npm ci && npm run build`
locally on the VPS and points nginx at the resulting `build/`. Means the
VPS needs a git checkout of the repo, Node installed, and a webhook
receiver process. More moving parts on the VPS than A, no benefit for a
site this size.

**C. Container-based** — CI builds a Docker image (nginx + static files
baked in), pushes to a registry (GHCR), VPS pulls the new image and
restarts the container (via Watchtower, a cron `docker pull`, or a
webhook). Cleanest isolation, but adds a registry and container runtime
requirement to the ask — overkill unless IT already runs everything on
that VPS as containers.

**Recommendation: A.** It reuses the existing CI job almost unchanged and
asks the VPS admin for the least amount of new setup (one deploy user, one
static file path, nginx/Caddy). Revisit B or C only if IT's own conventions
for that VPS push back on SSH-from-CI.

## Why Option A (Decap CMS auth) reopens, and Option B still doesn't

From `docs-internal/decap-cms-auth-todo.md`:

- **Option A** (`github` backend + OAuth-proxy) was blocked on "needs a
  small always-on service hosted *somewhere*" — GitHub Pages can't run
  one. **A VPS is exactly that somewhere.** This is now the confirmed path.
  Editors still need real GitHub accounts and repo-collaborator access —
  that constraint doesn't change and should be treated as a conscious
  tradeoff, not a surprise, when onboarding non-technical club leads.
- **Option B** (`git-gateway` + Netlify Identity) is **still off the
  table**, VPS or not. Git Gateway is a Netlify-specific product tied to
  Netlify Identity; a generic VPS doesn't provide a drop-in replacement.
  Building a self-hosted identity + git-proxy stack to match it would be a
  much larger project than this wiki needs. Not worth revisiting unless
  hosting deliberately moves to Netlify itself, which this plan does not
  propose.

## Netlify test deploy

Repo-side prep so a Netlify build can run without disturbing the live
GitHub Pages deploy, or requiring any of this plan's VPS/Option-A decisions
to change:

- `netlify.toml` (new) sets the build command (`npm run build`), publish
  dir (`build`), and Node version (20, matching CI).
- `docusaurus.config.js` reads Netlify's own `NETLIFY`/`URL` build-time env
  vars into one `SITE_BASE_URL` constant, so `url`/`baseUrl` are correct on
  either host from the same config — root path on Netlify (`/`), the
  existing `/collage-wiki-SAIU/` subpath everywhere else. Neither the
  GitHub Pages config values nor (once Phase 5 happens) the VPS's own
  `baseUrl: '/'` need to change because of this — it's additive.
- Testing that Netlify build surfaced two real hardcoded-URL bugs that
  predated this and would have silently broken on *any* host other than
  GitHub Pages — exactly the risk this doc's "Repo-side changes" section
  had flagged (the `js/github-badge.js` line item below) but hadn't hit
  yet. Both are now fixed at the source instead of deferred to Phase 5:
  the `github-badge.js` `<script>` tag's `src` was a literal
  `/collage-wiki-SAIU/js/github-badge.js` (would 404 under any other
  `baseUrl`) — now built from the same `SITE_BASE_URL` constant; the
  homepage's JSON-LD structured-data `url` was a hardcoded
  `https://chargingtrex.github.io/collage-wiki-SAIU/` string in
  `src/pages/index.js` (would keep claiming the GitHub Pages URL as
  canonical from any other origin) — now built from
  `useDocusaurusContext()`'s real `siteConfig.url + siteConfig.baseUrl`
  instead of a second, driftable copy of the same value. Full detail:
  `changes.md`'s 2026-09-09 entry.
- Connecting this repo to an actual Netlify site (`netlify login` +
  linking the site, or a `NETLIFY_AUTH_TOKEN`) needs a real Netlify account
  action — not something doable without the maintainer's own
  browser-based auth step.

## OAuth-proxy & CMS requirements

Concrete, so whoever deploys `oauth-proxy/` doesn't have to reconstruct this
from the code. Full detail: `oauth-proxy/README.md`.

**GitHub OAuth App** (repo owner creates this, GitHub → Settings →
Developer settings → OAuth Apps — not a VPS/IT task):

- **Homepage URL**: the site's public URL (the VPS domain once live).
- **Authorization callback URL**: `<OAUTH_PROXY_BASE_URL>/callback` exactly
  — must match what the proxy is configured with, or the handshake fails.
- Produces a **Client ID** and a **Client Secret** (secret shown once,
  copy immediately).

**OAuth-proxy runtime** (`oauth-proxy/server.js`, run on the VPS):

- Environment variables, all required: `GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET` (both from the OAuth App above — real secrets,
  never committed, injected via env or the host's secret store),
  `OAUTH_PROXY_BASE_URL` (the proxy's own public URL, no trailing slash,
  minus `/callback`).
- Listens on `PORT` (default `8081`) — always behind the reverse proxy;
  never expose `8081` directly to the internet.
- Node.js v20 (matches CI), run persistently (systemd unit or `pm2` — see
  "The ask for IT" item 3 below).
- Stateless — no database, no persistent app state, safe to restart anytime.

**`static/admin/config.yml` wiring** (repo-side, once the proxy has a real
URL — see "Repo-side changes" below):

```yaml
backend:
  name: github
  repo: ChargingTrex/collage-wiki-SAIU
  branch: main
  base_url: https://oauth.<domain>   # currently the placeholder
  auth_endpoint: auth
```

**Editor (club lead) requirements** — the actual cost of Option A, worth
stating plainly since it's a UX tradeoff, not just an infra one:

- A real GitHub account.
- Added as a collaborator on `ChargingTrex/collage-wiki-SAIU` (or org
  membership with repo access) — Decap's `github` backend authenticates
  editors as real GitHub users with real write access, there's no separate
  lighter-weight identity layer (that was Option B, ruled out above).

**Local development needs none of this** — `local_backend: true` in
`config.yml` + `npm run cms:proxy` bypasses OAuth entirely, see
`docs-internal/decap-cms-auth-todo.md`'s "Testing locally" section.

## The ask for IT / the dean's office

Concrete list to hand over — nothing here can be done from this repo alone:

1. **A domain or subdomain** pointed at the VPS (A/AAAA record) for the
   site itself, e.g. `wiki.<university-domain>`. A second host or path for
   the OAuth-proxy (e.g. `wiki.<university-domain>/oauth/` or an
   `oauth.<university-domain>` subdomain) — either works, whichever is less
   setup for them.
2. **Reverse proxy + TLS** — nginx or Caddy, with Let's Encrypt. Caddy's
   automatic TLS is less config if there's no existing preference.
3. **Node.js (v20, matching CI)** available to run the OAuth-proxy service
   persistently — a systemd unit or `pm2`, whichever matches how they run
   other long-lived processes on that box. (Not needed for path A's static
   file serving, only for the OAuth-proxy.)
4. **A deploy user** with SSH key access, write-scoped to the one directory
   the built site lives in (e.g. `/var/www/wiki/`) — the key's public half
   goes in as a GitHub Actions secret, nothing else needs VPS access.
5. **Firewall**: only 80/443 need to be open. The OAuth-proxy and any
   deploy tooling stay behind the reverse proxy, never exposed directly.
6. **A GitHub OAuth App** (repo owner creates this at GitHub → Settings →
   Developer settings → OAuth Apps, not a VPS task) whose Client
   ID/Secret get handed to whoever configures the OAuth-proxy service.
   Treated as a secret — never committed to the repo.

## Repo-side changes — not made yet, listed for when VPS details exist

Holding off on these until the VPS is actually reachable, so the live
GitHub Pages site doesn't break mid-transition:

- `docusaurus.config.js`: `url` → the real domain, `baseUrl: '/'` (no more
  `/collage-wiki-SAIU/` subpath), remove `organizationName` /
  `projectName` / `deploymentBranch` (all GitHub Pages–specific).
- `.github/workflows/deploy.yml`: swap the final two steps
  (`actions/configure-pages`, `actions/deploy-pages`) for an SSH/rsync
  step; add `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` as repo secrets.
- ~~`static/admin/config.yml`: `backend.name` from `git-gateway` →
  `github`~~ — done. What's left is `base_url` / `auth_endpoint`, which need
  the OAuth-proxy's real deployed URL; still the literal placeholder
  `REPLACE-WITH-DEPLOYED-OAUTH-PROXY-URL` until then.
- ~~Write the OAuth-proxy service~~ — done, `oauth-proxy/server.js`
  (implements Decap's popup handshake: `/auth` redirects to GitHub,
  `/callback` exchanges the code and posts the token back). Not deployed —
  needs `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `OAUTH_PROXY_BASE_URL`
  and somewhere to run persistently, i.e. the VPS this doc is about. See
  `oauth-proxy/README.md` for the exact run steps and the GitHub OAuth App
  setup.
- `docs-internal/decap-cms-auth-todo.md`: already updated to reflect the
  OAuth-proxy being code-complete but undeployed — no further edit needed
  there unless deploy actually happens.
- Check `js/github-badge.js` (referenced in `docusaurus.config.js`'s
  `scripts`) for any GitHub Pages–specific assumptions before the domain
  changes.

## Cutover plan

Keep the existing GitHub Pages deploy running in parallel until the VPS
path is verified end-to-end (build reachable over the new domain, TLS
valid, `/admin` can authenticate and save a real commit). Flip DNS to the
VPS last, once that's confirmed — not before. Remove the Pages workflow
only after the VPS has been serving correctly for a stretch, not
immediately on cutover, in case DNS needs to roll back.

## Open questions (need answers from IT / the dean's office before repo-side work starts)

- Actual domain/subdomain name to use.
- Preferred deploy mechanism if not A (SSH access may not be something IT
  wants to grant to a GitHub Actions secret — worth asking directly rather
  than assuming).
- Whether this VPS already runs other sites/services (affects whether
  nginx/Caddy config needs to share the box with existing vhosts).

## Phase checklist

Working list to take this plan from "written" to "live," in dependency
order. Phases 0–1 don't need the VPS at all and can happen anytime; Phase 2
is the actual blocker everything else waits on.

**Phase 0 — Repo-side groundwork (done)**

- [x] `oauth-proxy/server.js` + `README.md` written (Decap's popup-handshake
      protocol: `/auth` redirect, `/callback` token exchange).
- [x] `static/admin/config.yml`: `backend.name` switched to `github`.
- [x] Local dev bypass (`local_backend: true` + `npm run cms:proxy`) built
      and tested end-to-end against this checkout's real files.
- [x] OAuth-proxy code paths verified locally this session: ran the wiki
      (`npm start`, :3000) and the proxy (`node server.js`, :8081) as two
      separate processes with dummy credentials, then confirmed by curl —
      `/auth` redirects to `github.com/login/oauth/authorize` with correct
      `client_id`/`redirect_uri`/`scope`/`state`; `/callback` with no `code`
      returns 400; `/callback` with a bogus code reaches real GitHub and
      correctly surfaces its error as a 502; `/admin` loads through the
      wiki server. Confirms the handshake logic itself is correct — the one
      thing this *can't* prove without a real registered OAuth App is a
      live "Login with GitHub" click completing successfully end-to-end.
- [ ] Optional, only if a full live-login dry run is wanted before the VPS
      exists: register a throwaway GitHub OAuth App with callback
      `http://localhost:8081/callback`, temporarily flip `local_backend` to
      `false` (or run from a non-localhost hostname override — check
      Decap's docs for the exact detection rule) to force the real
      `github` backend, and click through the actual consent screen. Not
      required for Phase 1+ — the proxy code doesn't change based on where
      it's deployed.
- [x] Netlify test-deploy prep: `netlify.toml` added, `docusaurus.config.js`
      made host-aware (`SITE_BASE_URL`), and the two hardcoded-URL bugs
      that prep surfaced (`js/github-badge.js`'s script `src`, the
      homepage's JSON-LD `url`) fixed at the source. See "Netlify test
      deploy" above. Connecting an actual Netlify site to this repo still
      needs the maintainer's own account/login step.

**Phase 1 — GitHub OAuth App (repo owner, ~5 minutes, no VPS needed)**

- [ ] Create the OAuth App: GitHub → Settings → Developer settings → OAuth
      Apps → New OAuth App.
- [ ] Homepage URL = site's public URL (VPS domain once known; can be
      updated later without creating a new app).
- [ ] Authorization callback URL = `<OAUTH_PROXY_BASE_URL>/callback` —
      exact match required, update this if the domain changes later.
- [ ] Save Client ID + Client Secret somewhere secure (secret shown once).
      Never commit either to the repo.

**Phase 2 — Ask IT / the dean's office (blocking — nothing in Phase 3+ can start until this comes back)**

- [ ] Domain/subdomain pointed at the VPS (A/AAAA record) for the site.
- [ ] A host or path for the OAuth-proxy (own subdomain, or a path behind
      the same reverse proxy) — whichever is less setup for them.
- [ ] Reverse proxy + TLS (nginx or Caddy, Let's Encrypt).
- [ ] Node.js v20 available persistently (systemd unit or `pm2`) for the
      OAuth-proxy specifically — the static file path doesn't need it.
- [ ] A deploy user with SSH key access, write-scoped to one directory
      (e.g. `/var/www/wiki/`).
- [ ] Firewall: confirm only 80/443 need to be open; OAuth-proxy and deploy
      tooling stay behind the reverse proxy.
- [ ] Confirm SSH-from-GitHub-Actions (deploy mechanism A) is acceptable to
      IT, or get their preferred alternative — don't assume.
- [ ] Get the actual domain/subdomain name and confirm whether the VPS
      already hosts other sites (affects whether nginx/Caddy config needs
      to share the box with existing vhosts).

**Phase 3 — Deploy the OAuth-proxy (needs Phase 1 + Phase 2)**

- [ ] Copy `oauth-proxy/` to the VPS, `npm install`.
- [ ] Set real env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (Phase
      1's values), `OAUTH_PROXY_BASE_URL` (Phase 2's domain/path).
- [ ] Run persistently (systemd unit or `pm2`, matching however IT runs
      other long-lived processes on that box) behind the reverse proxy —
      never expose port 8081 directly.
- [ ] If the callback URL differs from what Phase 1 registered (e.g. moved
      off a localhost test), update the OAuth App's callback URL to match.

**Phase 4 — Wire the static-site deploy mechanism (needs Phase 2)**

- [ ] `.github/workflows/deploy.yml`: replace the final
      `actions/configure-pages` + `actions/deploy-pages` steps with an
      `rsync`-over-SSH step to the deploy user's path.
- [ ] Add `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` as GitHub Actions repo
      secrets.

**Phase 5 — Remaining repo-side changes (needs Phase 2's real domain)**

- [ ] `docusaurus.config.js`: `url` → the real domain, `baseUrl: '/'`
      (drop the `/collage-wiki-SAIU/` subpath), remove
      `organizationName`/`projectName`/`deploymentBranch` (GitHub
      Pages–specific).
- [ ] `static/admin/config.yml`: `base_url` → the OAuth-proxy's real
      deployed URL (currently the literal placeholder
      `REPLACE-WITH-DEPLOYED-OAUTH-PROXY-URL`).
- [x] ~~Check `js/github-badge.js` for GitHub Pages–specific
      assumptions~~ — done ahead of schedule, surfaced by the Netlify test
      deploy prep (see "Netlify test deploy" above): its `<script>` `src`
      no longer hardcodes `/collage-wiki-SAIU/`, it derives from the same
      `SITE_BASE_URL` constant `baseUrl` itself uses, so it'll be correct
      once this line's own `baseUrl: '/'` change lands too.

**Phase 6 — Cutover**

- [ ] Verify end-to-end on the new domain before touching DNS: site loads,
      TLS valid, `/admin` authenticates via real GitHub OAuth and saves a
      real commit.
- [ ] Keep the GitHub Pages workflow running in parallel until that's
      confirmed.
- [ ] Flip DNS to the VPS.
- [ ] Watch for a stretch (not just the first few hours) before removing
      the Pages workflow, in case DNS needs to roll back.

**Phase 7 — Post-cutover cleanup**

- [ ] Remove `.github/workflows/deploy.yml`'s GitHub Pages path once the
      VPS has been serving correctly for a stretch.
- [ ] Update `docs-internal/decap-cms-auth-todo.md` and this doc's own
      "Status" line at the top to reflect the finished state.
