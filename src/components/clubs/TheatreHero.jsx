// src/components/clubs/TheatreHero.jsx
//
// Theatre Club — curtains part to reveal the empty stage, then a spotlight
// fades up on the boards. That opening — reveal, then light — is the exact
// moment a performance begins, before any actor has spoken.
//
// The spotlight comes AFTER the curtains finish, not during. A light that
// appears while the curtains are still moving reads as a lighting glitch;
// one that fades up on the settled empty stage reads as "places, please."

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

export function TheatreHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('theatre-club');
  const state = isPlaying ? 'playing' : 'rested';

  // Curtain: closed covers the whole half; open pulls mostly off-frame.
  const curtainOpen = 0.14; // fraction still visible when parted

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-purple-950 p-8 text-white shadow-xl"
    >
      <div className="z-20">
        <h1 className="font-serif text-3xl font-bold" style={{ color: accent.dark }}>
          Theatre Club
        </h1>
        <p className="mt-1 text-purple-200/80">Bringing compelling stories to life on stage.</p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 160 130"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2"
        role="img"
        aria-label="Stage curtains parting to reveal a spotlit empty stage"
      >
        <defs>
          <radialGradient id="theatre-spot" cx="50%" cy="20%" r="75%">
            <stop offset="0%" stopColor={accent.dark} stopOpacity="0.55" />
            <stop offset="55%" stopColor={accent.dark} stopOpacity="0.12" />
            <stop offset="100%" stopColor={accent.dark} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Back wall of the stage */}
        <rect x="0" y="0" width="160" height="130" className="fill-black/40" />

        {/* Stage floor */}
        <rect x="0" y="104" width="160" height="26" fill={accent.dark} opacity="0.14" />

        {/* Spotlight cone — fades up only after the curtains have parted. */}
        <motion.polygon
          points="80,6 116,118 44,118"
          fill="url(#theatre-spot)"
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 1 },
            playing: { opacity: [0, 0, 1], transition: { duration: 2.4, times: [0, 0.62, 1], ease: 'easeOut' } },
          }}
        />
        {/* Pool of light where the cone meets the floor */}
        <motion.ellipse
          cx="80"
          cy="116"
          rx="26"
          ry="6"
          fill={accent.dark}
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 0.4 },
            playing: { opacity: [0, 0, 0.4], transition: { duration: 2.4, times: [0, 0.62, 1] } },
          }}
        />

        {/* Left curtain */}
        <motion.g
          initial="rested"
          animate={state}
          variants={{
            rested: { x: `${-(1 - curtainOpen) * 50}%` },
            playing: { x: ['0%', `${-(1 - curtainOpen) * 50}%`], transition: { duration: 1.4, ease: [0.4, 0, 0.2, 1] } },
          }}
        >
          <rect x="0" y="0" width="80" height="130" className="fill-purple-800" />
          {/* Fabric folds */}
          {[10, 26, 42, 58, 72].map((fx) => (
            <rect key={fx} x={fx} y="0" width="5" height="130" className="fill-purple-950/50" />
          ))}
          {/* Valance edge */}
          <rect x="0" y="0" width="80" height="12" className="fill-purple-900" />
        </motion.g>

        {/* Right curtain */}
        <motion.g
          initial="rested"
          animate={state}
          variants={{
            rested: { x: `${(1 - curtainOpen) * 50}%` },
            playing: { x: ['0%', `${(1 - curtainOpen) * 50}%`], transition: { duration: 1.4, ease: [0.4, 0, 0.2, 1] } },
          }}
        >
          <rect x="80" y="0" width="80" height="130" className="fill-purple-800" />
          {[88, 104, 120, 136, 150].map((fx) => (
            <rect key={fx} x={fx} y="0" width="5" height="130" className="fill-purple-950/50" />
          ))}
          <rect x="80" y="0" width="80" height="12" className="fill-purple-900" />
        </motion.g>
      </svg>
    </div>
  );
}
