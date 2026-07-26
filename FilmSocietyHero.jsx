// src/components/clubs/FilmSocietyHero.jsx
//
// Film Society — a strip advancing through a gate, not a reel spinning.
//
// A spinning reel is the machine. Cinema is the frames ADVANCING: the strip
// pulls down one frame at a time, pauses while that frame is projected, then
// pulls again. That intermittent motion — move, hold, move — is literally how
// a projector works and why film looks like film.
//
// The pause is doing the work here. A strip sliding smoothly reads as a
// conveyor belt; a strip that jerks and holds reads as a projector.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const FRAME_H = 34;      // height of one frame + its gap
const FRAME_W = 46;
const STRIP_X = 22;
const FRAME_COUNT = 6;

// Each frame gets a simple abstract "image" so the strip isn't empty boxes.
// Kept as blocks and circles — anything more detailed turns to noise at this size.
const FRAME_ART = [
  { type: 'horizon', y: 0.62 },
  { type: 'figure' },
  { type: 'horizon', y: 0.4 },
  { type: 'circle' },
  { type: 'figure' },
  { type: 'horizon', y: 0.55 },
];

export function FilmSocietyHero() {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('film-society');

  // Intermittent pull-down: advance one frame, hold, advance again.
  // times[] creates the hold — the strip is stationary between pulls.
  const advance = {
    y: [0, -FRAME_H, -FRAME_H, -FRAME_H * 2, -FRAME_H * 2, -FRAME_H * 3],
    transition: {
      duration: 3.6,
      times: [0, 0.12, 0.37, 0.49, 0.74, 0.86],
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 0.3,
    },
  };

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-bold tracking-wider" style={{ color: 'var(--club-accent)' }}>
          Film Society
        </h1>
        <p className="mt-1 text-zinc-400">Appreciating, analyzing, and creating cinema.</p>
      </div>

      <svg
        key={isHovered ? 'hover' : 'intro'}
        viewBox="0 0 90 130"
        className="h-44 w-28 shrink-0"
        role="img"
        aria-label="A film strip advancing frame by frame through a projector gate"
      >
        <defs>
          {/* The gate: only the strip inside this window is visible, so
              frames genuinely enter and leave rather than fading. */}
          <clipPath id="film-gate">
            <rect x="0" y="8" width="90" height="114" />
          </clipPath>
        </defs>

        <g clipPath="url(#film-gate)">
          <motion.g
            initial={false}
            animate={isPlaying ? advance : { y: -FRAME_H }}
            transition={isPlaying ? advance.transition : { duration: 0.4, ease: 'easeOut' }}
          >
            {/* Strip base, tall enough to cover the full travel */}
            <rect
              x={STRIP_X - 12}
              y={-FRAME_H}
              width={FRAME_W + 24}
              height={FRAME_H * (FRAME_COUNT + 2)}
              className="fill-zinc-950"
            />

            {Array.from({ length: FRAME_COUNT + 2 }).map((_, i) => {
              const y = (i - 1) * FRAME_H + 12;
              const art = FRAME_ART[i % FRAME_ART.length];

              return (
                <g key={i}>
                  {/* Sprocket holes, both edges — the detail that makes it
                      unmistakably film rather than a filmstrip icon. */}
                  {[0, 1].map((side) => (
                    <React.Fragment key={side}>
                      <rect
                        x={side === 0 ? STRIP_X - 9 : STRIP_X + FRAME_W + 2}
                        y={y + 4}
                        width="6"
                        height="6"
                        rx="1.2"
                        className="fill-zinc-700"
                      />
                      <rect
                        x={side === 0 ? STRIP_X - 9 : STRIP_X + FRAME_W + 2}
                        y={y + 18}
                        width="6"
                        height="6"
                        rx="1.2"
                        className="fill-zinc-700"
                      />
                    </React.Fragment>
                  ))}

                  {/* The frame itself */}
                  <rect
                    x={STRIP_X}
                    y={y}
                    width={FRAME_W}
                    height={FRAME_H - 6}
                    rx="1"
                    className="fill-zinc-800"
                  />

                  {/* Abstract frame content */}
                  {art.type === 'horizon' && (
                    <rect
                      x={STRIP_X + 4}
                      y={y + (FRAME_H - 6) * art.y}
                      width={FRAME_W - 8}
                      height="1.6"
                      fill="var(--club-accent)"
                      opacity="0.7"
                    />
                  )}
                  {art.type === 'figure' && (
                    <>
                      <circle cx={STRIP_X + FRAME_W / 2} cy={y + 10} r="3" fill="var(--club-accent)" opacity="0.7" />
                      <rect x={STRIP_X + FRAME_W / 2 - 3} y={y + 14} width="6" height="9" rx="1.5" fill="var(--club-accent)" opacity="0.7" />
                    </>
                  )}
                  {art.type === 'circle' && (
                    <circle cx={STRIP_X + FRAME_W / 2} cy={y + (FRAME_H - 6) / 2} r="7" fill="none" stroke="var(--club-accent)" strokeWidth="1.6" opacity="0.7" />
                  )}
                </g>
              );
            })}
          </motion.g>
        </g>

        {/* Gate edges — the aperture the strip runs behind. Drawn last so
            the strip passes underneath. */}
        <rect x="0" y="0" width="90" height="10" className="fill-zinc-900" />
        <rect x="0" y="120" width="90" height="10" className="fill-zinc-900" />
      </svg>
    </div>
  );
}
