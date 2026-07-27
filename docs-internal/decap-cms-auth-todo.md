# Decap CMS auth backend — decision needed once hosting is finalized

**Status: unresolved, deliberately deferred. Not a CP5 blocker — see
`CLAUDE.md`'s locked decisions and the CP0–CP8 build plan.**

## What's already done

- `static/admin/index.html` — loads the Decap CMS UI via CDN script.
- `static/admin/config.yml` — one working collection ("Events", i.e.
  `blog/`), with co-located image uploads matching the site's existing
  image convention. See that file's own header comment for why club/fest
  page editing (`docs/clubs/*`, `docs/fests/*`) is **not** exposed yet —
  that's a content-model gap (MDX with hero-component imports isn't safe to
  hand a non-technical editor a generic body widget for), independent of
  the auth question below.
- `backend: {name: git-gateway, branch: main}` in `config.yml` — a
  placeholder. `/admin` loads and renders the CMS's editing UI, but nothing
  can actually authenticate or save until one of the two options below is
  chosen and wired up.

## The actual decision: two viable backends

### Option A — GitHub backend + OAuth proxy

Decap's `github` backend authenticates editors directly against GitHub
(they need a real GitHub account and repo access), via a small OAuth-proxy
server (Decap's own `decap-cms-oauth-provider`-style Netlify/Vercel function,
or the same for another host) that handles the OAuth handshake.

- **Pro**: no separate identity system — an editor's GitHub account *is*
  their identity, permissions map directly to repo collaborator access.
- **Con**: every club lead needs a real GitHub account and to be added as a
  repo collaborator (or org member) — that's a much higher bar for
  non-technical club leads than the CMS is meant to spare them from. Also
  needs a small always-on OAuth-proxy service hosted *somewhere* — GitHub
  Pages alone can't run it.

### Option B — git-gateway backend + Netlify Identity

Decap's `git-gateway` backend proxies git operations through Netlify
Identity — editors get an email/password (or invite-link) account managed
entirely inside Netlify, with no GitHub account or repo access needed at
all.

- **Pro**: matches "non-technical club leads" much better — an invite email
  and a password is a far lower bar than a GitHub account.
- **Con**: **requires hosting on Netlify** (or a Netlify Identity-compatible
  shim) for the Identity + Git Gateway services specifically — this project
  is currently targeting **GitHub Pages** per `CLAUDE.md`
  (`deploymentBranch: 'gh-pages'`, `organizationName: 'ChargingTrex'`). Using
  this backend would mean either hosting the *site* on Netlify instead (a
  bigger change than it sounds — this project's whole deploy story assumes
  GitHub Pages), or running Netlify Identity/Git Gateway as a bolted-on
  service alongside GitHub Pages hosting, which isn't how Netlify designed
  it to work (Identity is tied to a Netlify-hosted site).

## Why this is genuinely blocked on a hosting decision, not just unmade

Option A works with the current GitHub Pages plan as-is (needs an extra
small proxy service, but the site itself stays on GitHub Pages). Option B
is the better fit for the actual editors (non-technical club leads) but
effectively requires moving hosting to Netlify, which is a real
architectural change beyond "pick a CMS auth backend" — it would mean
revisiting `CLAUDE.md`'s locked GitHub Pages decision, not just this file.

**This can't be resolved from inside the CMS config** — it needs an
explicit choice: stay on GitHub Pages and accept Option A's higher bar for
editors (or find/host a lightweight OAuth-proxy under someone's control), or
move hosting to Netlify for Option B's easier editor experience. Revisit
once that hosting conversation happens; don't default to either silently.

## What actually has to happen to unblock this (either path)

1. Decide GitHub Pages (stays) vs. Netlify (hosting changes) — a project
   decision, not a code change.
2. **If Option A**: stand up an OAuth-proxy (e.g. Cloudflare Worker, Vercel
   function, or a small always-on Node service) implementing Decap's OAuth
   handshake; add `base_url`/`auth_endpoint` to `config.yml`'s `backend:`
   block pointing at it.
3. **If Option B**: move hosting to Netlify (or add a Netlify site solely
   for Identity/Git Gateway, pointed at this same GitHub repo — possible,
   but means running/paying for two hosting surfaces for one site); enable
   Identity + Git Gateway in the Netlify dashboard; invite each club lead
   via Netlify Identity.
4. Either way: update `static/admin/config.yml`'s `backend:` block for the
   chosen option, remove this file's "unresolved" framing, and re-enable the
   commented-out Decap CMS link in `docusaurus.config.js`'s footer.
5. Once auth actually works, revisit the club/fest MDX-editing gap noted
   above — separately, since it's not an auth problem.
