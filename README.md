# Sai University Club & Event Wiki

A [Docusaurus v3](https://docusaurus.io/) wiki for **Sai University, Chennai**:
18 student clubs, 400+ archived events, hosted free on **GitHub Pages**, editable
by non-technical club leads via **Decap CMS** at `/admin`. The signature feature
is **23 custom animated hero components** (18 clubs + Library + Archives + 3
fests), each built around the club's *actual activity* rather than a spinning
icon, governed by one shared playback rule and one shared accent-color system.

## Status

This repo is currently in the **pre-scaffold planning stage**. The root holds
the pre-built hero components (`.jsx`), shared hooks (`.js`), and the planning
documents that define the build — not yet a running Docusaurus site. The
scaffold and integration work is tracked checkpoint-by-checkpoint; see below.

## Where to start

Read in this order:

1. **[`CLAUDE.md`](CLAUDE.md)** — working instructions and locked decisions for
   anyone (human or agent) building in this repo.
2. **[`BUILD-BRIEF (1).md`](<BUILD-BRIEF (1).md>)** — master decisions doc: file
   inventory, build order, verification checklist.
3. **[`scholar-design-system-hybrid (1).html`](<scholar-design-system-hybrid (1).html>)** —
   the design system (open in a browser; it's a live token/style reference, not
   prose).
4. **[`saiu-collage-wiki-easter-egg.md`](saiu-collage-wiki-easter-egg.md)** — the
   hidden footer Chrome-dino easter egg spec.
5. **[`animation-caveats (3).md`](<animation-caveats (3).md>)** — current,
   authoritative open-issues log for the hero animations (supersedes `(1)` and
   `(2)`, kept alongside for history).

## Build checkpoints

The build proceeds one checkpoint at a time, each requiring sign-off before the
next starts:

- **CP0** — repo init, README, prerequisites, initial commit + push *(this one)*
- **CP1** — Docusaurus + Tailwind scaffold, Scholar hybrid styling
- **CP2** — shared hooks/infra wired in, one club page smoke-tested
- **CP3** — all 23 heroes integrated, all 18 club pages built
- **CP4** — homepage (mini-hero cards) + 3 fest heroes
- **CP5** — blog structure + Decap CMS
- **CP6** — footer easter egg
- **CP7** — accent unified-mode toggle, off-screen animation pause
- **CP8** — GitHub Pages deploy

## Prerequisites

See [`requirements.txt`](requirements.txt) for what you need installed to work
on this repo.
