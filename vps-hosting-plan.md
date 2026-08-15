# VPS hosting plan — self-hosted site, GitHub stays the content source

**Status: planning only, nothing below has been executed.** Written because
the university (via the dean's office) has provisioned a VPS for hosting
this site. The VPS is **administered by someone else** (university IT) —
this repo has no SSH access to it and can't stand anything up directly. This
doc is meant to be handed to whoever administers the VPS as a concrete
request list, and to record the repo-side changes that follow once that
access exists.

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
- `static/admin/config.yml`: `backend.name` from `git-gateway` → `github`,
  plus `base_url` / `auth_endpoint` once the OAuth-proxy's real URL is
  known. (Currently still set to the `git-gateway` placeholder — see the
  header comment in that file.)
- `docs-internal/decap-cms-auth-todo.md`: update once this is live — flip
  Option A from "confirmed path, not built" to actually built, and note
  this doc as the source of the hosting change.
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
