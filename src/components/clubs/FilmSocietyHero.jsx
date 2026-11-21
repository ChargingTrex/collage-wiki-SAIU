// src/components/clubs/FilmSocietyHero.jsx
//
// Creators Club (slug film-society): 3, 2, 1, and the film rolls.
//
// The card is a 35mm strip running through a projector gate. It opens on
// the classic countdown leader (rings, crosshair, the clock-hand wedge that
// sweeps once per number) flickering, weaving in the gate and scratched the
// way a well-travelled print is. It counts 3, 2, 1, then the claw pulls the
// strip down a frame to the slate, the clapperboard snaps, and the strip
// pulls down once more onto the first frame of the scene: a filmmaker and
// a camera on a ridge at dusk. That frame is where the card rests.
//
// Why this: the leader is the moment before every film starts, and the
// slate is the moment a crew starts making one. The club does both,
// watching and making. The pull-down keeps the idea from the earlier hero
// (film is intermittent motion: move, hold, move) but now it leads somewhere.
//
// Sound: a separate "Play with sound" button plays the projector (sprocket
// clatter, motor hum, a beep on each count, the clapper) synthesized with
// the Web Audio API in FilmSocietyHeroSound.js and restarts the countdown
// in sync. It never plays on load or on a replay click, stops on a second
// press, when the hero is stopped or scrolled away, on unmount, and when it
// ends. The button is a sibling of the replay root (not nested inside that
// role="button" element) and is not rendered for reduced-motion visitors.
//
// Color: the card is permanently dark, so the heading uses the accent's
// `dark` variant. The scene frame is tinted entirely with that accent, so
// unified mode turns it into a black-and-white film still.

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Square } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { FILM_CUES as C, buildProjectorSound } from './FilmSocietyHeroSound';
import styles from './FilmSocietyHero.module.css';

const TOTAL = C.settle;

// Each property gets [time in seconds, value, ease into this keyframe];
// padded to TOTAL so elements hold before their cue and after their last.
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

// Strip geometry (viewBox 280 x 192). The frame is 224 x 160, close to the
// Academy ratio; four perforations per frame, as on 35mm.
const FRAME = { x: 28, y: 16, w: 224, h: 160 };
const PITCH = 168; // one frame + the frame line
const PERF = PITCH / 4;
const CX = FRAME.x + FRAME.w / 2;
const CY = FRAME.y + FRAME.h / 2;

// Fixed-seed noise for flicker, gate weave and grain, generated once at
// module load (never in render) so server and client agree.
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
const rand = makeRng(1895);
const STEPS = 44;
const stepTimes = Array.from({ length: STEPS + 1 }, (_, i) => (i / STEPS) * TOTAL);
// Everything below ends on its rest value, so `playing` finishes as `rested`.
const noise = (amp, center = 0) =>
  stepTimes.map((t, i) => [t, i === STEPS ? center : center + (rand() * 2 - 1) * amp]);
const FLICKER = stepTimes.map((t, i) => [t, i === STEPS || t > C.pullToScene + 0.5 ? 0 : rand() * rand() * 0.11]);
const WEAVE_X = noise(0.7);
const WEAVE_Y = noise(0.9);
// Grain jumps between held positions (it must not glide like an overlay):
// each step is written as a hold followed by an instant move.
const hold = (frames) => frames.flatMap(([t, v], i) => (i === 0 ? [[t, v]] : [[t - 0.001, frames[i - 1][1]], [t, v]]));
const GRAIN_X = hold(noise(14));
const GRAIN_Y = hold(noise(10));

// Scratches: brief vertical lines at a few moments during the leader.
const SCRATCHES = [
  { x: 92, at: [0.42, 1.28, 2.1] },
  { x: 201, at: [0.8, 1.9] },
  { x: 150, at: [1.52, 2.62] },
].map((s) => ({
  x: s.x,
  opacity: s.at.flatMap((t) => [
    [t, 0],
    [t + 0.01, 0.5],
    [t + 0.09, 0.5],
    [t + 0.1, 0],
  ]),
}));

// The pull-down: a quick claw stroke with a little overshoot in the gate.
const PULL_EASE = [0.55, 0, 0.25, 1];
const STRIP_Y = [
  [C.pullToSlate, 0],
  [C.pullToSlate + 0.15, PITCH + 5, PULL_EASE],
  [C.pullToSlate + 0.23, PITCH, 'easeOut'],
  [C.pullToScene, PITCH],
  [C.pullToScene + 0.15, PITCH * 2 + 5, PULL_EASE],
  [C.pullToScene + 0.23, PITCH * 2, 'easeOut'],
];
const LANDED = C.pullToScene + 0.23;

const PERF_ROWS = Array.from({ length: 7 }, (_, i) => -PERF + i * PERF + (PERF - 14) / 2 + 2);

export function FilmSocietyHero() {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('film-society');
  const state = isPlaying ? 'playing' : 'rested';
  const tint = accent.dark;
  const deep = accent.light; // deep crimson; black in unified mode

  // --- Sound -------------------------------------------------------------
  const [canSound, setCanSound] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(false);
  const [run, setRun] = React.useState(0);
  const audioRef = React.useRef(null);

  const stopSound = React.useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    audioRef.current = null;
    clearTimeout(a.timer);
    try {
      // A short fade so stopping mid-clatter doesn't click.
      const now = a.ctx.currentTime;
      a.master.gain.cancelScheduledValues(now);
      a.master.gain.setTargetAtTime(0, now, 0.012);
    } catch {
      /* context already closed */
    }
    setTimeout(() => a.ctx.close().catch(() => {}), 90);
    setSoundOn(false);
  }, []);

  React.useEffect(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanSound(Boolean(AudioCtx) && !reduced);
    return stopSound;
  }, [stopSound]);

  // The sound belongs to the running picture: if the hero is stopped (a
  // click on it) or scrolls out of view, the projector stops too.
  React.useEffect(() => {
    if (soundOn && !isPlaying) stopSound();
  }, [soundOn, isPlaying, stopSound]);

  const onSoundClick = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      stopSound();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let ctx;
    try {
      ctx = new AudioCtx();
    } catch {
      return;
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const { master, duration } = buildProjectorSound(ctx, ctx.currentTime + 0.03);
    audioRef.current = { ctx, master, timer: setTimeout(stopSound, (duration + 0.15) * 1000) };
    setSoundOn(true);
    // Restart the countdown under the sound. If the hero isn't in a click
    // replay yet, the hook's own toggle starts one (and remounts the SVG);
    // if it already is, toggling would stop it, so remount via `run`.
    if (isReplaying) setRun((n) => n + 1);
    else hoverProps.onClick();
  };

  return (
    <div className={`${styles.wrap} my-6 rounded-2xl shadow-xl`}>
      <div
        {...hoverProps}
        style={accentStyle}
        className={`${styles.root} relative w-full overflow-hidden rounded-2xl text-white`}
      >
        <div className={styles.inner}>
          <div className={styles.text}>
            {/* Permanently dark card, so the fixed "dark" (light) accent. */}
            <h1 className="text-3xl font-bold" style={{ color: tint }}>
              Creators Club
            </h1>
            <p className="mb-0 mt-1 text-zinc-300">Appreciating, analyzing, and creating cinema.</p>
          </div>

          <svg
            key={`${isReplaying ? 'replay' : 'intro'}-${run}`}
            viewBox="0 0 280 192"
            preserveAspectRatio="xMaxYMid meet"
            className={styles.art}
            role="img"
            aria-label="A film leader counts down 3, 2, 1, a clapperboard snaps, and the strip rolls on to the first frame: a filmmaker with a camera on a ridge at dusk"
          >
            <defs>
              <clipPath id="film-society-frame">
                <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="3" />
              </clipPath>
              <clipPath id="film-society-strip">
                <rect x="4" y="0" width="272" height="192" />
              </clipPath>
              <linearGradient id="film-society-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={deep} stopOpacity="0.55" />
                <stop offset="0.3" stopColor={deep} stopOpacity="0.95" />
                <stop offset="0.52" stopColor={tint} stopOpacity="0.7" />
                <stop offset="0.68" stopColor={tint} stopOpacity="1" />
              </linearGradient>
              <radialGradient id="film-society-sun" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="film-society-vignette" cx="0.5" cy="0.5" r="0.72">
                <stop offset="0.55" stopColor="#000" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity="0.62" />
              </radialGradient>
              <radialGradient id="film-society-spot" cx="0.5" cy="0.45" r="0.6">
                <stop offset="0" stopColor="#5a4d40" />
                <stop offset="1" stopColor="#15110e" />
              </radialGradient>
              <pattern id="film-society-stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
                <rect width="10" height="20" fill="#f4f0e6" />
                <rect x="10" width="10" height="20" fill="#141110" />
              </pattern>
              <filter id="film-society-grain" filterUnits="userSpaceOnUse" x="0" y="-12" width="280" height="216">
                <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5" />
                <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.72" />
              </filter>
            </defs>

            <g clipPath="url(#film-society-strip)">
              {/* Film base. */}
              <rect x="4" y="-2" width="272" height="196" fill="#0a0807" />
              <rect x="4" y="-2" width="0.8" height="196" fill="#fff" opacity="0.18" />
              <rect x="275.2" y="-2" width="0.8" height="196" fill="#fff" opacity="0.18" />

              {/* Perforations run for as long as the film does. A finite
                  repeat, ending one perforation along (identical to rest). */}
              <motion.g
                initial="rested"
                animate={state}
                variants={{
                  rested: { y: 0, transition: REST },
                  playing: { y: [0, PERF], transition: { duration: 0.2, ease: 'linear', repeat: 16 } },
                }}
              >
                {PERF_ROWS.map((y) => (
                  <React.Fragment key={y}>
                    <rect x="9.5" y={y} width="11" height="14" rx="2.2" fill="#3a3129" />
                    <rect x="259.5" y={y} width="11" height="14" rx="2.2" fill="#3a3129" />
                  </React.Fragment>
                ))}
              </motion.g>

              {/* The strip: pulled down a frame at a time, weaving a little
                  in the gate while it runs. Frames stack upward (the next
                  frame arrives from above). */}
              <motion.g
                initial="rested"
                animate={state}
                variants={{
                  rested: { x: 0, y: 0, transition: REST },
                  playing: seq({ x: WEAVE_X, y: WEAVE_Y }),
                }}
              >
                <motion.g
                  initial="rested"
                  animate={state}
                  variants={{
                    rested: { y: PITCH * 2, transition: REST },
                    playing: seq({ y: STRIP_Y }),
                  }}
                >
                  {/* Frame below the leader: plain head leader. */}
                  <g transform={`translate(0 ${PITCH})`} clipPath="url(#film-society-frame)">
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="#2a2420" />
                  </g>

                  {/* Frame 0: the countdown leader. */}
                  <g clipPath="url(#film-society-frame)">
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="#cdc6b4" />
                    {/* The sweep: a fat dashed circle drawn as a pie wedge,
                        once round per number, starting at twelve o'clock. */}
                    <g transform={`rotate(-90 ${CX} ${CY})`}>
                      <motion.circle
                        cx={CX}
                        cy={CY}
                        r="70"
                        fill="none"
                        stroke="#3d3630"
                        strokeOpacity="0.34"
                        strokeWidth="140"
                        initial="rested"
                        animate={state}
                        variants={{
                          rested: { pathLength: 1, transition: REST },
                          playing: seq({
                            pathLength: [
                              [C.three, 0],
                              [C.two, 1],
                              [C.two + 0.001, 0],
                              [C.one, 1],
                              [C.one + 0.001, 0],
                              [C.pullToSlate, 1],
                            ],
                          }),
                        }}
                      />
                    </g>
                    <line x1={FRAME.x} y1={CY} x2={FRAME.x + FRAME.w} y2={CY} stroke="#1f1b18" strokeWidth="1.3" />
                    <line x1={CX} y1={FRAME.y} x2={CX} y2={FRAME.y + FRAME.h} stroke="#1f1b18" strokeWidth="1.3" />
                    <circle cx={CX} cy={CY} r="70" fill="none" stroke="#1f1b18" strokeWidth="2.6" />
                    <circle cx={CX} cy={CY} r="59" fill="none" stroke="#1f1b18" strokeWidth="2.6" />
                    {[
                      ['3', 0, C.two],
                      ['2', C.two, C.one],
                      ['1', C.one, TOTAL + 1],
                    ].map(([n, from, to]) => (
                      <motion.text
                        key={n}
                        x={CX}
                        y={CY + 33}
                        textAnchor="middle"
                        fontSize="94"
                        fontWeight="700"
                        fontFamily="Inter, system-ui, sans-serif"
                        fill="#171412"
                        initial="rested"
                        animate={state}
                        variants={{
                          rested: { opacity: n === '1' ? 1 : 0, transition: REST },
                          playing: seq({
                            opacity: [
                              [0, from === 0 ? 1 : 0],
                              ...(from > 0 ? [[from - 0.001, 0], [from, 1]] : []),
                              ...(to < TOTAL ? [[to - 0.001, 1], [to, 0]] : []),
                            ],
                          }),
                        }}
                      >
                        {n}
                      </motion.text>
                    ))}
                  </g>

                  {/* Frame 1: the slate. */}
                  <g transform={`translate(0 ${-PITCH})`} clipPath="url(#film-society-frame)">
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="url(#film-society-spot)" />
                    <g transform={`rotate(-4 ${CX} ${CY})`}>
                      {/* Board */}
                      <rect x="76" y="78" width="128" height="80" rx="3" fill="#141110" stroke="#e9e3d5" strokeWidth="1.6" />
                      <path d="M 76,104 H 204 M 76,131 H 204 M 119,104 V 131 M 162,104 V 131" stroke="#e9e3d5" strokeWidth="1" opacity="0.8" />
                      <g fill="#e9e3d5" fontFamily="Inter, system-ui, sans-serif" fontSize="5.5" fontWeight="600" opacity="0.75">
                        <text x="81" y="87">PROD.</text>
                        <text x="81" y="112">ROLL</text>
                        <text x="124" y="112">SCENE</text>
                        <text x="167" y="112">TAKE</text>
                        <text x="81" y="139">DIRECTOR</text>
                      </g>
                      <g fill="#fbf8f0" fontFamily="Caveat, cursive" fontWeight="700">
                        <text x="106" y="98" fontSize="17">Creators Club</text>
                        <text x="94" y="128" fontSize="17">24</text>
                        <text x="141" y="128" fontSize="17">1</text>
                        <text x="184" y="128" fontSize="17">1</text>
                        <text x="118" y="152" fontSize="15">you</text>
                      </g>
                      {/* Fixed stick */}
                      <rect x="76" y="64" width="128" height="13" rx="1.5" fill="url(#film-society-stripes)" stroke="#e9e3d5" strokeWidth="1" />
                      {/* Clap stick, hinged at the left. */}
                      <motion.g
                        style={{ originX: 0, originY: 1 }}
                        initial="rested"
                        animate={state}
                        variants={{
                          rested: { rotate: 0, transition: REST },
                          playing: seq({
                            rotate: [
                              [C.pullToSlate, -27],
                              [C.snap - 0.09, -27],
                              [C.snap, 0, [0.7, 0, 1, 0.6]],
                            ],
                          }),
                        }}
                      >
                        <rect x="76" y="50" width="128" height="13" rx="1.5" fill="url(#film-society-stripes)" stroke="#e9e3d5" strokeWidth="1" />
                      </motion.g>
                      <circle cx="81" cy="64" r="3" fill={tint} />
                    </g>
                  </g>

                  {/* Frame 2: the first frame of the scene. Tinted with the
                      club accent only, so unified mode makes it black and
                      white. */}
                  <g transform={`translate(0 ${-PITCH * 2})`} clipPath="url(#film-society-frame)">
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="#150b0c" />
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="url(#film-society-sky)" />
                    {/* Sun, coming up a touch as the frame lands. */}
                    <motion.g
                      initial="rested"
                      animate={state}
                      variants={{
                        rested: { y: 0, transition: REST },
                        playing: seq({ y: [[LANDED - 0.1, 9], [TOTAL, 0, [0.16, 1, 0.3, 1]]] }),
                      }}
                    >
                      <circle cx="176" cy="102" r="58" fill="url(#film-society-sun)" />
                      <circle cx="176" cy="102" r="21" fill="#fffaf2" />
                    </motion.g>
                    {/* Thin cloud bars across the sun. */}
                    <path d="M 136,92 H 214 M 150,99 H 232 M 28,84 H 92" stroke="#150b0c" strokeWidth="1.6" strokeLinecap="round" opacity="0.32" />
                    {/* Birds */}
                    <motion.path
                      d="M 112,58 q 4,-4 7,0 q 3,-4 7,0 M 128,48 q 3,-3 5,0 q 2,-3 5,0 M 214,54 q 3,-3 5,0 q 2,-3 5,0"
                      fill="none"
                      stroke="#150b0c"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      opacity="0.8"
                      initial="rested"
                      animate={state}
                      variants={{
                        rested: { x: 0, transition: REST },
                        playing: seq({ x: [[LANDED - 0.1, -7], [TOTAL, 0, 'easeOut']] }),
                      }}
                    />
                    {/* Hills, three depths. */}
                    <path d="M 28,116 C 58,100 86,112 118,104 C 150,96 192,117 252,98 V 176 H 28 Z" fill={deep} opacity="0.5" />
                    <path d="M 28,132 C 70,117 108,134 150,124 C 190,114 222,131 252,121 V 176 H 28 Z" fill="#1c0a0c" opacity="0.72" />
                    <path d="M 28,149 C 60,139 100,146 132,150 C 170,155 212,146 252,151 V 176 H 28 Z" fill="#0c0606" />
                    {/* The filmmaker and the camera, in silhouette. */}
                    <g fill="#0c0606" stroke="#0c0606" strokeLinecap="round" strokeLinejoin="round">
                      {/* tripod */}
                      <path d="M 92,127 L 82,150 M 92,127 L 92,151 M 92,127 L 103,150" strokeWidth="1.7" fill="none" />
                      {/* camera: body, lens hood, two magazines */}
                      <rect x="81" y="114" width="23" height="12" rx="1.5" strokeWidth="0.5" />
                      <path d="M 104,117 L 112,114.5 V 125.5 L 104,123 Z" strokeWidth="0.5" />
                      <circle cx="86.5" cy="109" r="5.6" strokeWidth="0.5" />
                      <circle cx="98" cy="109.5" r="4.6" strokeWidth="0.5" />
                      {/* person behind the camera, eye to the viewfinder */}
                      <circle cx="71.5" cy="113" r="4.6" strokeWidth="0.5" />
                      <path d="M 66,121 C 68,118 75,118 77,121 L 78,136 L 76.5,149 H 72.8 L 72,138 L 70.5,149 H 66.8 L 66,136 Z" strokeWidth="0.5" />
                      <path d="M 75,123 L 82,121.5" strokeWidth="2.6" fill="none" />
                    </g>
                    {/* A lone tree on the right to balance the frame. */}
                    <g fill="#0c0606">
                      <path d="M 221,152 C 222,140 221,132 222.5,124 L 225,124 C 225,134 225.5,142 227,152 Z" />
                      <ellipse cx="224" cy="116" rx="15" ry="10" />
                      <ellipse cx="213" cy="121" rx="8" ry="6" />
                      <ellipse cx="235" cy="122" rx="8" ry="5.5" />
                    </g>
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="url(#film-society-vignette)" />
                  </g>

                  {/* Frame 3, above the scene: the next frame, barely seen. */}
                  <g transform={`translate(0 ${-PITCH * 3})`} clipPath="url(#film-society-frame)">
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="#150b0c" />
                    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} fill="url(#film-society-sky)" />
                    <path d="M 28,149 C 60,139 100,146 132,150 C 170,155 212,146 252,151 V 176 H 28 Z" fill="#0c0606" />
                  </g>
                </motion.g>
              </motion.g>

              {/* What the gate and the lamp add on top of whatever frame is
                  in it: grain, flicker, scratches, and the flash of the
                  first exposed frame. */}
              <g clipPath="url(#film-society-frame)">
                <motion.rect
                  x="-20"
                  y="-12"
                  width="320"
                  height="216"
                  filter="url(#film-society-grain)"
                  opacity="0.16"
                  initial="rested"
                  animate={state}
                  variants={{
                    rested: { x: 0, y: 0, transition: REST },
                    playing: seq({ x: GRAIN_X, y: GRAIN_Y }),
                  }}
                />
                <motion.rect
                  x={FRAME.x}
                  y={FRAME.y}
                  width={FRAME.w}
                  height={FRAME.h}
                  fill="#fff6e6"
                  initial="rested"
                  animate={state}
                  variants={{
                    rested: { opacity: 0, transition: REST },
                    playing: seq({ opacity: FLICKER }),
                  }}
                />
                <motion.rect
                  x={FRAME.x}
                  y={FRAME.y}
                  width={FRAME.w}
                  height={FRAME.h}
                  fill="#fff1dc"
                  initial="rested"
                  animate={state}
                  variants={{
                    rested: { opacity: 0, transition: REST },
                    playing: seq({
                      opacity: [[C.pullToScene + 0.1, 0], [LANDED, 0.38], [LANDED + 0.6, 0, 'easeOut']],
                    }),
                  }}
                />
                {SCRATCHES.map((s) => (
                  <motion.line
                    key={s.x}
                    x1={s.x}
                    y1={FRAME.y}
                    x2={s.x + 1.5}
                    y2={FRAME.y + FRAME.h}
                    stroke="#fffaf0"
                    strokeWidth="0.7"
                    initial="rested"
                    animate={state}
                    variants={{
                      rested: { opacity: 0, transition: REST },
                      playing: seq({ opacity: s.opacity }),
                    }}
                  />
                ))}
              </g>
            </g>
          </svg>
        </div>
      </div>

      {canSound && (
        <button
          type="button"
          className={`hero-sound-button ${styles.sound}`}
          onClick={onSoundClick}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Stop the projector sound' : 'Play the countdown with projector sound'}
        >
          {soundOn ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          <span className={styles.soundLong}>{soundOn ? 'Stop sound' : 'Play with sound'}</span>
          <span className={styles.soundShort}>{soundOn ? 'Stop' : 'Sound'}</span>
        </button>
      )}
    </div>
  );
}
