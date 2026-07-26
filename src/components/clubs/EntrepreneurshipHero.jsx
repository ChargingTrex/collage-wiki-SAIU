// src/components/clubs/EntrepreneurshipHero.jsx
//
// Entrepreneurship Club — the arc of a venture in three beats: an idea (a bulb
// flickers on), turned into a business (the bulb becomes a currency mark), that
// grows (a line plots upward point by point to a final high). Idea → money →
// growth.
//
// This is the least visually distinct concept of the set, so the value is in
// the SEQUENCE reading as a small story rather than in any one flashy shape.
// It builds once and holds on the final plotted line — a growth chart that
// resets is just a loop, which undercuts the "it grew" point.

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Rising plot points, plotted left to right.
const POINTS = [
  [8, 78], [40, 66], [72, 70], [104, 50], [136, 54], [168, 30], [196, 16],
];
const PLOT_PATH = POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ');

export function EntrepreneurshipHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('entrepreneurship-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        {/* Card is a fixed dark slate regardless of site theme, so this needs
            the fixed "dark" accent (light emerald) always, not the theme-
            flipping var(--club-accent) — same fix as Astronomy/Film/Fashion/
            Art. This also directly satisfies "make the text a shade lighter"
            since the deep emerald light-mode value was too dark here. */}
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Entrepreneurship Club
        </h1>
        <p className="mt-1 text-slate-300">Fostering startup culture and business innovation.</p>
      </div>

      <div className="relative mr-2 flex h-32 w-44 items-center justify-center">
        {/* Beat 1 + 2: bulb flicks on, then hands off to the currency mark.
            Both sit in the same spot; opacity crossfades them. */}
        <motion.div
          className="absolute left-2 top-6"
          style={{ color: 'var(--club-accent)' }}
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 0 },
            playing: {
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1.1, 1, 0.9],
              transition: { duration: 3.4, times: [0, 0.14, 0.28, 0.4] },
            },
          }}
        >
          <Lightbulb className="h-14 w-14" />
        </motion.div>

        <svg viewBox="0 0 210 100" className="h-full w-full" key={isReplaying ? 'hover' : 'intro'}>
          {/* Currency mark, appears as the bulb fades. */}
          <motion.text
            x="24"
            y="44"
            textAnchor="middle"
            fill="var(--club-accent)"
            style={{ fontSize: 48, fontWeight: 800 }}
            initial="rested"
            animate={state}
            variants={{
              rested: { opacity: 0 },
              playing: {
                opacity: [0, 0, 1, 1, 0],
                transition: { duration: 3.4, times: [0, 0.34, 0.44, 0.62, 0.72] },
              },
            }}
          >
            $
          </motion.text>

          {/* Axis */}
          <motion.path
            d="M 6,88 L 200,88 M 6,88 L 6,10"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-600"
            fill="none"
            initial="rested"
            animate={state}
            variants={{
              rested: { opacity: 0.6 },
              playing: { opacity: [0, 0, 0.6], transition: { duration: 3.4, times: [0, 0.6, 0.68] } },
            }}
          />

          {/* Growth line — plots after the currency beat, holds at the top. */}
          <motion.path
            d={PLOT_PATH}
            fill="none"
            stroke="var(--club-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="rested"
            animate={state}
            variants={{
              rested: { pathLength: 1, opacity: 1 },
              playing: {
                pathLength: [0, 0, 1],
                opacity: [0, 1, 1],
                transition: { duration: 3.4, times: [0, 0.68, 1], ease: 'easeOut' },
              },
            }}
          />

          {/* Final point punctuates the peak. */}
          <motion.circle
            cx={POINTS[POINTS.length - 1][0]}
            cy={POINTS[POINTS.length - 1][1]}
            r="4"
            fill="var(--club-accent)"
            initial="rested"
            animate={state}
            variants={{
              rested: { scale: 1, opacity: 1 },
              playing: {
                scale: [0, 0, 1.3, 1],
                opacity: [0, 0, 1, 1],
                transition: { duration: 3.4, times: [0, 0.95, 0.98, 1] },
              },
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        </svg>
      </div>
    </div>
  );
}
