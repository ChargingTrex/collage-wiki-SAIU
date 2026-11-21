// src/components/clubs/ArtHero.jsx
//
// Art Club: a splash of paint that turns into art.
//
// A loaded brush is flicked three times at a sheet of watercolor paper
// taped to the page. Each flick lands as a wet splat with flying droplets:
// fuchsia, then violet, then sky. Then the accident becomes the painting:
// every splat's ragged outline relaxes into the petals of a flower, a pale
// wash bleeds in behind, stems and leaves are brushed up from the bottom,
// the dark centers are dotted in, and a pencil signature closes it. The
// droplets stay where they fell, because loose watercolor florals keep
// their splatter. What rests on the card is the finished painting.
//
// Why this and not a brush icon: the club's act is turning a mess of
// pigment into a picture, so the motion is exactly that transformation.
//
// How the morph works: a splat and its flower are the same closed curve
// sampled at the same number of points around the same center (only the
// radius function differs), so Framer Motion can interpolate the `d`
// strings directly. Everything is generated once at module load from fixed
// seeds, never in render, so server and client markup match.
//
// Color: the card is paper in both site themes, so the heading uses the
// accent's `light` (dark-ink) variant, which unified mode turns black. The
// three paint colors are the concept and deliberately ignore unified mode
// (see docs-internal/animation-caveats.md).

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import styles from './ArtHero.module.css';

const TOTAL = 4.3; // seconds, the whole intro

// ---------------------------------------------------------------------------
// Timeline helper. Each property gets a list of [time in seconds, value,
// ease into this keyframe]; the helper pads it to the full TOTAL so every
// element holds its first value until its cue and its last value after.
function seq(props) {
  const out = {};
  const transition = {};
  Object.entries(props).forEach(([key, frames]) => {
    const f = frames.slice();
    if (f[0][0] > 0) f.unshift([0, f[0][1]]);
    if (f[f.length - 1][0] < TOTAL) f.push([TOTAL, f[f.length - 1][1]]);
    out[key] = f.map((x) => x[1]);
    transition[key] = {
      duration: TOTAL,
      times: f.map((x) => x[0] / TOTAL),
      ease: f.slice(1).map((x) => x[2] || 'linear'),
    };
  });
  return { ...out, transition };
}
const REST = { duration: 0.3 };
const OUT = [0.16, 1, 0.3, 1];

// ---------------------------------------------------------------------------
// Geometry, generated once from fixed seeds.
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const POINTS = 72;
const f1 = (n) => n.toFixed(1);

// Closed smooth curve through points (Catmull-Rom converted to cubics).
// Always POINTS segments, so any two of these can be morphed.
function closedPath(pts) {
  const n = pts.length;
  let d = `M ${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return `${d} Z`;
}

function radial(fn) {
  const pts = [];
  for (let i = 0; i < POINTS; i += 1) {
    const a = (i / POINTS) * Math.PI * 2;
    const r = fn(a);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return closedPath(pts);
}

const angDiff = (a, b) => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};

// A splat: a fat core with a handful of thrown-out fingers.
function splatPath(R, seed) {
  const rand = makeRng(seed);
  const spikes = [];
  const count = 6;
  for (let j = 0; j < count; j += 1) {
    spikes.push({
      a: ((j + rand() * 0.8) / count) * Math.PI * 2,
      amp: 0.12 + rand() * rand() * 0.75,
      w: 0.17 + rand() * 0.14,
    });
  }
  const wob = rand() * 6;
  return radial((a) => {
    let r = 0.68 + 0.06 * Math.sin(a * 3 + wob) + 0.03 * Math.sin(a * 7 + wob * 2);
    spikes.forEach((s) => {
      const d = angDiff(a, s.a) / s.w;
      // exp(-d^4): fingers with rounded, blobby ends rather than thorns.
      r += s.amp * Math.exp(-d * d * d * d);
    });
    return r * R * 0.84;
  });
}

// A five-petalled flower seen from the front, each petal a little uneven.
const PETALS = 5;
function flowerPath(R, seed, phase) {
  const rand = makeRng(seed);
  const sizes = Array.from({ length: PETALS }, () => 0.88 + rand() * 0.2);
  return radial((a) => {
    const t = (((a - phase) / (Math.PI * 2)) * PETALS + PETALS * 4) % PETALS;
    const k = Math.floor(t);
    const u = t - k - 0.5; // -0.5..0.5 across one petal
    const lobe = Math.cos(Math.PI * u) ** 0.5;
    return R * (0.3 + 0.7 * lobe * sizes[k]);
  });
}

// One petal as a teardrop pointing along +x from the flower's center.
function petalPath(R, k) {
  const L = R * (0.9 + (k % 2) * 0.08);
  const w = R * 0.46;
  return `M 0,0 C ${f1(L * 0.25)},${f1(-w)} ${f1(L * 0.92)},${f1(-w * 0.95)} ${f1(L)},0 C ${f1(L * 0.92)},${f1(w * 0.95)} ${f1(L * 0.25)},${f1(w)} 0,0 Z`;
}

function droplets(R, seed, count) {
  const rand = makeRng(seed);
  return Array.from({ length: count }, (_, i) => {
    const a = ((i + rand() * 0.8) / count) * Math.PI * 2;
    const dist = R * (1.2 + rand() * 0.95);
    return {
      x: Math.cos(a) * dist,
      y: Math.sin(a) * dist,
      r: 0.7 + rand() * rand() * 2.4,
      late: rand() * 0.08,
    };
  });
}

// The three flowers. `land` is when the splat hits, `bloom` when it starts
// relaxing into petals.
const FLOWERS = [
  { id: 'a', cx: 226, cy: 74, R: 42, light: '#e879f9', mid: '#c026d3', deep: '#86198f', land: 0.4, bloom: 1.5, phase: -1.57, seed: 11, drops: 11 },
  { id: 'b', cx: 148, cy: 110, R: 30, light: '#a78bfa', mid: '#7c3aed', deep: '#4c1d95', land: 0.72, bloom: 1.75, phase: -1.2, seed: 29, drops: 8 },
  { id: 'c', cx: 299, cy: 112, R: 27, light: '#67c8f5', mid: '#0ea5e9', deep: '#075985', land: 1.02, bloom: 2.0, phase: -1.9, seed: 53, drops: 8 },
].map((f) => ({
  ...f,
  splat: splatPath(f.R, f.seed),
  flower: flowerPath(f.R, f.seed + 1, f.phase),
  petals: Array.from({ length: PETALS }, (_, k) => ({
    d: petalPath(f.R, k),
    rot: ((f.phase + ((k + 0.5) / PETALS) * Math.PI * 2) * 180) / Math.PI,
    opacity: 0.2 + ((k * 2) % 3) * 0.07,
  })),
  // Keep the spatter on the art side of the card and inside the frame.
  drops: droplets(f.R, f.seed + 2, f.drops).filter(
    (d) => f.cx + d.x > 12 && f.cx + d.x < 356 && f.cy + d.y > 6 && f.cy + d.y < 186
  ),
  stamens: Array.from({ length: 7 }, (_, k) => {
    const a = (k / 7) * Math.PI * 2 + f.seed;
    return { x: Math.cos(a) * f.R * 0.24, y: Math.sin(a) * f.R * 0.24 };
  }),
}));

// Stems, drawn from the gathered base up into the back of each flower.
const STEM_T = 2.55;
const STEMS = [
  { d: 'M 215,173 C 212,150 227,128 225,100', w: 2.6, t: STEM_T },
  { d: 'M 212,173 C 199,153 174,142 157,126', w: 2.3, t: STEM_T + 0.12 },
  { d: 'M 218,173 C 237,157 270,149 289,130', w: 2.3, t: STEM_T + 0.24 },
  { d: 'M 130,92 C 122,82 114,72 109,62', w: 1.6, t: STEM_T + 0.5 },
  { d: 'M 306,92 C 312,78 318,64 322,52', w: 1.6, t: STEM_T + 0.58 },
];

const LEAVES = [
  { x: 215, y: 150, rot: -152, len: 30, fill: '#3f7f5f', t: 3.0 },
  { x: 220, y: 138, rot: -28, len: 25, fill: '#5b9a57', t: 3.1 },
  { x: 190, y: 148, rot: 152, len: 23, fill: '#5b9a57', t: 3.16 },
  { x: 250, y: 153, rot: 24, len: 27, fill: '#3f7f5f', t: 3.22 },
  { x: 268, y: 145, rot: -62, len: 19, fill: '#6aa75f', t: 3.3 },
];
const leafPath = (len) =>
  `M 0,0 C ${f1(len * 0.25)},${f1(-len * 0.3)} ${f1(len * 0.72)},${f1(-len * 0.28)} ${f1(len)},0 C ${f1(len * 0.7)},${f1(len * 0.2)} ${f1(len * 0.25)},${f1(len * 0.22)} 0,0 Z`;

const BUDS = [
  { x: 108, y: 59, rot: -118, fill: '#8b5cf6', deep: '#5b21b6', t: 3.25 },
  { x: 322, y: 49, rot: -72, fill: '#d946ef', deep: '#a21caf', t: 3.33 },
];

// Three colour tests dabbed on the page before each flick.
const SWATCHES = [
  { d: 'M 22,40 C 30,37 40,42 50,38', c: '#c026d3', t: 0.12 },
  { d: 'M 26,56 C 34,53 44,58 54,54', c: '#7c3aed', t: 0.5 },
  { d: 'M 22,72 C 30,69 40,74 50,70', c: '#0ea5e9', t: 0.8 },
];

// The brush lies pointing at the sheet; it flicks once per splat.
const BRUSH_ROTATE = FLOWERS.flatMap((f) => [
  [f.land - 0.2, -16, 'easeOut'],
  [f.land - 0.02, 9, [0.5, 0, 0.9, 0.4]],
  [f.land + 0.22, 0, 'easeOut'],
]);

export function ArtHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('art-club');
  const state = isPlaying ? 'playing' : 'rested';

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl shadow-md`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          {/* Paper card in both themes, so the fixed "light" (dark-ink)
              accent always; unified mode makes it black. */}
          <h1 className="text-3xl font-bold" style={{ color: accent.light }}>
            Art Club
          </h1>
          <p className="mb-0 mt-1 text-stone-700">Unleashing creativity through visual arts.</p>
        </div>

        <svg
          key={isReplaying ? 'replay' : 'intro'}
          viewBox="0 0 364 192"
          preserveAspectRatio="xMaxYMid meet"
          className={styles.art}
          role="img"
          aria-label="Splashes of fuchsia, violet and blue paint land on a taped sheet of paper and bloom into a watercolor painting of three flowers"
        >
          <defs>
            {/* Wet edge: a low-frequency warp so no outline is geometric,
                then fine grain knocked out of the alpha so pigment sits in
                the paper's tooth. Bounded to the painted area. */}
            <filter id="art-club-wet" filterUnits="userSpaceOnUse" x="0" y="0" width="364" height="192">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="warp" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="wet" />
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" result="grain" />
              <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.75 1.28" result="tooth" />
              <feComposite in="wet" in2="tooth" operator="in" />
            </filter>
            <filter id="art-club-bleed" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id="art-club-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            {FLOWERS.map((f) => (
              <linearGradient key={f.id} id={`art-club-petal-${f.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0.1" stopColor={f.mid} stopOpacity="0.05" />
                <stop offset="0.7" stopColor={f.mid} stopOpacity="0.5" />
                <stop offset="1" stopColor={f.deep} stopOpacity="0.62" />
              </linearGradient>
            ))}
          </defs>

          {/* The sheet, taped to the page at a slight angle. Static. */}
          <g transform="rotate(-1.2 213 96)">
            <rect x="82" y="16" width="266" height="168" fill="#3b2a14" opacity="0.28" filter="url(#art-club-shadow)" />
            <rect x="80" y="12" width="266" height="168" fill="#fffdf8" />
            <rect x="80" y="12" width="266" height="168" fill="none" stroke="#d9cdb6" strokeWidth="0.6" />
          </g>

          {/* Pale wash that bleeds in behind the flowers as they bloom. */}
          <motion.g
            filter="url(#art-club-bleed)"
            initial="rested"
            animate={state}
            variants={{
              rested: { opacity: 1, transition: REST },
              playing: seq({ opacity: [[1.5, 0], [2.9, 1, 'easeOut']] }),
            }}
          >
            <ellipse cx="222" cy="84" rx="66" ry="42" fill="#f5d0fe" opacity="0.5" />
            <ellipse cx="160" cy="118" rx="42" ry="26" fill="#ddd6fe" opacity="0.45" />
            <ellipse cx="292" cy="118" rx="38" ry="26" fill="#bae6fd" opacity="0.45" />
            <ellipse cx="226" cy="150" rx="46" ry="16" fill="#d9f2c4" opacity="0.5" />
          </motion.g>

          <g filter="url(#art-club-wet)">
            {/* Stems and leaves, under the flowers. */}
            {STEMS.map((s) => (
              <motion.path
                key={s.d}
                d={s.d}
                fill="none"
                stroke="#4a8a5c"
                strokeWidth={s.w}
                strokeLinecap="round"
                opacity="0.85"
                initial="rested"
                animate={state}
                variants={{
                  rested: { pathLength: 1, opacity: 0.85, transition: REST },
                  playing: seq({
                    pathLength: [[s.t, 0], [s.t + 0.55, 1, OUT]],
                    opacity: [[s.t - 0.01, 0], [s.t, 0.85]],
                  }),
                }}
              />
            ))}
            {LEAVES.map((l) => (
              <g key={l.t} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
                <motion.g
                  style={{ originX: 0, originY: 0.5 }}
                  initial="rested"
                  animate={state}
                  variants={{
                    rested: { scale: 1, opacity: 1, transition: REST },
                    playing: seq({
                      scale: [[l.t, 0.1], [l.t + 0.45, 1, OUT]],
                      opacity: [[l.t, 0], [l.t + 0.08, 1]],
                    }),
                  }}
                >
                  <path d={leafPath(l.len)} fill={l.fill} opacity="0.72" />
                  <path d={`M 2,0 L ${f1(l.len * 0.86)},0`} stroke="#2f5f47" strokeWidth="0.7" opacity="0.5" strokeLinecap="round" />
                </motion.g>
              </g>
            ))}
            {BUDS.map((b) => (
              <g key={b.t} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`}>
                <motion.g
                  style={{ originX: 0, originY: 0.5 }}
                  initial="rested"
                  animate={state}
                  variants={{
                    rested: { scale: 1, opacity: 1, transition: REST },
                    playing: seq({
                      scale: [[b.t, 0.1], [b.t + 0.4, 1, OUT]],
                      opacity: [[b.t, 0], [b.t + 0.08, 1]],
                    }),
                  }}
                >
                  <path d="M 0,0 C 3,-6 10,-6 14,0 C 10,6 3,6 0,0 Z" fill={b.fill} opacity="0.78" />
                  <path d="M 5,-3.6 C 8,-1.5 8,1.5 5,3.6" fill="none" stroke={b.deep} strokeWidth="0.8" opacity="0.6" />
                  <path d="M -1,0 C 1,-3.4 4,-3.6 6,-2.6 C 4,-1 4,1 6,2.6 C 4,3.6 1,3.4 -1,0 Z" fill="#3f7f5f" opacity="0.85" />
                </motion.g>
              </g>
            ))}

            {/* The splats, and what they become. */}
            {FLOWERS.map((f) => {
              const end = f.bloom + 0.85;
              return (
                <g key={f.id} transform={`translate(${f.cx} ${f.cy})`}>
                  {f.drops.map((d, i) => (
                    <motion.circle
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      cx={f1(d.x)}
                      cy={f1(d.y)}
                      r={f1(d.r)}
                      fill={f.mid}
                      opacity="0.72"
                      initial="rested"
                      animate={state}
                      variants={{
                        rested: { x: 0, y: 0, scale: 1, opacity: 0.72, transition: REST },
                        playing: seq({
                          x: [[f.land, -d.x * 0.85], [f.land + 0.3 + d.late, 0, OUT]],
                          y: [[f.land, -d.y * 0.85], [f.land + 0.3 + d.late, 0, OUT]],
                          scale: [[f.land - 0.01, 0], [f.land, 1]],
                          opacity: [[f.land - 0.01, 0], [f.land, 0.72]],
                        }),
                      }}
                    />
                  ))}

                  {/* One outline: lands as the splat, relaxes into the
                      flower, thinning from fresh paint to a pale wash. */}
                  <motion.path
                    stroke={f.mid}
                    strokeWidth="0.9"
                    strokeOpacity="0.55"
                    initial="rested"
                    animate={state}
                    variants={{
                      rested: { d: f.flower, scale: 1, rotate: 0, opacity: 1, fill: f.light, fillOpacity: 0.62, transition: REST },
                      playing: seq({
                        d: [[f.bloom, f.splat], [end, f.flower, [0.5, 0, 0.2, 1]]],
                        scale: [[f.land - 0.01, 0], [f.land, 0.25], [f.land + 0.14, 1.07, OUT], [f.land + 0.34, 1, 'easeInOut']],
                        opacity: [[f.land - 0.01, 0], [f.land, 1]],
                        rotate: [[f.bloom, -32], [end, 0, [0.5, 0, 0.2, 1]]],
                        fill: [[f.bloom, f.mid], [end, f.light, 'easeInOut']],
                        fillOpacity: [[f.bloom, 0.9], [end, 0.62, 'easeInOut']],
                      }),
                    }}
                  />

                  {/* Petals: darker glazes over the wash. */}
                  <motion.g
                    initial="rested"
                    animate={state}
                    variants={{
                      rested: { opacity: 1, scale: 1, rotate: 0, transition: REST },
                      playing: seq({
                        opacity: [[f.bloom + 0.25, 0], [end + 0.2, 1, 'easeOut']],
                        scale: [[f.bloom + 0.25, 0.45], [end + 0.2, 1, OUT]],
                        rotate: [[f.bloom + 0.25, -24], [end + 0.2, 0, OUT]],
                      }),
                    }}
                  >
                    {f.petals.map((p) => (
                      <path
                        key={p.rot}
                        d={p.d}
                        transform={`rotate(${f1(p.rot)})`}
                        fill={`url(#art-club-petal-${f.id})`}
                        stroke={f.mid}
                        strokeWidth="0.6"
                        strokeOpacity="0.35"
                        opacity={0.75 + p.opacity}
                      />
                    ))}
                    {f.petals.map((p) => (
                      <path
                        key={`v${p.rot}`}
                        d={`M ${f1(f.R * 0.2)},0 Q ${f1(f.R * 0.5)},${f1(-f.R * 0.05)} ${f1(f.R * 0.72)},0`}
                        transform={`rotate(${f1(p.rot)})`}
                        fill="none"
                        stroke={f.deep}
                        strokeWidth="0.7"
                        strokeLinecap="round"
                        opacity="0.32"
                      />
                    ))}
                  </motion.g>

                  {/* The dark heart, dotted in last. */}
                  <motion.g
                    initial="rested"
                    animate={state}
                    variants={{
                      rested: { scale: 1, opacity: 1, transition: REST },
                      playing: seq({
                        scale: [[end + 0.35, 0], [end + 0.65, 1, [0.34, 1.4, 0.64, 1]]],
                        opacity: [[end + 0.35, 0], [end + 0.4, 1]],
                      }),
                    }}
                  >
                    <circle r={f.R * 0.3} fill="#fff7d6" opacity="0.7" />
                    <circle r={f.R * 0.15} fill="#2e1065" opacity="0.88" />
                    {f.stamens.map((s) => (
                      <circle key={s.x} cx={f1(s.x)} cy={f1(s.y)} r={Math.max(1, f.R * 0.045)} fill="#f59e0b" />
                    ))}
                  </motion.g>
                </g>
              );
            })}
          </g>

          {/* Pencil signature, bottom right of the sheet. */}
          <motion.path
            d="M 302,170 c 2,-7 6,-7 4,0 c 3,-6 6,-5 5,0 c 3,-4 4,-3 7,-1 c 3,2 6,-1 12,-2"
            fill="none"
            stroke="#57534e"
            strokeWidth="0.8"
            strokeLinecap="round"
            initial="rested"
            animate={state}
            variants={{
              rested: { pathLength: 1, opacity: 0.8, transition: REST },
              playing: seq({
                pathLength: [[3.75, 0], [4.25, 1, 'easeInOut']],
                opacity: [[3.74, 0], [3.75, 0.8]],
              }),
            }}
          />

          {/* Masking tape on the top corners. */}
          <g opacity="0.9">
            <rect x="-17" y="-5.5" width="34" height="11" transform="translate(84 17) rotate(-40)" fill="#ead7a4" />
            <rect x="-17" y="-5.5" width="34" height="11" transform="translate(343 12) rotate(38)" fill="#ead7a4" />
          </g>

          {/* Test dabs on the page beside the sheet: the palette, mixed. */}
          <g filter="url(#art-club-wet)">
            {SWATCHES.map((w) => (
              <motion.path
                key={w.d}
                d={w.d}
                fill="none"
                stroke={w.c}
                strokeWidth="7"
                strokeLinecap="round"
                initial="rested"
                animate={state}
                variants={{
                  rested: { pathLength: 1, opacity: 0.7, transition: REST },
                  playing: seq({
                    pathLength: [[w.t, 0], [w.t + 0.3, 1, OUT]],
                    opacity: [[w.t - 0.01, 0], [w.t, 0.7]],
                  }),
                }}
              />
            ))}
          </g>

          {/* The brush, resting where the last flick left it. */}
          <g transform="translate(10 184) rotate(-38)">
            <motion.g
              style={{ originX: 0, originY: 0.5 }}
              initial="rested"
              animate={state}
              variants={{
                rested: { rotate: 0, transition: REST },
                playing: seq({ rotate: [[0.1, 0], ...BRUSH_ROTATE] }),
              }}
            >
              <path d="M 0,-1.3 L 52,-3 L 52,3 L 0,1.3 Z" fill="#9a3412" />
              <path d="M 0,-1.3 L 52,-3 L 52,-1.2 L 0,-0.4 Z" fill="#c2571f" />
              <rect x="52" y="-3.4" width="13" height="6.8" rx="1" fill="#b8b2a7" />
              <rect x="52" y="-3.4" width="13" height="2.2" rx="1" fill="#dedad2" />
              <path d="M 65,-3.2 C 72,-4.6 80,-2.4 86,0 C 80,2.4 72,4.6 65,3.2 Z" fill="#a21caf" />
              <path d="M 65,-3.2 C 72,-4.6 80,-2.4 86,0 C 78,-0.6 70,-1 65,-0.6 Z" fill="#d946ef" />
            </motion.g>
          </g>
        </svg>
      </div>
    </div>
  );
}
