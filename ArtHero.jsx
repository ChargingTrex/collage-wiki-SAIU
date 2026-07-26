// src/components/clubs/ArtHero.jsx
//
// Art Club — a single broad brushstroke paints itself across the frame, its
// width swelling and thinning the way real pressure varies, while its color
// travels through a small palette. A retro-CRT wash sits underneath.
//
// Not a spinning palette icon. The act here is the STROKE — pigment laid down
// with intent. It draws once and stays painted; a stroke that erases itself
// isn't painting.
//
// The width variation is faked with a tapered filled shape (not a stroked
// line, which can only be uniform width). The color shift rides a hue
// animation on the fill so it feels like loading a fresh color mid-stroke.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// A tapered brush body: thin at the start, fat in the middle, thin at the end.
// Drawn as an outline so the width can vary along its length.
const STROKE_BODY =
  'M 6,60 ' +
  'C 40,40 60,38 90,46 ' +   // top edge
  'C 130,56 170,54 226,44 ' +
  'C 172,66 132,70 90,62 ' +  // bottom edge back
  'C 60,56 40,58 6,64 Z';

export function ArtHero() {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('art-club');
  const clipId = React.useId();

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--club-accent)' }}>
          Art Club
        </h1>
        <p className="mt-1 text-slate-300">Unleashing creativity through visual arts.</p>
      </div>

      {/* CRT scanline wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
        }}
      />

      <svg
        key={isHovered ? 'hover' : 'intro'}
        viewBox="0 0 240 110"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5"
        role="img"
        aria-label="A brushstroke painting itself across the frame"
      >
        <defs>
          {/* A wipe rectangle reveals the stroke left-to-right, so it looks
              laid down by a moving brush rather than just fading in. */}
          <clipPath id={clipId}>
            <motion.rect
              x="0"
              y="0"
              height="110"
              initial={false}
              animate={
                isPlaying
                  ? { width: [0, 240] }
                  : { width: 240 }
              }
              transition={
                isPlaying
                  ? { duration: 2.0, ease: [0.4, 0, 0.3, 1] }
                  : { duration: 0.4 }
              }
            />
          </clipPath>
        </defs>

        {/* The stroke. Hue shifts along the way — filter animates the fill
            through the palette so it reads as changing color mid-stroke. */}
        <motion.path
          d={STROKE_BODY}
          clipPath={`url(#${clipId})`}
          initial={false}
          animate={
            isPlaying
              ? { fill: ['#f472b6', '#a78bfa', '#38bdf8', '#f472b6'] }
              : { fill: 'var(--club-accent)' }
          }
          transition={
            isPlaying
              ? { duration: 3.2, repeat: Infinity, ease: 'linear' }
              : { duration: 0.4 }
          }
        />

        {/* Brush tip riding the leading edge of the wipe. */}
        <motion.g
          initial={false}
          animate={
            isPlaying
              ? { x: [6, 226], opacity: [1, 1, 0] }
              : { x: 226, opacity: 0 }
          }
          transition={
            isPlaying
              ? { duration: 2.0, times: [0, 0.9, 1], ease: [0.4, 0, 0.3, 1] }
              : { duration: 0.3 }
          }
        >
          {/* Ferrule + bristles */}
          <rect x="0" y="40" width="6" height="10" rx="1" className="fill-slate-400" transform="rotate(20 3 45)" />
          <path d="M 4,52 L 14,58 L 4,62 Z" className="fill-slate-200" />
        </motion.g>
      </svg>
    </div>
  );
}
