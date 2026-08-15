// src/components/clubs/SportsHero.jsx
//
// Sports Society — a kick travels the whole frame as a sequence of distinct
// beats, not one continuous blur: kick → football flies in → a beat of
// stillness at the stumps → smash (becomes a cricket ball, stumps go down)
// → a beat of stillness → hops on as a pickleball → a beat of stillness →
// softens into a shuttlecock for the final drop. Four sports, four readable
// events, each one landing before the next starts — the multi-sport range
// of the society (headlined by the University Premier League) as a relay
// with real beats, not a smear.
//
// Mechanism: true shape-morphing between unrelated silhouettes (a circle, a
// perforated ball, a feathered cone) isn't practical as one continuous SVG
// path. Instead one parent group carries the real, continuous x/y path —
// including flat DWELL segments where x/y hold still for a beat — and four
// independent children ride inside it, each fading/popping in exactly as
// the last fades out at its own checkpoint. Same "pick the implementable
// trick, not the literal simulation" call as Literary's font-mask over a
// traced pen stroke; the dwells are what make the handoffs read as
// sequential events instead of one smeared arc.
//
// The football/cricket ball/pickleball/shuttlecock keep their real colors
// (white/black, red, perforated lime, white feathers) rather than the club
// accent — same tradeoff class as Gaming's ghosts or Fashion's gold: the
// color IS the identifying feature here, so unified-accent mode won't
// flatten it. The leg and the stumps it's aimed at do carry the accent.
//
// Builds once and holds on the landed shuttlecock — the whole point is a
// journey that arrives somewhere, not a loop.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Every absolute-second mark below the ball hits, in order. Keeping them as
// named seconds (not raw fractions) is what makes the sequence legible and
// editable — `S.impact` is when the ball becomes a cricket ball AND the
// stumps fall, on the same beat, by construction.
const S = {
  launch: 0.45, // leg contact
  peak: 0.73,
  stumpsArrive: 1.0,
  impact: 1.15, // dwell as football: 1.0-1.15
  postImpactEnd: 1.35, // dwell as cricket ball: 1.15-1.35
  pickleballArrive: 1.6,
  pickleballEnd: 1.8, // dwell as pickleball: 1.6-1.8
  landed: 2.3, // soft shuttlecock drop: 1.8-2.3
};
const TOTAL = 2.8;
const f = (seconds) => seconds / TOTAL; // seconds -> fraction of TOTAL, for `times` arrays

const FLIGHT_TIMES = [0, S.launch, S.peak, S.stumpsArrive, S.impact, S.postImpactEnd, S.pickleballArrive, S.pickleballEnd, S.landed, TOTAL].map(f);
const FLIGHT_X = [40, 40, 100, 150, 150, 150, 195, 195, 230, 230];
const FLIGHT_Y = [90, 90, 55, 96, 96, 96, 70, 70, 100, 100];

// Each ball's visible window: fades/pops in at `inAt`, holds, fades out at
// `outAt`. `outSpeed` lets the football's handoff be a near-instant cut (an
// impact) while the others stay a soft crossfade (a handoff, not a hit).
const arrive = (inAt, outAt, outSpeed = 0.02) => ({
  rested: { opacity: outAt == null ? 1 : 0, scale: 1 },
  playing: {
    opacity: outAt == null ? [0, 0, 1, 1] : [0, 0, 1, 1, 0, 0],
    scale: outAt == null ? [0.5, 0.5, 1.15, 1] : [0.5, 0.5, 1.15, 1, 1, 1],
    transition: {
      duration: TOTAL,
      times: outAt == null
        ? [0, f(inAt), f(inAt) + 0.03, 1]
        : [0, f(inAt), f(inAt) + 0.03, f(outAt), f(outAt) + outSpeed, 1],
      ease: 'easeOut',
    },
  },
});

export function SportsHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion({ playOnVisible: true });
  const { accent, accentStyle } = useClubAccent('sports-society');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-green-950 p-8 text-white shadow-xl transition-shadow duration-150 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-primary-500)] focus-visible:ring-offset-2"
    >
      <div className="z-10 max-w-[42%]">
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Sports Society
        </h1>
        <p className="mt-1 text-green-200/80">
          Home to the University Premier League — and everything played to win.
        </p>
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox="0 0 260 150"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5"
        role="img"
        aria-label="A kicked football arrives and becomes a cricket ball that knocks over the stumps, pauses, hops on as a pickleball, pauses, then settles as a shuttlecock"
      >
        {/* Ground line. */}
        <path d="M 10,130 L 250,130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-green-100/15" />

        {/* The kicking leg — static hip position, rotation-only inner group
            (same transform-ownership split as Photography's brackets). Fast
            committed swing, holds the follow-through. Contact lands right at
            S.launch, which is when the ball becomes visible and departs. */}
        <g transform="translate(24, 58)">
          <motion.g
            stroke="none"
            fill={accent.dark}
            initial="rested"
            animate={state}
            style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' }}
            variants={{
              rested: { rotate: 42 },
              playing: {
                rotate: [-18, -18, 58, 42],
                transition: { duration: 0.55, times: [0, 0.27, 0.82, 1], ease: 'easeOut' },
              },
            }}
          >
            {/* Shin as a simple capsule, boot as a distinct angled wedge —
                two plain shapes read as "leg + shoe" more clearly at this
                size than one fused hand-drawn silhouette would. */}
            <rect x="-3" y="0" width="6" height="30" rx="3" />
            <path d="M -4,26 L 6,26 L 21,37 L 14,43 L -6,35 Z" />
          </motion.g>
        </g>

        {/* Stumps at the impact point — knocked over exactly at S.impact,
            the same instant the ball becomes a cricket ball. The far
            (rightmost) stump is the one that falls, rotating AWAY from its
            neighbors — a middle stump falling in-plane swings its top clean
            across the other two and reads as a crossed "H" rather than a
            knocked-over wicket. */}
        <g transform="translate(150, 130)">
          {[-8, 0, 8].map((dx, i) => (
            <motion.rect
              key={i}
              x={dx - 2}
              y={-34}
              width={4}
              height={34}
              fill={accent.dark}
              initial="rested"
              animate={state}
              style={{ transformBox: 'fill-box', transformOrigin: `${dx}px 0px` }}
              variants={
                i === 2
                  ? {
                      rested: { rotate: 62, opacity: 0.85 },
                      playing: {
                        rotate: [0, 0, 62],
                        opacity: [1, 1, 0.85],
                        transition: { duration: 0.4, delay: S.impact, times: [0, 0.2, 1], ease: 'easeOut' },
                      },
                    }
                  : { rested: { rotate: 0 }, playing: { rotate: 0 } }
              }
            />
          ))}
          {/* Bails — pop up and off at impact, toward the falling stump. */}
          {[0, 1].map((i) => (
            <motion.rect
              key={i}
              x={2}
              y={-38}
              width={12}
              height={3}
              rx={1.5}
              fill={accent.dark}
              initial="rested"
              animate={state}
              variants={{
                rested: { y: -16, x: i === 0 ? 10 : 26, rotate: i === 0 ? -60 : 80, opacity: 0.7 },
                playing: {
                  y: [0, 0, -16],
                  x: [0, 0, i === 0 ? 10 : 26],
                  rotate: [0, 0, i === 0 ? -60 : 80],
                  opacity: [1, 1, 0.7],
                  transition: { duration: 0.4, delay: S.impact, times: [0, 0.15, 1], ease: 'easeOut' },
                },
              }}
            />
          ))}
        </g>

        {/* The traveling object — carries the real path, including flat
            dwell segments (repeated x/y values) at the stumps and at the
            pickleball spot, so each stage visibly lands before the next
            begins. Children inside swap which sport it is. */}
        <motion.g
          initial="rested"
          animate={state}
          variants={{
            rested: { x: FLIGHT_X[FLIGHT_X.length - 1], y: FLIGHT_Y[FLIGHT_Y.length - 1] },
            playing: { x: FLIGHT_X, y: FLIGHT_Y, transition: { duration: TOTAL, times: FLIGHT_TIMES, ease: 'easeInOut' } },
          }}
        >
          {/* Football — visible from launch through the arrival dwell,
              cuts out fast right at impact (a hit, not a fade). Real spin
              while airborne. */}
          <motion.g initial="rested" animate={state} variants={arrive(S.launch, S.impact, 0.02)}>
            <motion.g
              initial="rested"
              animate={state}
              variants={{
                rested: { rotate: 0 },
                playing: { rotate: [0, 720], transition: { delay: S.launch, duration: S.stumpsArrive - S.launch, ease: 'linear' } },
              }}
            >
              <circle r="9" fill="#F8FAFC" stroke="#1C1917" strokeWidth="1" />
              <path d="M -3,-6 L 3,-6 L 4,-1 Z" fill="#1C1917" />
              <path d="M -6,3 L -1,7 L -5,9 Z" fill="#1C1917" />
              <path d="M 6,3 L 1,7 L 5,9 Z" fill="#1C1917" />
            </motion.g>
          </motion.g>

          {/* Cricket ball — pops in right at impact, dwells at the fallen
              stumps, rides the hop, hands off as the pickleball lands. */}
          <motion.g initial="rested" animate={state} variants={arrive(S.impact, S.pickleballArrive, 0.045)}>
            <circle r="8" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="0.75" />
            <path d="M -8,0 C -3,-3 3,-3 8,0" fill="none" stroke="#FEF2F2" strokeWidth="0.75" />
          </motion.g>

          {/* Pickleball — pops in on arrival, dwells, hands off to the
              shuttlecock for the soft finale. */}
          <motion.g initial="rested" animate={state} variants={arrive(S.pickleballArrive, S.pickleballEnd, 0.055)}>
            <circle r="8" fill="#D9F99D" stroke="#4D7C0F" strokeWidth="1" />
            {[[-3, -3], [3, -3], [0, 0], [-3, 3], [3, 3]].map(([dx, dy], i) => (
              <circle key={i} cx={dx} cy={dy} r="0.9" fill="#4D7C0F" />
            ))}
          </motion.g>

          {/* Shuttlecock — the landed, held final costume. Pops in and
              stays, then gets its own tiny settle bounce distinct from the
              balls' harder arrivals — a shuttlecock drops soft, not sharp. */}
          <motion.g initial="rested" animate={state} variants={arrive(S.pickleballEnd, null)}>
            <motion.g
              initial="rested"
              animate={state}
              variants={{
                rested: { scale: 1 },
                playing: {
                  scale: [1, 1, 0.85, 1],
                  transition: { delay: S.landed, duration: 0.35, times: [0, 0.5, 0.75, 1], ease: 'easeOut' },
                },
              }}
            >
              {[-42, -21, 0, 21, 42].map((angle, i) => (
                <path
                  key={i}
                  d="M -2,2 L 2,2 L 1,-16 L -1,-16 Z"
                  fill="#F8FAFC"
                  stroke="#CBD5E1"
                  strokeWidth="0.5"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cy="4" r="4.5" fill="#D6B370" stroke="#92400E" strokeWidth="0.75" />
            </motion.g>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
