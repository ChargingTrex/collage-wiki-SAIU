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
} from 'lucide-react';

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
