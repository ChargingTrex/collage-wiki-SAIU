// src/components/clubAccents.js
//
// Every club gets its own accent color, so the directory can be sorted and
// scanned by color as well as alphabetically. Readers who find that too busy
// can flip a single setting and get the site palette everywhere instead —
// the motion still differs per club, only the color unifies.
//
// Colors are stored as CSS custom properties rather than Tailwind classes so
// that (a) the unified-mode override is one swap rather than 18, and (b) SVG
// fill/stroke can reference them directly.
//
// Ordering note: accents are assigned so that alphabetically adjacent clubs
// don't land on near-identical hues — otherwise the directory reads as a
// gradient smear instead of 18 distinguishable entries.

export const CLUB_ACCENTS = {
  'animal-welfare-society':            { light: '#B45309', dark: '#FBBF24', name: 'Amber' },
  'art-club':                          { light: '#A21CAF', dark: '#E879F9', name: 'Fuchsia' },
  'astronomy-club':                    { light: '#4338CA', dark: '#A5B4FC', name: 'Indigo' },
  'dance-club':                        { light: '#BE123C', dark: '#FB7185', name: 'Rose' },
  'entrepreneurship-club':             { light: '#047857', dark: '#6EE7B7', name: 'Emerald' },
  'fashion-club':                      { light: '#9D174D', dark: '#F9A8D4', name: 'Pink' },
  'film-society':                      { light: '#7F1D1D', dark: '#FCA5A5', name: 'Crimson' },
  'foss-club':                         { light: '#0369A1', dark: '#7DD3FC', name: 'Sky' },
  'gaming-club':                       { light: '#6D28D9', dark: '#C4B5FD', name: 'Violet' },
  'gardening-club':                    { light: '#15803D', dark: '#86EFAC', name: 'Green' },
  'literary-club':                     { light: '#92400E', dark: '#FCD34D', name: 'Sepia' },
  'martial-arts-club':                 { light: '#B91C1C', dark: '#F87171', name: 'Red' },
  'music-club':                        { light: '#C2410C', dark: '#FDBA74', name: 'Orange' },
  'oratory-club':                      { light: '#1D4ED8', dark: '#93C5FD', name: 'Blue' },
  'photography-club':                  { light: '#0E7490', dark: '#67E8F9', name: 'Cyan' },
  'science-society':                   { light: '#0F766E', dark: '#5EEAD4', name: 'Teal' },
  'theatre-club':                      { light: '#7E22CE', dark: '#D8B4FE', name: 'Purple' },
  'turingites-computer-science-society': { light: '#15803D', dark: '#4ADE80', name: 'Terminal' },
};

// Used when the reader has opted into a single color. Falls back to the
// site's Infima primary so it tracks whatever palette is chosen later.
export const UNIFIED_ACCENT = {
  light: 'var(--ifm-color-primary)',
  dark: 'var(--ifm-color-primary)',
  name: 'Site palette',
};

export const ACCENT_STORAGE_KEY = 'sai-wiki-accent-mode'; // 'per-club' | 'unified'
