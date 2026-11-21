// src/components/clubs/FashionHero.jsx
//
// Fashion Club — a designer's plate comes alive. A croquis (the elongated
// nine-heads figure every fashion sketch starts from) is inked in gold on
// its plumb line; a watercolour wash blooms into a gown, its train
// unfurling behind; then the sketch shifts its weight into a pose, hand to
// hip, one leg through the slit, and a camera flash catches it. The card
// rests on that finished illustration.
//
// Why this and not the old two garment outlines: those were the roughest
// drawings in the set (animation-caveats §11), and garments with nobody in
// them say "shop". Design is the path from a line on paper to a person
// wearing it, so the hero shows that path: ink, wash, pose, photograph.
//
// The figure is the shared rig (./rig), drawn as ink line rather than
// silhouette: each limb is one open outline through its joints, so there
// are no construction marks at knees and elbows. The gown, its fold lines
// and its train are computed from the same joints, so the cloth moves when
// the hips do; the train swings past and settles.
//
// Gold is not the club accent here: metallic ink is the whole look, so it
// is a fixed gold and survives unified mode (animation-caveats §10). The
// accent colours the heading and the gown's wash.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { Rig, useRigClock, useRigFrame } from './rig/RigParts';
import { POSE0, clamp, makeTimeline, mix, n, place, pt, reach, shift, solve } from './rig/rig';
import styles from './FashionHero.module.css';

const FLOOR = 180;
const SKIN = '#6d1230'; // a tone just off the card, so limbs read as form, not cut-outs
const GOLD = 'url(#fashion-club-gold)';

const BODY = {
  torso: 35, neck: 7.5, headR: 7.6,
  shoulderW: 23, hipW: 14,
  upperArm: 24, foreArm: 23,
  thigh: 43, shin: 45, foot: 10,
};

// ink: the outline being drawn. bloom: the wash spreading. train: the train
// unfurling. w: hand travelling to the hip. sway: the train swinging.
const PLATE = makeTimeline([
  { t: 0, x: 208, torso: 0, head: 0, shTilt: 0, hipTilt: 0, laU: -8, laF: -3, raU: 8, raF: 3, llT: -2.5, llS: 0, rlT: 2.5, rlS: 0, lf: -14, rf: 14, ink: 0, bloom: 0, train: 0.25, w: 0, sway: 0, fold: 0 },
  { t: 1.25, ink: 0.86, bloom: 0, train: 0.25 },
  { t: 1.5, ink: 1 },
  { t: 2.5, bloom: 1, train: 1, fold: 0, x: 208, torso: 0, head: 0, shTilt: 0, hipTilt: 0, w: 0, sway: 0, laU: -8, laF: -3, raU: 8, raF: 3, rlT: 2.5, rlS: 0, rf: 14, llT: -2.5, llS: 0 },
  { t: 3.0, sway: 9 },
  { t: 3.35, x: 205, torso: -2, head: 9, shTilt: -7, hipTilt: 9, w: 1, raU: 18, raF: 8, rlT: 16, rlS: 8, rf: 40, llT: 3, llS: -2, fold: 1, sway: -5 },
  { t: 3.75, sway: 3, head: 11, shTilt: -8 },
  { t: 4.3, sway: 0, head: 10, shTilt: -7 },
]);
const DURATION = PLATE.duration;

const norm = (a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 0.001;
  return [-dy / len, dx / len];
};
const off = (p, v, r) => [p[0] + v[0] * r, p[1] + v[1] * r];

// One open ink outline around a two-segment limb: down one side, round the
// tip, back up the other. Open at the root, so it joins the body cleanly.
function limb(a, b, c, r0, r1, r2) {
  const n1 = norm(a, b);
  const n2 = norm(b, c);
  const m = [n1[0] + n2[0], n1[1] + n2[1]];
  const ml = Math.hypot(m[0], m[1]) || 1;
  const nm = [m[0] / ml, m[1] / ml];
  return (
    `M${pt(off(a, n1, r0))}Q${pt(off(b, nm, r1 * 1.08))} ${pt(off(c, n2, r2))}` +
    `A${r2} ${r2} 0 0 0 ${pt(off(c, n2, -r2))}` +
    `Q${pt(off(b, nm, -r1 * 1.08))} ${pt(off(a, n1, -r0))}`
  );
}

function scene(t) {
  const k = PLATE(t);
  const p = { ...POSE0, ...k };
  const j = solve({ ...p, y: 0 }, BODY);
  shift(j, 0, FLOOR - Math.max(j.toeL[1], j.toeR[1]) - 0.6);

  // Hand to hip.
  const hip = [j.hipL[0] - 6.5, j.hipL[1] - 5];
  const arm = reach(j.shL, mix(j.haL, hip, k.w), BODY.upperArm, BODY.foreArm, 1);
  j.elL = arm.mid;
  j.haL = arm.tip;

  // Body outline: shoulders, waist, hips.
  const C = j.chest;
  const P = j.pelvis;
  const sl = Math.hypot(j.shR[0] - j.shL[0], j.shR[1] - j.shL[1]) || 1;
  const s = [(j.shR[0] - j.shL[0]) / sl, (j.shR[1] - j.shL[1]) / sl];
  const at = (u, half) => {
    const c = mix(C, P, u);
    return [off(c, s, -half), off(c, s, half)];
  };
  const [bl, br] = at(0.24, 8.2);
  const [wl, wr] = at(0.62, 5.4);
  const hl = [j.hipL[0] - 4.6, j.hipL[1] + 1];
  const hr = [j.hipR[0] + 4.6, j.hipR[1] + 1];
  const body =
    `M${pt(j.shL)}Q${pt(mix(j.shL, wl, 0.45))} ${pt(wl)}Q${pt([hl[0] - 1, mix(wl, hl, 0.5)[1]])} ${pt(hl)}` +
    `L${pt(hr)}Q${pt([hr[0] + 1, mix(wr, hr, 0.5)[1]])} ${pt(wr)}Q${pt(mix(j.shR, wr, 0.45))} ${pt(j.shR)}`;

  // The gown, from the same joints: bodice, hip, a slit over the front
  // leg, and a train that trails to the left.
  const dip = mix(C, P, 0.36);
  const slit = [mix(j.hipR, j.knR, 0.5)[0] + 5.5, mix(j.hipR, j.knR, 0.5)[1]];
  const hemR = [P[0] - 3 + k.sway * 0.3, FLOOR];
  const tip = [P[0] - 26 - 62 * k.train + k.sway, FLOOR - 0.5];
  const backMid = [P[0] - 13 - 15 * k.train + k.sway * 0.45, mix(P, [0, FLOOR], 0.58)[1]];
  const gown =
    `M${pt(bl)}Q${pt(dip)} ${pt(br)}L${pt(wr)}Q${pt([hr[0] + 0.5, mix(wr, hr, 0.5)[1]])} ${pt(hr)}` +
    `Q${pt([slit[0] + 3, mix(hr, slit, 0.5)[1]])} ${pt(slit)}` +
    `Q${pt([slit[0] - 1, mix(slit, hemR, 0.55)[1]])} ${pt(hemR)}` +
    `Q${pt([mix(hemR, tip, 0.35)[0], FLOOR + 3.5])} ${pt(mix(hemR, tip, 0.6))}T${pt(tip)}` +
    `Q${pt([backMid[0] - 12, FLOOR - 9])} ${pt(backMid)}` +
    `Q${pt([hl[0] - 5, mix(hl, backMid, 0.45)[1]])} ${pt(hl)}Q${pt([hl[0] - 0.5, mix(wl, hl, 0.5)[1]])} ${pt(wl)}Z`;
  const folds =
    `M${pt([hl[0] + 4, hl[1] + 8])}Q${pt([backMid[0] + 7, backMid[1] + 2])} ${pt([tip[0] + 26, FLOOR - 2.5])}` +
    `M${pt([P[0] - 1, P[1] + 12])}Q${pt([P[0] - 9 + k.sway * 0.3, mix(P, [0, FLOOR], 0.6)[1]])} ${pt([P[0] - 24 + k.sway * 0.6, FLOOR - 1.5])}` +
    `M${pt([hr[0] - 4, hr[1] + 8])}Q${pt([slit[0] - 6, slit[1] + 12])} ${pt([hemR[0] - 5, FLOOR - 1.5])}`;
  return { k, p, j, body, gown, folds, waist: mix(C, P, 0.62) };
}

// Each part's share of the inking, as a dash offset (1 = undrawn).
const inked = (ink, from, to) => n(100 - clamp((ink - from) / (to - from), 0, 1) * 100) / 100;

export function FashionHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('fashion-club');
  const state = isPlaying ? 'playing' : 'rested';
  const clock = useRigClock(isPlaying, isReplaying, DURATION);
  const frame = useRigFrame(clock, scene);

  const ink = { fill: SKIN, stroke: GOLD, strokeWidth: 1.15, strokeLinecap: 'round', strokeLinejoin: 'round', pathLength: 1, strokeDasharray: 1 };
  const drawn = (from, to) => (f) => ({ 'stroke-dashoffset': inked(f.k.ink, from, to), 'fill-opacity': n(clamp((f.k.ink - from) / (to - from), 0, 1)) });
  const appear = (delay, to = 1, duration = 0.7) => ({
    rested: { opacity: to },
    playing: { opacity: [0, to], transition: { delay, duration, ease: 'easeOut' } },
  });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl bg-rose-950 text-white shadow-md`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          {/* The card is dark wine in both site themes, so the heading uses
              the fixed "dark" accent rather than the theme-flipping one. */}
          <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
            Fashion Club
          </h1>
          <p className="mt-1" style={{ color: '#fecdd3' }}>
            Setting trends, design, and celebrating style.
          </p>
        </div>

        <svg
          key={isReplaying ? 'replay' : 'intro'}
          viewBox="0 0 364 192"
          className={`${styles.art} pointer-events-none`}
          role="img"
          aria-label="A fashion illustration: a figure is sketched in gold ink, a watercolour gown washes in with a long train, and she strikes a pose as a camera flashes"
        >
          <defs>
            <linearGradient id="fashion-club-gold" x1="150" y1="10" x2="260" y2="185" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="45%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#c8962c" />
            </linearGradient>
            <linearGradient id="fashion-club-wash" x1="190" y1="55" x2="150" y2="182" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={accent.dark} />
              <stop offset="55%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#9d174d" />
            </linearGradient>
            <radialGradient id="fashion-club-bloom">
              <stop offset="55%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="fashion-club-flash" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="45%" stopColor="#fff7e0" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fff7e0" stopOpacity="0" />
            </radialGradient>
            {/* Watercolour edge: a little turbulence pushed through the shape's outline */}
            <filter id="fashion-club-watercolour" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <mask id="fashion-club-reveal" maskUnits="userSpaceOnUse" x="60" y="0" width="304" height="192">
              <Rig as="circle" frame={frame} fill="url(#fashion-club-bloom)"
                attrs={(f) => ({ cx: n(f.waist[0]), cy: n(f.waist[1] + 10), r: n(f.k.bloom * 230) })} />
            </mask>
          </defs>

          {/* A loose wash on the paper behind the figure */}
          <motion.g filter="url(#fashion-club-watercolour)" initial="rested" animate={state} variants={appear(1.1, 1, 1.2)}>
            <path d="M150 34 C196 14 262 22 286 58 C306 90 290 150 250 166 C206 182 150 172 128 138 C108 104 116 52 150 34 Z" fill="#be123c" opacity="0.3" />
          </motion.g>

          {/* Construction: the plumb line and the floor */}
          <motion.g initial="rested" animate={state} variants={appear(0, 1, 0.5)}>
            <path d={`M208 14 V${FLOOR + 4}`} stroke="#d4af37" strokeWidth="0.6" strokeDasharray="1.5 3" opacity="0.5" />
            <path d={`M112 ${FLOOR + 0.5} H300`} stroke="#d4af37" strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />
            <path d="M197 54 H219 M199 126 H217" stroke="#d4af37" strokeWidth="0.6" opacity="0.4" />
          </motion.g>

          {/* Legs, body, neck */}
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: limb(f.j.hipL, f.j.knL, f.j.anL, 6.6, 4.3, 2.2), ...drawn(0.45, 0.95)(f) })} />
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: limb(f.j.anL, mix(f.j.anL, f.j.toeL, 0.5), f.j.toeL, 2.2, 1.8, 0.8), ...drawn(0.85, 1)(f) })} />
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: limb(f.j.hipR, f.j.knR, f.j.anR, 6.6, 4.3, 2.2), ...drawn(0.5, 1)(f) })} />
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: limb(f.j.anR, mix(f.j.anR, f.j.toeR, 0.5), f.j.toeR, 2.2, 1.8, 0.8), ...drawn(0.85, 1)(f) })} />
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: limb(f.j.chest, mix(f.j.chest, f.j.headC, 0.5), f.j.headC, 2.6, 2.2, 2.2), ...drawn(0.1, 0.3)(f) })} />
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: f.body, ...drawn(0.2, 0.6)(f) })} />

          {/* The gown: watercolour wash, then its ink */}
          <g mask="url(#fashion-club-reveal)">
            <g filter="url(#fashion-club-watercolour)">
              <Rig frame={frame} attrs={(f) => ({ d: f.gown })} fill="url(#fashion-club-wash)" />
            </g>
            <Rig frame={frame} attrs={(f) => ({ d: f.gown })} fill="none" stroke={GOLD} strokeWidth="0.9" strokeLinejoin="round" opacity="0.9" />
          </g>
          <Rig frame={frame} fill="none" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" pathLength="1" strokeDasharray="1" opacity="0.8"
            attrs={(f) => ({ d: f.folds, 'stroke-dashoffset': n(100 - f.k.fold * 100) / 100 })} />

          {/* Arms over the gown */}
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: limb(f.j.shR, f.j.elR, f.j.haR, 3, 2.3, 1.5), ...drawn(0.4, 0.85)(f) })} />
          <Rig frame={frame} {...ink} attrs={(f) => ({ d: limb(f.j.shL, f.j.elL, f.j.haL, 3, 2.3, 1.5), ...drawn(0.35, 0.8)(f) })} />

          {/* Head: an oval, a gold chignon, one earring */}
          <Rig as="g" frame={frame} attrs={(f) => ({ transform: place(f.j.headC, f.p.head), opacity: n(clamp(f.k.ink / 0.25, 0, 1)) })}>
            <circle cx="-4.6" cy="-7.4" r="4.4" fill="#d4af37" />
            <ellipse rx="6.1" ry="7.8" fill={SKIN} stroke={GOLD} strokeWidth="1.15" />
            <path d="M-6 -2.5 C-6.5 -8.5 4 -10.5 6 -3.5 C3.5 -6.5 -2.5 -7 -6 -2.5 Z" fill="#d4af37" />
            <circle cx="5.6" cy="3.6" r="1.1" fill="#fde68a" />
          </Rig>

          {/* Pinned swatches: the plate's palette */}
          <motion.g initial="rested" animate={state} variants={appear(2.2, 1, 0.6)}>
            <rect x="304" y="22" width="19" height="19" rx="1" fill="#9d174d" stroke="#d4af37" strokeWidth="0.6" transform="rotate(-7 313 31)" />
            <rect x="318" y="34" width="19" height="19" rx="1" fill={accent.dark} stroke="#d4af37" strokeWidth="0.6" transform="rotate(6 327 43)" />
            <rect x="306" y="49" width="19" height="19" rx="1" fill="#d4af37" stroke="#fde68a" strokeWidth="0.6" transform="rotate(-4 315 58)" />
            <circle cx="320" cy="36" r="1.6" fill="#fde68a" />
          </motion.g>

          {/* The photograph */}
          <motion.ellipse
            cx="214" cy="84" rx="210" ry="150" fill="url(#fashion-club-flash)" style={{ mixBlendMode: 'screen' }}
            initial="rested" animate={state}
            variants={{
              rested: { opacity: 0 },
              playing: { opacity: [0, 0, 0.9, 0.15, 0.5, 0], transition: { duration: 4.3, times: [0, 0.86, 0.875, 0.9, 0.915, 1], ease: 'linear' } },
            }}
          />
        </svg>
      </div>
    </div>
  );
}
