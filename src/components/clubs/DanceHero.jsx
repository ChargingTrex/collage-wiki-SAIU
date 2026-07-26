// src/components/clubs/DanceHero.jsx
//
// Dance Club — rhythmic equalizer bars. The original idea was right (the bars
// ARE the rhythm, not a picture of it); the only change is shaping the motion
// into a phrase — build, peak, drop — instead of random per-bar bounce.
// Random reads as noise; a shaped pulse reads as a beat you could move to.
//
// Bars share a repeating beat but each is offset, so the whole thing ripples
// left-to-right like a body catching a rhythm rather than pumping in unison.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Per-bar: baseline height fraction and how much it swings. Center bars swing
// hardest — the energy lives in the middle of the phrase.
const BARS = [
  { base: 0.30, swing: 0.25 },
  { base: 0.45, swing: 0.40 },
  { base: 0.55, swing: 0.55 },
  { base: 0.70, swing: 0.70 },
  { base: 0.85, swing: 0.85 },
  { base: 0.70, swing: 0.70 },
  { base: 0.55, swing: 0.55 },
  { base: 0.45, swing: 0.40 },
  { base: 0.30, swing: 0.25 },
];

const BAR_W = 8;
const BAR_GAP = 6;
const MAX_H = 64;
const FLOOR_Y = 74;

export function DanceHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('dance-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-rose-950 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-extrabold" style={{ color: accent.dark }}>
          Dance Club
        </h1>
        <p className="mt-1 text-rose-200/80">Expressing rhythm, grace, and movement.</p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox={`0 0 ${BARS.length * (BAR_W + BAR_GAP)} 90`}
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2"
        role="img"
        aria-label="Rhythmic equalizer bars"
      >
        {BARS.map((bar, i) => {
          const baseH = bar.base * MAX_H;
          const peakH = Math.min((bar.base + bar.swing) * MAX_H, MAX_H);
          const x = i * (BAR_W + BAR_GAP);
          // Offset each bar's beat so the pulse travels across.
          const offset = Math.abs(i - (BARS.length - 1) / 2) * 0.09;

          return (
            <motion.rect
              key={i}
              x={x}
              width={BAR_W}
              rx={BAR_W / 2}
              fill={accent.dark}
              initial="rested"
              animate={state}
              variants={{
                rested: { y: FLOOR_Y - baseH, height: baseH, opacity: 0.8 },
                playing: {
                  y: [FLOOR_Y - baseH, FLOOR_Y - peakH, FLOOR_Y - baseH],
                  height: [baseH, peakH, baseH],
                  opacity: 0.9,
                  transition: {
                    duration: 0.9,
                    delay: offset,
                    // Two beats, then hold — an infinite pulse read as
                    // distracting/relentless rather than musical. Stays
                    // stopped until the reader hovers or clicks to replay.
                    repeat: 1,
                    repeatType: 'loop',
                    ease: 'easeInOut',
                  },
                },
              }}
            />
          );
        })}
        {/* Floor line the bars stand on */}
        <rect x="0" y={FLOOR_Y} width={BARS.length * (BAR_W + BAR_GAP)} height="2" rx="1" fill={accent.dark} opacity="0.3" />
      </svg>
    </div>
  );
}
