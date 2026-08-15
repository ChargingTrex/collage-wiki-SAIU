// src/components/AccentModeToggle.jsx
//
// Navbar control for the per-club/unified accent toggle. useAccentMode's
// hook and localStorage layer already existed (useClubAccent.js) — nothing
// in the app called setAccentMode until this component, so the documented
// "flip a single setting to get the site palette everywhere" feature was
// unreachable by any real visitor. A compact pill in the navbar rather than
// a whole settings page: this is one boolean, not a settings surface.
//
// Motion is unaffected either way — per useClubAccent's own contract,
// unified mode only swaps color; each hero's choreography stays whatever
// it already is.

import React from 'react';
import { useAccentMode } from './useClubAccent';

export function AccentModeToggle() {
  const { mode, setAccentMode } = useAccentMode();
  const isUnified = mode === 'unified';

  return (
    <button
      type="button"
      className="accent-mode-toggle"
      onClick={() => setAccentMode(isUnified ? 'per-club' : 'unified')}
      aria-pressed={isUnified}
      aria-label={
        isUnified
          ? "Unified accent color is on. Click to switch back to each club's own color."
          : "Per-club accent colors are on. Click to use one color everywhere."
      }
      title={isUnified ? 'Colors: Unified' : 'Colors: Per-club'}
    >
      <span className="accent-mode-toggle__dot" aria-hidden="true" />
      {isUnified ? 'Unified' : 'Per-club'}
    </button>
  );
}
