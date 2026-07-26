// src/components/clubs/ScienceHero.jsx
//
// Science Society — an atom whose electrons actually orbit.
//
// The original spun a static atom glyph in place, which is a picture of an
// atom rotating — something atoms don't do. Here the nucleus holds still and
// three electrons travel their own elliptical shells at different periods,
// which is the behaviour the diagram is meant to describe.
//
// Electrons ride `offsetPath` (the ellipse itself), so the motion follows the
// drawn shell exactly instead of approximating it with sin/cos, which drifts
// out of alignment the moment you rotate the ellipse.
//
// Continuous orbit is the exception to the play-once rule: an orbit that
// stops mid-arc is just a dot sitting somewhere arbitrary. It still obeys
// the scroll rule — it goes still when the reader starts working — but its
// rested state parks each electron at a deliberate point rather than
// wherever it happened to be.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

const CX = 65;
const CY = 65;

// Three shells at different tilts and periods. Differing speeds are what
// stop it reading as one rigid object turning.
const SHELLS = [
  { rx: 52, ry: 20, rotate: 0,   period: 3.4, restAt: '0%' },
  { rx: 52, ry: 20, rotate: 60,  period: 4.6, restAt: '35%' },
  { rx: 52, ry: 20, rotate: 120, period: 2.9, restAt: '68%' },
];

// Builds the arc path for an ellipse already tilted by `rotateDeg`, using the
// arc command's own x-axis-rotation parameter — rather than drawing an
// axis-aligned ellipse and trying to spin the traveling point afterward with
// a separate CSS `rotate`. That combination (offset-path + an individual
// `rotate` property) doesn't compose reliably: the point ends up traveling
// the UNROTATED path while only its own facing angle rotates, so it visibly
// cuts across the drawn (rotated) shell instead of tracing it. Baking the
// tilt into the path itself means the point genuinely follows the shell.
const ellipsePath = (rx, ry, rotateDeg) => {
  const rad = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const x0 = CX - rx * cos;
  const y0 = CY - rx * sin;
  const dx = 2 * rx * cos;
  const dy = 2 * rx * sin;
  return `M ${x0},${y0} a ${rx},${ry} ${rotateDeg} 1,0 ${dx},${dy} a ${rx},${ry} ${rotateDeg} 1,0 ${-dx},${-dy}`;
};

export function ScienceHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('science-society');

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-cyan-950 p-8 text-white shadow-xl"
    >
      <div className="z-10">
        <h1 className="text-3xl font-extrabold" style={{ color: accent.dark }}>
          Science Society
        </h1>
        <p className="mt-1 text-cyan-200/80">
          Advancing scientific curiosity and research.
        </p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 130 130"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label="Electrons orbiting an atomic nucleus"
      >
        {/* Shells. Drawn faintly — they're the track, not the subject. */}
        {SHELLS.map((shell, i) => (
          <ellipse
            key={`shell-${i}`}
            cx={CX}
            cy={CY}
            rx={shell.rx}
            ry={shell.ry}
            fill="none"
            stroke={accent.dark}
            strokeWidth="0.9"
            opacity="0.28"
            transform={`rotate(${shell.rotate}, ${CX}, ${CY})`}
          />
        ))}

        {/* Electrons. offsetPath binds each to its own drawn ellipse. */}
        {SHELLS.map((shell, i) => (
          <motion.circle
            key={`e-${i}`}
            r="4"
            fill={accent.dark}
            style={{
              offsetPath: `path("${ellipsePath(shell.rx, shell.ry, shell.rotate)}")`,
              offsetRotate: '0deg',
            }}
            initial={{ offsetDistance: shell.restAt }}
            animate={
              isPlaying
                ? { offsetDistance: ['0%', '100%'] }
                : { offsetDistance: shell.restAt }
            }
            transition={
              isPlaying
                ? { duration: shell.period, repeat: Infinity, ease: 'linear' }
                : { duration: 0.6, ease: 'easeOut' }
            }
          />
        ))}

        {/* Nucleus — three overlapping circles, so it reads as particles
            bound together rather than one ball. */}
        <g>
          <circle cx={CX - 3.5} cy={CY - 2} r="6" fill={accent.dark} opacity="0.9" />
          <circle cx={CX + 3.5} cy={CY - 1} r="6" fill={accent.dark} opacity="0.75" />
          <circle cx={CX} cy={CY + 4} r="6" fill={accent.dark} />
        </g>
      </svg>
    </div>
  );
}
