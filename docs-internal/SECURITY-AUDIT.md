# Security Audit — 2026-08-15

Full-repo cybersecurity review: secret scanning (current tree + full git
history), dependency vulnerabilities (`npm audit`, both the main site and
`oauth-proxy/`), the real OAuth backend (`oauth-proxy/server.js`), GitHub
Actions CI, Decap CMS config, client-side code (XSS vectors), and custom
build-time plugins. Not a passive checklist — every finding below was
independently confirmed by reading the actual code, not inferred from
naming or assumed from best-practice defaults.

**Scope note:** this project has almost no attack surface today because
the CMS backend isn't deployed yet (`base_url` in `config.yml` is still a
placeholder) — most findings below are about *what becomes exploitable once
it is*, so they're worth fixing before that deploy, not after.

## Summary

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Path traversal → arbitrary file read in `club-events-plugin.js` | **High** | Confirmed, unmitigated |
| 2 | Decap CMS loaded from CDN with no Subresource Integrity | **Medium-High** | Confirmed, unmitigated |
| 3 | OAuth `state` parameter generated but never validated (CSRF) | **Medium** | Confirmed, unmitigated |
| 4 | No `.gitignore` in `oauth-proxy/` — future secret-commit risk | **Medium** | Confirmed, unmitigated |
| 5 | CMS commits go straight to `main`, no review gate | **Medium** | By design, flagging implication |
| 6 | Third-party OAuth error text reflected into unescaped HTML response | **Low** | Confirmed, low practical risk |
| 7 | `npm audit`: 31 vulnerabilities in build toolchain | **Info** | None reachable by site visitors |
| 8 | No security headers (CSP/HSTS/etc.) anywhere | **Low** | Platform-limited today, fixable at VPS migration |
| 9 | GitHub Actions workflow | — | **Clean**, no findings |
| 10 | Client-side code (XSS vectors) | — | **Clean**, no findings |
| 11 | Committed secrets (current tree + full git history) | — | **Clean**, none found |
| 12 | `oauth-proxy`'s own dependencies (Express only) | — | **Clean**, 0 vulnerabilities |

---

## 1. [High] Path traversal → arbitrary file read in `club-events-plugin.js`

**Where:** `src/plugins/club-events-plugin.js`, `resolveImage()`, lines 76–97.

**The bug:** a blog post's `image:` frontmatter value (`rawImage`) is used
directly in `path.join(blogDir, postDir, rawImage)` (line 85) to build the
**source** path for `fs.copyFile()`. `path.join` does not strip `../`
segments. The **destination** filename is correctly sanitized
(`path.basename(rawImage)`, line 84), but the source read path is not.

```js
const imageFileName = path.basename(rawImage);           // sanitized ✓
const sourcePath = path.join(blogDir, postDir, rawImage); // NOT sanitized ✗
await fs.copyFile(sourcePath, path.join(destDir, imageFileName));
```

**Exploit:** a post with `image: ../../../../../../../../etc/passwd` (or
any other file readable by whatever machine runs `npm run build`/`npm
start`) gets that file's contents copied into
`static/img/_event-thumbnails/<post-folder>/passwd` — which then ships as
part of the **publicly deployed static site**, readable by anyone at that
URL.

**Who can trigger it:** anyone who can get content into a blog post's
frontmatter — today that means a merged PR; **once Decap CMS's OAuth
backend is deployed (see the earlier conversation in this session), it
means any authenticated club-lead editor**, since the CMS's Feature Image
field writes straight to this same frontmatter field with no
extra validation of its own.

**Real impact today:** low (requires a merged PR, and GitHub Actions
runners are ephemeral with nothing especially sensitive on them since this
workflow injects no `secrets.*`). **Real impact once CMS write access is
live:** meaningfully higher — a compromised or malicious editor account, or
a maintainer running a local build with untrusted content pulled in, could
exfiltrate local files (SSH keys, other dotfiles, etc.) onto the public
site.

**Fix:** resolve `sourcePath` and verify it's still inside
`path.join(blogDir, postDir)` before copying — e.g.:
```js
const resolved = path.resolve(blogDir, postDir, rawImage);
if (!resolved.startsWith(path.resolve(blogDir, postDir) + path.sep)) {
  throw new Error(`Refusing to read image outside its post folder: ${rawImage}`);
}
```

---

## 2. [Medium-High] Decap CMS loaded from a CDN with no Subresource Integrity

**Where:** `static/admin/index.html`, line 12:
```html
<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
```

**The issue, two compounding problems:**
- **No `integrity` attribute.** If unpkg.com is compromised, DNS-hijacked,
  or MITM'd, arbitrary JavaScript executes in the context of `/admin` — the
  one page on this site that, once the OAuth backend is live, will hold a
  real GitHub access token with `repo` scope (full read/write on any repo
  the authenticating editor can access). This is the single highest-value
  page on the site to compromise, and it's the one page loading its entire
  application from an unpinned third-party CDN URL with no integrity check.
- **`^3.0.0` is a caret range, not a pinned version.** unpkg serves
  whatever the latest matching `3.x.x` release is, at every page load —
  any future compromise of the `decap-cms` npm package (supply-chain
  attack on the upstream project) propagates to this site's admin panel
  immediately, with no PR or code review on this repo's side.

**Fix, in order of preference:**
1. Self-host `decap-cms.js` (built from a pinned `npm install decap-cms`,
   bundled or copied into `static/admin/`) — removes the CDN dependency
   entirely.
2. If keeping the CDN: pin to an exact version (`decap-cms@3.x.y`, not
   `^3.0.0`) **and** add `integrity="sha384-..."
   crossorigin="anonymous"` (unpkg supports this; compute the hash once per
   pinned version and update it deliberately on upgrade).

---

## 3. [Medium] OAuth `state` parameter generated but never validated

**Where:** `oauth-proxy/server.js` — `/auth` generates a random `state`
(line 40) and sends it to GitHub, but `/callback` (line 50 onward) never
stores or re-checks it against anything before exchanging `code` for a
token.

**Why it matters:** `state` exists specifically to prevent OAuth login-CSRF
(RFC 6749 §10.12) — without validating it, an attacker can initiate their
own OAuth authorization (as their own GitHub account), obtain a valid
`code`, and get a victim to complete `/callback` with *that* code instead
of one the victim's own session actually requested. The resulting access
token (for the attacker's account) gets posted into whatever window opened
the popup — in Decap's flow, the victim's `/admin` session — creating
confusion about whose GitHub identity the CMS session is now operating
as.

**Fix:** store the issued `state` (a signed cookie, or an in-memory
map keyed by a short-lived session id) when `/auth` runs, and reject
`/callback` requests whose `state` query param doesn't match before
exchanging the code.

---

## 4. [Medium] No `.gitignore` in `oauth-proxy/` — real risk of a future secret commit

**Where:** `oauth-proxy/` has no `.gitignore` of its own, and the directory
is currently **entirely untracked** (`git status` shows `?? oauth-proxy/`).

**Why it matters:** the service's own README instructs running it with
`GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... npm start` — the natural
next step for anyone deploying or testing this is to drop those into a
local `.env` file (the standard Node convention). With no `.gitignore`
in this directory, the first `git add oauth-proxy/` (or a careless
`git add -A` when this directory finally gets committed) would happily
stage that `.env` — and `node_modules/` (71 packages currently sitting
there) — into the repo. This hasn't happened yet (confirmed: no `.env`
exists there right now, and full git history is clean — see finding 11),
but it's a real, easy-to-hit landmine for whoever commits this directory.

**Fix:** add `oauth-proxy/.gitignore` with at minimum:
```
node_modules/
.env
.env.*
```
before this directory is ever `git add`ed for real.

---

## 5. [Medium, by design — flagging the implication] CMS commits land directly on `main`, no review step

**Where:** `static/admin/config.yml` — `backend.branch: main`, and Decap's
default (non-"editorial workflow") mode: every save is an immediate commit
to `main`, which the GitHub Actions workflow deploys to the live site on
every push. No draft/PR/review stage.

**Why it's worth flagging even though it's an intentional product
decision:** once the OAuth backend is deployed, **any individual
authenticated editor's save is instantly live, unreviewed.** A compromised
editor GitHub account, a typo, or (combined with finding 1) a malicious
frontmatter value all go straight to production with no gate. This is a
defensible tradeoff for a low-stakes club wiki, but it's worth a conscious
decision rather than a default — Decap supports an editorial-workflow mode
(`publish_mode: editorial_workflow`) that opens a PR instead of committing
directly, if that tradeoff is ever reconsidered.

---

## 6. [Low] Third-party OAuth error text reflected into an unescaped HTML response

**Where:** `oauth-proxy/server.js`, line 70:
```js
res.status(502).send(`GitHub token exchange failed: ${error || 'no token returned'}`);
```
Express's `res.send(string)` defaults to `Content-Type: text/html`, so
`error` (GitHub's own OAuth error field) is rendered as HTML, unescaped.
**Practical risk is low** — GitHub's OAuth error values are a fixed set of
enum-like codes (`bad_verification_code`, `redirect_uri_mismatch`, etc.),
not free-form attacker-controlled text — but the code is trusting a third
party's response format rather than defensively escaping it. Cheap fix:
`res.set('Content-Type', 'text/plain').status(502).send(...)`.

Same class of issue, lower confidence: the `payload` JSON embedded into the
inline `<script>` on line 83 is properly `JSON.stringify`-escaped for
quotes/backslashes, but `JSON.stringify` does not escape `</script>` —
if GitHub's token ever contained that literal substring (it won't, given
GitHub's token format, but the code doesn't defend against it), it would
prematurely close the script tag. Not worth urgent action; worth a
one-line `.replace(/</g, '\\u003c')` if this file is touched again.

---

## 7. [Info] `npm audit`: 31 vulnerabilities, all in the build toolchain — none reachable by site visitors

Root `npm audit`: **31 vulnerabilities (25 high, 6 moderate)**. Read
individually, the advisory titles look alarming (`serialize-javascript`
even carries an RCE advisory) — but every single one traces to
Docusaurus's own build tooling (webpack, webpack-dev-server, sockjs,
sharp/image-size for `@docusaurus/plugin-ideal-image`, js-yaml,
brace-expansion, fast-uri) — **none of this code ships to the browser
bundle or runs when a visitor loads the live site.** The actual exposure:

- **`webpack-dev-server`/`sockjs`/`uuid`** — only relevant while a
  developer runs `npm start` locally; the known attack class (a malicious
  website reading local dev-server source while it's running) affects
  contributors' machines, not deployed output.
- **`js-yaml`, `sharp`, `image-size`, `serialize-javascript`,
  `brace-expansion`** — all process input during `npm run build` only.
  The one mildly interesting angle: **combined with CMS write access
  (finding 5), a malicious image upload via Decap CMS could trigger the
  `image-size`/`sharp` DoS advisories (infinite-loop parsers) on the
  *next* CI build**, denial-of-service against deployment rather than
  against the live site. Worth knowing, not urgent.
- `oauth-proxy/`'s own `npm audit`: **0 vulnerabilities** — this is the
  one dependency tree that's actually internet-facing in production, and
  it's clean.

**Recommendation:** run `npm audit fix` for the ones flagged
`fixAvailable=true` opportunistically; don't treat the "25 high" headline
as urgent given none are reachable by a visitor.

---

## 8. [Low] No security headers (CSP, HSTS, X-Content-Type-Options, etc.) anywhere

GitHub Pages doesn't allow custom response headers at all — a platform
limitation, not something fixable while hosting there. `oauth-proxy/`'s
Express app also sets none (no `helmet` or equivalent), though its only
real response bodies are a redirect and one small inline-script page.
**Worth addressing at the planned VPS migration** (`vps-hosting-plan.md`),
which is the first point this project will control its own web server
config (nginx/Caddy) and could add a CSP, HSTS, `X-Frame-Options`, etc.
sitewide. Not urgent today; flagging so it isn't forgotten once that
migration happens.

---

## 9–12. Clean areas (confirmed, not assumed)

- **GitHub Actions (`deploy.yml`):** tightly scoped permissions
  (`contents: read, pages: write, id-token: write`, not the
  write-all default), OIDC-based deploy via `actions/deploy-pages`
  (no long-lived deploy token stored as a secret), triggers only on
  `push: [main]` + manual dispatch — no `pull_request_target`, no
  execution of untrusted PR code with write permissions. All actions are
  official first-party `actions/*`, pinned to major-version tags (SHA-pinning
  would be marginally stronger but is a minor hardening note, not a finding,
  given these aren't third-party actions).
- **Client-side XSS surface:** zero `dangerouslySetInnerHTML`, zero
  `innerHTML`, zero `eval`/`new Function`, zero `document.write` anywhere
  in `src/`, `docs/`, `blog/`, or `static/`. `github-badge.js` (the one
  script that renders fetched API data) uses `.textContent` exclusively,
  never HTML injection, for untrusted API response data.
- **Committed secrets:** scanned the full current tree and the *entire*
  git history (`git log --all -p`) for AWS keys, private-key headers,
  GitHub/Slack/OpenAI-style tokens, and generic
  `secret/password/api_key/token = "..."` literal assignments. Nothing
  found, in the current tree or ever committed and later removed.
- **`oauth-proxy`'s dependencies:** just `express@^4.19.0`, actively
  maintained, `npm audit` clean.

## Priority order if addressing these

1. **Fix #1** (path traversal) — real, exploitable today via a PR, and the
   fix is small and self-contained.
2. **Fix #4** (`oauth-proxy/.gitignore`) — costs one file, closes a real
   future landmine, do it before that directory is ever committed.
3. **Fix #2 and #3** (SRI + OAuth state validation) — both matter most
   right before the CMS backend actually goes live; fix either alongside
   that deploy work, not necessarily before.
4. **#5** — a product decision, not a code fix; worth a deliberate yes/no
   rather than a default.
5. **#6, #7, #8** — low urgency, address opportunistically or at the VPS
   migration.
