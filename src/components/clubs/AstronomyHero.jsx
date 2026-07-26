// src/components/clubs/AstronomyHero.jsx
//
// Astronomy Club — two beats:
//   1. An observer at a telescope, small against the frame.
//   2. The camera pulls back; the figure recedes and the star field takes
//      over, with constellation lines drawing themselves between stars,
//      holding, then softening.
//
// Deliberately slow. Stargazing is a patient activity and a fast version of
// this would read as a loading spinner.
//
// The "zoom out" is done by scaling the foreground group down and the star
// group up from a shared origin — cheaper and steadier than animating a
// viewBox, which forces layout on every frame.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Hand-placed rather than random so the constellation actually resolves into
// a recognizable shape. Loosely a plough/dipper.
const STARS = [
  { cx: 42,  cy: 96, r: 1.6 },
  { cx: 74,  cy: 82, r: 2.1 },
  { cx: 108, cy: 74, r: 1.5 },
  { cx: 143, cy: 76, r: 1.9 },
  { cx: 168, cy: 52, r: 1.4 },
  { cx: 196, cy: 44, r: 2.2 },
  { cx: 222, cy: 62, r: 1.6 },
];

// Scattered background stars — no lines, just depth.
const FIELD = [
  { cx: 20,  cy: 34, r: 1.2 }, { cx: 62,  cy: 26, r: 1.5 },
  { cx: 96,  cy: 44, r: 1.1 }, { cx: 128, cy: 22, r: 1.4 },
  { cx: 184, cy: 96, r: 1.2 }, { cx: 232, cy: 28, r: 1.5 },
  { cx: 252, cy: 88, r: 1.1 }, { cx: 16,  cy: 70, r: 1.4 },
];

const CONSTELLATION_PATH = STARS.map((s, i) =>
  `${i === 0 ? 'M' : 'L'} ${s.cx},${s.cy}`
).join(' ');

// Stars are yellow because that's what stars look like — independent of the
// club's actual accent color (Indigo, used for the heading/UI elsewhere).
// Same pattern as Gaming's 2nd ghost / Art's color cycle / Fashion's gold:
// the color is the concept here, not a themeable brand accent.
const STAR_COLOR = '#FDE047';

export function AstronomyHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('astronomy-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-slate-950 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        {/* This card's background is a fixed dark navy regardless of site
            theme, so the heading needs the fixed "dark" accent (light
            indigo) always — `var(--club-accent)` flips with SITE theme and
            in light mode resolves to the deep indigo meant for text on
            white, which is nearly invisible against this permanently-dark
            card. */}
        <h1 className="text-3xl font-extrabold" style={{ color: accent.dark }}>
          Astronomy Club
        </h1>
        <p className="text-slate-300">Exploring the cosmos &amp; stargazing nights.</p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 270 130"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3"
        role="img"
        aria-label="An observer at a telescope beneath a constellation"
      >
        {/* --- Star field. Arrives as the camera pulls back. --- */}
        <motion.g
          variants={{
            rested: { opacity: 1, scale: 1 },
            playing: {
              opacity: [0, 0, 1],
              scale: [0.82, 0.82, 1],
              transition: { duration: 3.2, times: [0, 0.34, 0.72], ease: 'easeOut' },
            },
          }}
          initial="rested"
          animate={state}
          style={{ originX: '50%', originY: '60%' }}
        >
          {FIELD.map((s, i) => (
            <motion.circle
              key={`f${i}`}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="var(--astronomy-dot-color)"
              variants={{
                rested: { opacity: 0.55 },
                playing: {
                  opacity: [0, 0.55],
                  transition: { delay: 1.1 + i * 0.06, duration: 0.5 },
                },
              }}
              initial="rested"
              animate={state}
            />
          ))}

          {STARS.map((s, i) => (
            <motion.circle
              key={`s${i}`}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={STAR_COLOR}
              variants={{
                rested: { opacity: 1 },
                playing: {
                  opacity: [0, 1],
                  transition: { delay: 1.2 + i * 0.09, duration: 0.4 },
                },
              }}
              initial="rested"
              animate={state}
            />
          ))}

          {/* The constellation line draws star to star, then eases back to a
              faint trace so it doesn't compete with the heading. */}
          <motion.path
            d={CONSTELLATION_PATH}
            fill="none"
            stroke={STAR_COLOR}
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              rested: { pathLength: 1, opacity: 0.32 },
              playing: {
                pathLength: [0, 1, 1],
                opacity: [0, 0.75, 0.32],
                transition: { duration: 2.4, delay: 1.5, times: [0, 0.62, 1], ease: 'easeInOut' },
              },
            }}
            initial="rested"
            animate={state}
          />
        </motion.g>

        {/* --- Observer + telescope. Starts large and central, then recedes.
              Peak scale/offset kept modest enough to stay clear of the
              heading/subtitle column — a bigger swing used to grow left far
              enough to overlap the text. --- */}
        <motion.g
          variants={{
            rested: { opacity: 0.5, scale: 1, x: 0, y: 0 },
            playing: {
              opacity: [1, 1, 0.5],
              scale: [1.35, 1.35, 1],
              x: [-6, -6, 0],
              y: [-6, -6, 0],
              transition: { duration: 3.2, times: [0, 0.3, 0.72], ease: 'easeInOut' },
            },
          }}
          initial="rested"
          animate={state}
          style={{ originX: '50%', originY: '100%' }}
        >
          {/* Ground line the figure stands on */}
          <path d="M 150,120 L 250,120" stroke="currentColor" strokeWidth="0.8" className="text-slate-700" />

          {/* Tripod */}
          <path
            d="M 196,104 L 190,120 M 196,104 L 202,120 M 196,104 L 196,120"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="text-slate-500"
          />
          {/* Barrel, angled up at the constellation */}
          <g transform="rotate(-32, 196, 102)">
            <rect x="182" y="98" width="34" height="7" rx="3.5" className="fill-slate-400" />
            <rect x="214" y="96.5" width="7" height="10" rx="2" className="fill-slate-300" />
          </g>

          {/* Observer — small, simple, reads at this scale */}
          <circle cx="176" cy="103" r="3.4" className="fill-slate-300" />
          <path
            d="M 176,107 L 176,117 M 176,110 L 171,114 M 176,110 L 182,107 M 176,117 L 172,120 M 176,117 L 180,120"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-slate-300"
          />
        </motion.g>
      </svg>
    </div>
  );
}
