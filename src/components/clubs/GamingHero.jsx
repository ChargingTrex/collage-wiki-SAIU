// src/components/clubs/GamingHero.jsx
//
// Gaming Club — a retro arcade maze-chase, running itself. A wedge muncher
// eats a row of pellets left to right while three ghosts trail behind, all
// over a CRT-scanline wash. It reads instantly as "arcade" without being any
// one specific trademarked game.
//
// The muncher's SHAPE is deliberately generic (not Pac-Man's specific model),
// but as of this revision it's filled yellow at the requester's explicit
// direction — the closest color match to the genre's best-known character.
// Earlier drafts kept it off-yellow specifically to steer clear of Namco's
// Pac-Man trade dress; that tradeoff was flagged and knowingly overridden
// here. Revisit if this ships to a real public audience and that risk
// tolerance changes.
//
// The muncher's mouth chomps on a fast independent loop while the whole cast
// travels across — two timescales, like the real thing.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const PELLETS = [40, 62, 84, 106, 128, 150, 172, 194];
const TRAVEL_MS = 4.2;

function Ghost({ x, delay, tone, isPlaying }) {
  return (
    <motion.g
      initial={{ x: 250 }}
      animate={isPlaying ? { x: [-40, 250] } : { x: 250 }}
      transition={
        isPlaying
          ? { duration: TRAVEL_MS, delay, repeat: Infinity, ease: 'linear' }
          : { duration: 0.4 }
      }
    >
      {/* Body: domed top, wavy skirt. */}
      <path
        d="M 0,4 A 9,9 0 0 1 18,4 L 18,18 L 14,14 L 10,18 L 6,14 L 2,18 L 0,14 Z"
        fill={tone}
        transform={`translate(${x}, 52)`}
      />
      {/* Eyes — the detail that makes it a ghost and not a blob. */}
      <circle cx={x + 6} cy="58" r="2.4" className="fill-white" />
      <circle cx={x + 13} cy="58" r="2.4" className="fill-white" />
      <circle cx={x + 6.6} cy="58.6" r="1.1" className="fill-slate-900" />
      <circle cx={x + 13.6} cy="58.6" r="1.1" className="fill-slate-900" />
    </motion.g>
  );
}

export function GamingHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('gaming-club');

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-violet-950 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: accent.dark }}>
          Gaming Club
        </h1>
        <p className="mt-1 text-violet-200/80">Casual, competitive, and esports community.</p>
      </div>

      {/* CRT scanline wash over the play area. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
        }}
      />

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 240 90"
        className="pointer-events-none absolute inset-x-0 bottom-2 h-24 w-full"
        role="img"
        aria-label="An arcade muncher eating pellets while ghosts chase"
      >
        {/* Pellets — vanish as the muncher passes over each. */}
        {PELLETS.map((px, i) => (
          <motion.circle
            key={i}
            cx={px}
            cy="60"
            r="3"
            fill={accent.dark}
            initial={{ opacity: 0.35 }}
            animate={
              isPlaying
                ? { opacity: [1, 1, 0] }
                : { opacity: 0.35 }
            }
            transition={
              isPlaying
                ? {
                    duration: TRAVEL_MS,
                    // Each pellet blinks out as the muncher reaches its x.
                    times: [0, (px - 20) / 230, (px - 12) / 230],
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : { duration: 0.3 }
            }
          />
        ))}

        {/* The muncher — travels across; mouth chomps on its own fast loop. */}
        <motion.g
          initial={{ x: 240 }}
          animate={isPlaying ? { x: [-30, 240] } : { x: 240 }}
          transition={
            isPlaying
              ? { duration: TRAVEL_MS, repeat: Infinity, ease: 'linear' }
              : { duration: 0.4 }
          }
        >
          <motion.path
            // Wedge with a mouth; the `d` swaps between open and closed.
            fill="#FACC15"
            initial={{ d: 'M 12,60 L 24,53 A 9,9 0 1 0 24,67 Z' }}
            animate={
              isPlaying
                ? {
                    d: [
                      'M 12,60 L 24,53 A 9,9 0 1 0 24,67 Z', // open
                      'M 12,60 L 22,58 A 9,9 0 1 0 22,62 Z', // closed
                      'M 12,60 L 24,53 A 9,9 0 1 0 24,67 Z', // open
                    ],
                  }
                : { d: 'M 12,60 L 24,53 A 9,9 0 1 0 24,67 Z' }
            }
            transition={
              isPlaying
                ? { duration: 0.32, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
          />
        </motion.g>

        {/* Three ghosts trailing behind, each offset so they don't overlap.
            Each gets its own fixed generic color (not the club accent, and
            not each other's) so every character reads as distinct at a
            glance instead of blurring into one hue. */}
        <Ghost x={0} delay={0.9} tone="#67E8F9" isPlaying={isPlaying} />
        <Ghost x={-28} delay={1.5} tone="#c4b5fd" isPlaying={isPlaying} />
        <Ghost x={-56} delay={2.1} tone="#fda4af" isPlaying={isPlaying} />
      </svg>
    </div>
  );
}
