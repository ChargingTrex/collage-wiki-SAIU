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
import { Feather } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const INK_START = 14;   // where the writing begins

export function LiteraryHero({
  quote = 'In the quiet of words, the universe speaks.',
  attribution = 'Opening dedication, Annual Poetry Slam',
}) {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('literary-club');

  // The quote is a prop of arbitrary length, so the reveal width can't be a
  // fixed magic number — a longer quote (or a translation) would just get
  // clipped by the viewBox regardless of the write animation finishing.
  // Measure the rendered text's actual width and size everything off that,
  // with a reasonable fallback for the one frame before it's measured.
  const textRef = React.useRef(null);
  const [textWidth, setTextWidth] = React.useState(260);

  React.useLayoutEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.getBBox().width);
    }
  }, [quote]);

  const inkEnd = INK_START + textWidth + 6;
  const viewW = inkEnd + 20;

  const progress = useMotionValue(0);

  // Quill nib rides the same progress the mask does, so the pen is always at
  // the wet end of the line rather than approximately near it.
  const quillX = useTransform(progress, [0, 1], [INK_START, inkEnd]);
  const quillY = useTransform(progress, [0, 1], [16, 11]);
  // Slight wrist rotation — a dead-straight travel reads robotic.
  const quillRotate = useTransform(progress, [0, 0.5, 1], [-12, -6, -14]);
  // The mask rectangle grows to expose the text.
  const maskWidth = useTransform(progress, [0, 1], [0, inkEnd]);

  React.useEffect(() => {
    if (isReplaying) {
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
  }, [isPlaying, isReplaying, progress]);

  // Unique mask id per instance — two of these on one page would otherwise
  // share a mask and one would render blank.
  const maskId = React.useId();

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 w-full overflow-hidden rounded-2xl border border-solid border-amber-800/25 bg-amber-50/60 p-8 shadow-sm dark:border-amber-700/25 dark:bg-amber-950/20"
    >
      <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--club-accent)' }}>
        Literary Club
      </h1>
      <p className="mt-1 text-amber-900 dark:text-amber-300/70">
        Celebrating the written and spoken word.
      </p>

      <div className="mt-4">
        <svg
          // Extra headroom above y=0 — the quill's feather plume extends
          // upward from the ink line and was getting clipped by the
          // viewBox's top edge before this margin existed.
          viewBox={`0 -22 ${viewW} 92`}
          className="h-24 w-full max-w-lg"
          role="img"
          aria-label={quote}
        >
          <defs>
            <mask id={maskId}>
              {/* White reveals, black conceals. The rect grows rightward. */}
              <motion.rect x="0" y="-22" height="92" fill="white" style={{ width: maskWidth }} />
            </mask>
          </defs>

          {/* The quote, in real letterforms, progressively unmasked. */}
          <text
            ref={textRef}
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

          {/* Quill — a real Feather icon rather than a hand-rolled path. The
              custom leaf-shaped path (even with an asymmetric curve added)
              still read as a plain triangle/arrowhead at this render size;
              a properly designed icon holds up at 20px where hand-drawn
              curves don't. Positioned so the icon's own nib corner lands at
              the local origin, which quillX/quillY already track. */}
          <motion.g style={{ x: quillX, y: quillY, rotate: quillRotate }}>
            <Feather
              x={-2}
              y={-23}
              width={22}
              height={22}
              stroke="var(--club-accent)"
              strokeWidth={2}
              fill="none"
            />
          </motion.g>
        </svg>

        <p className="mt-1 text-xs uppercase tracking-widest text-amber-800 dark:text-amber-200">
          {attribution}
        </p>
      </div>
    </div>
  );
}
