# Animation Improvements — Proposal: Staggered Page-Intro Text

A forward-looking proposal, not yet built. For what already exists, see
[`ANIMATION.md`](ANIMATION.md) (technical reference) and
[`animation-caveats.md`](animation-caveats.md) (open decisions log). This
doc adds one to that log: extending on-load motion from just the hero to the
page content immediately around it.

## The gap

Right now, **only the 23 hero components animate on page load.** Everything
else — the page title, the description/tagline paragraph, section headings,
the homepage header — renders instantly with zero transition, on every
surface checked:

- **Club/fest doc pages** (`docs/clubs/<slug>/index.mdx`): the hero plays
  its intro, then the description paragraph directly under it (e.g.
  Astronomy's "The Astronomy Club hosts stargazing nights...") and every
  `##` heading below (`Current Board`, `Contact`) pop in instantly — plain
  Docusaurus/Infima MDX rendering, no motion wrapper at all.
- **Homepage** (`src/pages/index.js`'s `HomepageHeader`): the `<h1>` title,
  subtitle, stat row, and CTA buttons are a fully static Infima `hero
  hero--primary` block. No Framer import, no transition — this is the
  single highest-traffic "top of the page" moment on the whole site and it
  currently has no motion at all.
- **Blog posts**: post titles and body content render through Docusaurus's
  default blog theme, same story.

The result: a reader's first impression is one well-crafted animated moment
(the hero) sitting directly above completely static text. The polish stops
exactly where the hero ends.

## Proposal

Extend the same lifecycle contract `useIntroMotion` already established —
animate on arrival, respect `prefers-reduced-motion`, be SSR-safe — to a
second, lighter hook purpose-built for text content, plus a small set of
reusable components that apply it consistently instead of every page
hand-rolling its own stagger.

### 1. A new `usePageIntro` hook (sibling to `useIntroMotion`, not a rewrite of it)

Hero intros and page-text intros have different enough shapes that they
shouldn't share one hook with a mode flag — a hero's rich, once-per-arrival,
click-to-replay contract doesn't map cleanly onto a title/paragraph stagger.
Proposed shape, deliberately smaller than `useIntroMotion`:

```jsx
// src/components/usePageIntro.js (proposed)
export function usePageIntro() {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard, same as useIntroMotion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShouldAnimate(!prefersReduced);
  }, []);

  return { shouldAnimate };
}
```

What it deliberately does **not** carry over from `useIntroMotion`, and why:

- **No scroll-stop listener.** Page-intro text is above the fold by
  definition (it's what's visible on arrival) and its stagger finishes in
  well under a second — there's nothing for a mid-animation scroll to
  interrupt in practice, so the extra listeners would be dead weight.
- **No click-to-replay.** Replaying a hero on click is a deliberate, novel
  interaction with a discrete visual object. Replaying a paragraph of body
  text every time a reader's cursor happens to land on it would read as
  distracting, not delightful — flagged as an explicit open question below,
  not assumed.

### 2. Shared stagger components, not per-page hand-rolling

Reuse the exact orchestration pattern already proven in this codebase
(`GeneralFestHero`'s `TEXT_GROUP`/`TEXT_ITEM`, `Book.jsx`'s per-index
stagger) rather than inventing a new one:

```jsx
// src/components/PageIntro.jsx (proposed)
const GROUP = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function PageIntro({ children }) {
  const { shouldAnimate } = usePageIntro();
  return (
    <motion.div
      initial={shouldAnimate ? 'hidden' : 'show'}
      animate="show"
      variants={GROUP}
    >
      {children}
    </motion.div>
  );
}

export function PageIntroItem({ as: Tag = motion.div, className, children }) {
  return (
    <Tag variants={ITEM} className={className}>
      {children}
    </Tag>
  );
}
```

Usage sketch (homepage header):

```jsx
<PageIntro>
  <PageIntroItem as={motion.h1} className="hero__title">Sai University Wiki</PageIntroItem>
  <PageIntroItem as={motion.p} className="hero__subtitle">The Sai University wiki for...</PageIntroItem>
  <PageIntroItem as={motion.div} className={styles.buttons}>{/* CTAs */}</PageIntroItem>
</PageIntro>
```

Same component works for a club page's title/description block once
`hide_title` is reconsidered, or wrapping just the description paragraph if
the title stays hidden (see rollout below).

### 3. Sequencing against the hero above it

On club/fest pages, the hero already plays its own multi-second intro
directly above this text. The page-intro stagger should **not** start at
the same instant as the hero — starting simultaneously reads as two
unrelated things happening at once, and starting only after the hero fully
finishes makes the reader wait through a multi-second animation before any
text appears. Proposed middle ground: a fixed short delay (`delayChildren`
in the 0.3–0.5s range, matching the delay `GeneralFestHero` already uses
before its own title stagger) so the text visibly follows the hero's
opening beat without waiting for its full loop/settle.

## Rollout order

1. **Homepage header** first — fully static today, highest traffic, lowest
   risk (no hero animation to sequence against, so no timing coordination
   needed for the first implementation).
2. **Club/fest page description paragraph + first heading** — coordinate
   timing against the hero per §3.
3. **Blog post titles** — lowest priority; 400+ archived posts means this
   is read far more than freshly "arrived at," so the value is smaller.

## Constraints inherited without exception

- `prefers-reduced-motion`: hard skip, identical to every existing system —
  `shouldAnimate` stays `false`, content renders in its final state
  immediately. No partial/slowed version.
- SSR/hydration safety: `window` guard before any `matchMedia` read, same
  guard pattern as `useIntroMotion` and `useCarouselAutoplay`.
- No hardcoded colors, radii, or spacing introduced by this work — any new
  wrapper markup stays on existing `--ds-*` tokens.

## Open questions (need a decision before building, not assumptions to bake in)

- **Replay behavior:** confirmed above as "no click-to-replay" by default —
  worth confirming that's actually wanted, versus, e.g., replaying the page
  intro alongside a hero's own replay when the hero is clicked (would need
  the two hooks to share a trigger).
- **Docusaurus client-side (SPA) navigation:** `useIntroMotion` only ever
  needs to handle a fresh page load in practice, since Docusaurus's route
  change unmounts and remounts the hero anyway. Worth explicitly deciding
  whether `usePageIntro` should also replay on every SPA route change
  (arguably good — every doc page arrival gets the same polish) or only on
  a true hard navigation/first load (arguably less repetitive for someone
  clicking through many club pages in one session).
- **Scope of what gets wrapped:** this proposal covers title/description/
  first-heading text specifically. Whether it should extend further down
  the page (e.g. `TeamSection`, `ClubContact`) is a separate, larger
  decision — those already have their own internal content and layout;
  wrapping them changes more surface area than a text stagger.
- **`hide_title: true` on club/fest pages:** every club page currently hides
  its Docusaurus-generated title (the hero carries that role visually).
  Applying `PageIntro` to "the title" in practice means the description
  paragraph beneath the hero, not an `<h1>` — worth confirming that's the
  intended scope rather than revisiting `hide_title`.

## Explicitly out of scope for this proposal

**Full route-to-route page transitions** (a crossfade or slide between one
doc page and the next as the reader navigates) is a related but
substantially larger feature — it touches Docusaurus's router/layout
lifecycle rather than a single page's own content, and nothing in the
current codebase does this today (confirmed: no `clientModules` route
listener, no layout-level transition wrapper exists). Worth its own proposal
if wanted; deliberately not bundled into this one so the text-stagger work
can ship independently.
