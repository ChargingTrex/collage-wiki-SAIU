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
// suggest left and right paws. Trail starts well clear of the svg's own left
// edge (which sits close to the heading column) so the first print doesn't
// overlap the heading text.
const PRINTS = Array.from({ length: 6 }).map((_, i) => ({
  x: 78 + i * 25,
  y: 76 + (i % 2 === 0 ? -6 : 6),
  rot: i % 2 === 0 ? -12 : 12,
}));

// A single paw: main pad + four toes.
function Paw({ color }) {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="6" ry="5" fill={color} />
      <circle cx="-5" cy="-4" r="2.1" fill={color} />
      <circle cx="-1.6" cy="-6.5" r="2.1" fill={color} />
      <circle cx="2.2" cy="-6.5" r="2.1" fill={color} />
      <circle cx="5.4" cy="-4" r="2.1" fill={color} />
    </g>
  );
}

export function AnimalWelfareHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('animal-welfare-society');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-amber-950 p-8 text-white shadow-xl"
    >
      <div className="z-10 max-w-[60%]">
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Animal Welfare Society
        </h1>
        <p className="mt-1 text-amber-200/80">
          Advocating, feeding, and caring for campus animals.
        </p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 220 100"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5"
        role="img"
        aria-label="A trail of paw prints ending in a heart"
      >
        {PRINTS.map((p, i) => (
          // Static position lives on a plain outer `<g>` — Framer Motion
          // needs to own `transform` itself for the scale/opacity variants,
          // so a translate/rotate ATTRIBUTE on the same motion element gets
          // silently overridden (it renders `style="transform: none"` once
          // settled, canceling the attribute entirely and leaving every
          // print stacked at the SVG's own origin). Same bug, same fix, as
          // Photography's corner brackets.
          <g key={i} transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}>
            <motion.g
              initial="rested"
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
              <Paw color={accent.dark} />
            </motion.g>
          </g>
        ))}

        {/* Heart rises where the trail ends. */}
        <motion.path
          d="M 200,52 C 200,46 208,44 210,50 C 212,44 220,46 220,52 C 220,58 210,64 210,64 C 210,64 200,58 200,52 Z"
          fill={accent.dark}
          initial="rested"
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
