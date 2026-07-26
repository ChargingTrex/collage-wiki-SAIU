// src/components/LibraryHero.jsx
//
// Campus Library — the collection assembling itself.
//
// Books drop into the shelf one after another and their spine titles fade in
// just after each lands. The layout and the settle live in the Book/Shelf
// primitive; this file only describes WHICH books.
//
// Companion piece: ArchivesHero (books flowing past) is separate. One shelf
// metaphor per component.

import React from 'react';
import { Shelf } from './primitives/Book';
import { useIntroMotion } from './useIntroMotion';

// Varying heights and widths so it reads as a real collection rather than a
// bar chart. The last one leans — a perfectly aligned shelf looks like stock art.
const SHELF_BOOKS = [
  { title: 'ARCHIVE',   width: 22, height: 84, tone: 'amber' },
  { title: 'JOURNALS',  width: 16, height: 96, tone: 'rose' },
  { title: 'THESES',    width: 26, height: 74, tone: 'emerald' },
  { title: 'PERIODICA', width: 18, height: 90, tone: 'slate', lean: 8 },
];

const BASELINE = 118;

export function LibraryHero({
  title = 'Campus Library Archive',
  subtitle = 'Four hundred events, catalogued and searchable.',
}) {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();

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
          <p className="mt-1 text-sm text-amber-800/70 dark:text-amber-300/60">{subtitle}</p>
        </div>

        <svg
          viewBox="0 0 200 140"
          className="h-32 w-52 shrink-0"
          role="img"
          aria-label="Books settling onto a library shelf"
        >
          {/* Remounting on hover replays the whole fill from an empty shelf. */}
          <g key={isHovered ? 'hover' : 'intro'}>
            <Shelf
              books={SHELF_BOOKS}
              baseline={BASELINE}
              startX={70}
              animate={isPlaying ? 'playing' : 'rested'}
            />
          </g>

          {/* The shelf itself. Static — it's the thing being filled. */}
          <rect x="0" y={BASELINE} width="200" height="6" rx="1" className="fill-amber-900/70 dark:fill-amber-950" />
          <rect x="0" y={BASELINE + 6} width="200" height="3" className="fill-amber-950/40 dark:fill-black/40" />
        </svg>
      </div>
    </div>
  );
}
