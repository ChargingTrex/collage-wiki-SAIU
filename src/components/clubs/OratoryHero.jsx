// src/components/clubs/OratoryHero.jsx
//
// Oratory Club — a microphone throwing expanding rings. The original idea was
// sound, and that's right; this cleans it up so the rings emit in a steady
// sequence (a voice carrying) rather than one lone pulse. Three rings on
// staggered timers keep at least one always mid-flight.
//
// Rings fade AND expand simultaneously, so they read as sound dissipating
// into a room rather than solid hoops flying off.

import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const RINGS = [0, 0.9]; // emission offsets, seconds

export function OratoryHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('oratory-club');

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-blue-950 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Oratory Club
        </h1>
        <p className="mt-1 text-blue-200/80">Mastering public speaking, debate, and rhetoric.</p>
      </div>

      <div className="relative mr-6 flex h-36 w-36 items-center justify-center">
        {/* Expanding rings emitted from the mic. */}
        {RINGS.map((delay, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border-2 border-solid"
            style={{ borderColor: accent.dark, height: 56, width: 56 }}
            initial={{ scale: 1, opacity: 0 }}
            animate={
              isPlaying
                ? { scale: [0.6, 3.2], opacity: [0.7, 0] }
                : { scale: 1, opacity: 0 }
            }
            transition={
              isPlaying
                ? { duration: 1.8, delay, repeat: Infinity, ease: 'easeOut' }
                : { duration: 0.3 }
            }
          />
        ))}

        {/* The mic itself — steady. It's the source, not the motion. */}
        <span
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ color: accent.dark }}
        >
          <Mic className="h-16 w-16" />
        </span>
      </div>
    </div>
  );
}
