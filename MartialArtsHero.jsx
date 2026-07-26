// src/components/clubs/MartialArtsHero.jsx
//
// Martial Arts Club — a board break. A hand descends in one committed strike,
// connects, and the plank snaps into two halves that fall away. The impact
// gives a single sharp shake and a brief burst at the contact point.
//
// Replaces the original's flame, which had nothing to do with martial arts.
// A break is discipline made visible: one focused movement, a clear result,
// then stillness. The two halves stay broken — the point was landed.
//
// The strike is fast and eases IN (accelerates into the board); the recovery
// and the falling halves are slower. Real strikes are quick to land and the
// aftermath is what you actually watch.

import React from 'react';
import { motion } from 'framer-motion';
import { Hand } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

export function MartialArtsHero() {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('martial-arts-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-red-950 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--club-accent)' }}>
          Martial Arts Club
        </h1>
        <p className="mt-1 text-red-200/80">Building discipline, fitness, and self-defense.</p>
      </div>

      <div className="relative mr-4 flex h-32 w-40 items-center justify-center">
        <svg viewBox="0 0 160 130" className="h-full w-full" key={isHovered ? 'hover' : 'intro'}>
          {/* Two support blocks the plank rests across. */}
          <rect x="14" y="78" width="16" height="34" rx="2" className="fill-red-900" />
          <rect x="130" y="78" width="16" height="34" rx="2" className="fill-red-900" />

          {/* Left half of the plank. Intact = spans center; broken = tips
              down off the left support. */}
          <motion.rect
            x="26"
            y="70"
            width="54"
            height="10"
            rx="2"
            fill="var(--club-accent)"
            initial={false}
            animate={state}
            style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
            variants={{
              rested: { rotate: 14, y: 6, opacity: 0.9 },
              playing: {
                rotate: [0, 0, 14],
                y: [0, 0, 6],
                transition: { duration: 1.4, times: [0, 0.5, 0.72], ease: 'easeOut' },
              },
            }}
          />
          {/* Right half. */}
          <motion.rect
            x="80"
            y="70"
            width="54"
            height="10"
            rx="2"
            fill="var(--club-accent)"
            initial={false}
            animate={state}
            style={{ transformBox: 'fill-box', transformOrigin: 'right center' }}
            variants={{
              rested: { rotate: -14, y: 6, opacity: 0.9 },
              playing: {
                rotate: [0, 0, -14],
                y: [0, 0, 6],
                transition: { duration: 1.4, times: [0, 0.5, 0.72], ease: 'easeOut' },
              },
            }}
          />

          {/* Impact burst at the break point — brief spokes at contact. */}
          <motion.g
            stroke="var(--club-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={state}
            variants={{
              rested: { opacity: 0 },
              playing: {
                opacity: [0, 0, 1, 0],
                scale: [0.4, 0.4, 1.2, 1.6],
                transition: { duration: 1.4, times: [0, 0.48, 0.56, 0.7] },
              },
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <path d="M 80,58 L 80,48" />
            <path d="M 80,58 L 70,50" />
            <path d="M 80,58 L 90,50" />
            <path d="M 80,58 L 66,58" />
            <path d="M 80,58 L 94,58" />
          </motion.g>
        </svg>

        {/* The striking hand — descends, holds at contact, recovers slightly. */}
        <motion.div
          className="absolute"
          style={{ color: 'var(--club-accent)', top: 0 }}
          initial={false}
          animate={state}
          variants={{
            rested: { y: 40, opacity: 0.9 },
            playing: {
              y: [-30, 40, 40, 30],
              opacity: [0, 1, 1, 0.9],
              transition: { duration: 1.4, times: [0, 0.5, 0.66, 1], ease: 'easeIn' },
            },
          }}
        >
          <Hand className="h-12 w-12 rotate-180" />
        </motion.div>
      </div>
    </div>
  );
}
