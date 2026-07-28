# GitHub Pages Hosting Plan

Status: **planning only — nothing in this doc has been built yet.** Written
up so implementation can start in a future session without re-deriving any
of this. Pick this up next time before starting other work on hosting/CMS.

## Context

CLAUDE.md has always said this site is "hosted free on GitHub Pages," but
that's never actually been set up: the repo (`ChargingTrex/collage-wiki-SAIU`)
is currently **private**, GitHub Pages isn't enabled (confirmed via the
GitHub API — 404), there's no `.github/workflows/`, and no `gh-pages` branch
exists. GitHub Pages on the free plan only works from a **public** repo —
private-repo Pages needs GitHub Pro/Team. Decision made: **make the repo
public**, and use that as the moment to clean up the pile of planning/handoff
docs sitting at the repo root before they become publicly visible (git
history becomes visible too once public, so cleanup has to happen *before*
flipping visibility, not after).

A repo-wide scan for secrets/API keys/personal emails found nothing — the
repo is safe to make public content-wise. The "cleanup" need is about
*tidiness*, not leaked secrets: 24 markdown files currently sit at the repo
root, several of them superseded duplicates, one-off session-handoff
snapshots, or a personal (non-project) file that doesn't belong in the repo
at all.

## Part A — Private backup repo (do this first, before any cleanup)

Cleanup in Part B deletes/archives files, and Part C makes the repo (and its
full git history) public. Before either happens, mirror the repo's *current*
state — every file, every commit — into a brand-new **private** GitHub repo
that stays private indefinitely, purely as a complete reference copy. This
means nothing is actually "lost" even for files that get deleted outright in
Part B: the full context still exists, just not in the repo that's about to
go public.

1. Create the new repo (empty, no auto-init): `gh repo create
   ChargingTrex/collage-wiki-SAIU-archive --private --description "Full
   private mirror of collage-wiki-SAIU, taken before the public cleanup"`.
   (Name is a suggestion — swap it for whatever's preferred at the time.)
2. Mirror-push everything as-is, before any cleanup commits exist yet:
   ```bash
   git clone --mirror https://github.com/ChargingTrex/collage-wiki-SAIU.git /tmp/collage-wiki-mirror
   cd /tmp/collage-wiki-mirror
   git push --mirror https://github.com/ChargingTrex/collage-wiki-SAIU-archive.git
   ```
   `--mirror` carries every branch, tag, and the full commit history exactly
   as it exists right now — a true point-in-time snapshot, not just the
   working tree.
3. Verify: browse the new repo on GitHub, confirm the file count/root listing
   matches the current (pre-cleanup) `collage-wiki-SAIU`, confirm it's
   private, confirm `git log` in the archive matches `git log` in the source.

Only after this backup is confirmed does Part B (cleanup) begin.

## Part B — Repo cleanup (before going public)

Scope is deliberately conservative: touch files with few/no cross-references
and real duplication/junk, leave the heavily-cross-referenced "read these
first" source docs (cited by exact filename in `README.md`/`CLAUDE.md`) at
root as-is. A full reorg of those into a subfolder would mean updating
references across `README.md`, `CLAUDE.md`, `PROMPT.md`, and even code
comments (`FashionHero.jsx`, `LiteraryHero.jsx`, `Footer/index.js`) for a
purely cosmetic gain — not worth the blast radius on this pass.

**1. Delete (confirmed zero real value, safe to remove):**
- `Sai University Wiki_ Motion & Animation GuideThis guide details how to implement modern, fluid animations and expressive typography across your Docusaurus portal using Motion (formerly Framer Motion), Lucide React icons, and custom handwriti.md`
  — a raw copy-paste dump (broken filename, literal `\.`/`\[`/`\]` markdown-escape
  artifacts in the body) duplicating `sai-uni-wiki-motion-guide.md`. Nothing
  references it.
- `prompt library.md` — generic AI-prompting templates (compact/handoff
  prompts), not project content at all. Zero references from any other file.
  Keep it locally outside the repo if wanted, but it doesn't belong in a
  public university-club-wiki repo.

**2. Archive into a new `docs-internal/archive/` folder (superseded but not
junk — keep for history, just out of root clutter):**
- `HANDOFF-1.md`, `HANDOFF-2.md`, `HANDOFF-3.md` — session-resume snapshots,
  explicitly superseded chronologically by each other and now by
  `changes.md`'s much more complete running log.
- `animation-caveats (1).md`, `animation-caveats (2).md` — `HANDOFF-2.md`
  itself already states `(3)` is canonical and supersedes `(1)`/`(2)`.
- `club homepage.md`, `homepage-content.md` — content drafts from the CP4
  homepage/clubs split, already acted on and now superseded by the real
  `src/pages/index.js` / `src/pages/clubs.js`. `leadership-rollover-plan.md`
  cites one specific fact from `club homepage.md` (a placeholder-link note)
  — archiving (not deleting) preserves that trail.
- `toggle ui dark ,light mode.md` → rename while archiving to
  `docs-internal/archive/theme-toggle-decision.md` (drops the comma/spaces).

**3. Rename + update references (fixes a real, pre-existing inconsistency):**
- `animation-caveats (3).md` → `docs-internal/animation-caveats.md`.
  `CLAUDE.md`, `BUILD-BRIEF (1).md`, and `PROMPT.md` already refer to the
  *unnumbered* `animation-caveats.md` as if that's the real filename — it
  currently isn't. Renaming makes more existing references correct than it
  breaks. Files that need their reference updated to the new path:
  `README.md`, `CONTRIBUTING.md`, `HANDOFF-2.md` (moving to archive anyway,
  but fix in place before the move), `changes.md`, `src/components/clubs/FashionHero.jsx`
  (code comment), `toggle ui dark ,light mode.md` (moving to archive anyway).

**Leave at root, unchanged:** `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`,
`changes.md`, `BUILD-BRIEF (1).md`, `saiu-collage-wiki-easter-egg.md`,
`traced-handwriting-guide.md`, `sai-uni-wiki-spec.md`,
`sai-uni-wiki-motion-guide.md`, `github-badge-guide.md`, `PROMPT.md`,
`TEST_REPORT.md`, `archive planning.md`, `leadership-rollover-plan.md` — all
either genuinely load-bearing "read this first" docs or already fine where
they are.

Verify after: `git grep` for each moved/renamed filename across the repo
(tracked files only) returns zero stale references; `npm run build` still
succeeds (docs moves don't touch anything Docusaurus actually builds from,
but confirms nothing else broke).

## Part C — Make the repo public

One-time GitHub setting, done only after Part B lands and is pushed (git
history becomes visible the moment the repo turns public, so cleanup must be
committed first). Via `gh repo edit ChargingTrex/collage-wiki-SAIU
--visibility public` or the repo Settings page — get explicit confirmation
before this step, since it's a real, hard-to-fully-undo visibility change.

## Part D — GitHub Pages via GitHub Actions

`docusaurus.config.js` already has the right values for a project-pages site
(`url: 'https://chargingtrex.github.io'`, `baseUrl: '/collage-wiki-SAIU/'`,
`organizationName: 'ChargingTrex'`, `projectName: 'collage-wiki-SAIU'`) — no
config changes needed there. Use the modern GitHub Actions deployment method
(`actions/upload-pages-artifact` + `actions/deploy-pages`), not the classic
`docusaurus deploy`-to-`gh-pages`-branch method already in `package.json`'s
`deploy` script — Actions-based deploy needs no stored git credentials, no
branch, and auto-adds `.nojekyll` for you.

**New file: `.github/workflows/deploy.yml`**
- Triggers: `push` to `main`, plus `workflow_dispatch` for manual runs.
- `permissions: { contents: read, pages: write, id-token: write }`.
- `concurrency: { group: "pages", cancel-in-progress: false }` — avoids two
  overlapping deploys racing.
- Build job: `actions/checkout`, `actions/setup-node` (Node 20, matching
  `package.json`'s `engines.node: ">=20.0"`, with `cache: 'npm'`), `npm ci`,
  `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact`
  with `path: build`.
- Deploy job: depends on the build job, `environment: github-pages`, single
  step `actions/deploy-pages`.

**Repo setting:** Settings → Pages → Source: **GitHub Actions** (not "Deploy
from a branch") — can be set via `gh api -X POST repos/ChargingTrex/collage-wiki-SAIU/pages -f build_type=workflow`
once the repo is public, or manually in the UI.

## Part E — First deploy + verification

1. Confirm `npm run build` is clean locally right before merging (catches
   any unrelated broken links from concurrent work before CI does).
2. Push the workflow to `main`, watch the Action run in the `Actions` tab.
3. Visit `https://chargingtrex.github.io/collage-wiki-SAIU/` and check:
   homepage renders (including the Recent Activity section), `/docs/*`
   routes resolve with correct `baseUrl`-prefixed assets, `/blog`, `/clubs`,
   `/fests` all load, a direct deep link (e.g.
   `/docs/clubs/art-club/events`) works on a hard refresh (tests GitHub
   Pages' static routing, not just client-side nav), unknown paths hit
   Docusaurus's generated `404.html`.
4. `/admin` will load the Decap CMS UI shell but still can't authenticate or
   save — that's the pre-existing, already-documented gap in
   `docs-internal/decap-cms-auth-todo.md`, not a hosting regression.

**Not in this plan's scope, flagged as a natural follow-up:** finalizing
GitHub Pages as the host resolves the "which hosting?" open question in
`docs-internal/decap-cms-auth-todo.md`, pointing the Decap CMS auth decision
toward **Option A** (GitHub backend + a small OAuth-proxy service, since
Option B needs Netlify hosting). Standing that proxy up is separate work,
not part of getting Pages live.

## Verification summary

- Private backup repo exists, is private, and its `git log`/file listing
  matches the pre-cleanup source repo exactly.
- `git grep` clean for every moved/renamed doc filename.
- `npm run build` succeeds locally before pushing.
- GitHub Actions run goes green end-to-end (build + deploy jobs).
- Live site reachable and correctly routed at the real Pages URL, spot-checked
  across homepage/docs/blog/clubs/fests + one deep link + the 404 page.
