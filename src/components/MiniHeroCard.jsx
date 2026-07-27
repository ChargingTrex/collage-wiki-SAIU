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

import React from 'react';
import Link from '@docusaurus/Link';

const SOURCE_WIDTH = 560; // px — width the hero renders at before scaling
const SCALE = 0.68; // was 0.58 — directory grid read as too zoomed-out at that size

export function MiniHeroCard({to, name, Hero}) {
  return (
    <Link to={to} className="mini-hero-card" aria-label={name}>
      <div
        className="mini-hero-card__scale-wrap"
        style={{width: SOURCE_WIDTH, transform: `scale(${SCALE})`}}>
        <Hero />
      </div>
    </Link>
  );
}
