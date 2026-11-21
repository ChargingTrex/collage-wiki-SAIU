// src/components/clubs/DanceHero.jsx
//
// Dance Club — a partnered duet, drawn as two brush silhouettes on a dark
// stage. They rock apart and together on joined hands, he lifts the hand
// and she turns twice under his arm, skirt flaring, and the phrase lands in
// a dip, which is the picture the card rests on.
//
// This replaces the equalizer bars, which showed the music (and duplicated
// the Music hero) rather than the dancing. What the club actually does is
// move together, so the hero is about partnership:
//   - The joined hands are one point both arms reach for (two-bone IK from
//     each dancer's shoulder), so the hold never breaks while they travel.
//   - In the dip his arm reaches for the middle of her back and her hand
//     for his shoulder, from the same joints, so the support is real.
//   - Follow-through carries the rhythm: her skirt hem and ponytail are
//     drawn from where her body was a moment ago, so cloth and hair trail
//     every change of direction, and two afterimages of the skirt trail
//     the turn the way a long exposure would.
//   - Both dancers are mirrored in the stage floor.
//
// The turn is faked the way a shadow puppet would do it: her shoulder and
// hip widths (and the sideways reach of her free limbs) are multiplied by
// the cosine of the spin angle, so the silhouette narrows and reopens.
//
// Figures come from the shared rig (./rig): one clock, joints computed in
// JS. He is a fixed rose; she is the club accent, so the pair stays two
// distinct tones in unified mode too.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { Rig, useRigClock, useRigFrame } from './rig/RigParts';
import { POSE0, capsule, makeTimeline, mix, n, pt, reach, shift, solve } from './rig/rig';
import styles from './DanceHero.module.css';

const FLOOR = 160;
const HIM = '#e11d48';
const STAGE = `translate(206 ${160}) scale(1.2) translate(-206 ${-160})`;
const SKIRT = '#fecdd3';

const BODY_HIM = { torso: 31, neck: 5, headR: 6.2, shoulderW: 20, hipW: 9, upperArm: 18, foreArm: 17, thigh: 30, shin: 31, foot: 7.5 };
const BODY_HER = { torso: 29, neck: 5.5, headR: 5.8, shoulderW: 14, hipW: 8.5, upperArm: 17.5, foreArm: 17, thigh: 29.5, shin: 31, foot: 8 };

// hx/hy: the joined hands. w: 0 = hand-in-hand, 1 = the dip hold.
const LEAD = makeTimeline([
  { t: 0, x: 163, torso: 3, head: 8, laU: -34, laF: -58, llT: -9, llS: 3, rlT: 7, rlS: 0, lf: -75, rf: 75, hx: 196, hy: 80, w: 0 },
  { t: 0.45, x: 158, torso: -6, llT: -17, llS: -6, rlT: 9, rlS: 13, hx: 195, hy: 86, laU: -36, laF: -54 },
  { t: 0.9, x: 172, torso: 5, llT: -7, llS: 9, rlT: 11, rlS: 0, hx: 200, hy: 70, laU: -16, laF: -26 },
  { t: 1.35, x: 190, torso: 2, llT: -9, llS: 0, rlT: 8, rlS: 0, hx: 211, hy: 37, laU: -50, laF: -78 },
  { t: 1.9, x: 191, torso: -2, hx: 213, hy: 35, laU: -58, laF: -88 },
  { t: 2.5, x: 190, torso: 1, hx: 212, hy: 38, w: 0, laU: -44, laF: -66 },
  { t: 3.2, x: 187, torso: 14, head: 30, rlT: 30, rlS: -4, llT: -14, llS: -18, lf: -40, rf: 80, laU: -72, laF: -108, w: 1 },
  { t: 3.5, torso: 17, head: 34, laU: -78, laF: -114 },
  { t: 3.9, torso: 15, head: 32, laU: -74, laF: -110 },
]);
const FOLLOW = makeTimeline([
  { t: 0, x: 228, torso: -4, head: -9, raU: 44, raF: 66, llT: -3, llS: 0, rlT: 12, rlS: -8, lf: -75, rf: 40, spin: 0, flare: 0.1 },
  { t: 0.45, x: 232, torso: 6, rlT: 17, rlS: 6, llT: -9, llS: -13, flare: 0.25, raU: 42, raF: 60 },
  { t: 0.9, x: 224, torso: -5, rlT: 6, rlS: -9, llT: -11, llS: 0, flare: 0.1, raU: 20, raF: 30 },
  { t: 1.35, x: 216, torso: 0, head: 0, spin: 0, raU: 62, raF: 82, rlT: 42, rlS: -40, rf: 6, llT: -1, llS: 0, lf: -10, flare: 0.5 },
  { t: 1.9, spin: 350, flare: 1, raU: 74, raF: 90 },
  { t: 2.5, spin: 720, flare: 0.7, raU: 56, raF: 74, rlT: 42, rlS: -40, x: 216, torso: 0, head: 0 },
  { t: 3.2, x: 205, torso: 47, head: 72, llT: -42, llS: -46, lf: -46, rlT: 42, rlS: -30, rf: 80, raU: 116, raF: 84, flare: 0 },
  { t: 3.5, torso: 52, head: 80, raU: 108, raF: 66 },
  { t: 3.9, torso: 50, head: 77, raU: 111, raF: 74 },
]);
const DURATION = LEAD.duration;
const RAD = Math.PI / 180;

function stand(p, body, spinLimbs) {
  const j = solve({ ...p, y: 0 }, body);
  if (spinLimbs) {
    // The sideways reach of her free limbs turns with her.
    for (const k of spinLimbs) j[k][0] = p.x + (j[k][0] - p.x) * p.turn;
  }
  const low = Math.max(j.anL[1], j.anR[1], j.toeL[1], j.toeR[1]) + 1.2;
  return shift(j, 0, FLOOR - low);
}

function pair(t) {
  const a = { ...POSE0, ...LEAD(t) };
  const b = { ...POSE0, ...FOLLOW(t) };
  b.turn = Math.cos(b.spin * RAD);
  const A = stand(a, BODY_HIM);
  const B = stand(b, BODY_HER, ['elR', 'haR', 'knR', 'anR', 'toeR', 'knL', 'anL', 'toeL']);

  // The hold: both arms reach for one point; in the dip, his for her back
  // and hers for his shoulder.
  const hands = [a.hx, a.hy];
  const back = mix(B.pelvis, B.chest, 0.6);
  const his = reach(A.shR, mix(hands, back, a.w), BODY_HIM.upperArm, BODY_HIM.foreArm, 1);
  A.elR = his.mid;
  A.haR = his.tip;
  const hers = reach(B.shL, mix(hands, [A.shR[0] - 1, A.shR[1] - 2], a.w), BODY_HER.upperArm, BODY_HER.foreArm, -1);
  B.elL = hers.mid;
  B.haL = hers.tip;
  return { a, b, A, B };
}

// Her skirt at time t: from the waist to a hem that trails the legs (it is
// drawn from where they were a moment earlier) and lifts as it flares.
function skirtAt(t, now = pair(t)) {
  const { b, B } = now;
  const P = pair(Math.max(0, t - 0.16)).B;
  const side = [Math.cos(b.torso * RAD), Math.sin(b.torso * RAD)];
  const waist = mix(B.pelvis, B.chest, 0.36);
  const wl = [waist[0] - side[0] * 4.6, waist[1] - side[1] * 4.6];
  const wr = [waist[0] + side[0] * 4.6, waist[1] + side[1] * 4.6];
  const out = 5 + b.flare * 15;
  const lift = b.flare * 7;
  const hemA = mix(P.hipL, P.knL, 1.05);
  const hemB = mix(P.hipR, P.knR, 1.05);
  const [hl, hr] = hemA[0] <= hemB[0] ? [hemA, hemB] : [hemB, hemA];
  const hemL = [hl[0] - out, hl[1] - lift];
  const hemR = [hr[0] + out, hr[1] - lift];
  const sag = mix(hemL, hemR, 0.5);
  sag[1] += 6 - b.flare * 3;
  return (
    `M${pt(wl)}Q${pt([mix(wl, hemL, 0.5)[0] - 2 - b.flare * 3, mix(wl, hemL, 0.5)[1] - 2])} ${pt(hemL)}` +
    `Q${pt(mix(hemL, sag, 0.5))} ${pt(sag)}T${pt(hemR)}` +
    `Q${pt([mix(wr, hemR, 0.5)[0] + 2 + b.flare * 3, mix(wr, hemR, 0.5)[1] - 2])} ${pt(wr)}Z`
  );
}

function scene(t) {
  const now = pair(t);
  const { b, B } = now;
  const P = pair(Math.max(0, t - 0.16)).B;
  // Ponytail: hangs from the back of her head toward where the head was.
  const tailRoot = [B.headC[0] + Math.sin(b.head * RAD) * 3, B.headC[1] - Math.cos(b.head * RAD) * 3];
  const tailTip = [P.headC[0] + (P.headC[0] - B.headC[0]) * 0.8, P.headC[1] + 13];
  return {
    ...now,
    skirt: skirtAt(t, now),
    // Afterimages of the skirt: where it was one and two beats of an eye ago.
    echo1: skirtAt(Math.max(0, t - 0.11)),
    echo2: skirtAt(Math.max(0, t - 0.22)),
    tailRoot,
    tailTip,
  };
}

function Dancer({ frame, who, body, fill, waistW, children }) {
  const J = (f) => f[who];
  const part = (a, b, ra, rb) => (
    <Rig frame={frame} attrs={(f) => ({ d: capsule(J(f)[a], J(f)[b], ra, rb) })} fill={fill} />
  );
  return (
    <g>
      {part('hipL', 'knL', 4.3, 3)}
      {part('knL', 'anL', 3, 1.6)}
      {part('anL', 'toeL', 1.8, 0.7)}
      {part('hipR', 'knR', 4.3, 3)}
      {part('knR', 'anR', 3, 1.6)}
      {part('anR', 'toeR', 1.8, 0.7)}
      <Rig
        frame={frame}
        attrs={(f) => {
          const j = J(f);
          // shoulders, a narrower waist, hips
          const wc = mix(j.pelvis, j.chest, 0.42);
          const ax = (j.shR[0] - j.shL[0]) / body.shoulderW;
          const ay = (j.shR[1] - j.shL[1]) / body.shoulderW;
          const wl = [wc[0] - ax * waistW, wc[1] - ay * waistW];
          const wr = [wc[0] + ax * waistW, wc[1] + ay * waistW];
          return { d: `M${pt(j.shL)}L${pt(j.shR)}L${pt(wr)}L${pt(j.hipR)}L${pt(j.hipL)}L${pt(wl)}Z` };
        }}
        fill={fill}
        stroke={fill}
        strokeWidth="4.6"
        strokeLinejoin="round"
      />
      {children}
      {part('shL', 'elL', 2.5, 1.9)}
      {part('elL', 'haL', 1.9, 1.1)}
      {part('shR', 'elR', 2.5, 1.9)}
      {part('elR', 'haR', 1.9, 1.1)}
      {part('chest', 'headC', 2.2, 2)}
      <Rig as="circle" frame={frame} r={body.headR} fill={fill} attrs={(f) => ({ cx: n(J(f).headC[0]), cy: n(J(f).headC[1]) })} />
    </g>
  );
}

export function DanceHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('dance-club');
  const state = isPlaying ? 'playing' : 'rested';
  const clock = useRigClock(isPlaying, isReplaying, DURATION);
  const frame = useRigFrame(clock, scene);
  const her = accent.dark;

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl bg-rose-950 text-white shadow-xl`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
            Dance Club
          </h1>
          <p className="mt-1" style={{ color: '#fecdd3' }}>
            Expressing rhythm, grace, and movement.
          </p>
        </div>

        <svg
          key={isReplaying ? 'replay' : 'intro'}
          viewBox="0 0 364 192"
          className={`${styles.art} pointer-events-none`}
          role="img"
          aria-label="Two dancers in silhouette: she turns under his raised arm and he lowers her into a dip, mirrored in the stage floor"
        >
          <defs>
            <radialGradient id="dance-club-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#be123c" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#9f1239" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dance-club-floor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fda4af" stopOpacity="0" />
              <stop offset="35%" stopColor="#fda4af" stopOpacity="0.55" />
              <stop offset="80%" stopColor="#fda4af" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="dance-club-fade" x1="0" y1={FLOOR} x2="0" y2="192" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" stopOpacity="0.36" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="dance-club-mirror" maskUnits="userSpaceOnUse" x="0" y={FLOOR} width="364" height={192 - FLOOR}>
              <rect x="0" y={FLOOR} width="364" height={192 - FLOOR} fill="url(#dance-club-fade)" />
            </mask>
          </defs>

          {/* Stage light behind the pair, and the floor they are mirrored in */}
          <motion.ellipse
            cx="212" cy="92" rx="128" ry="92" fill="url(#dance-club-glow)"
            initial="rested" animate={state}
            variants={{ rested: { opacity: 1 }, playing: { opacity: [0.35, 1], transition: { duration: 1.2, ease: 'easeOut' } } }}
          />
          <rect x="40" y={FLOOR} width="324" height="1" fill="url(#dance-club-floor)" />

          {/* The pair is authored at 1x and drawn larger about its spot on the floor */}
          <g mask="url(#dance-club-mirror)">
            <g transform={STAGE}>
              <use href="#dance-club-pair" transform={`translate(0 ${FLOOR * 2 + 0.8}) scale(1 -1)`} />
            </g>
          </g>

          <g transform={STAGE}>
            {/* Afterimages of her skirt: they trail every turn and fold back
                into the skirt itself when she is still */}
            <Rig frame={frame} attrs={(f) => ({ d: f.echo2 })} fill={her} opacity="0.14" />
            <Rig frame={frame} attrs={(f) => ({ d: f.echo1 })} fill={her} opacity="0.24" />

            <g id="dance-club-pair">
              <Dancer frame={frame} who="A" body={BODY_HIM} fill={HIM} waistW={6} />
              <Dancer frame={frame} who="B" body={BODY_HER} fill={her} waistW={3.4}>
                <Rig frame={frame} attrs={(f) => ({ d: capsule(f.tailRoot, f.tailTip, 2.6, 0.9) })} fill={her} />
                <Rig frame={frame} attrs={(f) => ({ d: f.skirt })} fill={SKIRT} stroke={SKIRT} strokeWidth="1.5" strokeLinejoin="round" opacity="0.94" />
              </Dancer>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
