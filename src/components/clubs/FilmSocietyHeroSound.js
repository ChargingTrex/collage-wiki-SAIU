// src/components/clubs/FilmSocietyHeroSound.js
//
// The Creators Club hero's projector sound, synthesized with the Web Audio
// API (no audio file, so nothing to license or download), plus the one
// timeline both the picture and the sound are cut to.
//
// What you hear, in order: the motor spins up, the sprocket clatter settles
// at 24 frames a second over a low hum and a little optical-track hiss, a
// 1 kHz leader beep lands on each of 3, 2 and 1, the clapperboard snaps,
// and the projector runs down.
//
// No imports and no DOM access here: `buildProjectorSound` takes any
// BaseAudioContext, so it can be rendered through an OfflineAudioContext
// to check levels.

// Seconds from the start of the hero's intro.
export const FILM_CUES = {
  three: 0.3,
  two: 1.0,
  one: 1.7,
  pullToSlate: 2.4, // the strip pulls down from the leader to the slate
  snap: 2.82, // the clapper closes
  pullToScene: 3.2, // and down again to the first frame of the scene
  settle: 4.1, // picture is at rest
  soundEnd: 4.9, // projector has run down
};

const FPS = 24;

function noiseBuffer(ctx, seconds) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Deterministic noise so every play (and the offline check) is identical.
  let s = 22222;
  for (let i = 0; i < length; i += 1) {
    s = (s * 16807) % 2147483647;
    data[i] = (s / 2147483647) * 2 - 1;
  }
  return buffer;
}

// One second of sprocket clatter: 24 claw clicks, each followed half a
// frame later by the softer shutter tick, with small uneven accents.
function clatterBuffer(ctx) {
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, rate, rate);
  const data = buffer.getChannelData(0);
  let s = 4711;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const click = (startSec, amp, decaySec) => {
    const start = Math.floor(startSec * rate);
    const len = Math.floor(decaySec * 6 * rate);
    for (let i = 0; i < len && start + i < rate; i += 1) {
      data[start + i] += (rand() * 2 - 1) * amp * Math.exp(-i / (decaySec * rate));
    }
  };
  for (let k = 0; k < FPS; k += 1) {
    const t = k / FPS;
    click(t, 0.75 + (k % 4 === 0 ? 0.25 : 0) - rand() * 0.2, 0.0035);
    click(t + 0.5 / FPS, 0.3 + rand() * 0.1, 0.002);
  }
  return buffer;
}

// Schedules the whole sound on `ctx`, starting at `t0` (a ctx time).
// Returns the nodes that need stopping and the master gain for a fade-out.
export function buildProjectorSound(ctx, t0) {
  const C = FILM_CUES;
  const end = t0 + C.soundEnd;
  const sources = [];

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(0.22, t0 + 0.08);
  master.gain.setValueAtTime(0.22, t0 + C.settle);
  master.gain.linearRampToValueAtTime(0, end);
  master.connect(ctx.destination);

  // Motor speed: spin up, run, run down. Clatter and hum both follow it.
  const speed = (param, base) => {
    param.setValueAtTime(base * 0.35, t0);
    param.exponentialRampToValueAtTime(base, t0 + 0.45);
    param.setValueAtTime(base, t0 + C.settle);
    param.exponentialRampToValueAtTime(base * 0.3, end);
  };

  // Sprocket clatter.
  const clatter = ctx.createBufferSource();
  clatter.buffer = clatterBuffer(ctx);
  clatter.loop = true;
  speed(clatter.playbackRate, 1);
  const clatterBand = ctx.createBiquadFilter();
  clatterBand.type = 'bandpass';
  clatterBand.frequency.value = 2100;
  clatterBand.Q.value = 0.7;
  const clatterGain = ctx.createGain();
  clatterGain.gain.value = 1.5;
  clatter.connect(clatterBand).connect(clatterGain).connect(master);
  sources.push(clatter);

  // Motor hum.
  const humFilter = ctx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 260;
  const humGain = ctx.createGain();
  humGain.gain.value = 0.5;
  humFilter.connect(humGain).connect(master);
  [
    ['sawtooth', 48, 0.5],
    ['triangle', 96, 0.35],
  ].forEach(([type, freq, level]) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    speed(osc.frequency, freq);
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g).connect(humFilter);
    sources.push(osc);
  });

  // Optical-track hiss.
  const hiss = ctx.createBufferSource();
  hiss.buffer = noiseBuffer(ctx, 1.5);
  hiss.loop = true;
  const hissBand = ctx.createBiquadFilter();
  hissBand.type = 'bandpass';
  hissBand.frequency.value = 5200;
  hissBand.Q.value = 0.5;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.07;
  hiss.connect(hissBand).connect(hissGain).connect(master);
  sources.push(hiss);

  // Leader beeps on 3, 2, 1.
  [C.three, C.two, C.one].forEach((cue) => {
    const at = t0 + cue;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.5, at + 0.006);
    g.gain.setValueAtTime(0.5, at + 0.085);
    g.gain.linearRampToValueAtTime(0, at + 0.1);
    osc.connect(g).connect(master);
    osc.start(at);
    osc.stop(at + 0.12);
  });

  // Clapperboard: a bright wooden crack over a short low knock.
  const snapAt = t0 + C.snap;
  const crack = ctx.createBufferSource();
  crack.buffer = noiseBuffer(ctx, 0.2);
  const crackHigh = ctx.createBiquadFilter();
  crackHigh.type = 'bandpass';
  crackHigh.frequency.value = 1700;
  crackHigh.Q.value = 0.9;
  const crackGain = ctx.createGain();
  crackGain.gain.setValueAtTime(0, snapAt);
  crackGain.gain.linearRampToValueAtTime(2.2, snapAt + 0.002);
  crackGain.gain.exponentialRampToValueAtTime(0.001, snapAt + 0.09);
  crack.connect(crackHigh).connect(crackGain).connect(master);
  crack.start(snapAt);
  crack.stop(snapAt + 0.2);
  const knock = ctx.createOscillator();
  knock.type = 'triangle';
  knock.frequency.setValueAtTime(320, snapAt);
  knock.frequency.exponentialRampToValueAtTime(110, snapAt + 0.06);
  const knockGain = ctx.createGain();
  knockGain.gain.setValueAtTime(0, snapAt);
  knockGain.gain.linearRampToValueAtTime(0.9, snapAt + 0.003);
  knockGain.gain.exponentialRampToValueAtTime(0.001, snapAt + 0.08);
  knock.connect(knockGain).connect(master);
  knock.start(snapAt);
  knock.stop(snapAt + 0.1);

  sources.forEach((node) => {
    node.start(t0);
    node.stop(end + 0.05);
  });

  return { master, duration: C.soundEnd };
}
