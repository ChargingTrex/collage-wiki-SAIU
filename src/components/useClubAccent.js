// src/components/useClubAccent.js
//
// Resolves which accent a club hero should use, honoring the reader's
// preference between per-club colors (default) and one unified site color.
//
// Returns a style object to spread onto the hero's root element. Everything
// downstream — SVG fills, borders, text — references var(--club-accent),
// so switching modes is one variable change rather than a re-render of
// eighteen different class strings.
//
//   const { accentStyle, accentName } = useClubAccent('astronomy-club');
//   <div style={accentStyle}>
//     <circle fill="var(--club-accent)" />
//   </div>

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CLUB_ACCENTS, UNIFIED_ACCENT, ACCENT_STORAGE_KEY } from './clubAccents';

function readStoredMode() {
  if (typeof window === 'undefined') return 'per-club';
  try {
    return window.localStorage.getItem(ACCENT_STORAGE_KEY) === 'unified'
      ? 'unified'
      : 'per-club';
  } catch {
    // Storage can throw in private-mode Safari and some embedded webviews.
    return 'per-club';
  }
}

export function useAccentMode() {
  // Always start at the default so server and first client render agree —
  // reading storage during render would cause a hydration mismatch in
  // Docusaurus's prerendered pages.
  const [mode, setMode] = useState('per-club');

  useEffect(() => {
    setMode(readStoredMode());

    // Keep multiple open tabs (and the settings toggle elsewhere on the
    // page) in sync.
    const onStorage = (e) => {
      if (e.key === ACCENT_STORAGE_KEY) setMode(readStoredMode());
    };
    const onLocal = () => setMode(readStoredMode());

    window.addEventListener('storage', onStorage);
    window.addEventListener('sai-accent-change', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sai-accent-change', onLocal);
    };
  }, []);

  const setAccentMode = useCallback((next) => {
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
    } catch {
      /* non-fatal — the setting just won't persist */
    }
    setMode(next);
    // Same-tab listeners don't get the 'storage' event, so fire our own.
    window.dispatchEvent(new Event('sai-accent-change'));
  }, []);

  return { mode, setAccentMode };
}

export function useClubAccent(clubSlug) {
  const { mode } = useAccentMode();

  return useMemo(() => {
    const perClub = CLUB_ACCENTS[clubSlug] ?? UNIFIED_ACCENT;
    const accent = mode === 'unified' ? UNIFIED_ACCENT : perClub;

    return {
      accent,
      accentName: accent.name,
      isUnified: mode === 'unified',
      // Both variables are set; custom.css picks the right one per theme:
      //   :root            { --club-accent: var(--club-accent-light); }
      //   [data-theme=dark]{ --club-accent: var(--club-accent-dark); }
      accentStyle: {
        '--club-accent-light': accent.light,
        '--club-accent-dark': accent.dark,
      },
    };
  }, [clubSlug, mode]);
}
