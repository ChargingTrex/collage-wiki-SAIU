# Decap CMS OAuth proxy

Small standalone service that lets `/admin` (Decap CMS) authenticate editors
against real GitHub accounts. Not part of the Docusaurus site — deployed and
run separately, per `../vps-hosting-plan.md`. Background and the decision
this implements: `../docs-internal/decap-cms-auth-todo.md`.

**Not deployed anywhere yet.** This is the code, ready to run once there's a
place to run it and a GitHub OAuth App to point it at.

## One-time setup: register a GitHub OAuth App

Someone with admin access to the `ChargingTrex` GitHub account (or the org
that ends up owning the repo):

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. **Homepage URL**: the site's URL (e.g. `https://chargingtrex.github.io/collage-wiki-SAIU/`,
   or the VPS domain once that's live).
3. **Authorization callback URL**: `<wherever this proxy will be reachable>/callback`
   — e.g. `https://oauth.<domain>/callback`.
4. Save. Copy the **Client ID**, and generate + copy a **Client Secret** —
   the secret is only shown once.

## Running it

Needs three environment variables:

- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — from the OAuth App above.
  Treat the secret as a real secret: never commit it, pass it as an env var
  or from whatever secret store the host provides.
- `OAUTH_PROXY_BASE_URL` — the public URL this service is reachable at
  (no trailing slash), e.g. `https://oauth.<domain>`. Must exactly match
  what's registered as the OAuth App's callback URL, minus `/callback`.

```bash
cd oauth-proxy
npm install
GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... OAUTH_PROXY_BASE_URL=https://oauth.example.edu npm start
```

Listens on `PORT` (default `8081`) — put a reverse proxy (nginx/Caddy) with
TLS in front of it, same as the site itself. Never expose port 8081
directly to the internet.

## Wiring it into the CMS once deployed

In `../static/admin/config.yml`, set `backend.base_url` to this service's
public URL (no `/auth` or `/callback` suffix — Decap appends those itself):

```yaml
backend:
  name: github
  repo: ChargingTrex/collage-wiki-SAIU
  branch: main
  base_url: https://oauth.example.edu
  auth_endpoint: auth
```

## Local development doesn't need any of this

Testing `/admin` locally uses Decap's own local-backend feature instead
(`local_backend: true`, already set in `config.yml`, paired with
`npm run cms:proxy` at the repo root) — no OAuth App, no deployed proxy, no
GitHub account required. See `../docs-internal/decap-cms-auth-todo.md` for
the exact steps.
