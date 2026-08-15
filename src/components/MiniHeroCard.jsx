// src/components/MiniHeroCard.jsx
//
// Homepage/directory card: the club's REAL hero, scaled down, not a separate
// mini-implementation. Reuses whatever useIntroMotion/useClubAccent already
// do (load-animate, click-to-replay, reduced-motion) for free.
//
// Heroes are built assuming a wide (~600px+) container — `w-full` flex
// layouts, text sized for that width. Rather than teach all 23 components a
// "compact" prop, the hero renders at its natural size inside a fixed-width
// wrapper, and that wrapper is scaled down with a plain CSS transform. The
// outer card is sized to exactly match the scaled result, so the grid gets a
// normal, fixed-size card with no layout surprises.
//
// `inert` on the scale-wrap: since useIntroMotion made each hero's own root
// element a real, focusable, keyboard-operable button (for replay), nesting
// `<Hero />` inside this `<Link>` would otherwise produce two competing tab
// stops per card — the Link (navigate) and the hero's own replay button —
// for what a reader perceives as one clickable card. `inert` removes the
// whole preview subtree from the tab order and from click/keyboard
// interaction entirely, leaving the Link as the single, correct interactive
// element. Replaying the animation isn't a feature this scaled-down,
// preview-only context needs — the card's one job is navigation.

import React from 'react';
import Link from '@docusaurus/Link';

const SOURCE_WIDTH = 560; // px — width the hero renders at before scaling
// Card is 416x143 (see custom.css). Width: the largest equal-proportion
// increase from the original 400px that still keeps the directory grid at
// exactly 3 cards per row at the widest container breakpoint (1320px Infima
// container, usable width 1288px after padding: 3*416 + 2*16 gaps = 1280px,
// an 8px margin — meaningfully bigger drops to 2 per row on wide screens).
// Height: fits the 20 of 21 club heroes that share a fixed 192px (h-48)
// natural height, scaled by this same factor — sizing around the majority
// rather than Literary (the one hero with no fixed height, taller natural
// content) means no dead space below any of those 20. Literary is the
// deliberate exception: its card now crops its content instead — accepted,
// not chased for a perfect fit. The other 20 still sit flush at the top
// rather than centered — see custom.css's comment on
// `.mini-hero-card__scale-wrap` for why centering isn't a safe option here.
const SCALE = 416 / SOURCE_WIDTH;

export function MiniHeroCard({to, name, Hero}) {
  return (
    <Link to={to} className="mini-hero-card" aria-label={name}>
      <div
        className="mini-hero-card__scale-wrap"
        style={{width: SOURCE_WIDTH, transform: `scale(${SCALE})`}}
        inert="">
        <Hero />
      </div>
    </Link>
  );
}
