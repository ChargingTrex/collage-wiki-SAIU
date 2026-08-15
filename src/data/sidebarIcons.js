// src/data/sidebarIcons.js
//
// Maps a `sidebar_custom_props.icon` string (set in each club doc's
// frontmatter) to the actual lucide-react component. A lookup table rather
// than dynamic `lucide-react[name]` indexing so unused icons still get
// tree-shaken out of the bundle.

import {
  BookOpen,
  Palette,
  Footprints,
  Sprout,
  Telescope,
  Drama,
  Camera,
  Gamepad2,
  Mic,
  Lightbulb,
  Shirt,
  FlaskConical,
  Music,
  Film,
  Terminal,
  PawPrint,
  Hand,
  Code2,
  Rocket,
  PartyPopper,
  Archive,
  Images,
  Image,
  UserRound,
  ChessKnight,
  Trophy,
} from 'lucide-react';

// lucide-react has no literal peace-sign glyph — hand-drawn here in the same
// stroke style as every lucide icon (24x24 viewBox, currentColor stroke,
// round caps/joins) so it reads as part of the same set, not a mismatched
// one-off. Geometry matches PugwashHero.jsx's own peace-sign path exactly
// (a circle + one vertical + two diagonals from center), just at icon scale.
function PeaceSign(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9" />
      <path d="M12 12 6.6 17.4" />
      <path d="M12 12l5.4 5.4" />
    </svg>
  );
}

export const SIDEBAR_ICONS = {
  BookOpen,
  Palette,
  Footprints,
  Sprout,
  Telescope,
  Drama,
  Camera,
  Gamepad2,
  Mic,
  Lightbulb,
  Shirt,
  FlaskConical,
  Music,
  Film,
  Terminal,
  PawPrint,
  Hand,
  Code2,
  Rocket,
  PartyPopper,
  Archive,
  Images,
  Image,
  UserRound,
  ChessKnight,
  Trophy,
  PeaceSign,
};

// Doc routes for club pages are the file's own slug (docs/clubs/art-club.mdx
// -> /docs/clubs/art-club, no custom `slug:` frontmatter overrides it), so
// the last path segment of a sidebar/card item's href is exactly the key
// useClubAccent/CLUB_ACCENTS expects. Non-club docs resolve to a slug that
// just isn't in CLUB_ACCENTS, which useClubAccent already falls back on.
export function slugFromHref(href) {
  if (!href) return undefined;
  const clean = href.split(/[?#]/)[0].replace(/\/+$/, '');
  return clean.split('/').pop();
}
