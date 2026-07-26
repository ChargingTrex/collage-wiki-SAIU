// src/components/clubs/AnimalWelfareHero.jsx
//
// Animal Welfare Society — a trail of paw prints appears across the frame,
// stepping one after another, then a small heart rises where the trail ends.
// The walk is care arriving; the heart is why.
//
// The original's walking paws were already a decent instinct — this keeps it
// and adds the payoff. Prints appear in sequence with a slight
// left/right/left offset so it reads as a gait, not a straight dotted line.
// It builds once and stays; a trail that erases itself loses the "someone was
// here caring" reading.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Each print: x along the trail, and a small y offset alternating up/down to
// suggest left and right paws.
const PRINTS = Array.from({ length: 6 }).map((_, i) => ({
  x: 14 + i * 34,
  y: 66 + (i % 2 === 0 ? -8 : 8),
  rot: i % 2 === 0 ? -12 : 12,
}));

// A single paw: main pad + four toes.
function Paw() {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="6" ry="5" fill="var(--club-accent)" />
      <circle cx="-5" cy="-4" r="2.1" fill="var(--club-accent)" />
      <circle cx="-1.6" cy="-6.5" r="2.1" fill="var(--club-accent)" />
      <circle cx="2.2" cy="-6.5" r="2.1" fill="var(--club-accent)" />
      <circle cx="5.4" cy="-4" r="2.1" fill="var(--club-accent)" />
    </g>
  );
}

export function AnimalWelfareHero() {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('animal-welfare-society');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-amber-950 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--club-accent)' }}>
          Animal Welfare Society
        </h1>
        <p className="mt-1 text-amber-200/80">
          Advocating, feeding, and caring for campus animals.
        </p>
      </div>

      <svg
        key={isHovered ? 'hover' : 'intro'}
        viewBox="0 0 220 100"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5"
        role="img"
        aria-label="A trail of paw prints ending in a heart"
      >
        {PRINTS.map((p, i) => (
          <motion.g
            key={i}
            transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}
            initial={false}
            animate={state}
            variants={{
              rested: { opacity: 0.85, scale: 1 },
              playing: {
                opacity: [0, 0.85],
                scale: [0.5, 1],
                transition: { delay: i * 0.24, duration: 0.35, ease: 'easeOut' },
              },
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <Paw />
          </motion.g>
        ))}

        {/* Heart rises where the trail ends. */}
        <motion.path
          d="M 200,52 C 200,46 208,44 210,50 C 212,44 220,46 220,52 C 220,58 210,64 210,64 C 210,64 200,58 200,52 Z"
          fill="var(--club-accent)"
          initial={false}
          animate={state}
          variants={{
            rested: { opacity: 1, scale: 1, y: 0 },
            playing: {
              opacity: [0, 1],
              scale: [0, 1.15, 1],
              y: [8, 0],
              transition: { delay: PRINTS.length * 0.24 + 0.1, duration: 0.55, ease: [0.34, 1.4, 0.64, 1] },
            },
          }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </svg>
    </div>
  );
}
