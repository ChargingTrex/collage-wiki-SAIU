// src/components/ArchivesHero.jsx
//
// Event Archives — retrieval, not transit.
//
// A dense wall of spines sits still. One volume slides partway out, showing
// its year label, holds, then settles back — and a moment later a different
// one does the same. The point being made is findability: this is a body of
// material you can reach into and pull something out of.
//
// Deliberately NOT the conveyor-belt version (books drifting past on a loop).
// That reads as things in transit, which is the opposite of archived.
//
// The wall is static. Only one spine moves at a time, and only while the
// reader is arriving — see useIntroMotion.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from './useIntroMotion';

// A dense run of spines. Widths and heights vary so it reads as accumulated
// material rather than a printed set — an archive is uneven by nature.
// `tone` cycles through muted binding colors; nothing here should compete
// with the one book that moves.
const SPINES = [
  { w: 13, h: 88, tone: 'fill-slate-600 dark:fill-slate-700' },
  { w: 9,  h: 94, tone: 'fill-amber-800 dark:fill-amber-900' },
  { w: 16, h: 82, tone: 'fill-stone-600 dark:fill-stone-700' },
  { w: 11, h: 91, tone: 'fill-rose-900 dark:fill-rose-950' },
  { w: 14, h: 86, tone: 'fill-slate-700 dark:fill-slate-800' },
  { w: 10, h: 95, tone: 'fill-emerald-900 dark:fill-emerald-950' },
  { w: 15, h: 84, tone: 'fill-stone-700 dark:fill-stone-800' },
  { w: 12, h: 90, tone: 'fill-amber-900 dark:fill-amber-950' },
  { w: 9,  h: 93, tone: 'fill-slate-600 dark:fill-slate-700' },
  { w: 17, h: 80, tone: 'fill-stone-600 dark:fill-stone-700' },
  { w: 11, h: 89, tone: 'fill-rose-900 dark:fill-rose-950' },
  { w: 13, h: 92, tone: 'fill-slate-700 dark:fill-slate-800' },
];

// Which spines pull out, in what order, and what they're labelled.
// Spaced apart along the wall so the movement travels rather than
// clustering in one spot.
const PULLS = [
  { index: 2,  label: '2024', at: 0.5 },
  { index: 7,  label: '2025', at: 2.3 },
  { index: 10, label: '2026', at: 4.1 },
];

const BASELINE = 108;
const GAP = 2;
const START_X = 6;

// Precompute x positions once — the wall never reflows.
const POSITIONS = (() => {
  let cursor = START_X;
  return SPINES.map((s) => {
    const x = cursor;
    cursor += s.w + GAP;
    return x;
  });
})();

export function ArchivesHero({
  title = 'Event Archives',
  subtitle = 'Four hundred events. Every one still here.',
}) {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const state = isPlaying ? 'playing' : 'rested';

  const pullFor = (i) => PULLS.find((p) => p.index === i);

  return (
    <div
      {...hoverProps}
      className="relative my-6 w-full overflow-hidden rounded-2xl border border-stone-700/25 bg-stone-100/70 px-8 py-6 shadow-inner dark:border-stone-600/20 dark:bg-stone-950/50"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="z-10">
          <h2 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-200">
            {title}
          </h2>
          <p className="mt-1 text-sm text-stone-600/80 dark:text-stone-400/70">{subtitle}</p>
        </div>

        <svg
          key={isHovered ? 'hover' : 'intro'}
          viewBox="0 0 190 130"
          className="h-32 w-56 shrink-0"
          role="img"
          aria-label="A wall of archived volumes, one sliding out to reveal its year"
        >
          {/* Shelf carcass — the recess the volumes sit in. Drawn first so
              the spines overlap its lower edge and look seated in it. */}
          <rect
            x="0"
            y="6"
            width="190"
            height={BASELINE - 6}
            rx="2"
            className="fill-stone-800/10 dark:fill-black/30"
          />

          {SPINES.map((spine, i) => {
            const x = POSITIONS[i];
            const pull = pullFor(i);
            const topY = BASELINE - spine.h;

            return (
              <motion.g
                key={i}
                initial={false}
                animate={state}
                variants={{
                  rested: { y: 0 },
                  playing: pull
                    ? {
                        // Out, hold, back. The hold is what sells it as
                        // "being read" rather than "wobbling".
                        y: [0, -14, -14, 0],
                        transition: {
                          duration: 1.6,
                          delay: pull.at,
                          times: [0, 0.28, 0.72, 1],
                          ease: 'easeInOut',
                        },
                      }
                    : { y: 0 },
                }}
              >
                <rect
                  x={x}
                  y={topY}
                  width={spine.w}
                  height={spine.h}
                  rx="1.5"
                  className={spine.tone}
                />
                {/* Head/tail bands — reads as bound volumes, not bars. */}
                <rect x={x} y={topY + 6} width={spine.w} height="1.5" className="fill-stone-200/25" />
                <rect x={x} y={BASELINE - 9} width={spine.w} height="1.5" className="fill-stone-200/25" />

                {/* Year label, only on the volumes that pull out, and only
                    visible once it's clear of its neighbours. */}
                {pull && (
                  <motion.text
                    x={x + spine.w / 2}
                    y={topY + spine.h / 2}
                    textAnchor="middle"
                    transform={`rotate(-90, ${x + spine.w / 2}, ${topY + spine.h / 2})`}
                    className="fill-stone-100 font-mono"
                    style={{ fontSize: 7, letterSpacing: '0.1em' }}
                    initial={false}
                    animate={state}
                    variants={{
                      rested: { opacity: 0 },
                      playing: {
                        opacity: [0, 1, 1, 0],
                        transition: {
                          duration: 1.6,
                          delay: pull.at,
                          times: [0, 0.3, 0.7, 1],
                        },
                      },
                    }}
                  >
                    {pull.label}
                  </motion.text>
                )}
              </motion.g>
            );
          })}

          {/* Shelf lip, drawn last so pulled volumes pass behind it — that
              overlap is what makes them read as coming OUT of the shelf
              rather than floating above it. */}
          <rect x="0" y={BASELINE} width="190" height="7" rx="1" className="fill-stone-700 dark:fill-stone-900" />
          <rect x="0" y={BASELINE + 7} width="190" height="3" className="fill-stone-900/40 dark:fill-black/50" />
        </svg>
      </div>
    </div>
  );
}
