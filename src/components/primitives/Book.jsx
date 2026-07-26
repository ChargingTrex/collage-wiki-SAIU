// src/components/primitives/Book.jsx
//
// A single book, drawn as SVG. The primitive behind LibraryHero,
// ArchivesHero, and anything else that needs books that aren't identical.
//
// Why not an icon: an icon gives you one fixed shape. A shelf needs varying
// spine widths, heights, and lean, plus a title that lives ON the spine and
// can be animated separately from the book. That's a component, not a glyph.
//
// The one behavior worth preserving wherever this is used: the title fades in
// AFTER the book settles, never with it. That gap is what makes it read as
// being catalogued rather than as a label that was always there. It's
// controlled by `titleDelay` and defaults to landing just after the settle.

import React from 'react';
import { motion } from 'framer-motion';

// Named tones rather than raw classes, so a shelf can be described as
// data ("archive", "rose") without callers hand-writing Tailwind.
export const BOOK_TONES = {
  amber:   'fill-amber-700 dark:fill-amber-600',
  rose:    'fill-rose-800 dark:fill-rose-700',
  emerald: 'fill-emerald-800 dark:fill-emerald-700',
  slate:   'fill-slate-700 dark:fill-slate-600',
  indigo:  'fill-indigo-800 dark:fill-indigo-700',
  clay:    'fill-orange-900 dark:fill-orange-800',
};

export function Book({
  // Geometry
  x = 0,
  baseline = 120,        // y of the shelf surface the book rests on
  width = 20,
  height = 88,
  lean = 0,              // degrees; a shelf where nothing leans looks like stock art

  // Content
  title = '',
  tone = 'amber',

  // Motion
  animate = 'rested',    // 'rested' | 'playing'
  index = 0,             // position in sequence; drives stagger
  stagger = 0.28,
  dropFrom = -70,
  titleDelay = 0.45,     // MUST stay > 0 — see note at top of file

  // Escape hatches
  toneClass,             // pass a raw Tailwind fill class to bypass BOOK_TONES
  bandClass = 'fill-amber-100/50',
  titleClass = 'fill-amber-50',
}) {
  const centerX = x + width / 2;
  const topY = baseline - height;
  const fill = toneClass ?? BOOK_TONES[tone] ?? BOOK_TONES.amber;

  const bookVariants = {
    rested: { y: 0, opacity: 1 },
    playing: {
      y: [dropFrom, 0],
      opacity: [0, 1, 1],
      transition: {
        delay: index * stagger,
        duration: 0.55,
        // Lands with weight. Mild overshoot, not a cartoon bounce.
        ease: [0.34, 1.2, 0.64, 1],
      },
    },
  };

  const titleVariants = {
    rested: { opacity: 1 },
    playing: {
      opacity: [0, 0, 1],
      transition: { delay: index * stagger + titleDelay, duration: 0.5 },
    },
  };

  // Font size tracks spine width — a wide spine can carry more weight,
  // a narrow one needs to stay small or it overflows the edges.
  const fontSize = width > 20 ? 8 : 7;

  return (
    <motion.g variants={bookVariants} initial={false} animate={animate}>
      <g transform={`rotate(${lean}, ${centerX}, ${baseline})`}>
        {/* Spine */}
        <rect x={x} y={topY} width={width} height={height} rx="2" className={fill} />

        {/* Head and tail bands — the detail that makes this read as a bound
            book rather than a colored bar. */}
        <rect x={x} y={topY + 7} width={width} height="2" className={bandClass} />
        <rect x={x} y={baseline - 11} width={width} height="2" className={bandClass} />

        {/* Title runs vertically up the spine, revealed after the settle. */}
        {title && (
          <motion.text
            variants={titleVariants}
            initial={false}
            animate={animate}
            x={centerX}
            y={baseline - height / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${centerX}, ${baseline - height / 2})`}
            className={`${titleClass} font-mono`}
            style={{ fontSize, letterSpacing: '0.12em' }}
          >
            {title}
          </motion.text>
        )}
      </g>
    </motion.g>
  );
}

/**
 * Lays out a row of books left to right with even gaps, so callers describe
 * a shelf as data and don't hand-compute x offsets.
 *
 *   <Shelf books={[{ title: 'ARCHIVE', width: 22, height: 84, tone: 'amber' }]} />
 */
export function Shelf({
  books = [],
  startX = 8,
  gap = 3,
  baseline = 120,
  animate = 'rested',
  stagger = 0.28,
}) {
  let cursor = startX;

  return (
    <>
      {books.map((book, i) => {
        const x = cursor;
        cursor += (book.width ?? 20) + gap;
        return (
          <Book
            key={book.title ?? i}
            {...book}
            x={x}
            baseline={baseline}
            index={i}
            stagger={stagger}
            animate={animate}
          />
        );
      })}
    </>
  );
}
