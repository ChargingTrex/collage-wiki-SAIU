# Animation & transition improvement plan

A design critique of the motion system as it stands, written in animation
vocabulary rather than "add more animation." Grounded in what's actually in
the code today (verified by grep/read, not assumed) — see
[`ANIMATION.md`](ANIMATION.md) for the technical reference this builds on and
[`animation-caveats.md`](animation-caveats.md) for the existing open-items
log. This doc doesn't repeat either: it's proposing *new* work, not
re-describing what's already tracked (off-screen `IntersectionObserver`
pause, the Literary traced-stroke upgrade, the accent-toggle UI — all
already logged elsewhere).

The frame: this site already has a genuine **motion signature** — 23 heroes,
each built around the club's real activity, none of them a spinning icon.
That craft currently stops at the hero's own boundary. Everything *around*
the heroes — cards, buttons, page transitions, scroll — uses either no
motion vocabulary at all or the browser's flattest default. The proposals
below are about extending the site's existing motion language outward, not
inventing a new one.

---

## 1. What's already working — name it so it doesn't get diluted

Before critiquing, the parts worth protecting:

- **Overshoot easing on landing motion** (`Book.jsx`'s drop, cubic-bezier
  family around `[0.34, 1.2, 0.64, 1]`) is a real **back-ease** — a
  deliberate small overshoot past the rest state before settling, which
  reads as weight and follow-through rather than a mechanical stop. This is
  correct craft, not decoration.
- **Parent-orchestrated choreography** (`staggerChildren`/`delayChildren` on
  a Framer `variants` parent, e.g. `GeneralFestHero`'s bunting) is the right
  default for any multi-element entrance — proposal §3 below reuses this
  exact pattern rather than introducing a new one.
- **Kinematic vs. dynamic motion is already correctly split** between two
  places: hero intros use duration + custom cubic-bezier (**kinematic** —
  scripted, predictable, narrative), while the three carousels' drag-release
  snap uses `type: 'spring'` (**dynamic** — physics-driven, responsive to
  input velocity). That's the right technique for each job. §4 below is
  about extending the *dynamic* side to more places that deserve it, not
  correcting the split.
- **The reduced-motion gate is a hard gate, not a softened animation** —
  `useIntroMotion` never plays anything for `prefers-reduced-motion`, rather
  than just shortening durations. That's the technically correct reading of
  the media query and should stay the template for anything new below.

---

## 2. The gap: motion hierarchy stops at the hero boundary

Three tiers of surface exist on this site, whether or not they've been
named as such:

| Tier | Examples | Current motion vocabulary |
|---|---|---|
| 1 — Hero intros | 23 club/fest heroes | Rich: custom easing, orchestration, `offsetPath`, seeded-PRNG physical sim |
| 2 — Interactive chrome | Nav links, footer links, carousel arrows, `.mini-hero-card`, `.explore-icon-card` | `transition: transform 0.15s ease, box-shadow 0.15s ease` — the browser's built-in `ease` keyword, not any of the site's own curves |
| 3 — Content entrance | `EventCard.jsx`, `MiniHeroCard.jsx`, docs/blog prose | None. Zero `whileInView` usage anywhere in `src/` (confirmed by grep) |

A reader arriving at a club page gets a bespoke, orchestrated performance
from the hero, then scrolls one card-height further into chrome that moves
with the same generic lift-and-shadow every template site ships, onto
content that has no entrance at all. The site's own stated motion
philosophy — *animate while arriving, settle once working* — is a hero-only
rule in practice; nothing in tiers 2–3 expresses it.

This isn't "add animation everywhere" — tier 3 in particular should stay
restrained (see §6). It's that the *choice* to keep chrome and content quiet
hasn't actually been made; right now it's quiet by default, not by design.

---

## 3. Proposal: viewport-triggered reveal for card grids (tier 3)

Scope: **`MiniHeroCard.jsx` grids** (homepage, club directory) and
**`EventCard.jsx` grids** (blog/event listings) only. Not docs prose, not
blog post body text — see §6 for why those should stay untouched.

Technique: Framer's `whileInView` with `viewport={{ once: true, amount: 0.3
}}` on each card, driven by a `staggerChildren` parent — the exact
orchestration pattern already established in `ANIMATION.md` §2 for hero
entrances, applied one layer out instead of invented fresh. `once: true`
matters here for the same reason `useIntroMotion` doesn't replay on
scroll-back-to-top: a reader re-scrolling past a grid they've already seen
shouldn't get the entrance again — it would read as flicker, not as a
"you've arrived" cue.

Suggested motion: a short (`~0.3–0.4s`) opacity + `translateY(8–12px)` rise,
staggered `~40–60ms` per card, capped so a 12-card grid doesn't take a full
second to finish revealing (cap total stagger budget, don't let the
per-card delay scale unbounded with grid size — clamp with something like
`Math.min(index, 8) * 0.05`). This is a **staged reveal**, not a fade-only —
the small rise gives the cards a shared point of origin (they're arriving
from "below," which reads as content settling into place) rather than just
opacity ramping, which reads as loading rather than arriving.

This is the single highest-leverage change in this doc: it's the one place
where extending the existing pattern (parent stagger, already proven,
already documented) closes the biggest actual gap (zero motion on the most
common surface a reader scrolls past — every card grid on the site).

---

## 4. Proposal: bring tier 2 chrome into the site's own easing vocabulary

Right now tier-2 hover feedback (`--ds-transition-fast: 150ms ease` /
`--ds-transition-base: 250ms ease` in `custom.css`) uses the CSS `ease`
keyword — a generic, un-authored timing function every browser ships
identically, with no relationship to any curve the hero layer uses. One of
the hero layer's own eases already exists in the codebase and is a much
better fit for this: `[0.22, 1, 0.36, 1]` (currently used once, in a hero)
is a standard **ease-out-expo**-family curve — fast start, long unhurried
settle — exactly the right feel for a hover lift, and it would cost nothing
to reuse.

Concretely: add `--ds-ease-out: cubic-bezier(0.22, 1, 0.36, 1)` alongside
the existing `--ds-transition-fast`/`--ds-transition-base` tokens, and swap
the plain `ease` keyword for it in the `.mini-hero-card:hover`,
`.explore-icon-card:hover`, and carousel-arrow hover rules. Small change,
but it's the difference between "the browser's default motion" and "this
site's motion" on every interactive element a reader's cursor touches
outside a hero.

**Separately**, consolidate the Framer-side easing drift: four near-
identical hand-tuned overshoot curves exist in the hero layer today —
`[0.34, 1.15, 0.64, 1]`, `[0.34, 1.2, 0.64, 1]`, `[0.34, 1.3, 0.64, 1]`,
`[0.34, 1.4, 0.64, 1]` — same **back-ease family** (all four share the
`[0.34, _, 0.64, 1]` shape, differing only in overshoot amplitude), spread
across different heroes with no shared name or documented reasoning for why
one hero gets `1.2` and another gets `1.4`. Worth a short pass to either (a)
name each amplitude as an intentional tier (`EASE_SETTLE_SUBTLE` /
`_MEDIUM` / `_BOUNCY`) in a small shared constants file so future heroes
pick deliberately instead of hand-tuning a fifth variant, or (b) confirm the
variance is arbitrary and collapse to one canonical value. Either is fine;
what's not fine is a fifth near-duplicate showing up in hero #24 because
nothing currently stops that.

---

## 5. Proposal: spring physics on direct-response interactions

`type: 'spring'` currently exists in exactly 3 of 25 Framer-using files, all
carousels, all on drag-release. That's the right call for drag (velocity-
driven, physically motivated), but the same reasoning applies to anything
that's a **direct, immediate response to a click** rather than a scripted
narrative beat — and right now those get the same duration/bezier tween as
narrative motion.

Best candidate: the click-to-replay trigger every hero shares via
`useIntroMotion`'s `hoverProps` (§ usage documented in `ANIMATION.md` §1).
A click is an input event with an implicit "how hard did they mean it"
quality that a spring can express (a `stiffness`/`damping` response feels
like it received the click) in a way a fixed-duration ease can't — it's the
same distinction Disney animators call **secondary action responding to a
primary force**, applied to a pointer event instead of a physical one. This
wouldn't touch the intro sequence itself (that stays kinematic, correctly),
just the transition *into* the replay state — e.g. a brief spring-based
scale/opacity pulse on the hero's container the instant the click
registers, before the Framer `key` remount kicks off the full intro. Small,
cheap, and gives 23 identical click targets a shared moment of physicality
they currently don't have (right now a click has zero visible feedback
until the remounted animation's first frame paints).

---

## 6. Explicit restraint: what should stay motionless

Naming this because the frontend-design principle that extra animation
reads as templated cuts both ways — the fix for §2's gap is not "animate
everything tier 3 touches":

- **Docs/blog prose body text** — paragraphs, headings, lists inside an
  `.mdx` page. No `whileInView` reveal, no per-paragraph fade-in. Text a
  reader is trying to read should never be waiting on an animation to
  finish before it's legible; this is a well-known anti-pattern (scroll-
  triggered prose reveal), not an oversight to fix.
- **The accent unified-mode swap stays a plain CSS-variable snap.**
  `CLAUDE.md` and `animation-caveats.md` §5 are explicit that this is a
  one-variable swap by design, and it changes 18 heroes' colors
  simultaneously — animating that transition risks an eighteen-way color
  crossfade that reads as glitchy rather than smooth. Flagging it here only
  to say it was considered and correctly rejected, not left unconsidered.
- **Any surface a reader is mid-task on** (search results, admin/CMS forms)
  — consistent with `useIntroMotion`'s own "go still once they start
  working" rule; the same logic argues against adding entrance motion to
  anything functional rather than editorial.

---

## 7. Exploratory, not scoped: shared-element continuity across navigation

Flagging as a real option, not a recommendation to build yet — this is
bigger than the others and needs its own spike before committing.

Today, clicking a `MiniHeroCard` in the directory to reach a club's full
page is a hard cut: the small scaled hero unmounts, the route changes, the
full-size `Hero` mounts fresh and replays its entire intro from frame one.
Framer Motion supports **shared-element transitions** via matching
`layoutId`s — if the same `layoutId` were applied to the mini card's scaled
hero and the destination page's full hero, and both stayed within a
persistent `LayoutGroup`/`AnimatePresence` that survives the route change
(Docusaurus's client-side router keeps the React tree alive across
navigations, so this is technically reachable, not blocked by full page
reloads), the small card could visually **morph** into the full hero rather
than being two unrelated mounts either side of a blank cut.

This would be the single most distinctive motion moment on the site if
done — genuine continuity across a navigation is rare on any Docusaurus
site — but it's real engineering risk: 23 heroes would each need their
scaled-down and full-size states reconciled into one `layoutId`-compatible
shape, and a botched shared-layout animation (mismatched aspect ratios,
layout thrashing) is more visible than no animation at all. Worth a
one-hero spike (Library, since its primitive is already the most modular)
before deciding whether to roll it out further.

---

## Summary — priority order

1. **§3 viewport-triggered card reveal** — highest leverage, reuses an
   already-proven pattern, clearly scoped (two components).
2. **§4 tier-2 easing token** — small, mechanical, immediately consistent.
3. **§4 easing-family consolidation** — cheap now, gets more expensive the
   more heroes get built without it.
4. **§5 spring on click-to-replay** — small, adds felt responsiveness to
   all 23 heroes' shared interaction from one place (`useIntroMotion`).
5. **§7 shared-element continuity** — real, but spike-first; don't commit
   scope until one hero proves the technique holds up.
