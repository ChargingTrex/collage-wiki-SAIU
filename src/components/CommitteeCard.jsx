// src/components/CommitteeCard.jsx
//
// One committee, led by its seal. Shared by the /committees directory and
// the Committees section of /explore so the two can't drift apart — the same
// reason MiniHeroCard is one component rather than a copy per directory.
//
// Committees have no hero animation to scale down (see CLAUDE.md), so this
// isn't a MiniHeroCard variant: the seal is the identity, and it's a static
// raster rather than a component, so the card is a plain link with an image
// instead of a scaled live render.

import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export function CommitteeCard({ slug, name, logo, logoAlt, blurb }) {
  return (
    <Link to={`/docs/committees/${slug}`} className="committee-card">
      <img
        className="committee-card__seal"
        src={useBaseUrl(logo)}
        alt={logoAlt}
        loading="lazy"
        width={72}
        height={72}
      />
      <span className="committee-card__body">
        <span className="committee-card__name">{name}</span>
        <span className="committee-card__blurb">{blurb}</span>
      </span>
    </Link>
  );
}
