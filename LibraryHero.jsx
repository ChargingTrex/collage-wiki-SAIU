// src/components/LibraryHero.jsx
//
// Campus Library — the collection assembling itself.
//
// Books of differing heights drop into the shelf one after another, each
// settling with a small amount of weight, and its spine title fading in
// just after it lands. The title arriving *after* the settle is the whole
// trick: it reads as the book being catalogued, not as a label that was
// always there.
//
// Hand-authored SVG rather than icons — icons are designed to sit still,
// and this needs varying spine widths, heights, and lean.
//
// Companion piece: ArchivesHero (books flowing past) is a separate
// component for the archives page. Don't merge them; one shelf metaphor
// per component.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from './useIntroMotion';

// Varying heights and widths so the shelf reads as a real collection.
// The last book leans — a perfectly aligned shelf looks like a stock photo.
const BOOKS = [
  { title: 'ARCHIVE',   w: 22, h: 84,  lean: 0,  tone: 'fill-amber-700  dark:fill-amber-600' },
  { title: 'JOURNALS',  w: 16, h: 96,  lean: 0,  tone: 'fill-rose-800   dark:fill-rose-700' },
  { title: 'THESES',    w: 26, h: 74,  lean: 0,  tone: 'fill-emerald-800 dark:fill-emerald-700' },
  { title: 'PERIODICA', w: 18, h: 90,  lean: 8,  tone: 'fill-slate-700  dark:fill-slate-600' },
];

const SHELF_Y = 118;      // baseline the books rest on
const SHELF_START_X = 96; // where the first spine begins

export function LibraryHero({ title = 'Campus Library Archive' }) {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();

  // Books land in sequence; each title follows its own book.
  const bookVariants = {
    rested: { y: 0, opacity: 1, rotate: 0 },
    playing: (i) => ({
      y: [-70, 0],
      opacity: [0, 1, 1],
      transition: {
        delay: i * 0.28,
        duration: 0.55,
        // Lands with weight, no cartoon bounce.
        ease: [0.34, 1.2, 0.64, 1],
      },
    }),
  };

  const titleVariants = {
    rested: { opacity: 1 },
    playing: (i) => ({
      opacity: [0, 0, 1],
      // Starts only once the book has settled — the catalogue moment.
      transition: { delay: i * 0.28 + 0.45, duration: 0.5 },
    }),
  };

  const animateState = isPlaying ? 'playing' : 'rested';
  // Remount on hover so the whole sequence replays from empty.
  const runKey = isHovered ? 'hover' : 'intro';

  return (
    <div
      {...hoverProps}
      className="relative my-6 w-full overflow-hidden rounded-2xl border border-amber-800/20 bg-amber-50/50 px-8 py-6 shadow-inner dark:border-amber-700/20 dark:bg-slate-900/60"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="z-10">
          <h2 className="font-serif text-2xl font-bold text-amber-900 dark:text-amber-200">
            {title}
          </h2>
          <p className="mt-1 text-sm text-amber-800/70 dark:text-amber-300/60">
            Four hundred events, catalogued and searchable.
          </p>
        </div>

        <svg
          viewBox="0 0 200 140"
          className="h-32 w-52 shrink-0"
          role="img"
          aria-label="Books settling onto a library shelf"
        >
          <g key={runKey}>
            {BOOKS.map((book, i) => {
              // Stack each spine to the right of the previous one.
              const x =
                SHELF_START_X -
                BOOKS.slice(0, i + 1).reduce((sum, b) => sum + b.w + 3, 0) +
                BOOKS.reduce((sum, b) => sum + b.w + 3, 0) -
                SHELF_START_X +
                8;

              return (
                <motion.g
                  key={book.title}
                  custom={i}
                  variants={bookVariants}
                  initial={false}
                  animate={animateState}
                  style={{ originX: 0.5, originY: 1 }}
                >
                  <g transform={`rotate(${book.lean}, ${x + book.w / 2}, ${SHELF_Y})`}>
                    {/* Spine */}
                    <rect
                      x={x}
                      y={SHELF_Y - book.h}
                      width={book.w}
                      height={book.h}
                      rx="2"
                      className={book.tone}
                    />
                    {/* Head/tail bands — the detail that makes it read as a
                        bound book rather than a colored bar. */}
                    <rect
                      x={x}
                      y={SHELF_Y - book.h + 7}
                      width={book.w}
                      height="2"
                      className="fill-amber-100/50"
                    />
                    <rect
                      x={x}
                      y={SHELF_Y - 11}
                      width={book.w}
                      height="2"
                      className="fill-amber-100/50"
                    />

                    {/* Spine title, running vertically, fading in after the
                        book settles. */}
                    <motion.text
                      custom={i}
                      variants={titleVariants}
                      initial={false}
                      animate={animateState}
                      x={x + book.w / 2}
                      y={SHELF_Y - book.h / 2}
                      textAnchor="middle"
                      transform={`rotate(-90, ${x + book.w / 2}, ${SHELF_Y - book.h / 2})`}
                      className="fill-amber-50 font-mono"
                      style={{ fontSize: book.w > 20 ? 8 : 7, letterSpacing: '0.12em' }}
                    >
                      {book.title}
                    </motion.text>
                  </g>
                </motion.g>
              );
            })}
          </g>

          {/* The shelf itself. Static — it's the thing being filled. */}
          <rect
            x="0"
            y={SHELF_Y}
            width="200"
            height="6"
            rx="1"
            className="fill-amber-900/70 dark:fill-amber-950"
          />
          <rect
            x="0"
            y={SHELF_Y + 6}
            width="200"
            height="3"
            className="fill-amber-950/40 dark:fill-black/40"
          />
        </svg>
      </div>
    </div>
  );
}
