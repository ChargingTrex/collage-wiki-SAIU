# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — public visitors.** Students, prospective students, parents, and
faculty browsing Sai University's 21 student clubs, 3 fests, and the 400+
event archive. Their job is reading and discovering, not editing: find a club,
see what it actually does, browse its event history, get contact/leadership
info.

**Secondary — club leads / non-technical editors.** Write and upload event
write-ups and photos, today via a developer PR, eventually through the
Decap CMS form at `/admin` once its auth backend is wired up. Design and
content-model decisions should keep this path as low-friction as possible for
someone with no Markdown/Git/React background, but the visitor experience is
the higher priority when the two pull in different directions.

## Product Purpose

A free, publicly hosted wiki that documents Sai University's student club
ecosystem and its 400+ archived events, so a visitor can discover a club,
understand what it actually does, and see its history — and so that record
stays accurate and easy for club leads to keep current year over year.

## Positioning

Every club and fest gets a hand-built hero animation rooted in what that club
*actually does* (a telescope pan for Astronomy, a brush stroke for Art, a
script page for Theatre) rather than a generic spinning icon or stock
photography — 26 of them, all governed by one shared playback rule and one
shared accent-color system so the bespoke-per-club craft never turns into
per-club inconsistency. Combined with a free GitHub Pages hosting model and a
content pipeline aimed at letting club leads self-serve routine event posts
without needing a developer, this is a level of dedicated, maintainable craft
a generic club-directory template or a Google Sites/Linktree-style page
couldn't match.

## Operating Context

- Visitors browse via the homepage, `/clubs`, `/fests`, `/explore`, `/events`,
  `/student-voices`, and each club/fest's own page.
- Club leads submit event write-ups (text, tags, photos) today via a
  developer PR; the `/admin` Decap CMS form exists and renders but cannot yet
  save (no auth backend wired up).
- Club/fest pages themselves (MDX with hero-component imports) are not
  CMS-editable by design — only the Events collection is.
- Developers maintain the 26 hero components, the two shared hooks
  (`useIntroMotion`, `useClubAccent`), the design-token system, and infra;
  changes deploy automatically to GitHub Pages on push to `main`.
- A club or fest's leadership board changes yearly; the outgoing board is
  snapshotted into a permanent, never-edited-again archive page rather than
  overwritten in place.

## Capabilities and Constraints

- Docusaurus v3 static site, Tailwind + a custom `--ds-*` design-token system
  mapped onto Infima, Framer Motion primary for animation (motion.css/js as
  fallback only).
- 21 club pages + 3 fest pages + Library + Archives, each with a custom hero;
  400+ event posts under `blog/` with co-located images.
- Decap CMS at `/admin` is structurally scaffolded but not yet saveable —
  content edits currently go through a developer via PR. Club/fest pages are
  deliberately excluded from CMS editing.
- WCAG 2.1 AA is the accessibility target sitewide.
- Audio never autoplays anywhere (fest/club players are click-to-play only).
- Dual license: GPL-3.0 + Commons Clause for code (non-commercial), CC
  BY-NC-SA 4.0 for content (docs/blog/images/audio) — any design or content
  work must stay compatible with non-commercial use and attribution.

## Brand Commitments

- Site identity: "Sai University Club & Event Wiki."
- The 21 clubs, their slugs, and their individual accent colors are fixed
  (see the club table in the root `CLAUDE.md`); a handful of heroes
  intentionally keep their own palette even in unified accent mode (Gaming's
  second ghost, Art's color cycle, Fashion's gold, fest palettes) because the
  color is part of that club's concept.
- The Scholar design system (`scholar-design-system-hybrid (1).html`) is the
  established source-of-truth palette/token spec, already implemented — not
  an open choice for new work to relitigate.
- Footer easter egg: hidden 🦖, in-flow at the bottom of every page, "charging
  trex..." hover tooltip, green by default and recoloring to the unified
  accent when unified mode is on.

## Evidence on Hand

- 400+ real, already-published event write-ups with real photos under
  `blog/`, growing over time.
- Real club/fest rosters via `TeamSection` and `src/data/teams/*.mjs`
  (placeholder photos where a real one hasn't been supplied yet).
- Real, byte-verified license text (`LICENSE`, `LICENSE-CREATIVE-COMMONS.md`)
  and the full Scholar design-token spec.
- No testimonials, press, benchmarks, or pricing exist or apply — do not
  invent any.

## Product Principles

- Motion comes from what the club actually does, never a generic or spinning
  icon — bespoke per club, consistent across clubs via the two shared hooks.
- Free and sustainable: GitHub Pages hosting, no paid backend, non-commercial
  licensing on both code and content.
- Club leads should eventually be able to self-serve routine event content
  without developer involvement; design and content-model choices should not
  make that path harder than it needs to be.
- Published event posts and yearly leadership snapshots are permanent once
  archived — never silently overwritten.
- Accessibility and reduced-motion support are baseline requirements applied
  once in shared code, not per-component afterthoughts.

## Accessibility & Inclusion

WCAG 2.1 AA sitewide. `prefers-reduced-motion` is respected by every hero,
carousel, and animation (rested state, no override on hover); autoplay
carousels and audio never run for reduced-motion visitors and hide controls
that would do nothing.
