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
  'animal-welfare-society': { light: '#B45309', dark: '#FBBF24', name: 'Amber' },
  'art-club': { light: '#A21CAF', dark: '#E879F9', name: 'Fuchsia' },
  'astronomy-club': { light: '#4338CA', dark: '#A5B4FC', name: 'Indigo' },
  'chess-club': { light: '#334155', dark: '#CBD5E1', name: 'Slate' },
  'dance-club': { light: '#BE123C', dark: '#FB7185', name: 'Rose' },
  'entrepreneurship-club': { light: '#047857', dark: '#6EE7B7', name: 'Emerald' },
  'fashion-club': { light: '#9D174D', dark: '#F9A8D4', name: 'Pink' },
  'film-society': { light: '#7F1D1D', dark: '#FCA5A5', name: 'Crimson' },
  'foss-club': { light: '#0369A1', dark: '#7DD3FC', name: 'Sky' },
  'gaming-club': { light: '#6D28D9', dark: '#C4B5FD', name: 'Violet' },
  'gardening-club': { light: '#15803D', dark: '#86EFAC', name: 'Green' },
  'literary-club': { light: '#92400E', dark: '#FCD34D', name: 'Sepia' },
  'martial-arts-club': { light: '#B91C1C', dark: '#F87171', name: 'Red' },
  'music-club': { light: '#C2410C', dark: '#FDBA74', name: 'Orange' },
  'oratory-club': { light: '#1D4ED8', dark: '#93C5FD', name: 'Blue' },
  'photography-club': { light: '#0E7490', dark: '#67E8F9', name: 'Cyan' },
  'pugwash-society': { light: '#3F6212', dark: '#BEF264', name: 'Olive' },
  'science-society': { light: '#0F766E', dark: '#5EEAD4', name: 'Teal' },
  'sports-society': { light: '#A16207', dark: '#FDE047', name: 'Gold' },
  'theatre-club': { light: '#7E22CE', dark: '#D8B4FE', name: 'Purple' },
  'turingites-computer-science-society': { light: '#16A34A', dark: '#4ADE80', name: 'Terminal' },
};

// Used when the reader has opted into a single color. `dark` (white) covers
// 19 of 21 club heroes — the ones with a permanently-dark card, which use
// `accent.dark` directly regardless of site theme, so white-on-dark is
// comfortably high contrast there. `light` (black) is specifically for
// Gardening/Literary, whose card backgrounds are genuinely theme-adaptive
// and read `var(--club-accent)` → the light variant in light site theme:
// their light-mode backgrounds (bg-emerald-50/bg-amber-50) are both
// near-white, so white text there would be effectively unreadable
// (~1:1 contrast) — black is the correct pairing for that specific case.
// Their dark-mode backgrounds are dark enough that white still works fine.
export const UNIFIED_ACCENT = {
  light: '#000000',
  dark: '#ffffff',
  name: 'Monochrome',
};

export const ACCENT_STORAGE_KEY = 'sai-wiki-accent-mode'; // 'per-club' | 'unified'
