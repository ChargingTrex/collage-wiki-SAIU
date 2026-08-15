// src/components/clubs/ChessHero.jsx
//
// Chess Club — an actual short game, not one static board. Three real chess
// beats in order: a pawn opens, a knight travels its true L (two straight
// segments, not a diagonal cheat) to capture an enemy pawn, then delivers
// check and the enemy king topples. Builds once and stays checkmated — like
// Martial Arts' broken plank, a landed mate that reset would undercut.
//
// The knight's landing square (2,2) is a genuine knight-move away from the
// king at (3,0) — one file, two ranks — it isn't just staged to look right,
// it's the real geometric relationship that makes a knight check legal. (An
// earlier draft placed the king at (4,0), a (2,2) offset — that's a diagonal
// jump, not a knight move, and wasn't actually check. Verified by computing
// the offset directly rather than eyeballing the board.)
//
// Pieces are lucide's real ChessPawn/ChessKnight/ChessKing glyphs, not
// hand-drawn silhouettes — same reasoning as Literary's Feather: a properly
// designed icon reads correctly at hero scale where a rolled-by-hand shape
// wouldn't. White pieces carry the club accent; the enemy side is a fixed
// muted stone tone so the two sides read as opposing regardless of theme.

import React from 'react';
import { motion } from 'framer-motion';
import { ChessPawn, ChessKnight, ChessKing } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const SQUARE = 26;
const COLS = 5;
const ROWS = 4;
const ENEMY = '#78716C'; // fixed stone-500 — the opposing side, not accent-driven

// Square -> pixel top/left, used as each piece's static resting position.
const sq = (col, row) => ({ left: col * SQUARE, top: row * SQUARE });

export function ChessHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion({ playOnVisible: true });
  const { accent, accentStyle } = useClubAccent('chess-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-stone-900 p-8 text-white shadow-xl transition-shadow duration-150 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary-500)] focus-visible:ring-offset-2"
    >
      <div className="z-10">
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Chess Club
        </h1>
        <p className="mt-1 text-stone-300/80">Strategy, tactics, and the quiet art of checkmate.</p>
      </div>

      <div
        key={isReplaying ? 'hover' : 'intro'}
        className="relative mr-6 shrink-0"
        style={{ width: COLS * SQUARE, height: ROWS * SQUARE }}
        role="img"
        aria-label="A pawn opens, a knight jumps its L to capture, and delivers checkmate"
      >
        {/* Static checkerboard backdrop. */}
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          if ((col + row) % 2 === 0) return null;
          return (
            <div
              key={i}
              className="absolute"
              style={{ ...sq(col, row), width: SQUARE, height: SQUARE, background: accent.dark, opacity: 0.08 }}
            />
          );
        })}

        {/* White pawn — the opening move, one square forward. Base position
            is its FINAL square; it animates in from one rank below. */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ ...sq(1, 2), width: SQUARE, height: SQUARE, color: accent.dark }}
          initial="rested"
          animate={state}
          variants={{
            rested: { y: 0 },
            playing: { y: [SQUARE, SQUARE, 0], transition: { duration: 0.7, times: [0, 0, 1], ease: 'easeOut' } },
          }}
        >
          <ChessPawn className="h-4 w-4" />
        </motion.div>

        {/* Enemy pawn sitting on the square the knight will capture. Present
            at rest only as "already gone" — captured pieces don't come back. */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ ...sq(2, 2), width: SQUARE, height: SQUARE, color: ENEMY }}
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 0, scale: 0.5 },
            playing: {
              opacity: [1, 1, 0],
              scale: [1, 1, 0.4],
              transition: { duration: 0.35, delay: 1.55, ease: 'easeIn' },
            },
          }}
        >
          <ChessPawn className="h-4 w-4" />
        </motion.div>

        {/* White knight — base position is the FINAL square (2,2). x/y are
            authored as the offset it travels FROM, animated down to zero in
            two separate stages so the path is a true dogleg: all the
            horizontal move happens first (0-0.5), then all the vertical move
            (0.5-1) — never both at once, which would just be a diagonal. */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ ...sq(2, 2), width: SQUARE, height: SQUARE, color: accent.dark }}
          initial="rested"
          animate={state}
          variants={{
            rested: { x: 0, y: 0 },
            playing: {
              x: [-2 * SQUARE, -2 * SQUARE, 0, 0],
              y: [SQUARE, SQUARE, SQUARE, 0],
              transition: { duration: 1.0, delay: 0.9, times: [0, 0, 0.5, 1], ease: 'easeInOut' },
            },
          }}
        >
          <ChessKnight className="h-4 w-4" />
        </motion.div>

        {/* Enemy king — sits a genuine knight-move away from (2,2): one
            file, two ranks. Topples on check and stays fallen. */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ ...sq(3, 0), width: SQUARE, height: SQUARE, color: ENEMY }}
          initial="rested"
          animate={state}
          variants={{
            rested: { rotate: 80, y: 8, opacity: 0.85 },
            playing: {
              rotate: [0, 0, 80],
              y: [0, 0, 8],
              opacity: [1, 1, 0.85],
              transition: { duration: 0.6, delay: 1.95, times: [0, 0.65, 1], ease: 'easeIn' },
            },
          }}
        >
          <ChessKing className="h-4 w-4" />
        </motion.div>

        {/* Check pulse — one ring, not a repeating emitter (this is a single
            decisive moment, not ambient sound like Oratory's mic rings). */}
        <motion.div
          className="absolute rounded-full border-2 border-solid"
          style={{
            left: 3 * SQUARE + SQUARE / 2 - 12,
            top: SQUARE / 2 - 12,
            width: 24,
            height: 24,
            borderColor: accent.dark,
          }}
          initial="rested"
          animate={state}
          variants={{
            rested: { opacity: 0, scale: 1 },
            playing: {
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.8, 2.4],
              transition: { duration: 0.55, delay: 1.9, ease: 'easeOut' },
            },
          }}
        />
      </div>
    </div>
  );
}
