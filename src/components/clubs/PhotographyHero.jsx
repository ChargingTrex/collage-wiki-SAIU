// src/components/clubs/PhotographyHero.jsx
//
// Photography Club — the ACT of taking a shot, not a camera icon.
//
// Sequence: four focus brackets drift inward and lock onto the subject
// (autofocus acquiring), a beat of stillness, then the shutter blinks and a
// flash flares. That's the moment a photograph happens.
//
// The flash is a full-frame white flare that snaps on and falls off fast —
// a slow flash looks like a fade, not a strobe.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Corner brackets: start position (spread out) and locked position (tight).
// Each `to`/`from` is a screen-space offset from CX/CY, so the sign has to
// match the label (tl = negative x, negative y, etc.) — they were previously
// swapped diagonally (tl's offset pointed bottom-right), which put every
// bracket's shape at its opposite corner, facing the wrong way.
//
// `to` is deliberately smaller in magnitude than the viewfinder square's own
// half-size (46, see the `motion.rect` below) so the brackets lock just
// inside the square's edge rather than sitting exactly on top of it.
const CORNERS = [
  { id: 'tl', from: [-30, -30], to: [-38, -38], path: 'M 0,10 L 0,0 L 10,0' },
  { id: 'tr', from: [30, -30],  to: [38, -38],  path: 'M -10,0 L 0,0 L 0,10' },
  { id: 'bl', from: [-30, 30],  to: [-38, 38],  path: 'M 0,-10 L 0,0 L 10,0' },
  { id: 'br', from: [30, 30],   to: [38, 38],   path: 'M -10,0 L 0,0 L 0,-10' },
];

const CX = 78;
const CY = 65;

export function PhotographyHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('photography-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Photography Club
        </h1>
        <p className="mt-1 text-slate-300">Capturing moments through the lens.</p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 150 130"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/5"
        role="img"
        aria-label="Focus brackets locking onto a subject, then a shutter flash"
      >
        {/* Subject dot the focus converges on. */}
        <motion.circle
          cx={CX}
          cy={CY}
          r="4"
          fill={accent.dark}
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 0.9 },
            playing: { opacity: [0, 0.9], transition: { delay: 0.8, duration: 0.3 } },
          }}
        />

        {/* Four converging focus brackets. Framer Motion needs to own the
            `transform` itself to animate x/y, so the CX/CY centering can't
            live on the same element as a static `transform` string — it's
            baked into an outer plain `<g>` instead, with only x/y (no other
            transform) animated on the inner motion.g. Mixing the two on one
            element silently drops the static offset, which is why 3 of the
            4 corners previously rendered off-position. */}
        {CORNERS.map((c, i) => (
          <g key={c.id} transform={`translate(${CX}, ${CY})`}>
            <motion.g
              stroke={accent.dark}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial="rested"
              animate={state}
              variants={{
                rested: { x: c.to[0], y: c.to[1], opacity: 0.9 },
                playing: {
                  x: [c.from[0], c.to[0]],
                  y: [c.from[1], c.to[1]],
                  opacity: [0, 0.9],
                  transition: { duration: 0.7, ease: 'easeOut' },
                },
              }}
            >
              <path d={c.path} />
            </motion.g>
          </g>
        ))}

        {/* Viewfinder square connecting the four corner brackets — reads as
            an actual camera viewfinder frame, not four floating marks. Locks
            into place on the same beat as the corner brackets. */}
        <motion.rect
          x={CX - 46}
          y={CY - 46}
          width={92}
          height={92}
          fill="none"
          stroke={accent.dark}
          strokeWidth="1"
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 0.35 },
            playing: {
              opacity: [0, 0.35],
              scale: [1.2, 1],
              transition: { duration: 0.7, ease: 'easeOut' },
            },
          }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        {/* Shutter blink — a quick iris close/open over the subject after
            focus locks. */}
        <motion.circle
          cx={CX}
          cy={CY}
          r="14"
          fill="none"
          stroke={accent.dark}
          strokeWidth="2"
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 0 },
            playing: {
              opacity: [0, 0, 0.8, 0],
              scale: [1, 1, 0.2, 1],
              transition: { duration: 2.4, times: [0, 0.5, 0.62, 0.72], ease: 'easeInOut' },
            },
          }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </svg>

      {/* Flash — full-frame white flare synced to the shutter blink. Snaps on,
          falls off fast. Sits above everything, hence absolute overlay. */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={
          isPlaying
            ? { opacity: [0, 0, 0.85, 0] }
            : { opacity: 0 }
        }
        transition={
          isPlaying
            ? { duration: 2.4, times: [0, 0.6, 0.64, 0.78], ease: 'easeOut' }
            : { duration: 0.2 }
        }
      />
    </div>
  );
}
