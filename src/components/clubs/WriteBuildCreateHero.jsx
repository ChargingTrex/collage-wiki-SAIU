// src/components/clubs/WriteBuildCreateHero.jsx
//
// Write Build Create: the club writes stories, builds games, and builds the
// worlds both of them happen in. The hero is one short story told as a
// three-panel manga strip, read left to right, with the same chibi
// character carried through all three panels, because that is the club's
// actual pipeline: one character goes from page, to world, to game.
//   1. WRITE: lines of script ink themselves onto the page, the nib
//      following the last line, and the character pops out of the writing.
//   2. BUILD THE WORLD: a mountain ridge and a river draw across a
//      screentoned sky, a tower rises on the peak, and the moon comes up.
//      The character stands in the foreground, looking at it.
//   3. CREATE THE GAME: platforms slide in, and the character jumps them
//      to a spinning coin, with manga speed lines on the landing.
//
// The anime look comes from manga craft rather than borrowed imagery: ink
// panel borders with slanted gutters, a halftone screentone, speed lines,
// and a big-eyed chibi drawn from simple shapes. The card is paper in both
// site themes (a manga page is paper), so the accent always uses its
// `light` (dark-ink) variant, which unified mode resolves to black.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const INK = '#1c1917';
const PAPER = '#fffdf8';

// Slanted manga gutters. Each panel is a quadrilateral, not a rectangle.
const PANEL_A = '8,10 98,10 88,130 8,130';
const PANEL_B = '104,10 196,10 188,130 94,130';
const PANEL_C = '202,10 292,10 292,130 194,130';

// Panel A script lines, each ending short of that panel's slanted edge.
const SCRIPT_LINES = [
  { y: 26, x2: 80 },
  { y: 37, x2: 74 },
  { y: 48, x2: 79 },
  { y: 59, x2: 62 },
];

// Panel C platforms, and where the character lands on each (feet).
const PLATFORMS = [
  { x: 206, y: 114, w: 26 },
  { x: 238, y: 96, w: 24 },
  { x: 266, y: 76, w: 22 },
];

// Panel C jump: offsets from the first platform's landing spot. Each hop is
// an arc: up, then down onto the next platform.
const JUMP_X = [0, 0, 14, 32, 32, 46, 59, 59];
const JUMP_Y = [0, 0, -30, -18, -18, -40, -38, -38];
const JUMP_TIMES = [0, 0.1, 0.3, 0.45, 0.55, 0.75, 0.9, 1];

// Speed lines radiate from the final landing spot.
const SPEED_LINES = [
  [262, 40, 270, 58],
  [290, 44, 284, 60],
  [292, 96, 284, 86],
  [248, 64, 260, 70],
];

// The character, feet at (0, 0), about 26 units tall. Simple shapes so it
// still reads at the /clubs card scale.
function Chibi({ accent }) {
  return (
    <g>
      <path d="M -2,0 L -2,-5 M 2,0 L 2,-5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M -4.5,-5 L 4.5,-5 L 3.2,-11.5 L -3.2,-11.5 Z" fill={accent} stroke={INK} strokeWidth="0.8" />
      <circle cx="0" cy="-17.5" r="6.5" fill={PAPER} stroke={INK} strokeWidth="1.1" />
      <path
        d="M -7,-17 L -6.2,-23 L -3.2,-21.2 L -1.2,-25.5 L 1.2,-21.8 L 4.2,-25 L 5,-20.8 L 7.6,-18.4 Q 4,-21.4 0,-21 Q -4,-21.4 -7,-17 Z"
        fill={INK}
      />
      <ellipse cx="-2.6" cy="-16.2" rx="1.35" ry="2.1" fill={INK} />
      <ellipse cx="2.6" cy="-16.2" rx="1.35" ry="2.1" fill={INK} />
      <circle cx="-2.2" cy="-17" r="0.55" fill={PAPER} />
      <circle cx="3" cy="-17" r="0.55" fill={PAPER} />
      <ellipse cx="-4.4" cy="-13.6" rx="1.1" ry="0.55" fill={accent} opacity="0.55" />
      <ellipse cx="4.4" cy="-13.6" rx="1.1" ry="0.55" fill={accent} opacity="0.55" />
    </g>
  );
}

// Four-point manga sparkle.
function Sparkle({ x, y, size = 4, fill }) {
  const s = size;
  return (
    <path
      d={`M ${x},${y - s} Q ${x + s * 0.18},${y - s * 0.18} ${x + s},${y} Q ${x + s * 0.18},${y + s * 0.18} ${x},${y + s} Q ${x - s * 0.18},${y + s * 0.18} ${x - s},${y} Q ${x - s * 0.18},${y - s * 0.18} ${x},${y - s} Z`}
      fill={fill}
    />
  );
}

export function WriteBuildCreateHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('write-build-create');
  const state = isPlaying ? 'playing' : 'rested';
  const ink = accent.light;

  // Shared helper: a fade/draw that starts at `delay` seconds into the strip.
  const appear = (delay, duration = 0.4) => ({
    rested: { opacity: 1 },
    playing: { opacity: [0, 1], transition: { delay, duration } },
  });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="wbc-hero relative my-6 w-full overflow-hidden rounded-2xl border border-solid border-stone-300 bg-stone-50 shadow-md"
    >
      {/* Layout lives in custom.css (.wbc-hero*), on a container query
          rather than Tailwind's viewport breakpoints: in the /clubs and
          /explore cards this hero renders at a fixed 560px and is scaled
          down, so a phone-width *viewport* must not restack it — only a
          narrow hero (its own club page on a phone) should. */}
      <div className="wbc-hero__inner">
      <div className="wbc-hero__text z-10">
        <h1 className="text-3xl font-extrabold leading-tight" style={{ color: ink }}>
          Write Build Create
        </h1>
        <p className="mt-1 text-stone-700">Stories, games, and the worlds they happen in.</p>
      </div>

      <svg
        key={isReplaying ? 'replay' : 'intro'}
        viewBox="0 0 300 140"
        className="wbc-hero__strip pointer-events-none"
        role="img"
        aria-label="A three-panel manga strip: a character is written into a story, stands before a world of mountains and a tower, then jumps across game platforms to a coin"
      >
        <defs>
          <pattern id="wbc-screentone" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.7" fill={INK} opacity="0.28" />
          </pattern>
          <clipPath id="wbc-panel-b">
            <polygon points={PANEL_B} />
          </clipPath>
          <clipPath id="wbc-panel-c">
            <polygon points={PANEL_C} />
          </clipPath>
        </defs>

        {/* Panels: paper fill, heavy ink border. Static; the strip's frame. */}
        {[PANEL_A, PANEL_B, PANEL_C].map((points) => (
          <polygon key={points} points={points} fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        ))}

        {/* ---- Panel A: WRITE ---- */}
        {SCRIPT_LINES.map((line, i) => (
          <motion.path
            key={line.y}
            d={`M 18,${line.y} L ${line.x2},${line.y}`}
            stroke={INK}
            strokeWidth="1.4"
            strokeLinecap="round"
            variants={{
              rested: { pathLength: 1, opacity: 0.7 },
              playing: {
                pathLength: [0, 1],
                opacity: [0.7, 0.7],
                transition: { delay: 0.15 + i * 0.22, duration: 0.24, ease: 'linear' },
              },
            }}
            initial="rested"
            animate={state}
          />
        ))}
        {/* The nib rides the last line as it's written, then lifts away. */}
        <motion.g
          variants={{
            rested: { opacity: 0, x: 0 },
            playing: {
              opacity: [1, 1, 1, 0],
              x: [0, 0, 44, 44],
              transition: { duration: 1.25, times: [0, 0.65, 0.95, 1] },
            },
          }}
          initial="rested"
          animate={state}
        >
          <path d="M 18,59 L 23,49 L 26,51 Z" fill={ink} stroke={INK} strokeWidth="0.6" />
        </motion.g>
        {/* The character pops out of the writing. */}
        <g transform="translate(44,118)">
          <motion.g
            style={{ originX: '50%', originY: '100%' }}
            variants={{
              rested: { opacity: 1, scale: 1 },
              playing: {
                opacity: [0, 1, 1],
                scale: [0.2, 1.18, 1],
                transition: { delay: 1.15, duration: 0.45, times: [0, 0.7, 1], ease: 'easeOut' },
              },
            }}
            initial="rested"
            animate={state}
          >
            <Chibi accent={ink} />
          </motion.g>
        </g>
        <motion.g variants={appear(1.4, 0.3)} initial="rested" animate={state}>
          <Sparkle x={62} y={92} size={4} fill={ink} />
          <Sparkle x={26} y={96} size={2.6} fill={ink} />
        </motion.g>

        {/* ---- Panel B: BUILD THE WORLD ---- */}
        <g clipPath="url(#wbc-panel-b)">
          <motion.rect
            x="94"
            y="10"
            width="102"
            height="80"
            fill="url(#wbc-screentone)"
            variants={appear(1.5, 0.5)}
            initial="rested"
            animate={state}
          />
          {/* Moon: an ink ring in the accent, rising. */}
          <motion.circle
            cx="176"
            cy="30"
            r="8"
            fill={PAPER}
            stroke={ink}
            strokeWidth="1.6"
            variants={{
              rested: { opacity: 1, y: 0 },
              playing: { opacity: [0, 1], y: [12, 0], transition: { delay: 1.7, duration: 0.7, ease: 'easeOut' } },
            }}
            initial="rested"
            animate={state}
          />
          {/* Ridge, then river, drawn in. */}
          <motion.path
            d="M 94,108 L 116,82 L 130,96 L 150,64 L 170,98 L 196,80 L 196,140 L 94,140 Z"
            fill={PAPER}
            stroke={INK}
            strokeWidth="1.5"
            strokeLinejoin="round"
            variants={{
              rested: { pathLength: 1, opacity: 1 },
              playing: { pathLength: [0, 1], opacity: [1, 1], transition: { delay: 1.6, duration: 0.8, ease: 'easeInOut' } },
            }}
            initial="rested"
            animate={state}
          />
          <motion.path
            d="M 140,140 C 146,124 162,122 160,108 C 158,100 166,96 172,98"
            fill="none"
            stroke={ink}
            strokeWidth="1.8"
            strokeLinecap="round"
            variants={{
              rested: { pathLength: 1 },
              playing: { pathLength: [0, 1], transition: { delay: 2.15, duration: 0.6, ease: 'easeOut' } },
            }}
            initial="rested"
            animate={state}
          />
          {/* The tower rises on the peak. */}
          <motion.g
            variants={{
              rested: { y: 0, opacity: 1 },
              playing: { y: [16, 0], opacity: [0, 1], transition: { delay: 2.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
            initial="rested"
            animate={state}
          >
            <rect x="146" y="50" width="8" height="16" fill={PAPER} stroke={INK} strokeWidth="1.2" />
            <path d="M 144,50 L 150,40 L 156,50 Z" fill={ink} stroke={INK} strokeWidth="1" strokeLinejoin="round" />
            <rect x="148.6" y="55" width="2.8" height="3.6" fill={INK} />
          </motion.g>
        </g>
        {/* The character, small in the foreground, takes in the world. */}
        <g transform="translate(112,126) scale(0.8)">
          <motion.g variants={appear(2.5, 0.35)} initial="rested" animate={state}>
            <Chibi accent={ink} />
          </motion.g>
        </g>

        {/* ---- Panel C: CREATE THE GAME ---- */}
        <g clipPath="url(#wbc-panel-c)">
          {PLATFORMS.map((p, i) => (
            <motion.rect
              key={p.x}
              x={p.x}
              y={p.y}
              width={p.w}
              height="5"
              fill={INK}
              variants={{
                rested: { x: 0, opacity: 1 },
                playing: {
                  x: [30, 0],
                  opacity: [0, 1],
                  transition: { delay: 2.7 + i * 0.12, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              initial="rested"
              animate={state}
            />
          ))}
          {/* Coin: spins in place (scaleX) above the last platform. */}
          <motion.g
            style={{ originX: '50%', originY: '50%' }}
            variants={{
              rested: { scaleX: 1, opacity: 1 },
              playing: {
                scaleX: [1, 0.15, 1, 0.15, 1],
                opacity: [0, 1, 1, 1, 1],
                transition: { delay: 2.9, duration: 1.4 },
              },
            }}
            initial="rested"
            animate={state}
          >
            <circle cx="277" cy="38" r="5" fill={ink} stroke={INK} strokeWidth="1" />
            <rect x="276" y="35" width="2" height="6" rx="1" fill={PAPER} />
          </motion.g>
          {/* Speed lines flash on the final landing, then settle faint. */}
          <motion.g
            variants={{
              rested: { opacity: 0.35 },
              playing: { opacity: [0, 0, 1, 0.35], transition: { delay: 3.3, duration: 1.1, times: [0, 0.55, 0.7, 1] } },
            }}
            initial="rested"
            animate={state}
          >
            {SPEED_LINES.map(([x1, y1, x2, y2]) => (
              <path key={`${x1}-${y1}`} d={`M ${x1},${y1} L ${x2},${y2}`} stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
            ))}
          </motion.g>
        </g>
        {/* The character hops platform to platform, ending under the coin. */}
        <g transform={`translate(${PLATFORMS[0].x + 13},${PLATFORMS[0].y})`}>
          <motion.g
            variants={{
              rested: { x: JUMP_X[JUMP_X.length - 1], y: JUMP_Y[JUMP_Y.length - 1], opacity: 1 },
              playing: {
                x: JUMP_X,
                y: JUMP_Y,
                opacity: [0, 1, 1, 1, 1, 1, 1, 1],
                transition: { delay: 2.95, duration: 1.3, times: JUMP_TIMES, ease: 'easeInOut' },
              },
            }}
            initial="rested"
            animate={state}
          >
            <Chibi accent={ink} />
          </motion.g>
        </g>
        <motion.g variants={appear(4.2, 0.3)} initial="rested" animate={state}>
          <Sparkle x={288} y={26} size={3.4} fill={ink} />
        </motion.g>
      </svg>
      </div>
    </div>
  );
}
