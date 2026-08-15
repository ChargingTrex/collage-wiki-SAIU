---
name: Sai University Club & Event Wiki
description: The Scholar's Letterhead — formal collegiate chrome (brand blue, warm orange, Emerald Ivy) that gets out of the way of 23 bespoke, per-club hero animations.
colors:
  primary: "#3b6af5"
  primary-dark: "#2549d4"
  primary-light: "#8fb2ff"
  secondary: "#f77f0e"
  secondary-dark: "#b54607"
  accent: "#218a5e"
  accent-dark: "#186e4c"
  neutral-bg: "#ffffff"
  neutral-surface: "#f8f9fc"
  neutral-border: "#e3e6ef"
  neutral-text: "#232836"
  neutral-text-secondary: "#4d546b"
  neutral-text-tertiary: "#848da8"
  success: "#16a34a"
  warning: "#eab308"
  error: "#dc2626"
  info: "#2563eb"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  mono:
    fontFamily: "JetBrains Mono, SF Mono, Fira Code, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0.02em"
rounded:
  sm: "0.5rem"
  md: "0.85rem"
  lg: "1.25rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.6rem 1.4rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "#b54607"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.6rem 1.4rem"
  button-secondary-hover:
    backgroundColor: "#93360d"
  card:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  tag-primary:
    backgroundColor: "#d9e6ff"
    textColor: "#1d38ab"
    rounded: "{rounded.full}"
    padding: "0.2rem 0.75rem"
---

# Design System: Sai University Club & Event Wiki

## Overview

**Creative North Star: "The Scholar's Letterhead"**

The chrome is formal and collegiate — brand blue, warm orange, and an
"Emerald Ivy" green sitting on a softened, squircle-cornered radius
scale (0.5–1.25rem, superellipse rounding rather than a plain circular
border-radius), set in a four-role type system (Playfair Display /
Spectral / Inter / JetBrains Mono) that reads like a university seal more
than a SaaS dashboard. But the letterhead is a frame, not the point: the
site's actual personality lives in its 23 hand-built hero animations — a
telescope panning for Astronomy, a brush stroke for Art, a script page for
Theatre — each rooted in what that specific club does, plus the handwritten
Caveat/Dancing Script/Great Vibes flourishes on the Literary Club and blog.
The formal shell exists so 23 wildly different, warm, playful expressions
don't read as visual chaos next to each other; consistency at the structural
level buys freedom at the expressive level.

One deliberate crack in the formality: Turingites CS Society and FOSS Club
swap the whole type system to "Tech Forward" (Space Grotesk / IBM Plex Sans
/ IBM Plex Mono) via a scoped `.tech-club` class — colors stay identical,
only the voice shifts, because a terminal-flavored club reading in Playfair
Display would undercut its own premise.

**Key Characteristics:**
- Formal, institutional chrome (color, four-role type system) softened by squircle-rounded surfaces, as a quiet container.
- Expressive personality concentrated in per-club hero animations and accent colors, not in the chrome itself.
- One scoped typography exception (Tech Forward) for the two clubs whose subject matter calls for it.
- Ambient depth (soft hover shadows), never a strict elevation hierarchy.
- Every color, radius, and spacing value is a `--ds-*` custom property — no hardcoded hex in components.

## Colors

Three brand hues plus a full neutral ramp, each with light/dark variants; a
handful of colors get scoped exceptions where recognizability trumps the
system (GitHub badge) or where the concept *is* the color (per-club accents,
below).

### Primary
- **Varsity Blue** (`#3b6af5`): The dominant brand color — primary buttons, links in the token system's original intent (though Emerald Ivy ended up carrying live links, see Accent), focus rings, active states. Dark mode brightens the *token* to `#5c88ff` for on-dark legibility, but button fills are deliberately pinned to the unbrightened `-600`/`-700` steps (`#2549d4`/`#1d38ab`) — the brightened value drops white-on-button contrast to 3.27:1, failing WCAG AA.

### Secondary
- **Homecoming Orange** (`#f77f0e`): Warm counterpoint to Varsity Blue — secondary buttons, footer links in light mode, warm accents. Button fills are pinned to `-700` (`#b54607`), not the token's own `-500`/`-600` — those measured 2.63:1/3.65:1 against white text (AA failure); `-700` clears 5.46:1.

### Accent
- **Emerald Ivy** (`#218a5e`): Carried over from the original Scholar system specifically for highlights and links (`--ifm-link-color`). Also the color used by the footer dino easter egg's default (pre-unified-mode) tint.

### Neutral
- **Neutral 0 / Surface** (`#ffffff` light / `#15181f` dark): Page and card background.
- **Neutral 900 / Text** (`#232836` light / `#f8f9fc` dark): Primary text color.
- **Neutral 700 / Text Secondary** (`#4d546b` light / `#e3e6ef` dark): Secondary/supporting text.
- **Neutral 500 / Text Tertiary** (`#848da8` light / `#a8b0c5` dark): Metadata, captions, timestamps.
- **Neutral 200 / Border** (`#e3e6ef` light / `#353b4d` dark): Default hairline borders, dividers.
- The full 50–950 ramp inverts direction between light and dark mode (light mode's `-900` becomes dark mode's near-white) rather than defining two separate ramps — this is why the footer background deliberately uses fixed hex values instead of `--ds-neutral-*` (see Do's and Don'ts).

### Per-club accent system (signature, not a fixed palette)
Each of the 21 clubs carries its own accent color (e.g. Astronomy = Indigo `#4338CA`/`#A5B4FC`, Art = Fuchsia `#A21CAF`/`#E879F9`, FOSS = Sky `#0369A1`/`#7DD3FC` — full table in `src/components/clubAccents.js`), applied via a `--club-accent` custom property that each hero sets inline and the rest of the CSS reads. A visitor-facing "unified mode" toggle swaps every club's accent for the single site primary in one variable flip. A few heroes intentionally opt out of unified mode entirely (Gaming's second ghost, Art's color cycle, Fashion's gold, the three fest palettes) because color *is* the concept for that specific club.

### Named Rules
**The Token-Only Rule.** No hardcoded hex color in a component. If a needed color isn't in the `--ds-*` token set, it gets added to the token file — never inlined.

**The Deliberate Exception Rule.** Two things break the token system on purpose: the GitHub navbar badge (hardcoded to GitHub's own production palette, because looking authentically like a GitHub badge was the explicit goal) and per-club hero accents (their own system, layered on top, not routed through `--ds-*`).

## Typography

**Display Font:** Playfair Display (with Georgia fallback)
**Heading Font:** Spectral (with Georgia fallback)
**Body Font:** Inter (with system-UI fallback)
**Mono Font:** JetBrains Mono (with SF Mono / Fira Code fallback)

**Character:** A serif display/heading pair (Playfair Display for hero moments, Spectral for in-content headings) gives the letterhead register real weight, while Inter keeps long-form reading — 400+ archived event write-ups — neutral and legible. JetBrains Mono marks anything metadata-flavored (tags, dates, code) as distinctly *not* prose.

### Hierarchy
- **Display** (700, `3rem` / clamps down to `2.25rem` on mobile, 1.1 line-height): Hero and cover-page titles only — never used inside running content.
- **Headline** (600, `1.875rem`, 1.3 line-height): Section-level headings (h2).
- **Title** (600, `1.5rem`, 1.3 line-height): Card titles, h3-level content headings.
- **Body** (400, `1rem`, 1.55 line-height; `1.75` for relaxed/long-form blocks): Running text — event write-ups, docs prose.
- **Label** (500, `0.75rem`–`0.875rem`, uppercase + `0.05–0.06em` letter-spacing for tags/metadata labels): Tags, card sub-labels, form labels.

### Named Rules
**The Four Roles Rule.** Display, heading, body, and mono each have exactly one job; none substitutes for another. A card title is never set in the display face, and hero copy is never set in body weight.

**The Tech Forward Exception.** `turingites-computer-science-society` and `foss-club` pages wrap their content in `.tech-club`, swapping the entire type system to Space Grotesk / IBM Plex Sans / IBM Plex Mono. Colors and every other token stay identical — this is a type-only exception, not a sub-brand.

## Layout

Docusaurus classic layout (navbar, sidebar-driven docs, blog) with a
`max-width: 1200px` centered container for custom pages. Spacing follows a
compact rem-based scale (`0.5rem` / `1rem` / `1.5rem` / `2rem` / `3rem`) —
tight enough for a content-dense archive site, not an airy marketing scale.

Directory/grid pages (`/clubs`, `/explore`) use a `flex-wrap` grid of
fixed-footprint cards (`381×131px`, matching each mini-hero's scaled-down
size) rather than a CSS grid with flexible columns — every card, hero or
icon-only, needs to sit flush in a mixed grid. Auto-fill grids (`repeat(auto-fill,
minmax(240px, 1fr))`) are used for token-swatch-style listings elsewhere.

Single breakpoint at `768px` for the documented mobile layout shift (stacked
component demos, reduced display-font size, stacked label rows); Docusaurus's
own responsive breakpoints govern the docs/sidebar chrome beyond that.

## Elevation & Depth

Ambient, not structural. Shadows are soft and diffuse, and they exist almost
entirely as a hover response (a card or mini-hero lifting `-3px` with a
shadow step-up) rather than as a fixed signal of stacking order — nothing on
the site uses shadow strength to communicate "this is above that." Dark mode
strengthens (not just recolors) every shadow step, since a shadow calibrated
for a white surface reads as nearly invisible on a dark one.

### Shadow Vocabulary
- **sm** (`0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)`; dark: `0 1px 3px rgba(0,0,0,.4)`): Resting state for cards, buttons.
- **md** (`0 4px 16px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)`; dark: `0 4px 16px rgba(0,0,0,.5)`): Hover-lift state for interactive cards (mini-hero cards, explore cards).
- **lg** (`0 8px 32px rgba(26,32,80,.12), 0 4px 8px rgba(26,32,80,.05)`; dark: `0 8px 32px rgba(0,0,0,.6)`): Reserved for the most prominent surfaces (rare; most UI stays at sm/md).

### Named Rules
**The Hover-Lift Rule.** Interactive cards go from `shadow-sm` at rest to `shadow-md` plus a `-3px` translateY on hover — the only place elevation actively communicates state.

## Shapes

Softened from the source spec's original sharp-letterhead scale into
squircle corners: the radius scale now runs `0.5rem` (sm) → `0.85rem` (md,
the default for buttons/inputs) → `1.25rem` (lg, cards and elevated
surfaces) → full pill (badges, tags, the theme toggle). This is superellipse
rounding, not a plain circular `border-radius` — the corner curves more
gradually into the edge than a normal rounded rect, reading as organic
rather than clipped. Where the platform supports it, author with CSS
`corner-shape: squircle` alongside the `border-radius` values above as a
progressive enhancement; browsers without `corner-shape` support fall back
to the plain circular radius, which is still meaningfully softer than the
old sharp scale. Borders stay thin (1px) hairlines in
`--ds-border`/`--ds-border-strong`, never heavy or decorative — only the
corner geometry changed, not the border weight.

### Named Rules
**The Squircle Rule.** Every primary surface (buttons, cards, inputs, mini-hero cards) rounds with a superellipse curve, not a sharp rectangle and not a plain circular radius — soft and organic without going all the way to a pill. Only badges, tags, buttons-as-chips, and the theme toggle go fully rounded to a pill.

## Components

Buttons, cards, and inputs are tactile and confident: solid fills on primary
actions, a visible hover response (background shift, border-color shift, or
a shadow lift), and enough padding that nothing feels clipped. Contrast was
audited and corrected at the component layer, not just the token layer —
several components pin themselves to a shade the raw token scale doesn't
default to, specifically to hold WCAG AA.

### Buttons
- **Shape:** `0.85rem` squircle radius (`--ds-radius-md`).
- **Primary:** Varsity Blue fill (`#3b6af5` light), white text, `0.6rem 1.4rem` padding. Dark mode pins the fill to `#2549d4` (the `-600` step), not the brightened on-dark token value, to hold AA.
- **Secondary:** Fill pinned to `#b54607` (Homecoming Orange `-700`), white text — the raw `-500`/`-600` steps fail AA for white-on-fill.
- **Outline:** Transparent background, `--ds-border-strong` border; hover fills with `--ds-bg-tertiary`.
- **Hover:** Background steps one shade darker (primary → `-700` in dark mode, secondary → `-800`); outline/default buttons gain a `shadow-sm` and a stronger border.

### Cards
- **Corner Style:** `1.25rem` squircle radius (`--ds-radius-lg`).
- **Background:** `--ds-surface` (white / near-black).
- **Shadow Strategy:** `shadow-sm` at rest → `shadow-md` + `-3px` lift on hover for interactive cards (mini-hero, explore).
- **Border:** 1px `--ds-border`, or none on cards that rely on shadow alone.
- **Internal Padding:** `1.5rem` typical.

### Tags / Chips
- **Style:** Full-pill radius, mono font, uppercase-adjacent label sizing.
- **Variants:** Neutral default, `tag-primary` (Varsity Blue-tinted), `tag-accent` (Emerald Ivy-tinted), and semantic success/warning/error tags using the semantic color pairs.

### Inputs / Fields
- **Style:** `0.85rem` squircle radius, 1px `--ds-border`, `--ds-bg` background.
- **Focus:** Border shifts to Varsity Blue plus a soft `0 0 0 3px rgba(59,106,245,.15)` glow ring.

### Hero Animations (signature component)
26 full-bleed, club/fest-specific hero components (21 clubs + Library +
Archives + 3 fests), each built around that entity's actual activity rather
than a generic icon. Two shared hooks govern every one of them, so per-hero
personality never becomes per-hero inconsistency:
- `useIntroMotion`: plays the intro once on page arrival, goes still on
  scroll/key/touch, replays on click/tap (not hover — an incidental hover
  was replaying heroes the reader never meant to touch, and hover doesn't
  exist on touch devices). Fully skipped under `prefers-reduced-motion`.
- `useClubAccent`: resolves the club's own accent or the unified site color,
  rendering `per-club` on first paint to avoid a hydration mismatch.

### Photo Carousels (signature component)
Three interchangeable carousel styles sharing one `images` prop shape,
Framer Motion drag gestures, and reduced-motion handling: `ImageCarousel`
(Fade — the accessible, low-key default), `CoverflowCarousel` (several tilted
photos at once, for a "wall of photos" moment), `StackCarousel` (a swipeable
draggable deck, for informal recaps). Optional autoplay always ships with a
required play/pause control and never runs under reduced motion.

### Mini-Hero Cards
Scaled-down (`0.68×`) live renders of the real hero components, not separate
static icons — `381×131px` fixed footprint so they sit flush in the
`/clubs`/`/explore` grid next to non-hero icon cards of the same size.

### Footer Easter Egg
A hidden 🦖 trigger in-flow at the very bottom of the page (not a floating
corner icon), "charging trex…" tooltip on hover, opening a full-screen Chrome
dino runner. Green by default; recolors to the unified accent (when unified
mode is on) via `mix-blend-mode: color` on an overlay div — chosen over a CSS
`filter`, which flattened the whole grayscale canvas into one solid block
instead of preserving the dino/ground's light-dark contrast.

## Do's and Don'ts

### Do:
- **Do** route every color, radius, and spacing value through a `--ds-*` custom property — the Token-Only Rule.
- **Do** let each hero's motion come from what that club/fest actually does, never a generic spinning icon.
- **Do** respect `prefers-reduced-motion` everywhere motion exists (heroes, carousels, autoplay) — skip the animation outright, don't just slow it down.
- **Do** keep audio strictly click-to-play; no autoplay anywhere on the site.
- **Do** use the pinned WCAG-safe button shades (`primary` dark-mode fill at `-600`/`-700`, `secondary` fill at `-700`/`-800`) rather than a token scale's raw `-500` default.
- **Do** co-locate blog post images next to their post and reference them with relative paths, never an absolute `/img/...` path.

### Don't:
- **Don't** hardcode a hex color inside a component — extend the token file instead.
- **Don't** wire hero replay to hover — click/tap only (hover-to-replay was tried and reverted; it fired on incidental cursor drift and doesn't exist on touch).
- **Don't** use `--ds-neutral-*` for anything that must stay visually dark/light regardless of theme (e.g. the footer) — that ramp inverts direction between light and dark mode, so it silently flips such elements to the wrong end of the scale.
- **Don't** let a club's per-club accent leak into `unified` mode for the handful of heroes where the color *is* the concept (Gaming's second ghost, Art's color cycle, Fashion's gold, fest palettes) — those stay put even when the site-wide toggle is on.
- **Don't** treat the GitHub navbar badge as a token-system candidate — its hardcoded GitHub-brand colors are a deliberate, single exception.
