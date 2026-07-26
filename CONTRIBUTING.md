# Contributing to the Sai University Wiki

This is a Docusaurus v3 site for Sai University's 18 student clubs, fests, and
400+ archived events. It's built so **two very different kinds of people** can
contribute to it:

- **Club leads / non-technical editors** — add or update event posts and club
  info through a web form, no code required.
- **Developers** — work on hero animations, layout, the design system, or
  infra.

Pick the section below that matches what you're doing.

---

## 1. Editing content without touching code

> **Not available yet.** Decap CMS needs a real backend (GitHub OAuth or
> Git Gateway) to save changes, which only works once the site has actual
> hosting set up (GitHub Pages + the CMS backend). Until then, `/admin` may
> not be wired up, and content edits should go through a developer via PR.
> This section describes how it will work once hosting is live.

Go to `/admin` on the live site (or `http://localhost:3000/admin` locally).
This opens **Decap CMS**, a form-based editor. From there you can:

- Add a new **event post** (this becomes a dated entry under the club's
  archive) — write the text and upload images through the form.
- Edit a **club page** (constitution, exec board, description).

You do not need to know Markdown, React, or Git. Images you upload are
automatically stored next to the post they belong to, so they keep working
even as the archive grows.

If `/admin` won't load or won't save, that's a developer issue (CMS config or
GitHub Pages auth) — report it rather than editing files by hand.

---

## 2. Developer setup

```bash
git clone <repo-url>
cd sai-uni-wiki
npm install
npm start          # http://localhost:3000, hot reload
```

Other useful commands:

```bash
npm run build       # production build — must pass before any PR
npm run serve       # serve the production build locally
npm run clear       # wipe Docusaurus's cache if something looks stale
```

Before opening a PR, always run `npm run build` locally. A page that only
breaks in the production build (not `npm start`) is a common way bugs slip
through.

---

## 3. Where things live

```
src/
  css/custom.css              site-wide styles + Scholar design tokens (--ds-*)
  theme/Footer/index.js       swizzled footer (the dino easter egg lives here)
  components/
    useIntroMotion.js         shared animation-lifecycle hook — all heroes use this
    useClubAccent.js          shared per-club accent-color hook
    clubAccents.js            the accent color for every club, one place
    primitives/Book.jsx       shared visual primitive
    clubs/                    18 club hero components
    fests/                    fest hero components + FestSound
  pages/index.js              homepage
docs/
  clubs/                      one .mdx page per club (hero component at the top)
  resources/
blog/
  YYYY-MM-DD-<event-slug>/    one folder per event, images co-located inside
static/
  admin/index.html            Decap CMS config
  audio/                      fest/club audio files
  img/
```

### Adding a new event post

Create `blog/YYYY-MM-DD-<event-name>/index.md` and put any images for that
post **in the same folder**. Never reference an image by an absolute path
(`/img/...`) from a blog post — always use a relative path to the co-located
file. This is what lets Docusaurus auto-compress images and keeps URLs stable
as the archive grows past 400 posts.

The blog isn't only for club-run events — **students can also write and
publish blog posts individually**, not on behalf of any club.

Every post needs a `tags:` field in its frontmatter, drawn from
`blog/tags.yml`:

```md
---
title: Stargazing Night — March Meetup
tags: [astronomy-club, talk]
---
```

- If the post is a club event, include that club's tag (e.g. `astronomy-club`)
  so it automatically appears on that club's tag page
  (`/blog/tags/astronomy-club`) — this is how a club's page can list its own
  events without any extra linking work.
- If it was part of a fest, add the fest's tag too (`tech-fest`,
  `general-fest`, or `cultural-fest`).
- Add one event-type tag if it fits: `workshop`, `competition`, `talk`,
  `screening`, `exhibition`, `performance`, `hackathon`.
- If it's an **individual student post with no club affiliation**, use the
  `student-voices` tag instead of a club tag.

Don't invent new tags ad hoc — add them to `blog/tags.yml` first so the tag
page gets a proper label and description.

### Adding or editing a club page

Club pages live at `docs/clubs/<slug>.mdx`. The hero component goes at the
top of the file. See the club table in the root `CLAUDE.md` for the correct
slug and accent name for each club.

---

## 4. Working with the two shared systems

Every hero component is built on two hooks. **Don't reimplement their
behavior locally in a component** — extend the hook instead, so all 23 heroes
stay consistent.

```jsx
const { isPlaying, isHovered, hoverProps } = useIntroMotion();
const { accentStyle, accentName, isUnified } = useClubAccent('astronomy-club');
```

- `useIntroMotion` — plays the intro once on arrival, goes still on
  scroll/click/key/touch, replays on hover (pointer only), respects
  `prefers-reduced-motion`, and pauses heroes that scroll off-screen.
- `useClubAccent` — resolves the club's accent color, or the unified site
  color if the visitor has switched accent mode. Renders `per-club` on first
  paint to avoid a hydration mismatch.

Motion should come from what the club actually *does* (chess pieces moving,
brush strokes, telescope panning), not a generic spinning icon. If you're
adding a 24th hero, follow the pattern of an existing one in `src/components/clubs/`
rather than starting from scratch.

---

## 5. Design tokens and accessibility

All colors, type, spacing, and radii come from the `--ds-*` custom properties
defined in `src/css/custom.css` (ported from `scholar-design-system-hybrid (1).html`,
the source-of-truth spec — read it before adding new UI). **Never hardcode a
hex color in a component.** If a color you need isn't in the token set, add it
to the token file, not inline.

This site targets **WCAG 2.1 AA**. Concretely:

- Normal text needs **4.5:1** contrast against its background; large text
  (≥18.66px bold or ≥24px regular) needs **3:1**.
- Non-text UI boundaries (input borders, button edges, focus rings) need
  **3:1** against the adjacent color.
- Don't use color as the only signal for state (error/success/etc.) — pair it
  with text or an icon.
- Check any new color pair before using it. A quick way: relative-luminance
  contrast calculators are built into most browser DevTools color pickers, or
  ask whoever's doing the review to run the numbers.

Known example: the design-system spec originally had white text on
`--ds-secondary-500` (orange) for the "Secondary" button, which measured
2.63:1 — a real AA failure. It was moved to `--ds-secondary-700`, which
measures 5.46:1. See `changes.md` for the full record and for other contrast
issues found but not yet fixed (tertiary text color, semantic tag colors,
input border contrast) — check that list before you assume a token is safe to
reuse as-is.

---

## 6. Before opening a PR

- [ ] `npm run build` succeeds
- [ ] New/changed heroes: animate on load, go still on scroll, replay on
      hover, respect reduced motion
- [ ] New colors are `--ds-*` tokens, not hardcoded hex, and meet the
      contrast rules above
- [ ] Blog images are co-located, not referenced by absolute path
- [ ] No new audio autoplays — audio is click-to-play only
- [ ] `/admin` still loads and can save a test edit, if you touched CMS config

## 7. What requires explicit sign-off

Don't do these without checking with a maintainer first: pushing to `main`,
running `npm run deploy`, deleting branches, or changing anything under
`static/admin` that affects what club leads can edit. These are called out
directly in the root `CLAUDE.md`.
