// src/components/clubs/FashionHero.jsx
//
// Fashion Club — two garment sketches (a dress, a suit) draw themselves in a
// gold outline, the way a designer's pen lays down a croquis. Then they hold,
// fully drawn, like finished plates on a mood board.
//
// This was the hardest of the set to keep out of cliché (a sparkle means
// nothing; a runway won't abstract). Drawing the garments as line art is the
// one thing that unambiguously says "fashion design" rather than "shopping".
//
// Gold isn't the club accent here — a metallic outline is the point of the
// look, so it's a fixed gold gradient. The accent still colors the heading,
// keeping the club identifiable.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Croquis line art. These are single continuous-ish outlines so pathLength
// draws them like a pen. Kept simple — legible garment silhouettes at hero size.
const DRESS =
  'M 30,14 L 22,26 L 30,32 L 26,30 L 20,64 C 20,64 40,74 60,64 L 54,30 L 50,32 L 58,26 L 50,14 ' +
  'C 46,20 34,20 30,14 Z';

const SUIT =
  'M 96,14 L 88,24 L 92,30 L 88,70 L 100,70 L 100,44 L 104,44 L 104,70 L 116,70 L 112,30 L 116,24 L 108,14 ' +
  'C 106,22 98,22 96,14 Z M 102,16 L 102,40'; // lapel line + center

export function FashionHero() {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('fashion-club');
  const state = isPlaying ? 'playing' : 'rested';

  const draw = (delay) => ({
    rested: { pathLength: 1, opacity: 1 },
    playing: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { delay, duration: 1.5, ease: 'easeInOut' },
    },
  });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl border border-rose-800/30 bg-rose-950/40 p-8 shadow-md"
    >
      <div className="z-10">
        <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--club-accent)' }}>
          Fashion Club
        </h1>
        <p className="mt-1 text-rose-200/70">Setting trends, design, and celebrating style.</p>
      </div>

      <svg
        key={isHovered ? 'hover' : 'intro'}
        viewBox="0 0 140 84"
        className="pointer-events-none absolute inset-y-0 right-6 h-full w-2/5"
        role="img"
        aria-label="A dress and a suit drawn as gold fashion sketches"
      >
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="45%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#a97a1f" />
          </linearGradient>
        </defs>

        <motion.path
          d={DRESS}
          fill="none"
          stroke="url(#gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw(0)}
          initial={false}
          animate={state}
        />
        <motion.path
          d={SUIT}
          fill="none"
          stroke="url(#gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw(0.8)}
          initial={false}
          animate={state}
        />

        {/* A soft gold shimmer sweeps once across the finished sketches. */}
        <motion.rect
          x="0"
          y="0"
          width="24"
          height="84"
          fill="url(#gold)"
          opacity="0.18"
          initial={false}
          animate={
            isPlaying
              ? { x: [-24, 140], opacity: [0, 0.18, 0] }
              : { x: 140, opacity: 0 }
          }
          transition={
            isPlaying
              ? { duration: 1.1, delay: 2.4, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        />
      </svg>
    </div>
  );
}
