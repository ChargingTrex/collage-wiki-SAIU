# Archive Planning

Status: **planning only — nothing in this doc has been built yet.** Consistent
with CLAUDE.md's existing note that a separate `/events`-style build is future
scope; this doc just records the decisions so implementation can start whenever
the user is ready.

Two distinct archival concerns exist in this project. They look similar
("old stuff going somewhere") but need different treatment, because one kind
of content is already permanently dated and the other represents *current
state* that gets overwritten unless explicitly snapshotted.

---

## 1. Event history (400+ past events)

**No structural change — this is the architecture already in place.**

- Event posts live in `/blog` exactly as Docusaurus/Decap CMS expect
  (`blog/YYYY-MM-DD-slug/index.md` + co-located images). They are **never
  physically moved or copied** into any archive folder.
- `blog/tags.yml` already tags every post by club (18 tags), by fest
  (`tech-fest` / `general-fest` / `cultural-fest`), by event type
  (workshop/competition/talk/screening/exhibition/performance/hackathon), and
  by `student-voices` for individually-authored posts. Tagging a post
  `art-club` is what makes it show up under that club — no extra frontmatter
  field needed.
- A future **Archives page** will lay a timeline + search/filter UI over these
  tagged posts (browse by year, by club, by fest, free-text search). This is
  a **pure presentation layer** — it reads existing posts/tags, moves nothing,
  breaks no URLs, and doesn't touch the co-located image pipeline.
- **The Hero:** `src/components/ArchivesHero.jsx` already exists and is built
  for exactly this page, but is **not yet wired into any route** (no
  `src/pages/archives.js` or `docs/archives` page imports it yet). Per its own
  header comment: a static wall of book spines where one volume at a time
  slides partway out and settles back — deliberately *not* a conveyor-belt of
  books drifting past, because that would read as "in transit" rather than
  "archived." The visual metaphor is retrieval/findability: a body of material
  you can reach into and pull something specific out of — which is exactly
  what the timeline+search UI needs to deliver functionally. Paired
  conceptually with `LibraryHero` (put-in vs. get-out).
- **Content sourcing** for the actual 400+ historical events is a **separate,
  manual effort** — most of it lives on club Instagram accounts, some events
  were never recorded at all, and it's not yet known whether every club has
  documentation for every past event. This will involve juniors/club members
  doing manual backfill via Decap CMS. Not a tooling problem to solve now,
  though a later "Instagram post → `index.md`" template could speed it up —
  explicitly deferred, not needed yet.

---

## 2. Leadership rollover — clubs (18)

Club exec boards change every year. Unlike events, the live club doc
(`docs/clubs/<slug>.mdx`) shows *current* board members — editing it in place
for the new year would silently destroy the previous board's record unless
something is done first.

**Decided approach: snapshot then overwrite.**

1. At year-end, copy the outgoing board's info into a new, permanent file:
   `docs/archive/<club-slug>/<year-range>-board.mdx`
   e.g. `docs/archive/art-club/2025-26-board.mdx`
2. Edit the live `docs/clubs/<club-slug>.mdx` page in place to show the
   incoming board for the new year.
3. Repeat annually — one file accumulates per club per year, each with its own
   permanent URL, each individually linkable/findable via the same
   timeline+search UI built for events.

**Rejected alternative:** a single ever-growing "board history" table living
on the club's live doc page, with no separate files. Rejected because it
isn't individually linkable/findable the way a timeline+search experience
needs — you'd get one long table, not discrete browsable records.

**Archive location:** a **central archive tree grouped by club**, not nested
inside each club's own docs folder — i.e. `docs/archive/<club-slug>/...`
lives alongside `docs/clubs/`, `docs/fests/`, etc., rather than as a
subfolder inside `docs/clubs/<slug>/`.

---

## 3. Leadership rollover — fests (NEW: same treatment extended to fests)

The same problem exists for fest organizing committees: Tech Fest, General
Fest, and Cultural Fest each have a committee/leads that changes yearly, and
(once `docs/fests/<fest-slug>.mdx` pages exist — not yet built) the live fest
page would face the identical overwrite problem as club pages.

**Decision: apply the identical snapshot-then-overwrite pattern to fests.**

1. At year-end (or whenever each fest's cycle resets), copy the outgoing
   committee's info into: `docs/archive/<fest-slug>/<year-range>-committee.mdx`
   e.g. `docs/archive/tech-fest/2025-26-committee.mdx`
2. Edit the live `docs/fests/<fest-slug>.mdx` page in place for the new
   committee.
3. Same central archive tree as clubs — `docs/archive/` holds both
   `docs/archive/<club-slug>/` and `docs/archive/<fest-slug>/` side by side,
   same timeline+search UI surfaces both.

Fest slugs (from `blog/tags.yml`): `tech-fest`, `general-fest`,
`cultural-fest`. File naming uses "`-committee.mdx`" rather than clubs'
"`-board.mdx`" purely to match how fests refer to their organizing group;
adjust the word if the actual club/fest terminology differs from this guess.

---

## Summary: unified archive tree

```
docs/
├── clubs/                          # live pages, current state only
│   └── art-club.mdx
├── fests/                          # live pages, current state only (not yet built)
│   └── tech-fest.mdx
└── archive/                        # snapshots only, never edited after creation
    ├── art-club/
    │   ├── 2024-25-board.mdx
    │   └── 2025-26-board.mdx
    ├── tech-fest/
    │   ├── 2024-25-committee.mdx
    │   └── 2025-26-committee.mdx
    └── ...
```

Events stay out of this tree entirely — they remain in `/blog`, surfaced
through tags + the future Archives page (`ArchivesHero`), not through
`docs/archive/`.

## Open items before implementation

- Confirm actual terminology fests use for their organizing group (committee?
  leads? core team?) to name the archive files accurately.
- `docs/fests/` doesn't exist yet — fest committee rollover can't be wired
  until those live pages are built.
- No mechanism yet decided for *who* triggers the yearly snapshot (manual
  Decap CMS action by outgoing club lead? scripted prompt? review reminder?).
- Archives page route/location not yet decided (`src/pages/archives.js` vs. a
  `docs/archives` doc).
