# Club & Fest Timeline — Visual Event Timeline per Club and Fest

Add a premium, animated vertical timeline to each club's `/docs/clubs/<slug>/events.mdx` page **and** each fest's page, showing events chronologically as an interactive, discoverable view **alongside** the existing flat card list (not replacing it).

## User Feedback — Incorporated

| Feedback | Decision |
|---|---|
| Don't replace the flat list — add a toggle button so users can discover the timeline interactively | ✅ Both views coexist; a toggle button switches between "List" and "Timeline" |
| Only tag events (not intro blog posts) along clubs — this can generate interactive annual reports | ✅ Timeline only renders posts tagged with **both** a club/fest slug **and** the `events` content-type tag |
| Fest badges are only for a combined "all events" timeline — each club/fest timeline shows only its own events | ✅ Per-club and per-fest timelines are scoped strictly to their own slug; fest badges only appear on the sitewide `/events` page |
| Each fest gets its own timeline page | ✅ Each fest gets a new `timeline.mdx` under `docs/fests/<slug>/` |
| Group by academic year (e.g. 2025–26) | ✅ Academic year grouping (June–May cycle) |
| Empty state: subtle illustration prompt encouraging clubs to add events | ✅ Illustrated empty state with a friendly CTA |

---

## Proposed Changes

### Timeline Component

#### [NEW] [ClubTimeline.jsx](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/src/components/ClubTimeline.jsx)

A new React component that renders a **vertical timeline** for a club's or fest's events.

Key design decisions:

- **Data source:** Same `usePluginData('club-events-plugin')` → `postsByTag[slug]` as `ClubEventsList` — one source of truth, zero plugin changes.
- **Events only:** Filters to posts that carry the `events` content-type tag (not intro/blog posts), so the timeline serves as a true annual activity report.
- **Accent-aware:** Uses `useClubAccent(clubSlug)` to tint the timeline spine, nodes, and year headers to the club's accent color. Fests fall back to the unified accent (no dedicated fest accent exists).
- **Academic year grouping:** Events grouped by academic year (June–May). Year headers display as "2025–26", "2024–25", etc.
- **Animated:** Framer Motion `motion.div` with staggered fade-in + slide-up as timeline nodes enter the viewport (`whileInView`), respecting `prefers-reduced-motion`.
- **Responsive:** Single-column left-aligned on mobile, alternating left/right on desktop.
- **Link-through:** Each node links to the full blog post via `permalink`.
- **Scoped:** Each club/fest timeline shows **only** its own events — no cross-fest badges. Fest badges are reserved for the sitewide `/events` view only.

Visual anatomy of a timeline node:
```
  ┌─────────────────────────────────┐
  │  📅 August 16, 2026             │
  │  ┌─────────┐                    │
  │  │ image   │  Title of Event    │
  │  │         │  Short description │
  │  └─────────┘                    │
  └─────────────────────────────────┘
         │
    ● ───┤──── timeline spine
         │
```

#### [NEW] [ClubTimeline.module.css](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/src/components/ClubTimeline.module.css)

CSS Module for the timeline. Uses `--ds-*` design tokens. CSS custom property `--timeline-accent` set by the component from `useClubAccent`.

Key visual features:
- Glassmorphism-style event cards with `backdrop-filter: blur`
- Gradient timeline spine using the club/fest accent
- Pulsing dot on the most recent event
- Smooth hover lift on cards
- Academic year divider headers
- Dark mode fully supported via `--ds-*` tokens

#### [NEW] [TimelineEmptyState.jsx](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/src/components/TimelineEmptyState.jsx)

A subtle illustrated empty state component shown when a club/fest has no events tagged yet. Features:
- A minimal SVG illustration (calendar/timeline motif)
- Friendly copy: "No events on the timeline yet — start documenting your club's journey!"
- Subtle fade-in animation
- Uses the club's accent color for the illustration tint

---

### View Toggle — List ↔ Timeline

#### [NEW] [EventViewToggle.jsx](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/src/components/EventViewToggle.jsx)

A toggle button component that lets users switch between the existing flat **List** view (`ClubEventsList`) and the new **Timeline** view (`ClubTimeline`). Design:
- Two icon buttons: list icon / timeline icon (from `lucide-react`)
- Persists choice to `localStorage` (key: `sai-wiki-event-view`)
- Defaults to **List** (the existing experience), so the timeline is a discoverable upgrade
- Smooth crossfade transition between views

#### [NEW] [ClubEventsView.jsx](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/src/components/ClubEventsView.jsx)

Wrapper component that renders the toggle + whichever view is active. This is what `events.mdx` will import — a single clean import that encapsulates both views.

```jsx
<ClubEventsView clubSlug="literary-club" />
```

Internally renders:
```
┌──────────────────────────────────────┐
│  [☰ List]  [⏐ Timeline]    toggle   │
├──────────────────────────────────────┤
│                                      │
│  <ClubEventsList />                  │
│       — or —                         │
│  <ClubTimeline />                    │
│                                      │
└──────────────────────────────────────┘
```

---

### Wiring — Club Events Pages (× 21)

#### [MODIFY] [events.mdx](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/docs/clubs/literary-club/events.mdx) (× 21 clubs)

Each club's `events.mdx` switches from importing `ClubEventsList` to importing `ClubEventsView`:

```diff
-import { ClubEventsList } from '@site/src/components/ClubEventsList';
+import { ClubEventsView } from '@site/src/components/ClubEventsView';

-<ClubEventsList clubSlug="literary-club" />
+<ClubEventsView clubSlug="literary-club" />
```

All 21 clubs:
`literary-club`, `art-club`, `chess-club`, `dance-club`, `gardening-club`, `astronomy-club`, `theatre-club`, `photography-club`, `gaming-club`, `oratory-club`, `entrepreneurship-club`, `fashion-club`, `pugwash-society`, `science-society`, `sports-society`, `music-club`, `film-society`, `turingites-computer-science-society`, `animal-welfare-society`, `martial-arts-club`, `foss-club`

---

### Wiring — Fest Timeline Pages (× 3)

Each fest currently has a single `.mdx` page under `docs/fests/`. To add a timeline, each fest needs to become a **directory** with its own sub-pages (matching the club pattern: `index.mdx` + `timeline.mdx`).

#### [MODIFY] Fest directory restructure

```
docs/fests/
├── _category_.json              (existing)
├── tech-fest/                   (NEW directory)
│   ├── _category_.json          (NEW — label: "Innovision", icon: Rocket)
│   ├── index.mdx                (MOVED from tech-fest.mdx — existing content)
│   └── timeline.mdx             (NEW — fest timeline page)
├── general-fest/                (NEW directory)
│   ├── _category_.json
│   ├── index.mdx                (MOVED from general-fest.mdx)
│   └── timeline.mdx             (NEW)
├── cultural-fest/               (NEW directory)
│   ├── _category_.json
│   ├── index.mdx                (MOVED from cultural-fest.mdx)
│   └── timeline.mdx             (NEW)
```

#### [NEW] timeline.mdx (× 3 fests)

Each fest's `timeline.mdx`:

```mdx
---
title: Timeline
sidebar_label: Timeline
description: Event timeline for Innovision — Sai University's tech fest.
---

import { ClubEventsView } from '@site/src/components/ClubEventsView';

<ClubEventsView clubSlug="tech-fest" />
```

The `ClubEventsView` component works for both clubs and fests — it reads `postsByTag[slug]` which is tag-agnostic.

---

### Preserved Components

#### [KEEP] [ClubEventsList.jsx](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/src/components/ClubEventsList.jsx)

Not deleted — it's the default "List" view inside `ClubEventsView`.

#### [KEEP] [EventCard.jsx](file:///Users/fi-it/Documents/projects/collage-wiki-SAIU/src/components/EventCard.jsx)

Still used by `ClubEventsList` and `RecentActivity`. Timeline nodes have their own card markup.

---

## Verification Plan

### Automated Tests
```bash
npm run build   # confirm zero broken links / build errors
```

### Manual Verification
- `npm start` → navigate to any club's Events page (e.g. `/docs/clubs/literary-club/events`)
- Confirm **List** view is the default (existing behavior preserved)
- Confirm toggle button switches to **Timeline** view
- Confirm toggle preference persists across page navigations (localStorage)
- Confirm timeline renders with the club's accent color
- Confirm dark mode toggle switches timeline colors properly
- Confirm animation plays on scroll (and skips on `prefers-reduced-motion`)
- Confirm responsive layout: alternating columns on desktop, single column on mobile
- Confirm each club's timeline shows **only** its own events (no cross-fest content)
- Confirm fest timeline pages exist at `/docs/fests/tech-fest/timeline`, etc.
- Confirm empty-state illustration shows on clubs/fests with no event-tagged posts
- Confirm the "View full timeline →" link still works in list view
- Academic year headers display correctly (e.g. "2025–26")
