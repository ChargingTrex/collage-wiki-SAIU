// src/components/clubs/PugwashHero.jsx
//
// Pugwash Society — a peace sign draws itself, centered and alone. Earlier
// drafts paired it with a mushroom cloud (the club's namesake, the Pugwash
// Conferences on Science and World Affairs, was founded in 1957 specifically
// to campaign against nuclear weapons) — first as a solid cloud that read as
// a tree, then as a corrected mushroom-cloud pictogram. Both were dropped at
// the requester's direction in favor of just the symbol: the peace sign
// alone still carries the club's real subject without needing to draw the
// threat it's answering.
//
// Builds once and holds the drawn sign — a symbol that re-draws itself on a
// loop reads as flickering, not resolve.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Peace sign glyph geometry, centered in the 160x160 viewBox.
const CX = 80;
const CY = 80;
const R = 45;
const TOP = `M ${CX},${CY - R} L ${CX},${CY}`;
const DIAG_L = `M ${CX},${CY} L ${CX - R * 0.71},${CY + R * 0.71}`;
const DIAG_R = `M ${CX},${CY} L ${CX + R * 0.71},${CY + R * 0.71}`;

export function PugwashHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion({ playOnVisible: true });
  const { accent, accentStyle } = useClubAccent('pugwash-society');
  const state = isPlaying ? 'playing' : 'rested';

  const draw = (delay, duration) => ({
    rested: { pathLength: 1, opacity: 1 },
    playing: { pathLength: [0, 1], opacity: [0, 1], transition: { delay, duration, ease: 'easeInOut' } },
  });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-neutral-900 p-8 text-white shadow-xl transition-shadow duration-150 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary-500)] focus-visible:ring-offset-2"
    >
      <div className="z-10">
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Pugwash Society
        </h1>
        <p className="mt-1 text-neutral-300/80">Debating science, policy, and the world's hardest questions.</p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 160 160"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label="A peace sign draws itself"
      >
        <motion.circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={accent.dark}
          strokeWidth="5"
          variants={draw(0.2, 0.75)}
          initial="rested"
          animate={state}
        />
        <motion.path d={TOP} fill="none" stroke={accent.dark} strokeWidth="5" strokeLinecap="round" variants={draw(0.8, 0.35)} initial="rested" animate={state} />
        <motion.path d={DIAG_L} fill="none" stroke={accent.dark} strokeWidth="5" strokeLinecap="round" variants={draw(1.0, 0.35)} initial="rested" animate={state} />
        <motion.path d={DIAG_R} fill="none" stroke={accent.dark} strokeWidth="5" strokeLinecap="round" variants={draw(1.0, 0.35)} initial="rested" animate={state} />
      </svg>
    </div>
  );
}
