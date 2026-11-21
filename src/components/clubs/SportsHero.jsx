// src/components/clubs/SportsHero.jsx
//
// Sports Society — matchday at the University Premier League, drawn as a
// flat screenprint poster: night sky, one floodlight tower, a stand full of
// dots, and a batter in the club's colour lofting the ball over everything.
//
// The society's own description leads with the UPL ("Home to the University
// Premier League — and everything played to win"), so cricket is the scene
// and the one focal sequence: the floodlight comes up, the delivery arrives
// from the bowler's end, the batter steps out and drives, the ball climbs
// away into the night trailing a dotted arc, the scoreboard's tile rolls up
// to a six and the stand bobs once. Then it holds — the follow-through, the
// ball still climbing, the six on the board — as a finished poster. That
// held frame is what the directory cards and reduced-motion readers see, so
// it is composed first and the motion only leads up to it.
//
// The rest of the society (football, pickleball, badminton) is in the same
// world rather than in a sequence of costume changes: the kit left on the
// boundary in the foreground. The previous hero morphed one ball through
// all four sports past a disembodied leg; its rested frame was unreadable.
//
// Mechanism: the shared figure rig (./rig). One Framer Motion clock drives
// one `scene(t)` function that returns the batter's joints, the bat, the
// ball, its trail, the scoreboard digit and the crowd bob — so bat and ball
// meet by construction, and stopping mid-play snaps the whole picture to
// its rested frame together. The clock rests at the end of the timeline, so
// the server render and reduced motion get the finished poster for free.
// Nothing loops.
//
// Colour: the batter's kit, the trail, the scoreboard digit and the lamps
// take the club accent (gold; white in unified mode). The cricket ball's
// red, the lime pickleball and the black-and-white football stay their real
// colours in every mode — they are how each sport is recognised. The
// scoreboard shows only "SPL" and a six for the shot just played; no
// invented teams or totals.

import React from 'react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { Rig, useRigClock, useRigFrame } from './rig/RigParts';
import { POSE0, capsule, clamp, lerp, makeTimeline, mix, n, place, pt, reach, shift, solve } from './rig/rig';
import styles from './SportsHero.module.css';

const CREAM = '#f3e9cf';
const RED = '#d8432e';
const WOOD = '#d9a45a';
const SKIN = '#b9764a';

const FLOOR = 161;
const RAD = Math.PI / 180;

const BODY = { torso: 32, neck: 4, headR: 7.2, shoulderW: 20, hipW: 11, upperArm: 18, foreArm: 17, thigh: 30, shin: 31, foot: 8.5 };
const BAT = { handle: 14, blade: 34 };
const ARM = BODY.upperArm + BODY.foreArm;

// Beats (seconds).
const T = {
  release: 0.55, // the ball enters from the bowler's end
  bounce: 0.98,
  contact: 1.2,
  away: 2.75, // the ball has climbed as far as the poster shows
  board: 2.45, // the scoreboard tile starts to roll
  boardEnd: 3.15,
  cheer: 2.55,
  cheerEnd: 3.9,
};

// gx/gy: where the top hand wants the bat handle. ba: the bat's angle in the
// rig's limb convention (0 hangs straight down, + swings toward the bowler,
// 180 points straight up).
const BATTER = makeTimeline([
  { t: 0, x: 134, torso: 34, head: 14, llT: 14, llS: -16, rlT: 28, rlS: -10, lf: 84, rf: 84, gx: 154, gy: 107, ba: -10 },
  { t: 0.45, x: 134, torso: 34, gx: 154, gy: 107, ba: -10, stop: true },
  { t: 0.95, x: 133, torso: 22, head: 14, llT: 8, llS: -12, rlT: 26, rlS: -4, gx: 132, gy: 80, ba: -150 },
  { t: 1.08, x: 139, torso: 20, rlT: 40, rlS: -2, llT: -6, llS: -22, gx: 136, gy: 88, ba: -118 },
  { t: 1.2, x: 147, torso: 24, head: 20, rlT: 44, rlS: 2, llT: -18, llS: -36, lf: 72, gx: 172, gy: 108, ba: 26 },
  { t: 1.36, x: 150, torso: 10, head: 6, gx: 184, gy: 78, ba: 118 },
  { t: 1.62, x: 151, torso: -2, head: 0, gx: 178, gy: 54, ba: 190, lf: 70 },
  { t: 2.05, x: 150, torso: -8, head: -5, rlT: 46, rlS: -4, llT: -22, llS: -46, lf: 68, gx: 170, gy: 52, ba: 228, stop: true },
  { t: 4.2 },
]);
const DURATION = BATTER.duration;

const IN0 = [372, 98];
const BOUNCE = [238, 155.5];

const easeOut = (u) => 1 - (1 - u) ** 3;
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

function batter(t) {
  const p = { ...POSE0, ...BATTER(t), turn: 0.32, y: 0 };
  const j = solve(p, BODY);
  const low = Math.max(j.anL[1], j.anR[1], j.toeL[1], j.toeR[1]) + 2;
  shift(j, 0, FLOOR - low);

  // Both hands on one handle: pull the grip inside the arms' reach, then
  // solve each arm to it.
  const mid = mix(j.shL, j.shR, 0.5);
  let grip = [p.gx, p.gy];
  const d = Math.hypot(grip[0] - mid[0], grip[1] - mid[1]);
  if (d > ARM - 2.5) grip = mix(mid, grip, (ARM - 2.5) / d);
  const dir = [Math.sin(p.ba * RAD), Math.cos(p.ba * RAD)];
  const lower = [grip[0] + dir[0] * 6, grip[1] + dir[1] * 6];
  const top = reach(j.shL, grip, BODY.upperArm, BODY.foreArm, -1);
  const bottom = reach(j.shR, lower, BODY.upperArm, BODY.foreArm, -1);
  j.elL = top.mid;
  j.haL = top.tip;
  j.elR = bottom.mid;
  j.haR = bottom.tip;
  const butt = [grip[0] - dir[0] * 3, grip[1] - dir[1] * 3];
  const splice = [grip[0] + dir[0] * (BAT.handle - 3), grip[1] + dir[1] * (BAT.handle - 3)];
  const toe = [splice[0] + dir[0] * BAT.blade, splice[1] + dir[1] * BAT.blade];
  return { j, p, butt, splice, toe };
}

// The ball meets the middle of the blade wherever the swing puts it.
const AT_CONTACT = batter(T.contact);
const CONTACT = mix(AT_CONTACT.splice, AT_CONTACT.toe, 0.55);
const OUT = [CONTACT, [228, 44], [276, 27]]; // the lofted drive, a quadratic curve

function ballAt(t) {
  if (t < T.bounce) {
    const u = span(t, T.release, T.bounce);
    const pos = mix(IN0, BOUNCE, u);
    pos[1] -= 9 * Math.sin(u * Math.PI) * (1 - u * 0.4); // a little flight on the delivery
    return { pos, r: 4.6, show: t >= T.release ? 1 : 0, u: 0 };
  }
  if (t < T.contact) {
    const u = span(t, T.bounce, T.contact);
    return { pos: mix(BOUNCE, CONTACT, u), r: 4.6, show: 1, u: 0 };
  }
  const u = easeOut(span(t, T.contact, T.away));
  const a = mix(OUT[0], OUT[1], u);
  const b = mix(OUT[1], OUT[2], u);
  return { pos: mix(a, b, u), ctrl: a, r: lerp(4.6, 3.9, u), show: 1, u };
}

function scene(t) {
  const B = batter(t);
  const ball = ballAt(t);
  // The dotted arc the ball has drawn so far (it stays in the rested frame).
  const from = mix(OUT[0], OUT[1], 0.12);
  const trail = ball.u > 0.14 ? `M${pt(from)}Q${pt(mix(from, ball.ctrl, 0.94))} ${pt(mix(ball.ctrl, ball.pos, 0.9))}` : 'M0 0';
  const cheer = span(t, T.cheer, T.cheerEnd);
  const bob = (phase) => (cheer > 0 && cheer < 1 ? -2.6 * Math.sin(cheer * Math.PI * 4 + phase) ** 2 * (1 - cheer) : 0);
  return {
    ...B,
    ball,
    trail,
    spark: t >= T.contact ? 1 - span(t, T.contact, T.contact + 0.32) : 0,
    digit: 6 * easeInOut(span(t, T.board, T.boardEnd)),
    bobA: bob(0),
    bobB: bob(1.1),
    lamp: t < 0.1 ? 0.25 : t < 0.18 ? 0.85 : t < 0.26 ? 0.45 : lerp(0.8, 1, span(t, 0.26, 0.6)),
  };
}

// Crowd: hand-placed-by-formula dots, deterministic. Two interleaved groups
// so the cheer reads as a ripple, not a slab moving.
const CROWD = [];
for (let row = 0; row < 3; row++) {
  for (let i = 0; i < 34; i++) {
    const x = 52 + i * 9.3 + (row % 2) * 4.6;
    const y = 122 + row * 8.5;
    const k = (i * 7 + row * 5) % 11;
    CROWD.push({ x, y, group: (i + row) % 2, tone: k < 2 ? 'accent' : k < 4 ? 'red' : 'cream' });
  }
}

function Batter({ frame, kit }) {
  const part = (a, b, ra, rb, fill = kit) => (
    <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j[a], f.j[b], ra, rb) })} fill={fill} />
  );
  const pad = (kn, an, hip) => (
    <Rig frame={frame} attrs={(f) => ({ d: capsule(mix(f.j[kn], f.j[hip], 0.22), mix(f.j[kn], f.j[an], 0.97), 5.6, 4.7) })} fill={CREAM} />
  );
  const glove = (h) => <Rig as="circle" frame={frame} r="3.8" fill={CREAM} attrs={(f) => ({ cx: n(f.j[h][0]), cy: n(f.j[h][1]) })} />;
  return (
    <g>
      {/* back leg */}
      {part('hipL', 'knL', 6.2, 4.8)}
      {part('knL', 'anL', 4.4, 3.4)}
      {pad('knL', 'anL', 'hipL')}
      {part('anL', 'toeL', 3.3, 2.5, CREAM)}
      {/* body */}
      <Rig frame={frame} attrs={(f) => ({ d: capsule(f.j.pelvis, mix(f.j.pelvis, f.j.chest, 0.94), 7.6, 8.6) })} fill={kit} />
      {/* front leg */}
      {part('hipR', 'knR', 6.2, 4.8)}
      {part('knR', 'anR', 4.4, 3.4)}
      {pad('knR', 'anR', 'hipR')}
      {part('anR', 'toeR', 3.3, 2.5, CREAM)}
      {/* bat: handle, then blade */}
      <Rig frame={frame} attrs={(f) => ({ d: capsule(f.butt, f.splice, 1.7, 1.7) })} fill={RED} />
      <Rig frame={frame} attrs={(f) => ({ d: capsule(f.splice, f.toe, 3.9, 4.6) })} fill={WOOD} />
      {/* arms and gloves */}
      {part('shL', 'elL', 4, 3.3)}
      {part('elL', 'haL', 3.3, 2.7)}
      {glove('haL')}
      {part('shR', 'elR', 4, 3.3)}
      {part('elR', 'haR', 3.3, 2.7)}
      {glove('haR')}
      {/* head: face, helmet with its peak and grille, facing the bowler */}
      <Rig as="g" frame={frame} attrs={(f) => ({ transform: place(f.j.headC, f.p.torso * 0.35 + f.p.head) })}>
        <g transform="scale(1.09)">
          <circle r="6.2" fill={SKIN} />
          <path d="M-7.3 2.2A7.3 7.3 0 0 1 6.6 -3.2L12.2 -2.2L12.2 -0.4L3.4 0.2L0.6 2.6Z" fill={RED} />
          <path d="M11.6 -0.6Q11.8 6.4 3.6 8.2M7.6 0.2Q8 4.6 5.4 7.6" fill="none" stroke={CREAM} strokeWidth="1" strokeLinecap="round" />
        </g>
      </Rig>
    </g>
  );
}

export function SportsHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('sports-society');
  const clock = useRigClock(isPlaying, isReplaying, DURATION);
  const frame = useRigFrame(clock, scene);
  const gold = accent.dark;
  const tone = { accent: gold, red: RED, cream: CREAM };

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className={`${styles.root} relative my-6 w-full overflow-hidden rounded-2xl text-white shadow-xl`}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
            Sports Society
          </h1>
          <p style={{ color: '#e6dcc3' }}>
            Home to the University Premier League — and everything played to win.
          </p>
        </div>

        <svg
          key={isReplaying ? 'replay' : 'intro'}
          viewBox="0 0 364 192"
          className={`${styles.art} pointer-events-none`}
          role="img"
          aria-label="A floodlit University Premier League match: a batter lofts the ball into the night sky, the scoreboard reads SPL 6, and a football, a pickleball paddle and a badminton racquet wait on the boundary"
        >
          <defs>
            <linearGradient id="sports-society-fade" x1="44" y1="0" x2="92" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="1" />
            </linearGradient>
            <mask id="sports-society-ground" maskUnits="userSpaceOnUse" x="0" y="0" width="364" height="192">
              <rect width="364" height="192" fill="url(#sports-society-fade)" />
            </mask>
            <linearGradient id="sports-society-beam" x1="338" y1="22" x2="170" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={CREAM} stopOpacity="0.34" />
              <stop offset="1" stopColor={CREAM} stopOpacity="0.03" />
            </linearGradient>
            <radialGradient id="sports-society-glow" cx="338" cy="22" r="36" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={gold} stopOpacity="0.55" />
              <stop offset="0.5" stopColor={gold} stopOpacity="0.16" />
              <stop offset="1" stopColor={gold} stopOpacity="0" />
            </radialGradient>
            <pattern id="sports-society-halftone" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
              <circle cx="2.5" cy="2.5" r="0.85" fill={CREAM} />
            </pattern>
            <clipPath id="sports-society-tile">
              <rect x="291" y="71" width="24" height="31" rx="2" />
            </clipPath>
          </defs>

          {/* A few stars the floodlight hasn't washed out */}
          <g fill={CREAM}>
            {[[58, 22, 1], [96, 54, 0.8], [118, 14, 1.1], [206, 18, 0.9], [236, 44, 0.8], [182, 58, 0.7], [74, 84, 0.8]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} opacity="0.55" />
            ))}
          </g>

          {/* Floodlight: glow, and a halftone beam falling on the square */}
          <Rig as="g" frame={frame} attrs={(f) => ({ opacity: n(f.lamp * 100) / 100 })}>
            <circle cx="338" cy="22" r="36" fill="url(#sports-society-glow)" />
            <path d="M326 26L92 150L262 150L348 30Z" fill="url(#sports-society-beam)" />
            <path d="M326 26L92 150L262 150L348 30Z" fill="url(#sports-society-halftone)" opacity="0.1" />
          </Rig>

          {/* Stand and outfield, fading out toward the text */}
          <g mask="url(#sports-society-ground)">
            <path d="M0 116L364 110L364 150L0 150Z" fill="#183450" />
            <path d="M0 116L364 110L364 113L0 119Z" fill="#274a6c" />
            {[0, 1].map((g) => (
              <Rig key={g} as="g" frame={frame} attrs={(f) => ({ transform: `translate(0 ${n(g ? f.bobB : f.bobA)})` })}>
                {CROWD.filter((c) => c.group === g).map((c, i) => (
                  <circle key={i} cx={n(c.x)} cy={n(c.y)} r="2.3" fill={tone[c.tone]} opacity={c.tone === 'cream' ? 0.42 : 0.6} />
                ))}
              </Rig>
            ))}
            <rect x="0" y="147" width="364" height="45" fill="#1d5b3f" />
            <rect x="0" y="147" width="364" height="2.2" fill={CREAM} opacity="0.75" />
            <path d="M0 166L364 163L364 192L0 192Z" fill="#174a33" />
            {/* the pitch, seen side-on, and the popping crease */}
            <rect x="48" y="156.5" width="316" height="8" rx="1" fill="#c9b27a" />
            <rect x="158" y="156.5" width="2" height="8" fill={CREAM} />
          </g>

          {/* Scoreboard on the stand roof: the league's initials and one rolling tile */}
          <g>
            <path d="M256 104V114M306 104V113" stroke="#274a6c" strokeWidth="3" />
            <rect x="238" y="64" width="84" height="44" rx="3" fill="#081523" stroke={CREAM} strokeWidth="1.6" />
            <text x="243.5" y="93" fontSize="19" fontWeight="700" fill={CREAM} letterSpacing="0.5" style={{ fontFamily: 'inherit' }}>
              SPL
            </text>
            <rect x="291" y="71" width="24" height="31" rx="2" fill="#12283f" />
            <g clipPath="url(#sports-society-tile)">
              <Rig as="g" frame={frame} attrs={(f) => ({ transform: `translate(0 ${n(f.digit * 31)})` })}>
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <text key={d} x="303" y={95.5 - d * 31} fontSize="25" fontWeight="700" textAnchor="middle" fill={gold} style={{ fontFamily: 'inherit' }}>
                    {d}
                  </text>
                ))}
              </Rig>
            </g>
          </g>

          {/* Floodlight tower */}
          <g>
            <path d="M338 30V150" stroke="#3a5f85" strokeWidth="2.6" />
            <path d="M331 150L338 96L345 150M333.5 130H342.5M335 112H341" fill="none" stroke="#3a5f85" strokeWidth="1.3" />
            <g transform="rotate(-24 338 20)">
              <rect x="322" y="9" width="32" height="22" rx="2" fill="#081523" stroke="#3a5f85" strokeWidth="1.2" />
              {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
                <Rig key={`${r}-${c}`} as="circle" frame={frame} cx={327 + c * 7.3} cy={13.6 + r * 6.4} r="2.3" fill={(r + c) % 3 === 0 ? gold : CREAM} attrs={(f) => ({ opacity: n(f.lamp * 100) / 100 })} />
              )))}
            </g>
          </g>

          {/* Stumps and bails behind the batter */}
          <g fill={CREAM}>
            <rect x="92" y="130" width="2.6" height="28" rx="1" />
            <rect x="97.7" y="130" width="2.6" height="28" rx="1" />
            <rect x="103.4" y="130" width="2.6" height="28" rx="1" />
            <rect x="91.6" y="127.8" width="7.4" height="2.2" rx="1.1" />
            <rect x="99" y="127.8" width="7.4" height="2.2" rx="1.1" />
          </g>

          {/* The rest of the society's kit, left on the boundary */}
          <g transform="translate(360 190) scale(1.16) translate(-360 -190)">
            {/* badminton racquet, propped on the kit bag */}
            <g transform="rotate(38 318 166)">
              <path d="M318 166V139" stroke={CREAM} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M318 172V160" stroke={RED} strokeWidth="3.4" strokeLinecap="round" />
              <ellipse cx="318" cy="127" rx="9.5" ry="12.5" fill="#12283f" stroke={CREAM} strokeWidth="1.9" />
              <path d="M311 121H325M309.5 127H326.5M311 133H325M314 116V138M318 115V139M322 116V138" stroke={CREAM} strokeWidth="0.6" opacity="0.7" />
            </g>
            {/* kit bag */}
            <path d="M292 184Q290 166 300 165L338 165Q348 166 346 184Z" fill="#274a6c" />
            <path d="M307 165V184M331 165V184" stroke={gold} strokeWidth="2.2" />
            <path d="M309 166Q319 153 329 166" fill="none" stroke="#3a5f85" strokeWidth="2" />
            {/* pickleball paddle and ball */}
            <g transform="rotate(-20 276 172)">
              <rect x="266" y="151" width="20" height="23" rx="6.5" fill={RED} />
              <rect x="266" y="151" width="20" height="23" rx="6.5" fill="none" stroke={CREAM} strokeWidth="1.2" />
              <rect x="273.6" y="173" width="4.8" height="12" rx="1.6" fill={CREAM} />
            </g>
            <g>
              <circle cx="291" cy="181" r="5.2" fill="#d8ee5a" />
              {[[-2.2, -1.6], [1.8, -2.2], [0, 0.6], [-2, 2.6], [2.4, 2]].map(([dx, dy], i) => (
                <circle key={i} cx={291 + dx} cy={181 + dy} r="0.8" fill="#5a7412" />
              ))}
            </g>
            {/* football */}
            <g transform="translate(246 176)">
              <circle r="10" fill="#f6f1e2" />
              <path d="M0 -4.2L4 -1.3L2.5 3.4L-2.5 3.4L-4 -1.3Z" fill="#14202e" />
              <path d="M0 -4.2V-10M4 -1.3L9.4 -3.2M2.5 3.4L5.8 8.2M-2.5 3.4L-5.8 8.2M-4 -1.3L-9.4 -3.2" stroke="#14202e" strokeWidth="1.1" />
              <path d="M-3.6 -9.3L0 -8L3.6 -9.3M9.9 0.6L7.6 3.6L8 7M-9.9 0.6L-7.6 3.6L-8 7" fill="none" stroke="#14202e" strokeWidth="1.1" />
            </g>
            {/* shuttlecock */}
            <g transform="translate(352 181) rotate(-28)">
              <path d="M-6.5 -11L6.5 -11L2.4 0L-2.4 0Z" fill={CREAM} />
              <path d="M-2.2 -11L-0.8 0M2.2 -11L0.8 0" stroke="#b9ad8c" strokeWidth="0.7" />
              <path d="M-2.6 0A2.6 3 0 0 0 2.6 0Z" fill={RED} />
            </g>
          </g>

          {/* Batter's shadow on the pitch */}
          <Rig as="ellipse" frame={frame} cy="163.4" ry="2.3" fill="#081523" opacity="0.4" attrs={(f) => ({ cx: n(f.j.pelvis[0] + 2), rx: n(16 + (f.j.toeR[0] - f.j.toeL[0]) * 0.4) })} />

          <Batter frame={frame} kit={gold} />

          {/* The ball: its dotted arc, the flash off the bat, the ball itself */}
          <Rig frame={frame} attrs={(f) => ({ d: f.trail })} fill="none" stroke={gold} strokeWidth="2.3" strokeLinecap="round" strokeDasharray="0.1 6.4" />
          <Rig as="g" frame={frame} attrs={(f) => ({ opacity: n(f.spark * 100) / 100, transform: `translate(${pt(CONTACT)}) scale(${n(1 + (1 - f.spark) * 0.8)})` })}>
            <path d="M7 -8L12 -14M10 -1L18 -2M1 -10L1 -18M9 6L15 10" stroke={CREAM} strokeWidth="1.8" strokeLinecap="round" />
          </Rig>
          <Rig as="g" frame={frame} attrs={(f) => ({ transform: `translate(${pt(f.ball.pos)}) scale(${n(f.ball.r / 4.6 * 100) / 100})`, opacity: f.ball.show })}>
            <circle r="4.6" fill={RED} />
            <path d="M-3.4 -3.1Q0 0 -3.4 3.1" fill="none" stroke={CREAM} strokeWidth="0.9" />
          </Rig>
        </svg>
      </div>
    </div>
  );
}
