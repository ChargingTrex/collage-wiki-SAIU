# Build Prompt — Sai University Club & Event Wiki

Paste this into a fresh Claude Code session opened in the project folder, with
`CLAUDE.md` and all source docs present.

---

## Your role

You are the implementation agent for the **Sai University, Chennai** club & event
wiki: a **Docusaurus v3** site — 18 student clubs, 400+ archived events, hosted on
**GitHub Pages**, editable by non-technical club leads via **Decap CMS** at
`/admin`. The signature feature is **23 custom animated hero components** (18
clubs + Library + Archives + 3 fests), each built around the club's actual
activity rather than a spinning icon, governed by one shared playback rule
(`useIntroMotion`) and one shared accent system (`useClubAccent`).

## How I want you to work

Work in three phases — **gather context → plan → code** — and never skip ahead.

1. **Gather context.** Read everything, then ask me the open questions *before*
   planning. Don't guess where a doc is ambiguous, conflicts, or is silent.
2. **Plan.** Produce a written plan and **checklists** I can approve. No code yet.
3. **Code.** Only after I approve the plan, and only one checkpoint at a time.

At **every checkpoint**: stop, report what you did, and wait for my go-ahead
before continuing. Whenever the docs are ambiguous, conflict with my
instructions, or a decision isn't covered — **stop and ask me** rather than
guessing. Never push, deploy, or delete anything without my explicit confirmation.

---

## Locked decisions — apply as given, do not relitigate

- **Framer Motion is primary.** Use it wherever possible. `motion.css` /
  `motion.js` are a **fallback only** when no Framer equivalent exists — kept,
  not deprecated.
- **Design system** = `scholar-design-system-hybrid (1).md` (primary `#3b6af5`,
  secondary `#f77f0e`, accent `#218A5E`). Map onto Infima in `custom.css`.
- **Tailwind is required.** **Shadcn is removed from the stack — do not install
  or init it.**
- **All 23 heroes exist**, including `TuringitesHero` — none are missing.
- **Content model** stays `/docs` (clubs + fests) + `/blog` (events). A separate
  `/events` section is **future** — do not build it now.
- **Audio never autoplays**; files are user-supplied.

---

## PHASE 1 — Gather context (do this first, no code)

Read `CLAUDE.md`, then the four authoritative docs in order — `BUILD-BRIEF (1).md`,
`scholar-design-system-hybrid (1).md`, `saiu-collage-wiki-easter-egg.md`,
`animation-caveats.md` — plus the reference docs (`sai-uni-wiki-spec.md`,
`sai-uni-wiki-motion-guide.md`, `traced-handwriting-guide.md`).

Then come back to me with:
- A short restatement of the project in your own words, to confirm alignment.
- Every **contradiction** you found between my locked decisions and the docs, or
  between docs.
- Every **gap** — anything undecided that you'll need an answer on before you can
  build (e.g. homepage cards static vs mini-heroes, GitHub org/repo names, whether
  fest audio exists yet, Decap CMS auth/backend choice, any hero flagged in
  `animation-caveats.md` as unresolved).
- Any **build risks** you foresee (e.g. `react-chrome-dino` against React 18 /
  Docusaurus v3 SSR, hydration mismatches, image-pipeline gotchas).

**Ask your questions as a numbered list and wait for my answers.** Do not proceed
to Phase 2 until I've responded.

---

## PHASE 2 — Plan & checklists (after my answers, still no code)

Produce, for my approval:
1. A **build plan** following `BUILD-BRIEF` §5, incorporating my Phase 1 answers.
2. A **master checklist** derived from Appendix B, broken down per checkpoint.
3. A **file-integration map** — which of the pre-built files land where, plus the
   two renames (`LibraryHero-v2`→`LibraryHero`, `LiteraryHero-fontmask`→
   `LiteraryHero`, deleting the old versions).
4. **Open decisions still needing me**, if any remain.

Keep the checklists as living markdown I can check off. **Wait for my approval of
the plan before writing any code.**

---

## PHASE 3 — Code, one checkpoint at a time

After each checkpoint: report status against its checklist, then stop.

**CP1 — Scaffold + styling.** Docusaurus + Tailwind + fonts (no Shadcn). Write
`custom.css` from the Scholar hybrid doc incl. the accent bridge:
```css
:root               { --club-accent: var(--club-accent-light); }
[data-theme='dark'] { --club-accent: var(--club-accent-dark); }
```
Show the running skeleton and the `--ds-*` → Infima token mapping. Stop.

**CP2 — Infra + smoke test.** Drop in `useIntroMotion`, `useClubAccent`,
`clubAccents`, primitives; verify imports resolve; do the two renames; wire **one**
club page as a smoke test. Prove load animation → still-on-scroll → hover replay,
and the reduced-motion path, on that one page. Stop.

**CP3 — All heroes + club pages.** Integrate the remaining heroes; build all 18
club `.mdx` pages (slugs in `CLAUDE.md`), hero at top of each. Report
render/animation status per hero; flag any misbehaving. Stop.

**CP4 — Homepage + fests.** Reconcile `index.js` with the Scholar palette (confirm
with me: static cards vs mini-heroes). Place the 3 fest heroes, `audioSrc` stubbed
(nothing autoplays). Stop.

**CP5 — Blog + CMS.** Blog structure, Decap CMS at `/admin`, co-located image
pipeline. Confirm a sample event post builds with compressed images. Stop.

**CP6 — Easter egg.** Swizzle Footer `--wrap`; in-flow at **page bottom** (hidden),
keep the "charging trex..." tooltip, dino **green by default**, recolored to the
**unified accent when the toggle is on** (reads `useAccentMode()`),
`react-chrome-dino` for now (swap later only if it errors). Verify it builds. Stop.

**CP7 — Infra polish, in this exact order:**
  (a) **Accent unified-mode toggle UI** — build the settings control that calls
      `setAccentMode` and persists; confirm the dino recolors with it.
  (b) **Off-screen `IntersectionObserver` pause** — add once inside
      `useIntroMotion` to pause looping heroes when off-screen.
Confirm (a) before starting (b). Stop.

**CP8 — Deploy.** Walk me through GitHub Pages config and deploy steps.
**Do not push or deploy without my explicit confirmation.**

---

**Begin with Phase 1.** Read the docs, then bring me your numbered questions.
