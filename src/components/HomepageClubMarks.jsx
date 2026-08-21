// src/components/HomepageClubMarks.jsx
//
// The homepage header's foundation line: 21 marks, one per real club, in
// that club's real accent color — the wiki's actual subject (21 distinct
// clubs, one shared record) rendered literally instead of decoratively.
// Not a generic dot/confetti pattern: each mark carries a real club name
// (native `title` tooltip) and its real accent hex from the same
// `CLUB_ACCENTS` data every hero reads, and honors the sitewide
// unified-accent toggle exactly like every hero does.
//
// Static, deliberately: the marks read as a settled, minimal band on their
// own — an entrance drop-in was tried and cut, it didn't earn its place
// against how quiet this piece is meant to be. No Framer Motion import
// needed as a result; if a future pass wants motion here, `useIntroMotion`
// is the hook to reach for (see every hero for the pattern), not a
// one-off animation.
//
// CSS-positioned circles, not an SVG viewBox: this band spans the full,
// very-wide/short header at any viewport width, and a `preserveAspectRatio`
// stretch to fill that box turns true circles into tall ellipses (X and Y
// end up scaled by different factors). Fixed-pixel `border-radius: 9999px`
// divs stay circular regardless of the container's aspect ratio.

import React from 'react';
import { useAccentMode } from './useClubAccent';
import { CLUB_ACCENTS, UNIFIED_ACCENT } from './clubAccents';

const SLUGS = Object.keys(CLUB_ACCENTS);

// Deterministic per-index jitter (not Math.random) — same SSR/hydration
// requirement as GeneralFestHero's confetti: this renders during prerender
// and again on the client, and both must agree exactly.
function jitter(i) {
  return Math.sin(i * 12.9898) * 5;
}

function clubDisplayName(slug) {
  return slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function HomepageClubMarks() {
  const { mode } = useAccentMode();
  const isUnified = mode === 'unified';

  const marks = SLUGS.map((slug, i) => {
    const accent = isUnified ? UNIFIED_ACCENT : CLUB_ACCENTS[slug];
    return {
      slug,
      name: clubDisplayName(slug),
      leftPct: 2 + (i * 96) / (SLUGS.length - 1),
      bottomPx: 14 + jitter(i),
      diameter: i % 3 === 0 ? 18 : i % 3 === 1 ? 13 : 10,
      fill: accent.dark,
    };
  });

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }} aria-hidden="true">
      {marks.map((m) => (
        <div
          key={m.slug}
          title={m.name}
          style={{
            position: 'absolute',
            left: `${m.leftPct}%`,
            bottom: `${m.bottomPx}px`,
            width: m.diameter,
            height: m.diameter,
            borderRadius: '9999px',
            background: m.fill,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}
