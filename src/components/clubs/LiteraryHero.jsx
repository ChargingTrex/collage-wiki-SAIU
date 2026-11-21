// src/components/clubs/LiteraryHero.jsx
//
// Literary Club — a dip pen writes a line of verse onto the page, the words
// appearing under its nib, then signs it off with a small flourish.
//
// FONT-MASK APPROACH. The quote is real text in `Caveat`, revealed by an SVG
// mask that widens as the pen moves along each line. Legible and editable:
// change the `quote` prop and it just works, no tooling. Tradeoff: the reveal
// is a left-to-right wipe per line, not a true pen stroke following the
// letterforms (see docs-internal/archive/traced-handwriting-guide.md for the
// traced-stroke upgrade path).
//
// Layout (2026-11): the hero follows the same contract as every club hero —
// exactly 192px tall at 560px wide, the title and subtitle in their own text
// column, and the artwork (here, the page of verse) in the right 364px, so
// the /clubs plate and the /explore card show the whole quote instead of
// cropping it mid-line. The quote is set on two lines (split at its first
// comma, or at the middle word) so it fits that 364px page at full size.
// On a narrow hero (its own page on a phone) a container query in
// LiteraryHero.module.css stacks the page under the title.
//
// The pen is drawn (a dip-pen holder and nib), not an icon. The rested state
// is the finished verse, signed with its flourish and attribution.
//
// Requires the Caveat font, already imported in custom.css.

import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import styles from './LiteraryHero.module.css';

const X0 = 26; // where each line begins, in the 364x192 page
const LINE_Y = [86, 126]; // baselines of the two lines
const FONT_SIZE = 33;
const DONE = 2; // progress runs 0 -> 1 over line one, 1 -> 2 over line two

// Split a quote into two lines: after its first comma if it has one,
// otherwise at the word nearest the middle.
function splitQuote(quote) {
  const comma = quote.indexOf(', ');
  if (comma > 0) return [quote.slice(0, comma + 1), quote.slice(comma + 2)];
  const words = quote.split(' ');
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

export function LiteraryHero({
  quote = 'In the quiet of words, the universe speaks.',
  attribution = 'Opening dedication, Annual Poetry Slam',
}) {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('literary-club');
  const [line1, line2] = splitQuote(quote);

  // Each line's rendered width sizes its own reveal, so a longer quote is
  // never cut off before the pen finishes. Sensible fallbacks cover the one
  // frame before measurement.
  const line1Ref = React.useRef(null);
  const line2Ref = React.useRef(null);
  const [widths, setWidths] = React.useState([250, 230]);
  React.useLayoutEffect(() => {
    if (line1Ref.current && line2Ref.current) {
      setWidths([line1Ref.current.getBBox().width, line2Ref.current.getBBox().width]);
    }
  }, [line1, line2]);
  const [w1, w2] = widths;

  // Rests at DONE: the server render, reduced motion and mid-page arrivals
  // all show the finished verse.
  const progress = useMotionValue(DONE);
  const mask1 = useTransform(progress, (p) => Math.max(0, Math.min(1, p)) * (w1 + 8));
  const mask2 = useTransform(progress, (p) => Math.max(0, Math.min(1, p - 1)) * (w2 + 8));
  // The pen's nib rides the wet end of whichever line is being written, and
  // lifts away once the verse is done.
  const penX = useTransform(progress, (p) =>
    p <= 1 ? X0 + p * w1 : X0 + Math.min(1, p - 1) * w2,
  );
  const penY = useTransform(progress, (p) => (p <= 1 ? LINE_Y[0] - 10 : LINE_Y[1] - 10));
  const penRotate = useTransform(progress, (p) => -4 + Math.sin(p * Math.PI * 3) * 5);
  const penOpacity = useTransform(progress, [0, 0.05, 1.92, DONE], [0, 1, 1, 0]);
  const flourish = useTransform(progress, [1.85, DONE], [0, 1]);

  React.useEffect(() => {
    if (isPlaying) {
      progress.set(0);
      const controls = animate(progress, DONE, {
        duration: isReplaying ? 3 : 3.8,
        ease: [0.45, 0, 0.55, 1],
      });
      return controls.stop;
    }
    // Stopped mid-line (the reader scrolled or clicked): finish the verse
    // quickly rather than freezing it half-written.
    if (progress.get() < DONE) {
      const controls = animate(progress, DONE, { duration: 0.35, ease: 'easeOut' });
      return controls.stop;
    }
    return undefined;
  }, [isPlaying, isReplaying, progress]);

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl border border-solid border-amber-800/25 bg-amber-50/60 shadow-sm dark:border-amber-700/25 dark:bg-amber-950/20`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--club-accent)' }}>
            Literary Club
          </h1>
          <p className="mt-1 text-amber-900 dark:text-amber-200">
            Celebrating the written and spoken word.
          </p>
        </div>

        <svg
          viewBox="0 0 364 192"
          className={`${styles.art} pointer-events-none`}
          role="img"
          aria-label={`${quote} (${attribution})`}
        >
          <defs>
            <mask id="literary-club-line-1">
              <motion.rect x={X0 - 6} y={LINE_Y[0] - 34} height="48" fill="white" style={{ width: mask1 }} />
            </mask>
            <mask id="literary-club-line-2">
              <motion.rect x={X0 - 6} y={LINE_Y[1] - 34} height="48" fill="white" style={{ width: mask2 }} />
            </mask>
          </defs>

          {/* Faint ruled lines: the page the verse is written on. */}
          {LINE_Y.map((y) => (
            <line
              key={y}
              x1={X0 - 8}
              x2={348}
              y1={y + 7}
              y2={y + 7}
              className="stroke-amber-800/15 dark:stroke-amber-200/15"
              strokeWidth="1"
            />
          ))}

          {[line1, line2].map((line, i) => (
            <text
              key={line}
              ref={i === 0 ? line1Ref : line2Ref}
              x={X0}
              y={LINE_Y[i]}
              mask={`url(#literary-club-line-${i + 1})`}
              fill="var(--club-accent)"
              style={{ fontFamily: "'Caveat', cursive", fontSize: FONT_SIZE, fontWeight: 600 }}
            >
              {line}
            </text>
          ))}

          {/* Flourish under the last word, drawn once the line is done. */}
          <motion.path
            d={`M ${X0 + w2 - 70} ${LINE_Y[1] + 16} q 22 -7 44 0 t 30 -4`}
            fill="none"
            stroke="var(--club-accent)"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ pathLength: flourish, opacity: flourish }}
          />

          <text
            x={X0}
            y={166}
            className="fill-amber-800 dark:fill-amber-200"
            style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            {attribution}
          </text>

          {/* The dip pen: nib at the local origin, holder angled up-right. */}
          <motion.g style={{ x: penX, y: penY, rotate: penRotate, opacity: penOpacity, originX: 0, originY: 0 }}>
            <path d="M 0 0 L 3 -9 L 8 -6 Z" fill="var(--club-accent)" />
            <path d="M 4 -8 L 30 -46" stroke="var(--club-accent)" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M 4.5 -8.5 L 8 -13.5" stroke="#d6b36a" strokeWidth="3.8" strokeLinecap="round" />
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
