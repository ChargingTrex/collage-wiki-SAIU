// src/components/ClubPlateCard.jsx
//
// /clubs directory card: the club's live hero shown as a picture ("plate")
// on top, with the club's name and one-line description set as ordinary
// text underneath — rather than MiniHeroCard's layout, where the hero's own
// heading and subtitle sit inside the scaled-down hero and shrink with it
// (to ~10px on phones). Layout borrowed from the 2026-11 Hallmark mock,
// built here in the site's own Scholar tokens.
//
// The plate is still the real hero component (same as MiniHeroCard: one
// source of truth, its own load animation, off-screen pause and
// reduced-motion path for free). Two things differ:
//   - The hero's own text column is hidden in the plate (custom.css,
//     `.club-plate-card__plate`), since the card prints that text below.
//   - The plate is a crop: most heroes draw their artwork in the right
//     ~65% of the card, so the hero is shifted left by `cropX` source px
//     and scaled so that slice fills the plate.
//     `PLATE_CROP` overrides that for heroes whose artwork sits elsewhere.
//
// `inert` (boolean — see MiniHeroCard for why not `inert=""`) takes the
// hero out of the tab order and the accessibility tree, so the card is one
// link whose name is the text below the plate.

import React from 'react';
import Link from '@docusaurus/Link';

const SOURCE_WIDTH = 560; // px the hero renders at before scaling
const SOURCE_HEIGHT = 192; // every club hero's fixed h-48 (Literary is taller and is cropped)
const DEFAULT_CROP_X = 196; // show source x 196..560: the right 65%
const PLATE_WIDTH = 352; // see .club-plate-grid in custom.css
const CROP_WIDTH = SOURCE_WIDTH - DEFAULT_CROP_X;
const SCALE = PLATE_WIDTH / CROP_WIDTH;
export const PLATE_HEIGHT = Math.round(SOURCE_HEIGHT * SCALE);

// Heroes whose artwork isn't in the right-hand slice: crop from a
// different source x (and y), e.g. `'some-club': {x: 0, y: 96}`. Empty
// since Literary moved its quote into the right-hand slice like the rest.
const PLATE_CROP = {};

export function ClubPlateCard({slug, to, name, description, Hero}) {
  const {x: cropX = DEFAULT_CROP_X, y: cropY = 0} = PLATE_CROP[slug] ?? {};
  return (
    <Link to={to} className="club-plate-card">
      <div className="club-plate-card__plate" style={{height: PLATE_HEIGHT}}>
        <div
          className="club-plate-card__scale-wrap"
          style={{
            width: SOURCE_WIDTH,
            transform: `scale(${SCALE}) translate(${-cropX}px, ${-cropY}px)`,
          }}
          inert>
          <Hero />
        </div>
      </div>
      <span className="club-plate-card__name">{name}</span>
      {description && <span className="club-plate-card__description">{description}</span>}
    </Link>
  );
}
