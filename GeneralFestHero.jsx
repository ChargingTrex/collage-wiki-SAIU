// src/components/fests/GeneralFestHero.jsx
//
// General College Fest — a burst of celebration. A popper fires, confetti
// launches upward, arcs over under gravity, and falls to settle at the bottom.
// A celebration genuinely IS bursts of color, so the original instinct was
// right; the only change is real ballistic motion (up, arc, fall, settle)
// instead of random floating, and it settles rather than looping forever.
//
// Each confetti piece gets a launch angle, a peak, and a landing, precomputed
// so the arc is a proper parabola rather than a jitter.

import React from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { FestSound } from './FestSound';

const CONFETTI_COLORS = ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#fb7185'];

// Precompute pieces once at module load — deterministic so SSR and client agree.
const PIECES = Array.from({ length: 22 }).map((_, i) => {
  const angle = -90 + (Math.random() * 120 - 60); // mostly upward
  const power = 60 + Math.random() * 70;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    // launch vector
    peakX: Math.cos(rad) * power,
    peakY: Math.sin(rad) * power, // negative = up
    // where it lands (drifts a bit further horizontally, falls to the floor)
    landX: Math.cos(rad) * power * 1.5,
    landY: 90 + Math.random() * 20,
    spin: Math.random() * 720 - 360,
    delay: Math.random() * 0.25,
    size: 4 + Math.random() * 4,
    rect: Math.random() > 0.5,
  };
});

export function GeneralFestHero({ title = 'Annual College Fest', audioSrc }) {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('art-club'); // borrows a festive multi-hue accent for the heading

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-orange-500 text-white shadow-xl"
    >
      {/* Sound toggle, top-right */}
      <div className="absolute right-4 top-4 z-20">
        <FestSound audioSrc={audioSrc} label="Play theme" />
      </div>

      <div className="z-10 flex flex-col items-center">
        <motion.div
          initial={false}
          animate={isPlaying ? { scale: [1, 1.25, 1], rotate: [0, -12, 8, 0] } : { scale: 1, rotate: 0 }}
          transition={isPlaying ? { duration: 0.6 } : { duration: 0.3 }}
        >
          <PartyPopper className="mb-2 h-14 w-14" />
        </motion.div>
        <h1 className="text-center text-4xl font-black tracking-tight drop-shadow-sm">{title}</h1>
      </div>

      {/* Confetti — launches from center, arcs, falls, settles. */}
      <svg
        key={isHovered ? 'hover' : 'intro'}
        viewBox="0 0 300 200"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {PIECES.map((p) => {
          const originX = 150;
          const originY = 96;
          const Shape = p.rect ? 'rect' : 'circle';
          const shapeProps = p.rect
            ? { width: p.size, height: p.size * 0.6, x: -p.size / 2, y: -p.size / 2, rx: 1 }
            : { r: p.size / 2 };

          return (
            <motion.g
              key={p.id}
              initial={false}
              animate={
                isPlaying
                  ? {
                      x: [originX, originX + p.peakX, originX + p.landX],
                      y: [originY, originY + p.peakY, originY + p.landY],
                      rotate: [0, p.spin * 0.5, p.spin],
                      opacity: [0, 1, 1, 0.9],
                    }
                  : { x: originX + p.landX, y: originY + p.landY, opacity: 0.9, rotate: p.spin }
              }
              transition={
                isPlaying
                  ? {
                      duration: 1.8,
                      delay: p.delay,
                      // Fast launch, slow fall — the arc's timing under gravity.
                      times: [0, 0.35, 1],
                      ease: ['easeOut', 'easeIn'],
                    }
                  : { duration: 0.3 }
              }
            >
              <Shape {...shapeProps} fill={p.color} />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
