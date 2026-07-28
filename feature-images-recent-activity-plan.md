# Feature Images in Recent Activity — Plan

**Status: planned, not yet implemented.**

## Why

The homepage "Recent Activity" section, each club's Events list, and the
tag-filtered Events/Blog feed all currently show text-only cards (date,
title, description). Every one of these surfaces is a thin wrapper around
one shared component, `EventCard.jsx`, fed by one shared data source,
`club-events-plugin.js` — so a single, small change point makes all three
surfaces show a thumbnail image at once. Today neither piece reads or
renders any image at all, and the Decap CMS schema club leads actually
edit through has no field for one.

## Current state (verified against the code)

- `src/pages/index.js` renders `<RecentActivity />`, which pulls the 5
  newest posts from `usePluginData('club-events-plugin')` and renders each
  via `<EventCard {...post} />`.
- `src/plugins/club-events-plugin.js` re-reads `blog/**/*.md(x)`
  frontmatter at build time (title, date, tags, description, slug) because
  `@docusaurus/plugin-content-blog` doesn't expose its parsed content to
  other plugins. Its `loadContent()` builds
  `{id, title, date, permalink, description, tags}` per post — **no
  `image` field is read or forwarded**, even where one exists in
  frontmatter.
- `src/components/EventCard.jsx` renders only `date`/`title`/`description`
  — no `<img>` markup at all. `ClubEventsList.jsx` and
  `TagFilteredEvents.jsx` both render through this same `EventCard`, so
  fixing it in one place fixes all three surfaces.
- No blog post anywhere in `/blog` sets `image:` in frontmatter today.
- `static/admin/config.yml` (Decap CMS) has one `events` collection
  (folder: `blog`) with fields `title`, `date`, `tags`, `description`,
  `body` only — **no `image`/`feature_image` field**. A club lead using
  `/admin` today has no UI control to attach one; dropping an image inline
  in the body is a different thing (an in-article image, not a card
  thumbnail).
- The only existing image-handling component, `ImageCarousel.jsx`, is a
  one-off used by a single test post via JS-imported images — not a
  reusable thumbnail/feature-image pattern to point to.

## What has to change (3 files, in order)

1. **`static/admin/config.yml`** — add an `image` field (Decap CMS "image"
   widget, optional) to the `events` collection's `fields:` list, alongside
   the existing `title`/`date`/`tags`/`description`/`body`. Decap's image
   widget uploads into the post's own folder (this collection already sets
   `media_folder: ''` / `public_folder: ''`, so uploads land co-located
   beside `index.md` — consistent with this repo's existing
   never-use-absolute-blog-image-paths convention) and writes a relative
   path into frontmatter, e.g. `image: ./cover.jpg`.

2. **`src/plugins/club-events-plugin.js`** — in `loadContent()`, add
   `image: frontMatter.image ?? null` to the object pushed for each post,
   next to the existing `title`/`date`/`description`/`tags` fields. This is
   the only place any of the three consuming surfaces gets its data from,
   so this one line is what makes the field exist at all downstream.

3. **`src/components/EventCard.jsx`** — destructure `image` from props and
   conditionally render a thumbnail (e.g. `{image && <img src={...} />}`)
   above or beside the existing title/date/description block. No
   placeholder/default image for posts without one — cards simply render as
   they do today (graceful, not a half-built fallback system). Because
   `RecentActivity`, `ClubEventsList`, and `TagFilteredEvents` all render
   through this one component, this single edit is what makes the image
   appear in all three places simultaneously.

Using the standard Docusaurus blog frontmatter key `image` (rather than a
made-up `feature_image`/`thumbnail` key) is deliberate: it's also the key
Docusaurus's blog plugin already recognizes for the post's social-share
(`og:image`) meta tag, so one field does double duty for free once set.

## How a club lead adds one (once built)

1. Open `/admin`, edit or create the event/blog post.
2. Use the new **Image** field to upload a photo (recommended: a horizontal/
   landscape photo, roughly 3:2 or 16:9 — card thumbnails are small and
   wide, not tall).
3. Save/publish as usual. No other field changes needed — the image will
   appear automatically in:
   - the homepage Recent Activity section (if the post is one of the 5
     newest),
   - that club's own Events list page,
   - the sitewide tag-filtered Events/Blog feed.
4. Posts published without an image keep working exactly as they do today
   — adding one is optional, never required.

## Editing by hand (no Decap CMS)

Add one line to the post's frontmatter, pointing at an image file
co-located in the same post folder (same convention as in-body images):

```yaml
---
title: Your Post Title
date: 2026-08-01
tags: [your-club-tag]
description: One-line summary.
image: ./cover.jpg
---
```

Put `cover.jpg` directly in `blog/YYYY-MM-DD-your-post/` beside `index.md`
— never an absolute `/img/...` path, so the post keeps working if the
archive folder structure ever changes.

## Verification (once implemented)

1. Add `image:` to one existing post's frontmatter (or via `/admin`);
   confirm the thumbnail renders on `/` (Recent Activity, if it's in the
   newest 5), on that club's `/docs/clubs/<slug>/events`, and on the
   sitewide Events/Blog feed page — same image, all three places, from
   the one frontmatter edit.
2. Confirm a post with no `image` field still renders a normal text-only
   card, no broken `<img>`/console error.
3. `npm run build` — confirm no `onBrokenLinks`/asset-resolution failure
   from the new co-located image path.

## Critical files

- `static/admin/config.yml` (new `image` field on the `events` collection)
- `src/plugins/club-events-plugin.js` (forward `frontMatter.image`)
- `src/components/EventCard.jsx` (render the thumbnail)
- Consumers that inherit the fix for free: `src/components/RecentActivity.jsx`,
  `src/components/ClubEventsList.jsx`, `src/components/TagFilteredEvents.jsx`
