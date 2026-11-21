// src/components/clubs/AstronomyHero.jsx
//
// Astronomy Club — one shot, pulled back out of a telescope:
//   1. We open INSIDE the eyepiece. A round field of view, soft at the lens
//      edge, with Orion in it: the stars start as defocused discs and snap
//      to points (the focus pull every observer does first), then the
//      figure is traced star to star.
//   2. The camera pulls back out of the eyepiece. The round field shrinks
//      until it is the eyepiece of a small refractor, and the night around
//      it is revealed.
//   3. Rest: an observer leaning into that telescope on a low hill above the
//      sea, with the same Orion — same orientation, now small — high in the
//      sky the tube is aimed at.
//
// Why Orion: it is the one constellation nearly everyone can name, it
// stands high in Chennai's winter evening sky, and its sword holds the
// Orion Nebula (the soft smudge below the belt), which is the first thing a
// club telescope gets pointed at.
//
// The sky is not drawn by eye. Every named star is placed from its
// catalogue right ascension and declination (rounded to 0.1 minute) by one projection (east to the left, as
// on a sky chart), used for both the eyepiece view and the small copy in
// the sky, and sized by its real magnitude. The other bright stars of that
// part of the sky (Sirius, Procyon, Aldebaran...) sit where the same
// projection puts them, and the telescope's tube angle is computed from
// where Orion is, so it is aimed at it by construction.
//
// Motion notes
//   - The pull-back is two transforms (the eyepiece disc shrinking onto the
//     telescope, the scene easing back with it) driven by one clock and
//     written as plain `transform` attributes: Framer pivots SVG transforms
//     on each element's bounding box, and the zoom needs fixed pivots. The
//     scale is interpolated geometrically, because a 40x zoom eased
//     linearly lurches at the end.
//   - Everything else (focus pull, lines drawing) is ordinary variants.
//   - No filters anywhere: the defocus is drawn (a wide soft disc per star
//     that collapses), the grain is one static CSS tile.
//   - The sequence runs once (~4.7s) and stops. No twinkle.
//
// Star colours are the stars' own (Betelgeuse is a red supergiant, Rigel a
// blue-white one), independent of the club accent. The accent (Indigo)
// inks the heading and the constellation lines, so unified mode still
// reaches the artwork.

import React, { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import styles from './AstronomyHero.module.css';

const W = 364;
const H = 192;
const r2 = (v) => Math.round(v * 100) / 100;

// ---- The sky ------------------------------------------------------------

// Right ascension in hours, declination in degrees, visual magnitude.
const ORION = {
  betelgeuse: { ra: 5 + 55.2 / 60, dec: 7.41, mag: 0.5, tint: 'warm' },
  bellatrix: { ra: 5 + 25.1 / 60, dec: 6.35, mag: 1.6 },
  meissa: { ra: 5 + 35.1 / 60, dec: 9.93, mag: 3.4 },
  mintaka: { ra: 5 + 32.0 / 60, dec: -0.3, mag: 2.2 },
  alnilam: { ra: 5 + 36.2 / 60, dec: -1.2, mag: 1.7 },
  alnitak: { ra: 5 + 40.8 / 60, dec: -1.94, mag: 1.8 },
  saiph: { ra: 5 + 47.8 / 60, dec: -9.67, mag: 2.1 },
  rigel: { ra: 5 + 14.5 / 60, dec: -8.2, mag: 0.1, tint: 'cool' },
};

// The figure, in the order it is traced.
const FIGURE = [
  ['meissa', 'betelgeuse'],
  ['betelgeuse', 'alnitak'],
  ['alnitak', 'saiph'],
  ['saiph', 'rigel'],
  ['rigel', 'mintaka'],
  ['mintaka', 'bellatrix'],
  ['bellatrix', 'meissa'],
  ['alnitak', 'alnilam'],
  ['alnilam', 'mintaka'],
  ['betelgeuse', 'bellatrix'],
];

// Fainter real stars in and around the figure (eyepiece only), and the
// sword: iota Orionis and the Orion Nebula, M42.
const ORION_FAINT = [
  { ra: 5 + 24.5 / 60, dec: -2.4, mag: 3.4 }, // eta Ori
  { ra: 5 + 17.6 / 60, dec: -6.84, mag: 3.6 }, // tau Ori
  { ra: 5 + 35.4 / 60, dec: -5.91, mag: 2.8 }, // iota Ori
  { ra: 5 + 35.4 / 60, dec: -4.84, mag: 4.6 }, // 42 Ori
  { ra: 5 + 38.7 / 60, dec: -2.6, mag: 3.8 }, // sigma Ori
  { ra: 5 + 30.8 / 60, dec: 5.95, mag: 4.2 }, // 32 Ori
  { ra: 6 + 2.4 / 60, dec: 9.65, mag: 4.1 }, // mu Ori
];
const M42 = { ra: 5 + 35.3 / 60, dec: -5.4 };

// Orion's bright neighbours, for the wide view.
const NEIGHBOURS = [
  { ra: 6 + 45.1 / 60, dec: -16.72, mag: -1.46, tint: 'cool' }, // Sirius
  { ra: 7 + 39.3 / 60, dec: 5.22, mag: 0.34 }, // Procyon
  { ra: 4 + 35.9 / 60, dec: 16.51, mag: 0.85, tint: 'warm' }, // Aldebaran
  { ra: 6 + 37.7 / 60, dec: 16.4, mag: 1.9 }, // Alhena
  { ra: 6 + 22.7 / 60, dec: -17.96, mag: 2.0 }, // Mirzam
  { ra: 7 + 27.2 / 60, dec: 8.29, mag: 2.9 }, // Gomeisa
  { ra: 5 + 7.8 / 60, dec: -5.09, mag: 2.8 }, // Cursa
  { ra: 5 + 32.7 / 60, dec: -17.82, mag: 2.6 }, // Arneb
  { ra: 4 + 49.8 / 60, dec: 6.96, mag: 3.2 }, // pi3 Ori (the shield)
  { ra: 4 + 51.2 / 60, dec: 5.6, mag: 3.7 }, // pi4 Ori
  { ra: 4 + 54.2 / 60, dec: 2.44, mag: 3.7 }, // pi5 Ori
  { ra: 4 + 50.6 / 60, dec: 8.9, mag: 4.4 }, // pi2 Ori
];

// One projection for everything: x runs against right ascension (east is
// left on a chart), y against declination, with the cos(dec) factor that
// keeps the aspect true. `k` is px per degree.
const RA0 = 5 + 35 / 60;
const DEC0 = 0;
function project({ ra, dec }, k, ox, oy) {
  const x = ox - (ra - RA0) * 15 * Math.cos((dec * Math.PI) / 180) * k;
  const y = oy - (dec - DEC0) * k;
  return [r2(x), r2(y)];
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Shorten a segment so the line stops short of each star, as on an
// engraved chart.
function gapped([ax, ay], [bx, by], ga, gb) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  return `M${r2(ax + ux * ga)} ${r2(ay + uy * ga)}L${r2(bx - ux * gb)} ${r2(by - uy * gb)}`;
}

function buildOrion(k, ox, oy, radius, gap) {
  const stars = {};
  for (const name in ORION) {
    const s = ORION[name];
    stars[name] = { p: project(s, k, ox, oy), r: r2(radius(s.mag)), tint: s.tint };
  }
  const lines = FIGURE.map(([a, b]) =>
    gapped(stars[a].p, stars[b].p, stars[a].r + gap, stars[b].r + gap)
  );
  return { stars, lines };
}

// Fixed-seed scatter (deterministic, so server and client agree).
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// ---- Eyepiece view (drawn around 0,0; radius EYE_R) ----------------------

const EYE_R = 86;
const EYE_K = 6.7; // px per degree: Orion's 20 degrees fill the field
const EYE = buildOrion(EYE_K, 0, 1, (m) => clamp(4.3 - 0.75 * m, 1.4, 4.6), 3.2);
const EYE_FAINT = ORION_FAINT.map((s) => ({
  p: project(s, EYE_K, 0, 1),
  r: r2(clamp(2.9 - 0.42 * s.mag, 0.8, 1.9)),
}));
const EYE_M42 = project(M42, EYE_K, 0, 1);
const EYE_DUST = (() => {
  const rnd = seeded(11);
  const out = [];
  while (out.length < 22) {
    const a = rnd() * Math.PI * 2;
    const d = 10 + rnd() * 68;
    const p = [r2(Math.cos(a) * d), r2(Math.sin(a) * d)];
    const near = Object.values(EYE.stars).some((s) => Math.hypot(s.p[0] - p[0], s.p[1] - p[1]) < 9);
    const r = r2(0.45 + rnd() * 0.55);
    const o = r2(0.3 + rnd() * 0.45);
    if (!near) out.push({ p, r, o });
  }
  return out;
})();

// ---- Wide view ------------------------------------------------------------

const SKY_K = 4; // px per degree: the belt stars stay ~5px apart
const SKY_O = [250, 70];
const SKY = buildOrion(SKY_K, SKY_O[0], SKY_O[1], (m) => clamp(2.05 - 0.33 * m, 0.8, 2.3), 1.5);
const SKY_M42 = project(M42, SKY_K, SKY_O[0], SKY_O[1]);
const SKY_NEIGHBOURS = NEIGHBOURS.map((s) => ({
  p: project(s, SKY_K, SKY_O[0], SKY_O[1]),
  r: r2(clamp(2.05 - 0.33 * s.mag, 0.6, 2.5)),
  tint: s.tint,
  halo: s.mag < 1,
}));
// The winter Milky Way runs down the sky just east (left) of Orion, from
// the feet of Gemini past Sirius. A dusting of faint stars along it, and a
// thinner scatter everywhere else.
// [cx, cy, rx, ry, opacity, rotation]
const MILKY_WAY = [
  [228, -4, 44, 40, 0.8, 20],
  [208, 34, 34, 48, 0.7, 24],
  [190, 78, 46, 44, 0.75, 14],
  [176, 122, 36, 46, 0.7, 22],
  [158, 160, 48, 34, 0.6, 10],
  [214, 96, 22, 30, 0.5, 30],
];
const SKY_DUST = (() => {
  const rnd = seeded(5);
  const out = [];
  for (let i = 0; i < 34; i++) {
    const t = rnd();
    const off = (rnd() + rnd() - 1) * 26;
    out.push({
      p: [r2(226 - 66 * t + off), r2(-8 + 168 * t + off * 0.3)],
      r: r2(0.35 + rnd() * 0.45),
      o: r2(0.3 + rnd() * 0.4),
    });
  }
  while (out.length < 34 + 40) {
    const p = [r2(rnd() * W), r2(rnd() * 150)];
    const r = r2(0.4 + rnd() * 0.55);
    const o = r2(0.3 + rnd() * 0.45);
    const inOrion = p[0] > 222 && p[0] < 280 && p[1] > 24 && p[1] < 116;
    if (!inOrion) out.push({ p, r, o });
  }
  return out;
})();

// The telescope: a small refractor on a tripod. The tube pivots on the
// mount and its angle is whatever points at Orion.
const MOUNT = [150, 122];
const TUBE_DEG = r2((Math.atan2(SKY_O[1] - MOUNT[1], SKY_O[0] - MOUNT[0]) * 180) / Math.PI);
const TUBE_BACK = -29.5; // the eyepiece end, along the tube from the mount
const EYEPIECE = [
  r2(MOUNT[0] + TUBE_BACK * Math.cos((TUBE_DEG * Math.PI) / 180)),
  r2(MOUNT[1] + TUBE_BACK * Math.sin((TUBE_DEG * Math.PI) / 180)),
];
// The observer is drawn for an eyepiece at (125.6, 133.2) and moved to
// wherever the eyepiece really is.
const FIGURE_SHIFT = [r2(EYEPIECE[0] - 125.6), r2(EYEPIECE[1] - 133.2)];
const GROUND_Y = r2(169.4 + FIGURE_SHIFT[1]);

// ---- Camera -----------------------------------------------------------------

const DURATION = 4.7;
const ZOOM_START = 2.45;
const ZOOM_END = 4.3;
const DISC_ZOOM = 40; // the eyepiece field ends 1/40 of its opening size
const SCENE_ZOOM = 1.3; // the scene eases back from this
const CENTRE = [W / 2, H / 2];
// The scene scales about the one point that puts the eyepiece dead centre
// at the start, so the shrinking disc stays glued to the telescope.
const PIVOT = [
  (SCENE_ZOOM * EYEPIECE[0] - CENTRE[0]) / (SCENE_ZOOM - 1),
  (SCENE_ZOOM * EYEPIECE[1] - CENTRE[1]) / (SCENE_ZOOM - 1),
];
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const zoomAt = (t) => easeInOut(clamp((t - ZOOM_START) / (ZOOM_END - ZOOM_START), 0, 1));

const sceneScaleAt = (t) => Math.pow(SCENE_ZOOM, 1 - zoomAt(t));
function sceneTransform(t) {
  const s = sceneScaleAt(t);
  return `translate(${r2(PIVOT[0] * (1 - s))} ${r2(PIVOT[1] * (1 - s))}) scale(${Math.round(s * 1e4) / 1e4})`;
}
// The disc rides on the scene's eyepiece (so it lands exactly on the
// telescope) and shrinks 40x on top of the scene's own easing back.
function discTransform(t) {
  const s = sceneScaleAt(t);
  const x = PIVOT[0] * (1 - s) + EYEPIECE[0] * s;
  const y = PIVOT[1] * (1 - s) + EYEPIECE[1] * s;
  const k = (s / SCENE_ZOOM) * Math.pow(DISC_ZOOM, -zoomAt(t));
  return `translate(${r2(x)} ${r2(y)}) scale(${Math.round(k * 1e5) / 1e5})`;
}
const discOpacity = (t) => r2(1 - clamp((zoomAt(t) - 0.8) / 0.2, 0, 1));
// The black surround lifts well before the lens lands, so what arrives at
// the telescope is a small lit lens, not a dark blot over the observer.
const barrelOpacity = (t) => r2(1 - clamp((zoomAt(t) - 0.3) / 0.3, 0, 1));

// ---- Inks --------------------------------------------------------------------

const STAR = '#fdf8e7';
const STAR_WARM = '#ffb38a';
const STAR_COOL = '#d6e8ff';
const INK = '#06071a';
const tintOf = (tint) => (tint === 'warm' ? STAR_WARM : tint === 'cool' ? STAR_COOL : STAR);
const glowOf = (tint) =>
  `url(#astronomy-club-glow-${tint === 'warm' ? 'warm' : tint === 'cool' ? 'cool' : 'white'})`;

export function AstronomyHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('astronomy-club');
  const state = isPlaying ? 'playing' : 'rested';

  // The camera clock. It rests at DURATION (the finished scene), so server
  // render, reduced motion and mid-page landings need no animation at all.
  const clock = useMotionValue(DURATION);
  const sceneRef = useRef(null);
  const discRef = useRef(null);
  const barrelRef = useRef(null);
  useEffect(() => {
    if (!isPlaying) {
      clock.set(DURATION);
      return undefined;
    }
    clock.set(0);
    const controls = animate(clock, DURATION, { duration: DURATION, ease: 'linear' });
    return () => controls.stop();
  }, [isPlaying, isReplaying, clock]);
  useMotionValueEvent(clock, 'change', (t) => {
    if (sceneRef.current) sceneRef.current.setAttribute('transform', sceneTransform(t));
    if (discRef.current) {
      discRef.current.setAttribute('transform', discTransform(t));
      discRef.current.setAttribute('opacity', discOpacity(t));
    }
    if (barrelRef.current) barrelRef.current.setAttribute('opacity', barrelOpacity(t));
  });
  const now = clock.get();

  const line = accent.dark;

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl text-white shadow-xl`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          {/* The card is a night sky in both site themes, so the heading
              takes the fixed "dark" accent (the light indigo) rather than
              `var(--club-accent)`, which flips with the site theme. */}
          <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
            Astronomy Club
          </h1>
          <p>Exploring the cosmos &amp; stargazing nights.</p>
        </div>

        <svg
          key={isReplaying ? 'replay' : 'intro'}
          viewBox={`0 0 ${W} ${H}`}
          className={`${styles.art} pointer-events-none`}
          role="img"
          // Wording kept from the previous hero: tests/e2e/hero-playback.spec.js
          // finds this SVG by exactly this label.
          aria-label="An observer at a telescope beneath a constellation"
        >
          <defs>
            {['white', 'warm', 'cool'].map((name) => (
              <radialGradient key={name} id={`astronomy-club-glow-${name}`}>
                <stop offset="0" stopColor={tintOf(name)} stopOpacity="0.55" />
                <stop offset="0.35" stopColor={tintOf(name)} stopOpacity="0.16" />
                <stop offset="1" stopColor={tintOf(name)} stopOpacity="0" />
              </radialGradient>
            ))}
            <radialGradient id="astronomy-club-haze">
              <stop offset="0" stopColor="#c9c4ff" stopOpacity="0.2" />
              <stop offset="0.55" stopColor="#a8a2f0" stopOpacity="0.08" />
              <stop offset="1" stopColor="#a8a2f0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="astronomy-club-nebula">
              <stop offset="0" stopColor="#f5b8ff" stopOpacity="0.85" />
              <stop offset="0.45" stopColor="#c58bf2" stopOpacity="0.35" />
              <stop offset="1" stopColor="#8b7bf0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="astronomy-club-barrel">
              <stop offset="0" stopColor="#020309" />
              <stop offset="0.8" stopColor="#020309" />
              <stop offset="1" stopColor="#020309" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="astronomy-club-field">
              <stop offset="0" stopColor="#1b2163" />
              <stop offset="0.6" stopColor="#12154a" />
              <stop offset="1" stopColor="#090b2c" />
            </radialGradient>
            <radialGradient id="astronomy-club-vignette">
              <stop offset="0.8" stopColor="#020309" stopOpacity="0" />
              <stop offset="0.94" stopColor="#020309" stopOpacity="0.45" />
              <stop offset="1" stopColor="#020309" stopOpacity="0.9" />
            </radialGradient>
            <linearGradient id="astronomy-club-sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8f7fc4" stopOpacity="0.55" />
              <stop offset="0.12" stopColor="#3a3478" stopOpacity="0.9" />
              <stop offset="1" stopColor="#15153f" />
            </linearGradient>
            <linearGradient id="astronomy-club-tube" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f1ff" />
              <stop offset="0.55" stopColor="#cfcdf2" />
              <stop offset="1" stopColor="#8a88c8" />
            </linearGradient>
          </defs>

          {/* ===== The wide view: sky, hill, observer. ===== */}
          <g ref={sceneRef} transform={sceneTransform(now)}>
            {/* Milky Way haze, east of Orion: broad and uneven, never a
                clean column (which would read as a beam from the tube). */}
            {MILKY_WAY.map((e, i) => (
              <ellipse
                key={`mw${i}`}
                cx={e[0]}
                cy={e[1]}
                rx={e[2]}
                ry={e[3]}
                fill="url(#astronomy-club-haze)"
                opacity={e[4]}
                transform={`rotate(${e[5]} ${e[0]} ${e[1]})`}
              />
            ))}

            {SKY_DUST.map((s, i) => (
              <circle key={`d${i}`} cx={s.p[0]} cy={s.p[1]} r={s.r} fill={STAR} opacity={s.o} />
            ))}

            {SKY_NEIGHBOURS.map((s, i) => (
              <g key={`n${i}`}>
                {s.halo && <circle cx={s.p[0]} cy={s.p[1]} r={r2(s.r * 3.4)} fill={glowOf(s.tint)} />}
                <circle cx={s.p[0]} cy={s.p[1]} r={s.r} fill={tintOf(s.tint)} />
              </g>
            ))}

            {/* Orion, small, the same way up as in the eyepiece. Its lines
                are the last thing to arrive: the moment of recognising, out
                in the open sky, what was in the eyepiece. */}
            {SKY.lines.map((d, i) => (
              <motion.path
                key={`sl${i}`}
                d={d}
                fill="none"
                stroke={line}
                strokeWidth="0.8"
                strokeLinecap="round"
                variants={{
                  rested: { pathLength: 1, opacity: 0.9 },
                  playing: {
                    pathLength: [0, 1],
                    opacity: [0, 0.9],
                    transition: {
                      pathLength: { delay: 3.7 + i * 0.045, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                      opacity: { delay: 3.7 + i * 0.045, duration: 0.12 },
                    },
                  },
                }}
                initial="rested"
                animate={state}
              />
            ))}
            <circle cx={SKY_M42[0]} cy={SKY_M42[1]} r="2.6" fill="url(#astronomy-club-nebula)" />
            {Object.entries(SKY.stars).map(([name, s]) => (
              <g key={name}>
                {s.tint && <circle cx={s.p[0]} cy={s.p[1]} r={r2(s.r * 3.6)} fill={glowOf(s.tint)} />}
                <circle cx={s.p[0]} cy={s.p[1]} r={s.r} fill={tintOf(s.tint)} />
              </g>
            ))}

            {/* The sea, and the hill in front of it */}
            <rect x="-140" y={r2(GROUND_Y - 4.5)} width="660" height="40" fill="url(#astronomy-club-sea)" />
            <path
              d={`M-150 300 L-150 262 L0 ${H + 2} C28 ${r2(GROUND_Y + 10)} 58 ${r2(GROUND_Y + 0.6)} 92 ${GROUND_Y} L172 ${GROUND_Y} C212 ${GROUND_Y} 262 ${r2(GROUND_Y + 5)} 306 ${r2(GROUND_Y + 11)} S372 ${r2(GROUND_Y + 19)} 520 ${r2(GROUND_Y + 22)} L520 300 Z`}
              fill={INK}
            />

            <path
              d={`M0 ${H + 1} C28 ${r2(GROUND_Y + 9.4)} 58 ${GROUND_Y} 92 ${r2(GROUND_Y - 0.5)} L172 ${r2(GROUND_Y - 0.5)} C212 ${r2(GROUND_Y - 0.5)} 262 ${r2(GROUND_Y + 4.5)} 306 ${r2(GROUND_Y + 10.5)} S372 ${r2(GROUND_Y + 18.5)} 520 ${r2(GROUND_Y + 21.5)}`}
              fill="none"
              stroke="#8577c9"
              strokeWidth="0.6"
              opacity="0.55"
            />

            {/* Tripod and mount */}
            <g stroke={INK} strokeLinecap="round" fill="none">
              <path d={`M${MOUNT[0]} ${MOUNT[1] + 4} L${MOUNT[0] - 12} ${GROUND_Y + 0.5}`} strokeWidth="1.9" />
              <path d={`M${MOUNT[0]} ${MOUNT[1] + 4} L${MOUNT[0] + 11} ${GROUND_Y + 0.5}`} strokeWidth="1.9" />
              <path d={`M${MOUNT[0]} ${MOUNT[1] + 4} L${MOUNT[0] + 1.5} ${GROUND_Y + 0.5}`} strokeWidth="1.6" />
              <path d={`M${MOUNT[0] - 6.5} ${MOUNT[1] + 26} L${MOUNT[0] + 6} ${MOUNT[1] + 26}`} strokeWidth="1.1" />
            </g>
            <rect x={MOUNT[0] - 2.6} y={MOUNT[1] - 1} width="5.2" height="7.5" rx="1.4" fill={INK} />

            {/* The refractor, aimed at Orion */}
            <g transform={`translate(${MOUNT[0]} ${MOUNT[1]}) rotate(${TUBE_DEG})`}>
              <rect x="-13" y="-6.6" width="11" height="2" rx="1" fill="#b4b2e6" />
              <rect x="-10.5" y="-4.8" width="1.4" height="2" fill={INK} />
              <rect x="-5.5" y="-4.8" width="1.4" height="2" fill={INK} />
              <rect x="-20" y="-3.3" width="45" height="6.6" rx="1.2" fill="url(#astronomy-club-tube)" />
              <rect x="24" y="-4.1" width="9.5" height="8.2" rx="1.2" fill="url(#astronomy-club-tube)" />
              <rect x="32.3" y="-4.1" width="1.2" height="8.2" fill="#55548f" />
              <rect x="-3" y="-3.3" width="6" height="6.6" fill="#4a4a86" opacity="0.55" />
              <rect x="-25.5" y="-2.1" width="6" height="4.2" rx="0.8" fill="#7f7dbd" />
              <rect x={TUBE_BACK} y="-1.4" width="4.4" height="2.8" rx="0.7" fill="#4d4c8a" />
              <circle cx="-22.5" cy="3.2" r="1.3" fill="#4d4c8a" />
            </g>

            {/* The observer: knees soft, one hand braced on the thigh, the
                other up at the focuser, eye at the eyepiece. */}
            <g
              transform={`translate(${FIGURE_SHIFT[0]} ${FIGURE_SHIFT[1]})`}
              fill="none"
              stroke={INK}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* far leg, far arm */}
              <path d="M108 150.6 L106 159.4" strokeWidth="4.1" />
              <path d="M106 159.4 L101.8 167.6" strokeWidth="3.2" />
              <path d="M100.6 168.4 L106 168.5" strokeWidth="2.3" />
              <path d="M116.6 140 L114.6 148 L113.4 155" strokeWidth="2.3" />
              {/* torso: a jacket, leaning in from the hips */}
              <path
                d="M115.4 135.8 C117.8 135.4 120.4 137.6 120.2 140 C119.4 144.2 115.4 148.8 112.6 152.6 L105.2 151 C105.4 145.4 109.4 138.8 112.4 136.6 Z"
                fill={INK}
                strokeWidth="1"
              />
              {/* near leg */}
              <path d="M109.8 150.6 L112.4 159" strokeWidth="4.5" />
              <path d="M112.4 159 L110.8 167.6" strokeWidth="3.5" />
              <path d="M110 168.4 L116 168.5" strokeWidth="2.3" />
              {/* neck and head, tipped back to follow the tube; hair tied up */}
              <path d="M117.4 137.6 L119.4 135" strokeWidth="2.7" />
              <ellipse cx="121.2" cy="132.3" rx="3.3" ry="3.85" fill={INK} stroke="none" transform="rotate(-18 121.2 132.3)" />
              <circle cx="117.7" cy="130.3" r="1.55" fill={INK} stroke="none" />
              {/* near arm, up to the focuser */}
              <path d="M117 139.6 L121.4 146.6" strokeWidth="2.8" />
              <path d="M121.4 146.6 L128 139" strokeWidth="2.3" />
            </g>
          </g>

          {/* ===== The eyepiece: what the observer sees. Opens filling the
                frame, then shrinks onto the telescope. ===== */}
          <g ref={discRef} transform={discTransform(now)} opacity={discOpacity(now)}>
            <circle ref={barrelRef} r="250" fill="url(#astronomy-club-barrel)" opacity={barrelOpacity(now)} />
            <circle r={EYE_R} fill="url(#astronomy-club-field)" />

            {/* The faint field only resolves as the focus comes in */}
            <motion.g
              variants={{
                rested: { opacity: 1 },
                playing: {
                  opacity: [0, 0.12, 1],
                  transition: { duration: 1.0, times: [0, 0.45, 1], ease: 'easeOut' },
                },
              }}
              initial="rested"
              animate={state}
            >
              {EYE_DUST.map((s, i) => (
                <circle key={`ed${i}`} cx={s.p[0]} cy={s.p[1]} r={s.r} fill={STAR} opacity={s.o} />
              ))}

              {/* M42, the Orion Nebula, in the sword */}
              <ellipse
                cx={EYE_M42[0]}
                cy={EYE_M42[1]}
                rx="6.4"
                ry="5"
                fill="url(#astronomy-club-nebula)"
                transform={`rotate(-20 ${EYE_M42[0]} ${EYE_M42[1]})`}
              />
              {EYE_FAINT.map((s, i) => (
                <circle key={`ef${i}`} cx={s.p[0]} cy={s.p[1]} r={s.r} fill={STAR} opacity="0.85" />
              ))}
            </motion.g>

            {/* The figure, traced star to star once the view is sharp */}
            {EYE.lines.map((d, i) => (
              <motion.path
                key={`el${i}`}
                d={d}
                fill="none"
                stroke={line}
                strokeWidth="1.15"
                strokeLinecap="round"
                variants={{
                  rested: { pathLength: 1, opacity: 0.9 },
                  playing: {
                    pathLength: [0, 1],
                    opacity: [0, 0.9],
                    transition: {
                      pathLength: { delay: 1.0 + i * 0.125, duration: 0.24, ease: 'easeInOut' },
                      opacity: { delay: 1.0 + i * 0.125, duration: 0.06 },
                    },
                  },
                }}
                initial="rested"
                animate={state}
              />
            ))}

            {/* Focus pull: each star is a wide soft disc that collapses to
                a point, which is exactly what racking a focuser does. */}
            {Object.entries(EYE.stars).map(([name, s], i) => (
              <g key={name}>
                <motion.circle
                  cx={s.p[0]}
                  cy={s.p[1]}
                  r={r2(s.r * 3.1 + 2)}
                  fill={tintOf(s.tint)}
                  variants={{
                    rested: { opacity: 0, scale: 0.25 },
                    playing: {
                      opacity: [0.3, 0.3, 0],
                      scale: [1, 0.9, 0.25],
                      transition: { duration: 1.0, times: [0, 0.3, 1], ease: 'easeInOut', delay: i * 0.012 },
                    },
                  }}
                  initial="rested"
                  animate={state}
                />
                <motion.g
                  variants={{
                    rested: { opacity: 1 },
                    playing: {
                      opacity: [0, 0, 1],
                      transition: { duration: 1.0, times: [0, 0.5, 1], ease: 'easeOut', delay: i * 0.012 },
                    },
                  }}
                  initial="rested"
                  animate={state}
                >
                  <circle cx={s.p[0]} cy={s.p[1]} r={r2(s.r * 3.2)} fill={glowOf(s.tint)} />
                  <circle cx={s.p[0]} cy={s.p[1]} r={s.r} fill={tintOf(s.tint)} />
                </motion.g>
              </g>
            ))}

            {/* Glass: vignette, the lens edge with a hint of colour
                fringing, and four field ticks. */}
            <circle r={EYE_R} fill="url(#astronomy-club-vignette)" />
            <g stroke="#dfe3ff" strokeWidth="0.7" opacity="0.32">
              <path d={`M0 ${-EYE_R} V${-EYE_R + 7} M0 ${EYE_R} V${EYE_R - 7} M${-EYE_R} 0 H${-EYE_R + 7} M${EYE_R} 0 H${EYE_R - 7}`} />
            </g>
            <circle r={EYE_R - 0.7} fill="none" stroke="#7dd3fc" strokeWidth="1" opacity="0.34" />
            <circle r={EYE_R + 0.5} fill="none" stroke="#fb923c" strokeWidth="1" opacity="0.3" />
            <circle r={EYE_R} fill="none" stroke="#e6e8ff" strokeWidth="0.6" opacity="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}
