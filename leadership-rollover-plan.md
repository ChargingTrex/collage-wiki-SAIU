# Leadership Rollover Mechanism (clubs + fests)

Status: **planned, not yet implemented** — this is the detailed
implementation plan for the two undone sections of `archive planning.md`
(club board / fest committee snapshot-then-overwrite). Saved here so it
persists across sessions; pick this up next time before starting other work
on the archive system.

## Context

`archive planning.md` (repo root) recorded a decision, made earlier this
project and never built: club exec boards and fest organizing committees
change yearly, and unlike blog posts (permanently dated once published), a
club/fest's live docs page shows *current* team info that would be silently
overwritten each year unless snapshotted first. The decided architecture —
snapshot outgoing team into a permanent `docs/archive/<slug>/` file, then
edit the live page for the incoming team — was fully designed but 0%
implemented. A status check confirmed: no `docs/archive/` tree exists, and
live club/fest pages don't even have a team section yet to snapshot from.

This plan builds that missing mechanism. Scope was narrowed via three
confirmed decisions:

1. **Mechanism only, placeholder data** — build the structure/templates with
   clearly-marked placeholder names, not real board members (same pattern
   already used for the 400+ event backfill: structure now, real content
   later, separately).
2. **Data model**: `name` + `role` mandatory; `photo` + `contact` optional.
3. **Rollover trigger**: build a script to perform the snapshot, but also
   document the manual fallback in `CONTRIBUTING.md`, plus a separate
   tutorial doc explaining the script.
4. Fest organizing-group terminology is confirmed: **"Organisation
   Committee"** — used verbatim in headings/file names.

Two things discovered during research that this plan also fixes as required
side effects, not scope creep:

- `docs/fests/` and `docs/resources/archives.mdx` (with `ArchivesHero` wired
  in) **already exist** now — `archive planning.md`'s claims that they don't
  are stale; this plan doesn't need to build them.
- `src/pages/clubs.js` already contains the exact sentence this feature is
  for ("Past members and past teams are kept on a separate Archives page —
  nothing gets overwritten...") but links to `/docs/resources/archives`,
  the *event* archive — a leftover placeholder link (confirmed via its own
  source draft `club homepage.md`: "Link target is a placeholder..."). This
  plan repoints it to the new leadership archive.
- `docs/tutorial-basics/`/`docs/tutorial-extras/` were deliberately moved
  out of `docs/` into `tutorial-reference/` in an earlier session
  specifically so they stop appearing in the site nav — the new tutorial
  doc goes under `docs/resources/` instead (it already holds
  `docs/resources/archives.mdx` and is described as "shared resources
  across all clubs and fests," which fits).

---

## 1. Data model — one file per club/fest, `.mjs` (not `.js`)

**Why `.mjs`, not `.js` (matching the rest of the codebase's plain `.js`
data files like `clubContacts.js`):** the rollover script (§5) is a
standalone `node scripts/rollover.mjs` process, not run through Docusaurus's
own config loader — it uses Node's native `import()`. `package.json` has no
`"type": "module"` field, so Node treats bare `.js` as CommonJS by default,
and CommonJS's parser throws a syntax error on `export const`. `.mjs` is
unconditionally treated as ESM by Node regardless of `package.json`, so it's
the only way the script can safely import these files directly. The
React/MDX side resolves `.mjs` imports fine too (webpack/Rspack include it
in default resolve extensions) — but to avoid depending on that at all,
**every import of these files, on both the script and React side, uses the
explicit `.mjs` extension** rather than relying on extension-less
resolution.

New files, one per club + one per fest (21 total):

```
src/data/teams/animal-welfare-society.mjs
src/data/teams/art-club.mjs
... (18 clubs, one per docs/clubs/<slug>/)
src/data/teams/tech-fest.mjs
src/data/teams/general-fest.mjs
src/data/teams/cultural-fest.mjs
```

Shape (same export name across all 21 so the script/component never branch
on club-vs-fest for data shape):

```js
// src/data/teams/art-club.mjs
//
// Current Art Club board. Snapshotted into docs/archive/art-club/ at
// rollover (see scripts/rollover.mjs), then reset to a fresh placeholder
// for the incoming board — see CONTRIBUTING.md "Leadership rollover".
//
// name + role are mandatory; photo + contact are optional. PLACEHOLDER_*
// values follow the same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these.

export const CURRENT_TEAM = [
  { name: 'PLACEHOLDER_NAME_1', role: 'PLACEHOLDER_ROLE (e.g. President)' },
  {
    name: 'PLACEHOLDER_NAME_2',
    role: 'PLACEHOLDER_ROLE (e.g. Vice President)',
    // Both optional fields demonstrated once, here, rather than duplicated
    // as fake data across all 21 files:
    photo: '/collage-wiki-SAIU/img/team/art-club/placeholder-vp.jpg',
    contact: { email: 'placeholder@example.com', instagram: null, linkedin: null },
  },
  { name: 'PLACEHOLDER_NAME_3', role: 'PLACEHOLDER_ROLE (e.g. Secretary)' },
];
```

(`photo` path uses a hardcoded `/collage-wiki-SAIU/...` baseUrl prefix,
matching existing precedent in `docs/fests/general-fest.mdx`'s
`audioSrc="/collage-wiki-SAIU/audio/fest-fanfare.mp3"`.)

**New fest-metadata file** (fests are flat `.mdx` files, not folders, so
unlike clubs there's no per-fest `_category_.json` for the script to read
label/description/icon from when it bootstraps a fest's first archive
category):

```js
// src/data/festMeta.mjs
//
// Per-fest label/description/icon — the fest equivalent of a club's own
// _category_.json, read only by scripts/rollover.mjs when bootstrapping a
// fest's docs/archive/<slug>/_category_.json for the first time. Keep in
// sync with each fest's own docs/fests/<slug>.mdx frontmatter by hand.

export const FEST_META = {
  'tech-fest':     { title: 'Innovision',          icon: 'Rocket',      description: "Sai University's annual technical fest — 48 hours, build something real." },
  'general-fest':  { title: 'Annual College Fest', icon: 'PartyPopper', description: "Sai University's annual college-wide fest — where every club comes together." },
  'cultural-fest': { title: 'MoSAIc',               icon: 'Sparkles',    description: "Sai University's annual cultural fest — the heartbeat of Sai University." },
};
```

`Rocket`, `PartyPopper`, `Sparkles` confirmed present in installed
`lucide-react@1.27.0`, no collisions with the 18 club icons already in
`src/data/sidebarIcons.js`.

**Fest icons — added now, not deferred:** fests currently have no
`sidebar_custom_props.icon` at all. Each `TechFestHero`/`GeneralFestHero`/
`CulturalFestHero` already calls `useClubAccent()` with a *borrowed* club
slug (documented in their own header comments) — fests were always meant to
have an accent, they just never got a sidebar icon wired. Adding one now is
low-risk and reuses the exact mechanism clubs already have. This does **not**
extend `CLUB_ACCENTS`/`useClubAccent` with fest-specific accent colors —
that's a separate, larger change to a hook used in 20+ places, out of scope
here. Fest sidebar icons will render in the *borrowed* club's accent color,
same as their heroes already do.

---

## 2. `TeamSection` component (+ one small justified refactor)

`src/components/ClubContact.jsx` inlines `ContactLink`, `InstagramIcon`,
`LinkedinIcon` (confirmed by reading the file in full). `TeamSection` needs
the identical three things for each member's optional contact row. Extract
rather than duplicate:

- **New:** `src/components/contactIcons.jsx` — `ContactLink`, `InstagramIcon`,
  `LinkedinIcon` moved verbatim out of `ClubContact.jsx`. No behavior change.
- **Modify:** `src/components/ClubContact.jsx` — imports those three from
  `./contactIcons` instead of defining them locally. Output identical.
- **New:** `src/components/TeamSection.jsx` — renders a list of
  `{name, role, photo?, contact?}`. No photo → a generic `UserRound` lucide
  icon in a circle, colored via the same `var(--club-accent)` /
  `useClubAccent(clubSlug)` pattern `ClubContact` already uses. Contact row
  (if present) reuses `ContactLink`/`InstagramIcon`/`LinkedinIcon` from the
  new shared file. **Does not render its own heading** — same convention
  `ClubContact` follows (the `.mdx` author writes `## Current Board` /
  `## 2025-26 Board` themselves) — this is what lets the exact heading wording
  vary correctly between "Board" (clubs) and "Organisation Committee" (fests)
  without the component needing to know which one it is.

Verify `--ds-text-secondary` (used for the role line) still meets the
4.5:1 AA contrast ratio this codebase has already audited/fixed once
(`changes.md`'s WCAG entry) — check, don't assume.

---

## 3. Wiring into the 21 live pages

Club pages import from `.../data/teams/<slug>.mjs` (explicit extension, per
§1). Diff pattern for all 18 (`docs/clubs/art-club/index.mdx` shown):

```diff
 import { ArtHero } from '@site/src/components/clubs/ArtHero';
 import { ClubContact } from '@site/src/components/ClubContact';
 import { CLUB_CONTACTS } from '@site/src/data/clubContacts';
+import { TeamSection } from '@site/src/components/TeamSection';
+import { CURRENT_TEAM } from '@site/src/data/teams/art-club.mjs';

 <ArtHero />

 The Art Club brings together students who paint, sketch, and experiment with
 visual media, hosting open studio sessions, exhibitions, and workshops across
 the year.

+## Current Board
+
+<TeamSection clubSlug="art-club" members={CURRENT_TEAM} />
+
+Looking for a past board? See the [Art Club Archive](/docs/archive/art-club).
+
 ## Contact
 <ClubContact clubSlug="art-club" {...CLUB_CONTACTS['art-club']} />
```

Fest pages (flat `.mdx`, e.g. `docs/fests/tech-fest.mdx`) get the same
addition plus the new icon frontmatter (§1):

```diff
 ---
 title: Innovision
 description: Sai University's annual technical fest — 48 hours, build something real.
 hide_title: true
+sidebar_custom_props:
+  icon: Rocket
 ---

 import { TechFestHero } from '@site/src/components/fests/TechFestHero';
+import { TeamSection } from '@site/src/components/TeamSection';
+import { CURRENT_TEAM } from '@site/src/data/teams/tech-fest.mjs';

 <TechFestHero audioSrc="/collage-wiki-SAIU/audio/innovision-theme.mp3" />

 Innovision is Sai University's flagship technical fest...
+
+## Current Organisation Committee
+
+<TeamSection clubSlug="tech-fest" members={CURRENT_TEAM} />
+
+Looking for a past committee? See the [Innovision Archive](/docs/archive/tech-fest).
```

`clubSlug` is passed explicitly (not inferred from the URL), so
`TeamSection`'s member-icon accent color is correct on both live pages and
archive snapshot pages regardless of the sidebar-icon nuance in §4.

Sequence note: land §4's archive scaffolding (so `/docs/archive/<slug>`
resolves) before/alongside these links — `onBrokenLinks: 'throw'` in
`docusaurus.config.js` hard-fails the build on any dangling link.

---

## 4. Archive tree — scaffold 2 worked examples, not all 21 upfront

**Top-level, build now:**

```json
// docs/archive/_category_.json
{
  "label": "Archive",
  "position": 5,
  "link": {
    "type": "generated-index",
    "slug": "/archive",
    "description": "Past boards and organisation committees, one permanent file per club/fest per year. Live pages always show the current team — this is where the previous ones go."
  }
}
```

**Explicit `link.slug` is required, not optional:** confirmed by inspecting
the actual compiled route (`.docusaurus/docusaurus-plugin-content-docs/
default/p/collage-wiki-saiu-docs-category-clubs-b38.json`) that Docusaurus's
default `generated-index` permalink is `/docs/category/<label-slug>`, **not**
`/docs/<folder-path>` — without an explicit `slug`, the archive category
would resolve to `/docs/category/archive`, not `/docs/archive`, breaking
every link this plan adds in §3. Setting `link.slug` explicitly also
decouples the URL from the label text, so relabeling later can't break links.

**Deliberately not pre-creating all 21 per-slug archive folders.**
Docusaurus's autogenerated sidebar (`sidebars.js`: `{type: 'autogenerated',
dirName: '.'}`) builds categories bottom-up from discovered docs — a folder
containing only a `_category_.json` and no actual doc renders nothing in the
sidebar (consistent with every existing category in this repo always having
≥1 real doc inside already). Pre-building 19 empty scaffolds would be dead,
unverifiable configuration that could drift out of sync before ever being
used. Instead: **the rollover script is the mechanism that bootstraps a
slug's archive category**, exercised for real the first time each club/fest
actually has a rollover. The remaining 19 slugs correctly show no archive
sidebar entry until then — expected, not a gap.

**What ships in this pass, produced by actually running the script (§5)
against the placeholder data — this doubles as both the build's own
verification and its worked documentation example:**

- `docs/archive/art-club/_category_.json` + `docs/archive/art-club/2025-26-board.mdx`
- `docs/archive/tech-fest/_category_.json` + `docs/archive/tech-fest/2025-26-committee.mdx`

Per-slug category shape (script-generated):

```json
// docs/archive/art-club/_category_.json
{
  "label": "Art Club Archive",
  "description": "Past boards for the Art Club, one file per year.",
  "customProps": { "icon": "Palette" },
  "link": {
    "type": "generated-index",
    "slug": "/archive/art-club",
    "description": "Past boards for the Art Club, one file per year."
  }
}
```

Per-year snapshot shape (script-generated):

```mdx
{/* docs/archive/art-club/2025-26-board.mdx */}
---
title: Art Club — 2025-26 Board
description: PLACEHOLDER — archived Art Club board for 2025-26.
---

import { TeamSection } from '@site/src/components/TeamSection';

## 2025-26 Board

<TeamSection
  clubSlug="art-club"
  members={[
    { "name": "PLACEHOLDER_NAME_1", "role": "PLACEHOLDER_ROLE (e.g. President)" },
    ...
  ]}
/>
```

Note `hide_title` is intentionally **omitted** here — live pages set
`hide_title: true` because their Hero already renders a heading; archive
pages have no Hero, so the normal `# Title` should render. Worth flagging so
this doesn't get "corrected" to match the live-page convention later.

---

## 5. The rollover script

**Location:** `scripts/rollover.mjs` (no `scripts/` dir exists yet).

**`package.json` addition:** `"rollover": "node scripts/rollover.mjs"`.
Invoked as `npm run rollover -- club art-club 2025-26` or
`npm run rollover -- fest tech-fest 2025-26 --dry-run`.

**Interface:** positional args (`type`, `slug`, `outgoingYear`), no new CLI
dependency — `yargs`/`commander` aren't in `package.json` and 3 args don't
justify adding one. Flags: `--dry-run` (log planned writes only), `--force`
(skip the placeholder-data confirmation prompt).

**Steps:**

1. Validate `type` ∈ `{club, fest}`; `outgoingYear` matches `/^\d{4}-\d{2}$/`.
2. **Validate `slug` via the filesystem, not by importing `clubDirectory.js`
   or `clubAccents.js`** — those are plain `.js` files with the same
   CJS-default problem `.mjs` was chosen to avoid (§1). Instead: check
   `fs.existsSync('src/data/teams/<slug>.mjs')`. Since all 21 team files
   ship with this plan (§1), this is a complete, ESM-safe validation with
   no extra import risk.
3. `suffix = type === 'club' ? 'board' : 'committee'`; `heading = type ===
   'club' ? 'Board' : 'Organisation Committee'`.
4. `await import('../src/data/teams/<slug>.mjs')` → `CURRENT_TEAM`. Validate
   every entry has non-empty `name`/`role`; if any value contains the
   literal string `PLACEHOLDER`, warn and prompt (Node `readline`) unless
   `--force`.
5. Refuse if `docs/archive/<slug>/<outgoingYear>-<suffix>.mdx` already
   exists — archive files are permanent, never edited after creation, so
   this is a hard stop.
6. If `docs/archive/<slug>/_category_.json` doesn't exist: create the
   folder and write it — label/description/icon sourced from
   `docs/clubs/<slug>/_category_.json` (clubs, plain `JSON.parse`, no ESM
   issue) or `FEST_META[slug]` from `src/data/festMeta.mjs` (fests, `.mjs`
   dynamic import, safe per §1), plus the explicit `link.slug` (§4).
7. Write `docs/archive/<slug>/<outgoingYear>-<suffix>.mdx`: frontmatter,
   `<TeamSection clubSlug="<slug>" members={...} />` with the array via
   `JSON.stringify(CURRENT_TEAM, null, 2)`, under `## <outgoingYear>
   <heading>`.
8. Overwrite `src/data/teams/<slug>.mjs` wholesale with a fresh placeholder
   template (§1's shape) for the incoming team — a single atomic whole-file
   write, which is *why* team data is one file per slug rather than one
   shared multi-club object (a shared file would need fragile regex/AST
   surgery to safely reset just one club's section without risking the
   other 20).
9. Print a summary and the required manual next step: "edit
   `src/data/teams/<slug>.mjs` with the incoming team's real names, then
   `npm run build`."

`--dry-run` runs steps 1–7's logic but only logs planned writes (used both
for future real rollovers and this plan's own build verification, §7).

---

## 6. CONTRIBUTING.md and tutorial doc

**`CONTRIBUTING.md`** — new "Leadership rollover (clubs & fests)"
subsection: one paragraph on the snapshot-then-overwrite problem (reusing
`archive planning.md`'s framing), the script command, and the **manual
fallback** (the exact steps from §5, written for a human doing it by hand —
explicitly stating archive files are permanent/never edited after
creation). Update the "where things live" tree to add `docs/archive/`,
`src/data/teams/`, `scripts/rollover.mjs`. New PR-checklist line: "If this
was a rollover, the outgoing team's data is in `docs/archive/<slug>/`, not
still sitting in `src/data/teams/<slug>.mjs`."

**New tutorial doc — `docs/resources/leadership-rollover.mdx`** (not under
`tutorial-basics`/`tutorial-extras` — those were deliberately relocated out
of `docs/` in an earlier session specifically so they stop appearing in the
site nav; `docs/resources/` is the actual home for shared how-to content):

```mdx
---
title: Running a Leadership Rollover
description: How to snapshot an outgoing club board or fest organisation committee and reset the live page for the incoming one.
---

# Running a Leadership Rollover

...why this exists (snapshot-then-overwrite, one paragraph)...

## Using the script

    npm run rollover -- club art-club 2025-26
    npm run rollover -- fest tech-fest 2025-26

What it creates, what it resets, and what you still do by hand afterward
(fill in the incoming team's real names).

## If the script isn't available

See "Leadership rollover" in CONTRIBUTING.md for the manual steps.

## Browsing past teams

Every past board/committee lives under [the Archive](/docs/archive).
```

---

## 7. Required link fix

`src/pages/clubs.js` currently links to the *event* archive
(`/docs/resources/archives`) from copy that's explicitly about *team*
history — a known leftover placeholder (confirmed via its own source draft
`club homepage.md`). Repoint it:

```diff
-teams are kept on a separate <Link to="/docs/resources/archives">Archives page</Link> —
+teams are kept on a separate <Link to="/docs/archive">Archive</Link> —
```

---

## Verification

1. `npm start` — confirm on `/docs/clubs/art-club`: "Current Board" renders
   3 placeholder members (the demonstration entry shows photo + contact),
   correct accent color. Confirm the same on a plain club with no
   photo/contact (`/docs/clubs/astronomy-club`) and on `/docs/fests/
   tech-fest` ("Current Organisation Committee" heading, `Rocket` icon now
   visible in the sidebar next to "Innovision").
2. Confirm the icon/accent nuance concretely: sidebar → `docs/archive` →
   "Art Club Archive" category (icon = Palette, Fuchsia, matching the live
   Art Club category) → into "2025-26 Board" (that individual file's own
   sidebar entry — expect its nav icon to fall back to the generic unified
   accent, not Fuchsia, since its href ends in `2025-26-board` not
   `art-club` — an accepted, documented fallback) while the **page body's**
   member icons still render correctly in Fuchsia (confirms the
   explicit-`clubSlug`-prop path in §3 is unaffected).
3. `npm run rollover -- club art-club 2025-26 --dry-run`, then for real;
   repeat for `tech-fest`. Confirm the exact 2 files/folders from §4 are
   produced. Re-run against the same slug/year — confirm it refuses (step 5
   of §5) rather than clobbering.
4. `npm run build` — must succeed given `onBrokenLinks: 'throw'`. Check the
   compiled route JSON for the new archive categories (same technique as
   Finding 3) to confirm actual resolved permalinks are `/docs/archive` and
   `/docs/archive/art-club` before trusting any hand-written link to them.
5. Confirm the remaining 19 un-rolled-over slugs show no archive sidebar
   entry yet (expected).
6. Confirm `src/pages/clubs.js`'s updated link resolves correctly.

## Critical files

- `src/components/TeamSection.jsx`, `src/components/contactIcons.jsx` (new)
- `src/components/ClubContact.jsx` (refactor only, no behavior change)
- `src/data/teams/*.mjs` (21 new), `src/data/festMeta.mjs` (new)
- `scripts/rollover.mjs` (new), `package.json` (new `rollover` script)
- `docs/archive/_category_.json`, `docs/archive/art-club/`,
  `docs/archive/tech-fest/` (new, worked examples)
- All 18 `docs/clubs/<slug>/index.mdx` and all 3 `docs/fests/<slug>.mdx`
  (wiring)
- `CONTRIBUTING.md`, `docs/resources/leadership-rollover.mdx` (new),
  `src/pages/clubs.js` (link fix)
