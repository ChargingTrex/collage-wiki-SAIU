// src/components/clubs/TheatreHero.jsx
//
// Theatre Club — a marionette show in a toy theatre. The curtains part on a
// painted cut-paper night, a spotlight comes up, and a carved wooden puppet
// is lowered in on its strings: it lands, waves, sweeps a bow, and rises
// into a one-legged flourish, which is the picture the card rests on.
//
// Why a puppet and not an empty stage (the previous version stopped at
// "curtains, then light"): theatre is somebody making a figure live for an
// audience, and a marionette shows that act literally, strings and all.
//
// What makes it read as a marionette rather than a cartoon person:
//   - Every string is drawn from the control bar to the joint it lifts
//     (two to the head, one to each wrist, one to each knee), recomputed
//     from the same joints as the limbs every frame, so they never drift.
//   - The bar follows the puppet the way a puppeteer's hand would: it hangs
//     a fixed string-length above the head, and tips toward whichever hand
//     is raised; the smaller knee bar rocks toward the lifted knee.
//   - Lower limbs dangle. A raised arm is lifted by the wrist, a lifted knee
//     leaves the shin hanging, and the puppet is "lowered until the floor
//     stops it": the pelvis height is min(string height, standing height).
//
// The spotlight still comes up only after the curtains have parted (a light
// on moving curtains reads as a glitch; on a settled stage, as "places").
//
// The figure comes from the shared rig (./rig): one clock, joints computed
// in JS. Curtains, light and footlights are ordinary Framer variants.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { Rig, useRigClock, useRigFrame } from './rig/RigParts';
import { POSE0, capsule, clamp, line, makeTimeline, n, place, shift, solve } from './rig/rig';
import styles from './TheatreHero.module.css';

const WOOD = '#ecd2a6';
const WOOD_LINE = '#6b3f1d';
const GOLD = '#f2c14e';
const VELVET = '#7e22ce';
const STRING = '#f3e8ff';

const CX = 196; // the puppet's mark, centre stage
const FLOOR = 165; // where its soles rest
const HEAD_STRING = 42; // the bar hangs this far above the head
const K = 1.12; // the puppet is authored at 1x and drawn this much larger, about its mark
const PUPPET = `translate(${CX} ${FLOOR}) scale(${K}) translate(${-CX} ${-FLOOR})`;

const BODY = {
  torso: 25, neck: 2, headR: 11,
  shoulderW: 21, hipW: 10,
  upperArm: 14, foreArm: 13,
  thigh: 15, shin: 15, foot: 7,
};

// `y` is how far the strings have lowered the pelvis; the floor does the
// rest (see scene()). The puppet waits above the valance while the curtains
// part, is lowered in, lands, waves, bows, and strikes its final pose.
const SHOW = makeTimeline([
  { t: 0, y: -4, torso: 0, head: 0, squash: 1, headDy: 0, laU: -5, laF: 2, raU: 5, raF: -2, llT: -7, llS: 3, rlT: 7, rlS: -3, lf: -18, rf: 18 },
  { t: 0.75, y: -4 },
  { t: 1.15, torso: 3, llS: 9, rlS: 3, laF: 6, raF: 2 },
  { t: 1.6, y: 150, torso: 0, llT: -4, llS: 0, rlT: 4, rlS: 0, lf: -72, rf: 72, laF: 0, raF: 0 },
  { t: 1.78, llT: -24, llS: 15, rlT: 24, rlS: -15, laU: -20, raU: 20, head: -3 },
  { t: 2.0, llT: -4, llS: 0, rlT: 4, rlS: 0, laU: -9, laF: -3, raU: 9, raF: 3, head: 0 },
  // the greeting: lifted by the wrist, the forearm waves
  { t: 2.4, raU: 116, raF: 176, head: 10, torso: 2, laU: -18, laF: -6 },
  { t: 2.58, raF: 146 },
  { t: 2.76, raF: 188 },
  { t: 2.94, raF: 150 },
  { t: 3.1, raF: 178, head: 7 },
  // the bow
  { t: 3.55, torso: 30, head: 58, squash: 0.86, headDy: 2, raU: 58, raF: 6, laU: -106, laF: -128, llT: -22, llS: -10, rlT: 16, rlS: -12, lf: -80, rf: 78, stop: true },
  { t: 3.85, torso: 31, head: 60, stop: true },
  // up, into the flourish
  { t: 4.35, torso: -3, head: -9, squash: 1, headDy: 0, laU: -131, laF: -176, raU: 74, raF: 98, llT: -2, llS: 0, rlT: 76, rlS: 10, lf: -74, rf: 30 },
  { t: 4.6, laU: -122, laF: -166, raU: 68, raF: 92, rlT: 64, rlS: 2 },
  { t: 4.9, torso: -3, head: -8, laU: -126, laF: -170, raU: 71, raF: 95, rlT: 70, rlS: 5 },
]);
const DURATION = SHOW.duration;

function scene(t) {
  const p = { ...POSE0, ...SHOW(t) };
  const j = solve({ ...p, x: CX, y: 0 }, BODY);
  // Lowered until the floor stops it.
  const reachDown = Math.max(j.anL[1], j.anR[1], j.toeL[1], j.toeR[1]) + 2.2;
  const standing = FLOOR - reachDown;
  const y = Math.min(p.y, standing);
  shift(j, 0, y);
  // `j` stays in the puppet's own 1x space (its limbs are drawn inside a
  // scaled group); `w` is the same joints in stage space, for the strings.
  const w = {};
  for (const k in j) w[k] = [CX + (j[k][0] - CX) * K, FLOOR + (j[k][1] - FLOOR) * K];

  // Control bar: a fixed string-length above the head, tipped toward the
  // raised hand. Knee bar: just below it, rocked toward the lifted knee.
  const barC = [CX + (w.headC[0] - CX) * 0.6, w.headC[1] - HEAD_STRING];
  const tilt = (clamp((j.haL[1] - j.haR[1]) * 0.42, -20, 20) * Math.PI) / 180;
  const bar = (half) => [
    [barC[0] - Math.cos(tilt) * half, barC[1] + Math.sin(tilt) * half],
    [barC[0] + Math.cos(tilt) * half, barC[1] - Math.sin(tilt) * half],
  ];
  const [barL, barR] = bar(36);
  const [tieL, tieR] = bar(6);
  const rock = (clamp((j.knL[1] - j.knR[1]) * 2.4, -30, 30) * Math.PI) / 180;
  const kneeC = [barC[0], barC[1] + 8];
  const kneeL = [kneeC[0] - Math.cos(rock) * 15, kneeC[1] + Math.sin(rock) * 15];
  const kneeR = [kneeC[0] + Math.cos(rock) * 15, kneeC[1] - Math.sin(rock) * 15];

  // Where the head strings tie on: either side of the crown.
  const hr = (p.head * Math.PI) / 180;
  const ear = (side) => [
    w.headC[0] + (Math.cos(hr) * 7.5 * side + Math.sin(hr) * 7) * K,
    w.headC[1] + (Math.sin(hr) * 7.5 * side - Math.cos(hr) * 7) * K,
  ];
  return {
    p, j, w, barC, barL, barR, tieL, tieR, kneeC, kneeL, kneeR,
    earL: ear(-1), earR: ear(1),
    air: clamp((standing - y) / 40, 0, 1), // 0 on the boards, 1 well above them
  };
}

// Scalloped valance edge across the proscenium opening.
const VALANCE = `M38 12 H346 V27 ${Array.from({ length: 11 }, () => 'q-14 13 -28 0').join(' ')} Z`;
const FRINGE = `M346 27 ${Array.from({ length: 11 }, () => 'q-14 13 -28 0').join(' ')}`;

function Star({ x, y, s = 3.2 }) {
  return (
    <g>
      <path d={`M${x} 14 V${y - s}`} stroke={STRING} strokeWidth="0.5" opacity="0.45" />
      <path
        d={`M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`}
        fill="#f6ead0"
      />
    </g>
  );
}

export function TheatreHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('theatre-club');
  const state = isPlaying ? 'playing' : 'rested';
  const clock = useRigClock(isPlaying, isReplaying, DURATION);
  const frame = useRigFrame(clock, scene);
  const costume = accent.dark;

  const limb = { fill: WOOD, stroke: WOOD_LINE, strokeWidth: 0.8, strokeLinejoin: 'round' };
  const cloth = { fill: costume, stroke: '#3b0764', strokeWidth: 0.8, strokeLinejoin: 'round' };
  const string = { stroke: STRING, strokeWidth: 0.75, strokeLinecap: 'round', opacity: 0.85, fill: 'none' };

  const curtain = {
    rested: { scaleX: 0.17 },
    playing: { scaleX: [1, 1, 0.17], transition: { duration: 1.25, times: [0, 0.12, 1], ease: [0.5, 0, 0.2, 1] } },
  };
  const lightUp = (to) => ({
    rested: { opacity: to },
    playing: { opacity: [0, 0, to], transition: { duration: 1.7, times: [0, 0.5, 1], ease: 'easeOut' } },
  });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl bg-purple-950 text-white shadow-xl`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
            Theatre Club
          </h1>
          <p className="mt-1" style={{ color: '#e9d5ff' }}>
            Bringing compelling stories to life on stage.
          </p>
        </div>

        <svg
          key={isReplaying ? 'replay' : 'intro'}
          viewBox="0 0 364 192"
          className={`${styles.art} pointer-events-none`}
          role="img"
          aria-label="A toy theatre: the curtains part and a wooden marionette is lowered on its strings, waves, bows, and strikes a pose in the spotlight"
        >
          <defs>
            <linearGradient id="theatre-club-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b103f" />
              <stop offset="100%" stopColor="#5a2a9a" />
            </linearGradient>
            <linearGradient id="theatre-club-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent.dark} stopOpacity="0.42" />
              <stop offset="100%" stopColor={accent.dark} stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="theatre-club-boards" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a2148" />
              <stop offset="100%" stopColor="#2b1030" />
            </linearGradient>
            <linearGradient id="theatre-club-footglow" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="theatre-club-fold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4c1389" />
              <stop offset="45%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>
            <pattern id="theatre-club-velvet" width="14" height="10" patternUnits="userSpaceOnUse">
              <rect width="14" height="10" fill="url(#theatre-club-fold)" />
            </pattern>
            <clipPath id="theatre-club-opening">
              <rect x="38" y="12" width="308" height="168" />
            </clipPath>
          </defs>

          {/* Proscenium: the toy theatre's frame */}
          <rect x="28" y="3" width="328" height="186" rx="7" fill="#24073f" />
          <rect x="28" y="3" width="328" height="186" rx="7" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.55" />

          <g clipPath="url(#theatre-club-opening)">
            {/* Painted backdrop: a cut-paper night */}
            <rect x="38" y="12" width="308" height="150" fill="url(#theatre-club-sky)" />
            <circle cx="100" cy="66" r="21" fill="#12082e" opacity="0.5" transform="translate(2.5 3)" />
            <circle cx="100" cy="66" r="21" fill="#f6ead0" />
            <circle cx="93" cy="60" r="4" fill="#e6d5b0" opacity="0.7" />
            <circle cx="107" cy="73" r="2.6" fill="#e6d5b0" opacity="0.7" />
            <Star x={66} y={44} />
            <Star x={268} y={42} s={3.6} />
            <Star x={304} y={66} s={2.8} />
            <Star x={142} y={36} s={2.4} />
            <path d="M38 132 C70 108 104 112 136 128 C170 110 214 100 250 122 C284 104 318 108 346 124 V162 H38 Z" fill="#4b2a8c" />
            <path d="M38 148 C82 126 120 138 160 146 C204 128 262 132 300 146 C320 140 336 140 346 144 V162 H38 Z" fill="#35196d" />
            {/* a cut-paper village on the far hill */}
            <path d="M270 118 v-9 l5 -5 l5 5 v9 Z M283 120 v-14 l4 -6 l4 6 v14 Z M295 119 v-7 l5 -4 l5 4 v7 Z" fill="#2a1259" />
            <rect x="272.6" y="111" width="2" height="2.6" fill={GOLD} opacity="0.9" />
            <rect x="286" y="108" width="2" height="2.6" fill={GOLD} opacity="0.9" />

            {/* Boards */}
            <rect x="38" y="160" width="308" height="20" fill="url(#theatre-club-boards)" />
            <path d="M38 160 H346" stroke="#7a4a76" strokeWidth="0.8" />
            <path d="M82 160 L58 180 M134 160 L122 180 M196 160 V180 M258 160 L270 180 M310 160 L334 180" stroke="#1f0a24" strokeWidth="0.7" opacity="0.7" />

            {/* Spotlight: up only after the curtains have parted */}
            <motion.g initial="rested" animate={state} variants={lightUp(1)}>
              <path d="M184 12 H208 L262 168 H130 Z" fill="url(#theatre-club-beam)" />
              <ellipse cx="196" cy="168" rx="66" ry="7.5" fill={accent.dark} opacity="0.32" />
            </motion.g>

            {/* The puppet's shadow on the boards */}
            <Rig as="ellipse" frame={frame} cx={CX} cy="167.5" ry="2.6" fill="#12051c"
              attrs={(f) => ({ rx: n(20 - f.air * 9), opacity: n(0.55 - f.air * 0.45) })} />

            {/* ---- The marionette ---- */}
            <g transform={PUPPET}>
            {/* legs */}
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.knL, f.j.anL, 3, 2.4) })} {...limb} />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.knR, f.j.anR, 3, 2.4) })} {...limb} />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.anL, f.j.toeL, 2.7, 1.7) })} fill={GOLD} stroke={WOOD_LINE} strokeWidth="0.8" />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.anR, f.j.toeR, 2.7, 1.7) })} fill={GOLD} stroke={WOOD_LINE} strokeWidth="0.8" />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.hipL, f.j.knL, 4.2, 3.4) })} fill={VELVET} stroke="#3b0764" strokeWidth="0.8" />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.hipR, f.j.knR, 4.2, 3.4) })} fill={VELVET} stroke="#3b0764" strokeWidth="0.8" />
            <Rig as="circle" frame={frame} r="1.1" fill={WOOD_LINE} attrs={(f) => ({ cx: n(f.j.knL[0]), cy: n(f.j.knL[1]) })} />
            <Rig as="circle" frame={frame} r="1.1" fill={WOOD_LINE} attrs={(f) => ({ cx: n(f.j.knR[0]), cy: n(f.j.knR[1]) })} />

            {/* tunic, drawn around the pelvis and leaned with the torso */}
            <Rig as="g" frame={frame}
              attrs={(f) => ({ transform: `${place(f.j.pelvis, f.p.torso)} scale(1 ${n(f.p.squash * 100) / 100})` })}>
              <path d="M-11.5 -25 Q0 -28.5 11.5 -25 L7.5 -9 L13 4.5 L6.5 1.5 L0 7 L-6.5 1.5 L-13 4.5 L-7.5 -9 Z" {...cloth} />
              <path d="M0 -21.5 L3.6 -15.5 L0 -9.5 L-3.6 -15.5 Z" fill={VELVET} />
              <path d="M-7.3 -9 Q0 -6.6 7.3 -9" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
            </Rig>

            {/* arms: sleeve, forearm, hand */}
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.elL, f.j.haL, 2.6, 2.1) })} {...limb} />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.elR, f.j.haR, 2.6, 2.1) })} {...limb} />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.shL, f.j.elL, 4, 3.2) })} {...cloth} />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.shR, f.j.elR, 4, 3.2) })} {...cloth} />
            <Rig as="circle" frame={frame} r="3" {...limb} attrs={(f) => ({ cx: n(f.j.haL[0]), cy: n(f.j.haL[1]) })} />
            <Rig as="circle" frame={frame} r="3" {...limb} attrs={(f) => ({ cx: n(f.j.haR[0]), cy: n(f.j.haR[1]) })} />

            {/* ruff + head */}
            <Rig as="g" frame={frame} attrs={(f) => ({ transform: place(f.j.chest, f.p.torso) })}>
              {[-8, -4, 0, 4, 8].map((x) => (
                <circle key={x} cx={x} cy={-0.5 - Math.abs(x) * 0.12} r="2.7" fill="#fbf5ff" stroke="#6b21a8" strokeWidth="0.5" />
              ))}
            </Rig>
            <Rig as="g" frame={frame} attrs={(f) => ({ transform: place(f.j.headC, f.p.head) })}>
              <path d="M-9.6 -5.4 C-5 -9.4 6 -9.4 9.6 -5.4 L2.6 -25 Z" fill={VELVET} stroke="#3b0764" strokeWidth="0.8" strokeLinejoin="round" />
              <circle r="11" fill={WOOD} stroke={WOOD_LINE} strokeWidth="0.9" />
              <path d="M-10.4 -3.6 C-5 -8.6 5 -8.6 10.4 -3.6 C5 -6.2 -5 -6.2 -10.4 -3.6 Z" fill={GOLD} stroke={WOOD_LINE} strokeWidth="0.5" />
              <path d="M-10.2 -4.2 C-6 -12.6 6 -12.6 10.2 -4.2 C5 -8 -5 -8 -10.2 -4.2 Z" fill={VELVET} stroke="#3b0764" strokeWidth="0.6" />
              <circle cx="2.6" cy="-25.4" r="2.5" fill={GOLD} stroke={WOOD_LINE} strokeWidth="0.5" />
              <circle cx="-5.6" cy="3.6" r="2.3" fill="#e47d6c" opacity="0.85" />
              <circle cx="5.6" cy="3.6" r="2.3" fill="#e47d6c" opacity="0.85" />
              <circle cx="-3.8" cy="-0.4" r="1.2" fill="#3b1d0a" />
              <circle cx="3.8" cy="-0.4" r="1.2" fill="#3b1d0a" />
              <path d="M-3 4.8 Q0 7.4 3 4.8" fill="none" stroke="#3b1d0a" strokeWidth="0.9" strokeLinecap="round" />
            </Rig>

            </g>

            {/* ---- Strings, bars, and the hand that holds them ---- */}
            <Rig frame={frame} attrs={(f) => ({ d: line(f.kneeL, f.w.knL) + line(f.kneeR, f.w.knR) })} {...string} opacity="0.6" />
            <Rig frame={frame} attrs={(f) => ({ d: line(f.tieL, f.earL) + line(f.tieR, f.earR) })} {...string} />
            <Rig frame={frame} attrs={(f) => ({ d: line(f.barL, f.w.haL) + line(f.barR, f.w.haR) })} {...string} />
            <Rig frame={frame} attrs={(f) => ({ d: capsule([f.barC[0] + 4, -6], [f.barC[0], f.barC[1] - 1], 6.5, 4.5) })} fill="#1a0a30" />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.kneeL, f.kneeR, 1.5) })} fill="#a8763e" stroke={WOOD_LINE} strokeWidth="0.6" />
            <Rig frame={frame} attrs={(f) => ({ d: line(f.barC, f.kneeC) })} stroke={WOOD_LINE} strokeWidth="1.6" />
            <Rig frame={frame} attrs={(f) => ({ d: capsule(f.barL, f.barR, 2) })} fill="#c8965a" stroke={WOOD_LINE} strokeWidth="0.7" />

            {/* Footlight wash on the boards */}
            <motion.rect x="38" y="140" width="308" height="40" fill="url(#theatre-club-footglow)" initial="rested" animate={state} variants={lightUp(0.5)} />

            {/* Curtains: gathered to the wings once parted */}
            <motion.g initial="rested" animate={state} variants={curtain} style={{ originX: 0 }}>
              <path d={`M38 12 H192 V172 ${Array.from({ length: 11 }, () => 'q-7 6 -14 0').join(' ')} Z`} fill="url(#theatre-club-velvet)" />
              <path d={`M192 172 ${Array.from({ length: 11 }, () => 'q-7 6 -14 0').join(' ')}`} fill="none" stroke={GOLD} strokeWidth="1.4" />
            </motion.g>
            <motion.g initial="rested" animate={state} variants={curtain} style={{ originX: 1 }}>
              <path d={`M346 12 H192 V172 ${Array.from({ length: 11 }, () => 'q7 6 14 0').join(' ')} Z`} fill="url(#theatre-club-velvet)" />
              <path d={`M192 172 ${Array.from({ length: 11 }, () => 'q7 6 14 0').join(' ')}`} fill="none" stroke={GOLD} strokeWidth="1.4" />
            </motion.g>

            {/* Valance */}
            <path d={VALANCE} fill="#6b21a8" />
            <path d={VALANCE} fill="url(#theatre-club-velvet)" opacity="0.35" />
            <path d={FRINGE} fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Apron and footlights */}
          <rect x="38" y="12" width="308" height="168" fill="none" stroke={GOLD} strokeWidth="1.2" />
          {[72, 134, 196, 258, 320].map((x) => (
            <g key={x}>
              <path d={`M${x - 6} 186 a6 6 0 0 1 12 0 Z`} fill="#12051c" />
              <motion.path d={`M${x - 4} 186 a4 4 0 0 1 8 0 Z`} fill="#fde68a" initial="rested" animate={state} variants={lightUp(1)} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
