// src/components/clubs/LiteraryHero.jsx
//
// Literary Club — a quill travels left to right and the line of poetry
// appears beneath its nib as it passes.
//
// FONT-MASK APPROACH (current). The quote is real text in `Caveat`, revealed
// by an SVG mask that widens as the quill moves. Legible, editable — change
// the `quote` prop and it just works, no tooling.
//
// Tradeoff: the reveal is a left-to-right wipe, not a true pen stroke. It
// won't follow the loops and lifts of the letterforms the way real
// handwriting does. To upgrade to a genuine stroke animation, see
// docs/traced-handwriting-guide.md — the swap is one prop.
//
// Requires the Caveat font, already imported in custom.css:
//   @import url('...family=Caveat:wght@600;700...');

import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const VIEW_W = 320;
const INK_START = 14;   // where the writing begins
const INK_END = 300;    // where it ends

export function LiteraryHero({
  quote = 'In the quiet of words, the universe speaks.',
  attribution = 'Opening dedication, Annual Poetry Slam',
}) {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('literary-club');

  const progress = useMotionValue(0);

  // Quill nib rides the same progress the mask does, so the pen is always at
  // the wet end of the line rather than approximately near it.
  const quillX = useTransform(progress, [0, 1], [INK_START, INK_END]);
  const quillY = useTransform(progress, [0, 1], [16, 11]);
  // Slight wrist rotation — a dead-straight travel reads robotic.
  const quillRotate = useTransform(progress, [0, 0.5, 1], [-12, -6, -14]);
  // The mask rectangle grows to expose the text.
  const maskWidth = useTransform(progress, [0, 1], [0, INK_END]);

  React.useEffect(() => {
    if (isHovered) {
      // Deliberate replay — rewind to blank and rewrite the whole line.
      progress.set(0);
      const controls = animate(progress, 1, { duration: 2.6, ease: 'easeInOut' });
      return controls.stop;
    }
    if (isPlaying) {
      const controls = animate(progress, 1, { duration: 3.4, ease: 'easeInOut' });
      return controls.stop;
    }
    // Reader started scrolling — finish fast rather than freezing the line
    // half-written, which looks like a bug rather than a pause.
    const controls = animate(progress, 1, { duration: 0.45, ease: 'easeOut' });
    return controls.stop;
  }, [isPlaying, isHovered, progress]);

  // Unique mask id per instance — two of these on one page would otherwise
  // share a mask and one would render blank.
  const maskId = React.useId();

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 w-full overflow-hidden rounded-2xl border border-amber-800/25 bg-amber-50/60 p-8 shadow-sm dark:border-amber-700/25 dark:bg-amber-950/20"
    >
      <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--club-accent)' }}>
        Literary Club
      </h1>
      <p className="mt-1 text-amber-800/70 dark:text-amber-300/70">
        Celebrating the written and spoken word.
      </p>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${VIEW_W} 70`}
          className="h-20 w-full max-w-lg"
          role="img"
          aria-label={quote}
        >
          <defs>
            <mask id={maskId}>
              {/* White reveals, black conceals. The rect grows rightward. */}
              <motion.rect x="0" y="0" height="70" fill="white" style={{ width: maskWidth }} />
            </mask>
          </defs>

          {/* The quote, in real letterforms, progressively unmasked. */}
          <text
            x={INK_START}
            y="46"
            mask={`url(#${maskId})`}
            fill="var(--club-accent)"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 30,
              fontWeight: 600,
            }}
          >
            {quote}
          </text>

          {/* Quill. Simple feather — a detailed one turns to mush at 20px. */}
          <motion.g style={{ x: quillX, y: quillY, rotate: quillRotate }}>
            <path
              d="M 0,0 L -3,-13 Q -1,-24 4,-30 Q 8,-22 6,-13 Z"
              fill="var(--club-accent)"
              opacity="0.9"
            />
            <path d="M 1,-6 L 4,-24" stroke="currentColor" strokeWidth="0.8" className="text-amber-950/40" />
          </motion.g>
        </svg>

        <p className="mt-1 text-xs uppercase tracking-widest text-amber-700/60 dark:text-amber-400/50">
          {attribution}
        </p>
      </div>
    </div>
  );
}
