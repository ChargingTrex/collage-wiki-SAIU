// src/components/clubs/FossHero.jsx
//
// FOSS Club — a commit graph that builds, not a git icon spinning.
//
// The original rotated a GitBranch glyph, which is a picture of the concept.
// This draws the actual thing: commits land on main, a branch diverges, gets
// its own commits, and merges back. That shape — diverge, work, converge — is
// what open-source collaboration looks like, and it's legible to anyone who
// has ever looked at a network graph.
//
// Builds once and stays built. A commit history that resets isn't history.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const MAIN_Y = 78;
const BRANCH_Y = 40;
const R = 5;

// Commits in chronological order. `lane` decides which line it sits on.
// `at` is when it appears — spacing is uneven on purpose, because real
// contribution is bursty rather than metronomic.
const COMMITS = [
  { x: 18,  lane: 'main',   at: 0.15 },
  { x: 48,  lane: 'main',   at: 0.45 },
  { x: 88,  lane: 'branch', at: 0.95 },
  { x: 118, lane: 'branch', at: 1.2 },
  { x: 152, lane: 'branch', at: 1.45 },
  { x: 196, lane: 'main',   at: 2.05 },
  { x: 226, lane: 'main',   at: 2.3 },
];

// Main line, the divergence, and the merge back.
const MAIN_PATH   = `M 10,${MAIN_Y} L 240,${MAIN_Y}`;
const BRANCH_OUT  = `M 48,${MAIN_Y} C 66,${MAIN_Y} 70,${BRANCH_Y} 88,${BRANCH_Y} L 152,${BRANCH_Y}`;
const BRANCH_BACK = `M 152,${BRANCH_Y} C 176,${BRANCH_Y} 178,${MAIN_Y} 196,${MAIN_Y}`;

export function FossHero() {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('foss-club');
  const state = isPlaying ? 'playing' : 'rested';

  const line = (delay, duration) => ({
    rested: { pathLength: 1, opacity: 0.85 },
    playing: {
      pathLength: [0, 1],
      opacity: [0, 0.85],
      transition: { delay, duration, ease: 'easeInOut' },
    },
  });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl border border-sky-800/40 bg-slate-900 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="font-mono text-3xl font-bold" style={{ color: 'var(--club-accent)' }}>
          FOSS Club
        </h1>
        <p className="mt-1 text-slate-300">Promoting Free and Open Source Software.</p>
      </div>

      <svg
        key={isHovered ? 'hover' : 'intro'}
        viewBox="0 0 250 120"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5"
        role="img"
        aria-label="A git commit graph: commits on main, a branch diverging and merging back"
      >
        {/* main */}
        <motion.path
          d={MAIN_PATH}
          fill="none"
          stroke="var(--club-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          variants={line(0, 2.6)}
          initial={false}
          animate={state}
        />
        {/* feature branch out */}
        <motion.path
          d={BRANCH_OUT}
          fill="none"
          stroke="var(--club-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
          variants={line(0.6, 1.0)}
          initial={false}
          animate={state}
        />
        {/* merge back */}
        <motion.path
          d={BRANCH_BACK}
          fill="none"
          stroke="var(--club-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
          variants={line(1.6, 0.7)}
          initial={false}
          animate={state}
        />

        {/* Commit nodes. Hollow on main, filled on the branch — the visual
            convention for "this is where work happened". */}
        {COMMITS.map((c, i) => (
          <motion.circle
            key={i}
            cx={c.x}
            cy={c.lane === 'main' ? MAIN_Y : BRANCH_Y}
            r={R}
            fill={c.lane === 'branch' ? 'var(--club-accent)' : '#0f172a'}
            stroke="var(--club-accent)"
            strokeWidth="2"
            initial={false}
            animate={state}
            variants={{
              rested: { scale: 1, opacity: 1 },
              playing: {
                scale: [0, 1.25, 1],
                opacity: [0, 1, 1],
                transition: { delay: c.at, duration: 0.4, ease: [0.34, 1.4, 0.64, 1] },
              },
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ))}

        {/* The merge commit reads as the payoff — give it a ring. */}
        <motion.circle
          cx={196}
          cy={MAIN_Y}
          r={R + 4}
          fill="none"
          stroke="var(--club-accent)"
          strokeWidth="1"
          initial={false}
          animate={state}
          variants={{
            rested: { opacity: 0.35, scale: 1 },
            playing: {
              opacity: [0, 0.7, 0.35],
              scale: [0.6, 1.15, 1],
              transition: { delay: 2.05, duration: 0.7 },
            },
          }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </svg>
    </div>
  );
}
