// src/components/clubs/GardeningHero.jsx
//
// Gardening Club — a stem draws upward, leaves unfold along it in the order
// they'd actually appear, a bud opens at the tip. Then it STAYS GROWN.
//
// The rested state is the fully grown plant, not the seed. Growth that
// resets isn't growth — it's a pulse, and a pulse reads as breathing or
// loading, neither of which is gardening.
//
// Leaves scale from their own attachment point on the stem (originX/Y set
// per leaf) so they hinge outward like real leaves rather than ballooning
// from their centers.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const STEM_PATH = 'M 60,120 C 60,100 54,86 58,68 C 61,52 66,40 64,24';

// Each leaf: the point it attaches to the stem (its hinge), the shape, and
// when it appears. Lower leaves emerge first — that's the order a plant does it.
const LEAVES = [
  {
    hinge: [58, 96],
    d: 'M 58,96 C 42,92 32,80 30,70 C 44,70 55,80 58,96 Z',
    delay: 0.65,
  },
  {
    hinge: [57, 78],
    d: 'M 57,78 C 74,76 86,66 89,56 C 74,54 61,63 57,78 Z',
    delay: 1.05,
  },
  {
    hinge: [63, 56],
    d: 'M 63,56 C 48,51 40,40 39,31 C 51,33 60,43 63,56 Z',
    delay: 1.45,
  },
];

export function GardeningHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('gardening-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl border border-solid border-emerald-800/25 bg-emerald-50/50 p-8 shadow-md dark:border-emerald-700/25 dark:bg-emerald-950/25"
    >
      <div className="z-10">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--club-accent)' }}>
          Gardening Club
        </h1>
        <p className="mt-1 text-emerald-800/70 dark:text-emerald-300/70">
          Cultivating green spaces across campus.
        </p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 130 130"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label="A seedling growing a stem, leaves, and a bud"
      >
        {/* Soil line — static. The plant grows from it. */}
        <path
          d="M 14,120 L 106,120"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-emerald-900/40 dark:text-emerald-100/20"
        />

        {/* Stem draws bottom to top. pathLength normalizes so timing is
            independent of the path's real length. */}
        <motion.path
          d={STEM_PATH}
          fill="none"
          stroke="var(--club-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          variants={{
            rested: { pathLength: 1 },
            playing: {
              pathLength: [0, 1],
              transition: { duration: 1.6, ease: 'easeOut' },
            },
          }}
          initial="rested"
          animate={state}
        />

        {/* Leaves unfold from their attachment points, low to high. */}
        {LEAVES.map((leaf, i) => (
          <motion.path
            key={i}
            d={leaf.d}
            fill="var(--club-accent)"
            style={{
              originX: `${leaf.hinge[0]}px`,
              originY: `${leaf.hinge[1]}px`,
            }}
            variants={{
              rested: { scale: 1, opacity: 0.9 },
              playing: {
                scale: [0, 1],
                opacity: [0, 0.9],
                transition: {
                  delay: leaf.delay,
                  duration: 0.55,
                  ease: [0.34, 1.15, 0.64, 1],
                },
              },
            }}
            initial="rested"
            animate={state}
          />
        ))}

        {/* Bud at the tip, last to open. */}
        <motion.circle
          cx="64"
          cy="23"
          r="6"
          fill="var(--club-accent)"
          style={{ originX: '64px', originY: '29px' }}
          variants={{
            rested: { scale: 1, opacity: 1 },
            playing: {
              scale: [0, 1],
              opacity: [0, 1],
              transition: { delay: 1.85, duration: 0.5, ease: [0.34, 1.3, 0.64, 1] },
            },
          }}
          initial="rested"
          animate={state}
        />
      </svg>
    </div>
  );
}
