// src/components/clubs/TuringitesHero.jsx
//
// Turingites Computer Science Society — Conway's Game of Life, actually
// simulated. Named for Turing; the hero IS computation rather than a picture
// of a coder at a terminal (which would also duplicate the Tech Fest hero).
//
// Why a SEEDED pattern, not random Life: a random board almost always decays
// into static debris within ~15 generations, which reads as broken. This seeds
// a glider (travels cleanly across the grid forever) plus a blinker and a small
// oscillator, so the motion is legible and reliable every time.
//
// The simulation is a real generation stepper (standard B3/S23 rules). It obeys
// the shared playback rule: runs while arriving, freezes on scroll (a paused
// board is a fine rested state), re-seeds and runs again on hover.

import React from 'react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const COLS = 32;
const ROWS = 14;
const STEP_MS = 190;

// Seed: a glider at top-left (travels down-right), a blinker, and a beacon.
// Coordinates are [row, col].
const SEED = [
  // glider
  [1, 1], [2, 2], [2, 3], [1, 3], [0, 3],
  // blinker (vertical, will oscillate)
  [6, 20], [7, 20], [8, 20],
  // beacon (2x2 + 2x2 oscillator)
  [10, 6], [10, 7], [11, 6],
  [12, 9], [13, 9], [13, 8],
  // a lightweight second glider, offset, for continuous motion
  [3, 12], [4, 13], [5, 11], [5, 12], [5, 13],
];

function makeGrid(seed) {
  const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  seed.forEach(([r, c]) => {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) g[r][c] = 1;
  });
  return g;
}

function step(grid) {
  const next = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          // Toroidal wrap — keeps gliders traveling forever instead of
          // sailing off the edge into an empty board.
          const rr = (r + dr + ROWS) % ROWS;
          const cc = (c + dc + COLS) % COLS;
          n += grid[rr][cc];
        }
      }
      // B3/S23
      next[r][c] = grid[r][c] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
    }
  }
  return next;
}

export function TuringitesHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('turingites-computer-science-society');

  const [grid, setGrid] = React.useState(() => makeGrid(SEED));
  const gridRef = React.useRef(grid);
  gridRef.current = grid;

  // Re-seed whenever a fresh run starts (initial arrival or a hover replay).
  React.useEffect(() => {
    if (isReplaying) setGrid(makeGrid(SEED));
  }, [isReplaying]);

  // Generation stepper — only ticks while playing. Freezing on scroll leaves
  // the board mid-evolution, which is a perfectly good rested state.
  React.useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setGrid((g) => step(g));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  const CELL = 12;
  const GAP = 2;
  const W = COLS * (CELL + GAP);
  const H = ROWS * (CELL + GAP);

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl border border-solid border-green-800/50 bg-black p-8 shadow-xl"
    >
      <div className="z-10">
        <h1 className="font-mono text-3xl font-bold" style={{ color: accent.dark }}>
          Turingites
        </h1>
        <p className="mt-1 font-mono text-sm text-green-600/80">
          Computer Science Society — coding, algorithms, hackathons.
        </p>
      </div>

      {/* The Life board. Live cells are the accent; the grid fades toward the
          heading side so the title stays readable over it. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5 opacity-90"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Conway's Game of Life cells evolving"
      >
        <defs>
          <linearGradient id="turing-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="black" stopOpacity="1" />
            <stop offset="45%" stopColor="black" stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map((row, r) =>
          row.map((alive, c) =>
            alive ? (
              <rect
                key={`${r}-${c}`}
                x={c * (CELL + GAP)}
                y={r * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx="2"
                fill={accent.dark}
              />
            ) : (
              // Faint dot for dead cells — gives the "grid" texture without
              // drawing 448 full rects.
              <rect
                key={`${r}-${c}`}
                x={c * (CELL + GAP) + CELL / 2 - 0.5}
                y={r * (CELL + GAP) + CELL / 2 - 0.5}
                width="1"
                height="1"
                fill={accent.dark}
                opacity="0.15"
              />
            )
          )
        )}

        {/* Left-edge fade so the title never fights the cells. */}
        <rect x="0" y="0" width={W} height={H} fill="url(#turing-fade)" />
      </svg>
    </div>
  );
}
