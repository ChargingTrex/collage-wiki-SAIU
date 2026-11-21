// src/components/clubs/OratoryHero.jsx
//
// Oratory Club — a speaker at the lectern, mid-speech, printed like a
// two-colour debate-night poster: a warm disc of stage light on a navy
// hall, the speaker and the microphone cut out against it, the front row
// in silhouette.
//
// The motion is the speech itself, told by the hand that works in front of
// the microphone:
//   1. it lifts off the lectern into an open palm (the opening appeal),
//   2. one finger goes up ("first..."),
//   3. it sweeps out over the audience, and the front row looks up,
//   4. it draws back and comes down in one firm beat on the closing line.
// The card rests on that beat: finger raised in front of the mic, leaning
// in, mouth still open on the last word.
//
// This replaces a lucide Mic icon throwing radar rings, which showed a
// device and a generic "sound" effect. What the club actually practises is
// delivery: gesture, emphasis, pause, landing a point on a room.
//
// The chalk marks over the audience are a speechwriter's scansion of the
// same sentence: the phrase arc is drawn by the sweep, its two stress
// accents and the caesura (the pause, "//") tick on as the line is spoken,
// and the full stop and underline land with the final beat.
//
// The figure comes from the shared rig (./rig): one clock in seconds drives
// everything, so the hand, the jaw, the heads and the chalk cannot drift
// apart. The gesturing arm is two-bone IK from the shoulder to a hand
// target; the hand is placed at the IK tip, so it never leaves the wrist.
// The clock rests at the end of the speech, which is the finished picture
// (server render, reduced motion and mid-page landings all get it).
//
// Colour: the jacket is the club accent (so unified mode recolours the
// speaker); the stage light is a fixed amber, because warm light on a blue
// hall is the picture.

import React from 'react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { Rig, useRigClock, useRigFrame } from './rig/RigParts';
import { BODY0, POSE0, capsule, clamp, makeTimeline, mix, n, place, reach, solve } from './rig/rig';
import styles from './OratoryHero.module.css';

const INK = '#0b1230';
const SKIN = '#d9a074';
const PAPER = '#f6efdc';
const CHALK = '#f3ecd8';
const AMBER = '#f7b74a';
const RAD = Math.PI / 180;

// Waist-up figure behind the lectern, turned three-quarters to the hall
// (screen left). The pelvis is hidden by the lectern and is the pivot the
// speaker leans from.
const BODY = { ...BODY0, torso: 68, neck: 5, headR: 15, shoulderW: 44, upperArm: 40, foreArm: 36 };
const PELVIS = [278, 150];
const FAR_HAND = [251, 119]; // the other hand stays on the lectern, on the notes
const HAND_K = 1.12;
// The stage (light, speaker, lectern, mic) is authored at 1x and drawn
// larger and further left; the chalk and the front row are in card space.
const K = 1.15;
const STAGE = `translate(-62 -3.2) scale(${K})`;
const UNSTAGE = `scale(${n(1 / K * 1000) / 1000}) translate(62 3.2)`;

// hx/hy: where the gesturing hand wants to be. hr: the hand's rotation
// (0 = fingers up, negative = toward the hall). cI / cO: curl of the index
// and of the other three fingers. sp: finger spread. th: thumb out.
const SPEECH = makeTimeline([
  { t: 0, torso: 1, head: 0, jaw: 0, hx: 236, hy: 114, hr: -80, cI: 0.3, cO: 0.4, sp: 0, th: 0.2 },
  { t: 0.3, jaw: 0 },
  // open palm: the appeal
  { t: 0.78, torso: -3, head: -4, jaw: 0.7, hx: 214, hy: 80, hr: -40, cI: 0, cO: 0, sp: 1, th: 1 },
  { t: 0.96, hy: 76, jaw: 0.15 },
  { t: 1.14, hy: 84, jaw: 0.85, stop: true },
  { t: 1.34, hy: 82, jaw: 0.2 },
  // "first": one finger up
  { t: 1.8, torso: 0, head: 3, jaw: 0.7, hx: 226, hy: 54, hr: -3, cI: 0, cO: 1, sp: 0, th: 0, stop: true },
  { t: 1.98, hy: 51, jaw: 0.15 },
  { t: 2.14, hy: 55, jaw: 0.6 },
  { t: 2.36, hx: 228, hy: 64, hr: -40, cO: 0.3, sp: 0.4, th: 0.6, jaw: 0.2 },
  // the sweep, out over the hall
  { t: 2.95, torso: -9, head: -9, jaw: 0.9, hx: 205, hy: 88, hr: -98, cI: 0, cO: 0, sp: 0.6, th: 1 },
  { t: 3.2, hx: 204, hy: 86, jaw: 0.25, stop: true },
  // draw back...
  { t: 3.56, torso: 1, head: 4, jaw: 0.1, hx: 236, hy: 40, hr: 8, cI: 0, cO: 1, sp: 0, th: 0 },
  // ...and the beat
  { t: 3.73, torso: -7, head: -9, jaw: 1, hx: 219, hy: 61, hr: -20, stop: true },
  { t: 3.92, torso: -5.5, head: -6.5, jaw: 0.5, hy: 57.5 },
  { t: 4.3, torso: -6, head: -7, jaw: 0.4, hy: 59 },
]);
const DURATION = SPEECH.duration;

const smooth = (u) => u * u * (3 - 2 * u);
const ramp = (t, a, b) => smooth(clamp((t - a) / (b - a), 0, 1));
const u01 = (v) => clamp(v, 0, 1);
// Finer than the rig's one-decimal n(): 0..1 fades and dash offsets would
// otherwise move in ten visible steps.
const n3 = (v) => Math.round(v * 1000) / 1000;

function scene(t) {
  const v = SPEECH(t);
  const j = solve({ ...POSE0, x: PELVIS[0], y: PELVIS[1], turn: 0.5, torso: v.torso, head: v.head }, BODY);
  const arm = reach(j.shR, [v.hx, v.hy], BODY.upperArm, BODY.foreArm, -1);
  const far = reach(j.shL, FAR_HAND, 31, 29, -1);
  const ha = arm.tip;
  const fore = Math.hypot(ha[0] - arm.mid[0], ha[1] - arm.mid[1]) || 1;
  return {
    t, j, el: arm.mid, ha, farEl: far.mid,
    cuff: mix(ha, arm.mid, 6.5 / fore),
    torso: v.torso, head: v.head, hr: v.hr,
    jaw: u01(v.jaw), cI: u01(v.cI), cO: u01(v.cO), sp: u01(v.sp), th: u01(v.th),
    light: ramp(t, 0, 0.7),
    // chalk, in the order it is spoken
    arc: ramp(t, 2.4, 3.05),
    acc1: ramp(t, 2.55, 2.7),
    acc2: ramp(t, 2.8, 2.95),
    caes: ramp(t, 3.22, 3.5),
    under: ramp(t, 3.7, 3.88),
    stop: ramp(t, 3.86, 3.98),
  };
}

// The speaker's head in profile, around its own centre. The jaw drops with
// `jaw`; the notch between the lips is the open mouth.
function headPath(jaw) {
  const d = jaw * 3.4;
  return (
    'M-1 -15.5C-9 -16 -14.5 -11 -14.8 -4.5L-15.6 -1L-19.2 4.2L-15.4 5.6L-15.9 7.4L-9.6 8.2' +
    `L-14.8 ${n(8.6 + d)}L-15 ${n(11.6 + d)}C-14.4 ${n(15.4 + d)} -10.4 ${n(16.6 + d)} -6.4 ${n(15.6 + d * 0.8)}` +
    `L3 ${n(11.4 + d * 0.3)}L6.4 6C13 6 15.6 -2 14 -8C12 -14 6 -15.6 -1 -15.5Z`
  );
}
const HAIR =
  'M-15 -5.2C-14.2 -17.4 -2 -20.4 7.4 -17C15.8 -14 18.4 -4 15.2 3.4C13.6 7 10.4 8.6 7 8C8.6 3.4 7.2 -1.6 3.6 -3.4C3 -7 0 -9.6 -4 -9.2C-8 -8.8 -11.4 -7.6 -15 -5.2Z';

// Fingers are drawn from the knuckles; a curled finger is foreshortened
// to a knuckle (the hand is seen side-on, so a fist is a row of bumps).
const FINGERS = [
  { x: -4.4, len: 12 },
  { x: -1.5, len: 12.8 },
  { x: 1.5, len: 11.8 },
  { x: 4.3, len: 9.4 },
];
function finger(i, curl, spread) {
  const f = FINGERS[i];
  const a = (i - 1.5) * spread * 9 * RAD;
  const len = f.len * (1 - 0.76 * curl);
  return capsule([f.x, -10], [f.x + Math.sin(a) * len, -10 - Math.cos(a) * len], 1.8, 1.6);
}
const thumb = (out) => capsule([-4.6, -3.4], mix([-0.6, -10.6], [-12.6, -8.6], out), 2.1, 1.7);

// The front row, seen from behind. `at` staggers when each head looks up:
// the sweep reaches the nearest seat first.
const ROW = [
  { x: 148, y: 172, r: 16, at: 2.5, hair: 0 },
  { x: 102, y: 165, r: 13.5, at: 2.66, hair: 1 },
  { x: 58, y: 173, r: 17, at: 2.82, hair: 2 },
];
const HAIRS = [
  // short crop
  (r) => `M${-r * 0.9} ${-r * 0.1}C${-r * 1.02} ${-r * 1.2} ${r * 1.02} ${-r * 1.2} ${r * 0.9} ${-r * 0.1}C${r * 0.4} ${-r * 0.5} ${-r * 0.4} ${-r * 0.5} ${-r * 0.9} ${-r * 0.1}Z`,
  // a bun
  (r) => `M${-r * 0.34} ${-r * 0.92}a${r * 0.36} ${r * 0.36} 0 1 1 ${r * 0.68} 0Z`,
  // curls
  (r) => `M${-r} ${-r * 0.2}a${r * 0.36} ${r * 0.36} 0 0 1 ${r * 0.3} ${-r * 0.62}a${r * 0.4} ${r * 0.4} 0 0 1 ${r * 0.7} ${-r * 0.3}a${r * 0.4} ${r * 0.4} 0 0 1 ${r * 0.7} ${r * 0.3}a${r * 0.36} ${r * 0.36} 0 0 1 ${r * 0.3} ${r * 0.62}Z`,
];

function Listener({ frame, x, y, r, at, hair }) {
  const dark = '#0a1131';
  return (
    <g>
      <path d={`M${x - r * 2.1} 196C${x - r * 2} ${y + r * 0.9} ${x - r * 0.8} ${y + r * 0.7} ${x} ${y + r * 0.7}C${x + r * 0.8} ${y + r * 0.7} ${x + r * 2} ${y + r * 0.9} ${x + r * 2.1} 196Z`} fill={dark} />
      <path d={`M${x + r * 0.5} ${y + r * 0.74}C${x + r * 1.5} ${y + r * 0.84} ${x + r * 1.96} ${y + r * 1.3} ${x + r * 2.04} 192`} fill="none" stroke={AMBER} strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <Rig as="g" frame={frame}
        attrs={(f) => {
          const u = ramp(f.t, at, at + 0.55);
          return { transform: `translate(${x} ${n3(y + r * 0.7 - u * 1.6)}) rotate(${n3(-12 + u * 23)}) translate(0 ${n(-r * 0.7)})` };
        }}>
        <ellipse rx={r * 0.9} ry={r} fill={dark} />
        <ellipse cx={r * 0.9} cy={r * 0.12} rx={r * 0.16} ry={r * 0.26} fill={dark} />
        <path d={HAIRS[hair](r)} fill={dark} />
        {/* the stage light catching the side of the head */}
        <Rig frame={frame} fill="none" stroke={AMBER} strokeWidth="1" strokeLinecap="round"
          d={`M${n(r * 0.2)} ${n(-r * 0.97)}C${n(r * 0.74)} ${n(-r * 0.86)} ${n(r * 0.96)} ${n(-r * 0.3)} ${n(r * 0.86)} ${n(r * 0.32)}`}
          attrs={(f) => ({ opacity: n3(0.35 + 0.6 * ramp(f.t, at, at + 0.55)) })} />
      </Rig>
    </g>
  );
}

export function OratoryHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('oratory-club');
  const clock = useRigClock(isPlaying, isReplaying, DURATION);
  const frame = useRigFrame(clock, scene);
  const jacket = accent.dark;

  const keyline = { stroke: INK, strokeWidth: 1, strokeLinejoin: 'round' };
  const chalk = { fill: 'none', stroke: CHALK, strokeWidth: 1.7, strokeLinecap: 'round', pathLength: 1, strokeDasharray: '1 2' };
  const draw = (key) => (f) => ({ 'stroke-dashoffset': n3(1 - f[key]), opacity: f[key] > 0.004 ? 0.9 : 0 });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl bg-blue-950 text-white shadow-xl`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
            Oratory Club
          </h1>
          <p className="mt-1" style={{ color: '#bfdbfe' }}>
            Mastering public speaking, debate, and rhetoric.
          </p>
        </div>

        <svg
          key={isReplaying ? 'replay' : 'intro'}
          viewBox="0 0 364 192"
          className={`${styles.art} pointer-events-none`}
          role="img"
          aria-label="A speaker at a lectern, lit by a warm stage light, making a point with one raised finger in front of the microphone while the front row looks up"
        >
          <defs>
            <radialGradient id="oratory-club-light" cx="0.56" cy="0.4" r="0.62">
              <stop offset="0%" stopColor="#fde7a8" />
              <stop offset="70%" stopColor="#f9c35c" />
              <stop offset="100%" stopColor="#f0a437" />
            </radialGradient>
            <pattern id="oratory-club-dots" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
              <circle cx="2.5" cy="2.5" r="1.15" fill="#c2551a" />
            </pattern>
            <linearGradient id="oratory-club-tone" x1="0.1" y1="1" x2="0.75" y2="0.2">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="oratory-club-tone-mask">
              <circle cx="250" cy="74" r="66" fill="url(#oratory-club-tone)" />
            </mask>
            <linearGradient id="oratory-club-lectern" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2a4196" />
              <stop offset="100%" stopColor="#16235c" />
            </linearGradient>
            <filter id="oratory-club-chalk" x="-5%" y="-10%" width="110%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
              <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.9" />
            </filter>
          </defs>

          <g transform={STAGE}>
          {/* The pool of stage light on the back wall */}
          <Rig as="g" frame={frame} attrs={(f) => ({ opacity: n3(0.3 + 0.7 * f.light) })}>
            <circle cx="246.5" cy="76.5" r="66" fill="none" stroke={CHALK} strokeWidth="0.9" opacity="0.5" />
            <circle cx="250" cy="74" r="66" fill="url(#oratory-club-light)" />
            <circle cx="250" cy="74" r="66" fill="url(#oratory-club-dots)" mask="url(#oratory-club-tone-mask)" opacity="0.55" />
          </Rig>

          {/* A speechwriter's scansion of the line being spoken (drawn in hall space, so it is un-scaled here) */}
          <g transform={UNSTAGE} filter="url(#oratory-club-chalk)">
            <Rig frame={frame} d="M140 30C112 12 72 18 44 50" {...chalk} attrs={draw('arc')} />
            <Rig frame={frame} d="M120 11L115 18" {...chalk} attrs={draw('acc1')} />
            <Rig frame={frame} d="M82 13L76 19" {...chalk} attrs={draw('acc2')} />
            <Rig frame={frame} d="M100 11L94 27M106 12L100 28" {...chalk} strokeWidth="1.4" attrs={draw('caes')} />
            <Rig as="circle" frame={frame} cx="118" cy="62.6" fill={CHALK} attrs={(f) => ({ r: n3(3 * f.stop), opacity: f.stop > 0.004 ? 0.92 : 0 })} />
            <Rig frame={frame} d="M46 64C64 60.6 84 60 108 61.6" {...chalk} strokeWidth="2.1" attrs={draw('under')} />
          </g>

          {/* ---- The speaker ---- */}
          {/* far arm, hand on the notes */}
          <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.shL, f.farEl, 7, 6) + capsule(f.farEl, FAR_HAND, 6, 4.6) })} fill={jacket} {...keyline} />
          <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.shL, f.farEl, 7, 6) + capsule(f.farEl, FAR_HAND, 6, 4.6) })} fill={INK} opacity="0.3" />
          <path d="M238 117l19 -2.4l1 5.6l-19 2.4Z" fill={PAPER} stroke={INK} strokeWidth="0.7" />
          <circle cx={FAR_HAND[0] - 2} cy={FAR_HAND[1] - 0.5} r="4.6" fill={SKIN} {...keyline} />

          {/* neck */}
          <Rig frame={frame} attrs={(f) => ({ d: capsule(mix(f.j.chest, f.j.headC, -0.15), f.j.headC, 6, 5.4) })} fill={SKIN} {...keyline} />

          {/* jacket, drawn around the hidden pelvis and leaned with the torso */}
          <Rig as="g" frame={frame} attrs={(f) => ({ transform: place(f.j.pelvis, f.torso) })}>
            <path d="M-21 8L-22 -40C-22 -56 -20 -65 -13 -70L-4 -74L9 -74C20 -73 28 -67 29 -56L28 8Z" fill={jacket} {...keyline} />
            <path d="M6 -74C18 -73 28 -67 29 -56L28 8L8 8C12 -20 12 -48 6 -74Z" fill={INK} opacity="0.2" />
            <path d="M-10 -71.4L-4 -74L4.6 -74L-5.4 -55Z" fill={PAPER} {...keyline} />
            <path d="M4.6 -74L-5.4 -55L-12 -34" fill="none" stroke={INK} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M-10 -71.4L-12.6 -60L-5.4 -55" fill="none" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          </Rig>

          {/* head */}
          <Rig as="g" frame={frame} attrs={(f) => ({ transform: place(f.j.headC, f.head) })}>
            <Rig frame={frame} attrs={(f) => ({ d: headPath(f.jaw) })} fill={SKIN} {...keyline} />
            <path d={HAIR} fill={INK} />
            <ellipse cx="4.2" cy="0.8" rx="2.6" ry="3.7" fill={SKIN} stroke={INK} strokeWidth="0.9" />
            <path d="M-12.6 -2.2L-9.4 -2.6" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M-14 -5.6L-8.6 -6.4" stroke={INK} strokeWidth="1" strokeLinecap="round" />
          </Rig>

          {/* ---- Lectern and microphone ---- */}
          <path d="M210 132.6L312 125L307 196L216 196Z" fill="url(#oratory-club-lectern)" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M224 142.6L299 137.4L296 196L228.6 196Z" fill="none" stroke={jacket} strokeWidth="1" opacity="0.7" />
          {/* the emblem: an opening quotation mark */}
          <path d="M249 168c-1 -7 2 -12 8 -14l1 2.6c-3 1.4 -4.4 3.4 -4.4 5.6h4.4v5.8ZM263 167c-1 -7 2 -12 8 -14l1 2.6c-3 1.4 -4.4 3.4 -4.4 5.6h4.4v5.8Z" fill={jacket} />
          <path d="M200 127.4L318 118.6L319 125L201 133.8Z" fill="#3a56b4" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M201.6 128.4L317.6 119.8" stroke={AMBER} strokeWidth="1" strokeLinecap="round" opacity="0.85" />

          <path d="M211 128C207.4 121 205.6 114 207 107" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M211 128C207.4 121 205.6 114 207 107" fill="none" stroke="#7f8fb8" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="1.2 2" />
          <rect x="205.4" y="125.2" width="11" height="3.6" rx="1.2" fill={INK} />
          <g transform="translate(207 107) rotate(42) scale(1.3)">
            <rect x="-3.2" y="-9" width="6.4" height="10" rx="1.6" fill={INK} />
            <rect x="-5.4" y="-22" width="10.8" height="14.4" rx="5.4" fill="#27336e" stroke={INK} strokeWidth="1" />
            <path d="M-4.6 -17.6H4.6M-5 -14H5M-4.6 -10.6H4.6M-1.8 -21V-8.6M1.8 -21V-8.6" stroke="#dbe3f8" strokeWidth="0.75" />
            <path d="M-3.4 -9.2H3.4" stroke={AMBER} strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* ---- The hand that does the talking ---- */}
          <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.shR, f.el, 8.4, 7) })} fill={jacket} {...keyline} />
          <Rig frame={frame} attrs={(f) => ({ d: capsule(f.el, f.cuff, 6.8, 5) })} fill={jacket} {...keyline} />
          <Rig frame={frame} attrs={(f) => ({ d: capsule(f.cuff, mix(f.cuff, f.ha, 0.62), 5.2, 4.8) })} fill={PAPER} {...keyline} />
          <Rig as="g" frame={frame} attrs={(f) => ({ transform: `${place(f.ha, f.hr)} scale(${HAND_K})` })}>
            {[3, 2, 1].map((i) => (
              <Rig key={i} frame={frame} attrs={(f) => ({ d: finger(i, f.cO, f.sp) })} fill={SKIN} stroke={INK} strokeWidth="0.85" />
            ))}
            <Rig frame={frame} attrs={(f) => ({ d: finger(0, f.cI, f.sp) })} fill={SKIN} stroke={INK} strokeWidth="0.85" />
            <path d="M-4.2 1.6C-7 -2 -7 -7.4 -6.2 -10.6L6 -10.6C7 -7 6.4 -2 4.2 1.6Z" fill={SKIN} stroke={INK} strokeWidth="0.85" strokeLinejoin="round" />
            <Rig frame={frame} attrs={(f) => ({ d: thumb(f.th) })} fill={SKIN} stroke={INK} strokeWidth="0.85" />
          </Rig>
          </g>

          {/* ---- The front row ---- */}
          {ROW.map((h) => (
            <Listener key={h.x} frame={frame} {...h} />
          ))}
        </svg>
      </div>
    </div>
  );
}
