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
//
// Two more additions on top of the glow-blob/spotlight/tagline pass: a
// bunting banner across the top that drops in first (the venue getting
// decorated, a beat the card was missing), and a radial flash behind the
// popper timed to the pop (gives the borrowed accent color an actual visual
// use instead of just setting an unused CSS variable).
//
// Also: the title/tagline previously had no entrance at all (everything else
// animated in, text just appeared) — now staggers in via Framer's variants +
// staggerChildren, orchestrated from one parent instead of per-child delay
// math. Bunting reuses the same pattern. Popper gets a whileHover bump as an
// immediate response to a direct hover, layered on top of the full
// hover-replay the whole card already does.

import React from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { FestSound } from './FestSound';

const CONFETTI_COLORS = ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#fb7185'];

// A tiny seeded PRNG (mulberry32), not `Math.random()`. This module gets
// evaluated twice for every page load — once during SSR (build time or
// `docusaurus serve`'s prerender), once again in the browser as part of
// hydration — and `Math.random()` genuinely produces a different sequence
// each time it's called, not just each time the *page* loads. A fixed seed
// makes both evaluations produce byte-identical PIECES, which is what
// "precompute once at module load" actually requires to be safe; plain
// `Math.random()` at module scope silently is NOT deterministic across
// those two evaluations, despite reading like it should be. Confirmed via
// this project's own Playwright suite: `Math.random()` here reproducibly
// threw a React hydration-mismatch (error #418) on both /fests and
// /explore, every run.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260728);

// Precompute pieces once at module load — deterministic (see `rand` above)
// so SSR and client agree. More pieces, bigger size range, and a wider
// settled spread (was clustered in a narrow band just below center, reading
// as sparse/plain once at rest).
const PIECES = Array.from({ length: 34 }).map((_, i) => {
  const angle = -90 + (rand() * 130 - 65); // mostly upward
  const power = 55 + rand() * 85;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    // launch vector
    peakX: Math.cos(rad) * power,
    peakY: Math.sin(rad) * power, // negative = up
    // where it lands (drifts a bit further horizontally, falls to the floor)
    landX: Math.cos(rad) * power * 1.5,
    landY: 55 + rand() * 75,
    spin: rand() * 720 - 360,
    delay: rand() * 0.25,
    size: 4 + rand() * 5,
    rect: rand() > 0.5,
  };
});

// Bunting pennants strung across the top, evenly spaced, alternating colors.
const PENNANTS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  x: 30 + i * 34.3,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

// Orchestrated with Framer's variants + staggerChildren rather than manual
// per-index delays (what the confetti/bunting used before) — lets the parent
// own the stagger timing once instead of each child computing its own offset.
const BUNTING_GROUP = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const PENNANT_ITEM = {
  hidden: { scaleY: 0, opacity: 0 },
  show: { scaleY: 1, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

// Title/tagline had no entrance at all — they just appeared instantly while
// everything else on the card animated. Same stagger technique as the
// bunting, delayed to land just after the popper/flash beat.
const TEXT_GROUP = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.45 } },
};
const TEXT_ITEM = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function GeneralFestHero({
  title = 'Annual College Fest',
  tagline = 'Where every club comes together.',
  audioSrc,
}) {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion({ playOnVisible: true });
  const { accent, accentStyle } = useClubAccent('art-club'); // borrows a festive multi-hue accent

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border border-solid border-white/10 bg-gradient-to-br from-rose-600 to-orange-500 text-white shadow-xl"
    >
      {/* Ambient glow blobs — same depth technique as Cultural Fest, this
          card read as a flat two-color gradient without them. */}
      <div className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-purple-700/20 blur-3xl" />
      {/* Soft radial spotlight behind the icon+title so they read as the
          focal point rather than sitting flush on the gradient. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.16) 0%, transparent 65%)',
        }}
      />

      {/* Sound toggle, top-right */}
      <div className="absolute right-4 top-4 z-20">
        <FestSound audioSrc={audioSrc} label="Play theme" />
      </div>

      <div className="z-10 flex flex-col items-center">
        <div className="relative mb-2 flex items-center justify-center">
          {/* Radial flash behind the popper, timed just after it fires */}
          <motion.div
            className="absolute h-16 w-16 rounded-full"
            style={{ background: `radial-gradient(circle, ${accent.dark}99 0%, transparent 70%)` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isPlaying ? { scale: [0, 2.2], opacity: [0.9, 0] } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          />
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={isPlaying ? { scale: [1, 1.25, 1], rotate: [0, -12, 8, 0] } : { scale: 1, rotate: 0 }}
            transition={isPlaying ? { duration: 0.6 } : { duration: 0.3 }}
            whileHover={{ scale: 1.12, rotate: -6 }}
          >
            <PartyPopper className="h-16 w-16" />
          </motion.div>
        </div>
        <motion.div
          className="flex flex-col items-center"
          initial={isPlaying ? 'hidden' : 'show'}
          animate="show"
          variants={TEXT_GROUP}
        >
          <motion.h1
            variants={TEXT_ITEM}
            className="text-center text-4xl font-black tracking-tight drop-shadow-sm"
          >
            {title}
          </motion.h1>
          <motion.p variants={TEXT_ITEM} className="mt-1 text-center font-medium text-white/80">
            {tagline}
          </motion.p>
        </motion.div>
      </div>

      {/* Bunting + confetti share one SVG so both sit in the same coordinate space.
          preserveAspectRatio="none" (not the usual "slice") is deliberate: this
          card is much wider-than-tall in real layout (~6:1) than the 300x200
          viewBox (1.5:1). "slice" covers by cropping to the taller dimension,
          which was hiding the bunting entirely and dropping confetti below the
          visible band once landed — the card read as plain because its two
          new effects were invisible, not because they weren't there. */}
      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 300 200"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {/* String the bunting hangs from */}
        <line x1="12" y1="10" x2="288" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        <motion.g
          initial={isPlaying ? 'hidden' : 'show'}
          animate="show"
          variants={BUNTING_GROUP}
        >
          {PENNANTS.map((p) => (
            <motion.polygon
              key={p.id}
              points={`${p.x - 6},10 ${p.x + 6},10 ${p.x},24`}
              fill={p.color}
              style={{ transformOrigin: `${p.x}px 10px` }}
              variants={PENNANT_ITEM}
            />
          ))}
        </motion.g>

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
              initial={{ x: originX + p.landX, y: originY + p.landY, opacity: 0.9, rotate: p.spin }}
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
