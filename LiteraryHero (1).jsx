// src/components/clubs/LiteraryHero.jsx
//
// Literary Club — a quill travels left to right, and the line of poetry
// appears beneath its nib as it moves. The nib and the ink are driven by the
// same progress value, so the pen is always exactly at the wet end of the
// stroke rather than approximately near it.
//
// Stops when the reader starts scrolling (see useIntroMotion). If it stops
// mid-stroke the line completes quickly rather than freezing half-written —
// a half-drawn word looks like a bug, not a pause.

import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';

// The handwritten line. This is a traced path of the words, not a font —
// so it draws stroke-by-stroke the way a pen actually moves.
// Replace with your own traced path to change the quote.
const POETRY_PATH =
  'M 14,52 c 6,-14 10,-20 14,-8 4,12 6,14 10,2 4,-11 8,-16 12,-6 3,8 6,10 9,1 ' +
  'M 66,50 c 8,-16 14,-10 10,2 -3,9 -9,10 -6,-2 4,-13 12,-18 18,-6 ' +
  'M 104,48 c 5,-12 9,-16 12,-6 3,9 6,11 9,2 3,-8 7,-12 11,-4 ' +
  'M 150,46 c 7,-14 13,-9 10,3 -3,10 -8,9 -6,-3 3,-14 11,-16 17,-5 ' +
  'M 190,45 c 6,-13 11,-15 14,-5 3,9 7,10 10,1 3,-9 8,-13 13,-4 ' +
  'M 240,44 c 8,-15 15,-8 11,4 -4,11 -10,9 -7,-3 4,-13 13,-15 19,-4';

export function LiteraryHero({
  quote = 'In the quiet of words, the universe speaks.',
  attribution = 'Opening dedication, Annual Poetry Slam',
}) {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const progress = useMotionValue(0);

  // The quill rides the same 0→1 progress the ink does.
  const quillX = useTransform(progress, [0, 1], [10, 268]);
  const quillY = useTransform(progress, [0, 1], [18, 12]);
  // Slight wrist rotation as the hand travels — dead-straight reads robotic.
  const quillRotate = useTransform(progress, [0, 0.5, 1], [-12, -6, -14]);

  React.useEffect(() => {
    if (isHovered) {
      // Deliberate replay — jump back to blank and rewrite the whole line,
      // which is the point of hovering. Slightly quicker than the intro.
      progress.set(0);
      const controls = animate(progress, 1, { duration: 2.6, ease: 'easeInOut' });
      return controls.stop;
    }
    if (isPlaying) {
      const controls = animate(progress, 1, { duration: 3.4, ease: 'easeInOut' });
      return controls.stop;
    }
    // Reader started scrolling — finish the line fast instead of freezing
    // it half-written, then stay put.
    const controls = animate(progress, 1, { duration: 0.45, ease: 'easeOut' });
    return controls.stop;
  }, [isPlaying, isHovered, progress]);

  return (
    <div
      {...hoverProps}
      className="relative my-6 w-full overflow-hidden rounded-2xl border border-amber-800/25 bg-amber-50/60 p-8 shadow-sm dark:border-amber-700/25 dark:bg-amber-950/20"
    >
      <h1 className="font-serif text-3xl font-bold text-amber-900 dark:text-amber-200">
        Literary Club
      </h1>
      <p className="mt-1 text-amber-800/70 dark:text-amber-300/70">
        Celebrating the written and spoken word.
      </p>

      <div className="mt-4">
        <svg
          viewBox="0 0 300 70"
          className="h-20 w-full max-w-md"
          fill="none"
          role="img"
          aria-label={quote}
        >
          {/* The ink. pathLength normalizes the path to 0→1 regardless of
              its real length, so progress maps cleanly onto it. */}
          <motion.path
            d={POETRY_PATH}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-900 dark:text-amber-300"
            style={{ pathLength: progress }}
          />

          {/* The quill. Drawn as a simple feather so it reads at 20px —
              a detailed one turns to mush at this size. */}
          <motion.g style={{ x: quillX, y: quillY, rotate: quillRotate }}>
            <path
              d="M 0,0 L -3,-13 Q -1,-24 4,-30 Q 8,-22 6,-13 Z"
              className="fill-amber-700/90 dark:fill-amber-400/90"
            />
            <path
              d="M 1,-6 L 4,-24"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-amber-900/40 dark:text-amber-900/60"
            />
          </motion.g>
        </svg>

        <p className="mt-1 text-xs uppercase tracking-widest text-amber-700/60 dark:text-amber-400/50">
          {attribution}
        </p>
      </div>
    </div>
  );
}
