// src/components/clubs/rig/rig.js
//
// A small jointed-figure rig shared by the three heroes that put a human
// figure on stage: Theatre (a marionette), Dance (a partnered duet) and
// Fashion (a croquis). Pure maths, no React: a pose (a flat object of
// numbers) goes in, joint positions come out, and helpers turn joints into
// SVG path strings.
//
// Why joints are computed here instead of nesting rotating <g> elements:
// the things that make these scenes read (a puppet's strings ending exactly
// on its wrists, two dancers' hands meeting, a skirt hem trailing the hips)
// all need the *positions* of the joints, which nested CSS transforms never
// expose. One function of time gives every element the same answer.
//
// Conventions
//   - Screen coordinates: +x right, +y down. "L" is the screen-left limb.
//   - Limb angles are absolute, in degrees: 0 hangs straight down, positive
//     swings toward +x, 180 points straight up. Absolute (not relative to
//     the parent bone) so a dangling forearm is simply 0.
//   - `torso` and `head` are leans from upright: 0 is vertical, positive
//     leans toward +x.
//   - Everything written to the DOM goes through `n()` (one decimal), so the
//     server-rendered rested picture is stable text.

const RAD = Math.PI / 180;

export const n = (v) => Math.round(v * 10) / 10;
export const pt = (p) => `${n(p[0])} ${n(p[1])}`;
export const lerp = (a, b, u) => a + (b - a) * u;
export const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

// Unit vector for a limb angle (0 = down, + = toward +x).
const down = (deg) => [Math.sin(deg * RAD), Math.cos(deg * RAD)];
// Unit vector for a lean from upright.
const up = (deg) => [Math.sin(deg * RAD), -Math.cos(deg * RAD)];
const along = (p, v, len) => [p[0] + v[0] * len, p[1] + v[1] * len];

export const POSE0 = {
  x: 0, y: 0, // pelvis
  torso: 0, head: 0,
  squash: 1, // torso foreshortening (a bow toward the viewer)
  headDy: 0, // extra head drop, for the same bow
  turn: 1, // shoulder/hip width multiplier: 1 front-on, 0 side-on, -1 back
  shTilt: 0, hipTilt: 0, // tilt of the shoulder and hip lines (contrapposto)
  laU: -6, laF: -3, raU: 6, raF: 3, // upper arm / forearm
  llT: -3, llS: 0, rlT: 3, rlS: 0, // thigh / shin
  lf: -70, rf: 70, // feet
};

// Proportions (lengths in SVG units). Each hero passes its own.
export const BODY0 = {
  torso: 26, neck: 3, headR: 8,
  shoulderW: 18, hipW: 10,
  upperArm: 14, foreArm: 13,
  thigh: 17, shin: 17, foot: 6,
};

// Forward kinematics: pose + proportions -> named joints.
export function solve(pose, body = BODY0) {
  const p = pose;
  const pelvis = [p.x, p.y];
  const chest = along(pelvis, up(p.torso), body.torso * p.squash);
  const shV = [Math.cos((p.torso + p.shTilt) * RAD), Math.sin((p.torso + p.shTilt) * RAD)];
  const hipV = [Math.cos((p.torso * 0.5 + p.hipTilt) * RAD), Math.sin((p.torso * 0.5 + p.hipTilt) * RAD)];
  const sw = (body.shoulderW / 2) * p.turn;
  const hw = (body.hipW / 2) * p.turn;
  const shL = along(chest, shV, -sw);
  const shR = along(chest, shV, sw);
  const hipL = along(pelvis, hipV, -hw);
  const hipR = along(pelvis, hipV, hw);
  const neck = along(chest, up(p.head), body.neck);
  const headC = along(chest, up(p.head), body.neck + body.headR);
  headC[1] += p.headDy;
  const elL = along(shL, down(p.laU), body.upperArm);
  const haL = along(elL, down(p.laF), body.foreArm);
  const elR = along(shR, down(p.raU), body.upperArm);
  const haR = along(elR, down(p.raF), body.foreArm);
  const knL = along(hipL, down(p.llT), body.thigh);
  const anL = along(knL, down(p.llS), body.shin);
  const knR = along(hipR, down(p.rlT), body.thigh);
  const anR = along(knR, down(p.rlS), body.shin);
  const toeL = along(anL, down(p.lf), body.foot);
  const toeR = along(anR, down(p.rf), body.foot);
  return { pelvis, chest, neck, headC, shL, shR, hipL, hipR, elL, haL, elR, haR, knL, anL, knR, anR, toeL, toeR };
}

// Move every joint by (dx, dy), in place.
export function shift(j, dx, dy) {
  for (const k in j) {
    j[k][0] += dx;
    j[k][1] += dy;
  }
  return j;
}

// Two-bone IK: where the middle joint sits so the chain root -> mid -> tip
// reaches `target` (clamped to the chain's reach). `bend` (+1 / -1) picks
// which side the middle joint folds to.
export function reach(root, target, l1, l2, bend = 1) {
  let dx = target[0] - root[0];
  let dy = target[1] - root[1];
  let d = Math.hypot(dx, dy) || 0.001;
  const max = l1 + l2 - 0.01;
  const min = Math.abs(l1 - l2) + 0.01;
  const dc = clamp(d, min, max);
  dx = (dx / d) * dc;
  dy = (dy / d) * dc;
  d = dc;
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d;
  const uy = dy / d;
  const mid = [root[0] + ux * a - uy * h * bend, root[1] + uy * a + ux * h * bend];
  return { mid, tip: [root[0] + dx, root[1] + dy] };
}

// Timeline: keyframes -> pose at any time. Keys are `{ t, ...values }`;
// a key only needs to name what changes (values carry forward). Segments
// are cubic Hermite with finite-difference tangents, so motion flows
// through a key instead of stopping on it; `stop: true` on a key (and any
// value that holds still on either side) gets a zero tangent, i.e. a rest.
export function makeTimeline(keys) {
  const frames = [];
  let prev = {};
  for (const { t, stop, ...v } of keys) {
    prev = { ...prev, ...v };
    frames.push({ t, stop: !!stop, v: prev });
  }
  for (let i = frames.length - 2; i >= 0; i--) frames[i].v = { ...frames[i + 1].v, ...frames[i].v };
  const names = Object.keys(frames[0].v);
  const last = frames.length - 1;
  const tangents = frames.map((f, i) => {
    const m = {};
    for (const k of names) {
      if (i === 0 || i === last || f.stop) m[k] = 0;
      else {
        const a = frames[i - 1];
        const b = frames[i + 1];
        m[k] = a.v[k] === f.v[k] || b.v[k] === f.v[k] ? 0 : (b.v[k] - a.v[k]) / (b.t - a.t);
      }
    }
    return m;
  });
  const duration = frames[last].t;

  function at(time) {
    const t = clamp(time, frames[0].t, duration);
    let i = 0;
    while (i < last - 1 && t > frames[i + 1].t) i++;
    const f0 = frames[i];
    const f1 = frames[i + 1];
    const h = f1.t - f0.t || 1;
    const u = clamp((t - f0.t) / h, 0, 1);
    const u2 = u * u;
    const u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1;
    const h10 = u3 - 2 * u2 + u;
    const h01 = -2 * u3 + 3 * u2;
    const h11 = u3 - u2;
    const out = {};
    for (const k of names) {
      out[k] = h00 * f0.v[k] + h10 * h * tangents[i][k] + h01 * f1.v[k] + h11 * h * tangents[i + 1][k];
    }
    return out;
  }
  at.duration = duration;
  return at;
}

// ---- Shapes -------------------------------------------------------------

// A tapered, round-ended limb between two joints.
export function capsule(a, b, ra, rb = ra) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 0.001;
  const nx = -dy / len;
  const ny = dx / len;
  return (
    `M${n(a[0] + nx * ra)} ${n(a[1] + ny * ra)}` +
    `L${n(b[0] + nx * rb)} ${n(b[1] + ny * rb)}` +
    `A${rb} ${rb} 0 0 0 ${n(b[0] - nx * rb)} ${n(b[1] - ny * rb)}` +
    `L${n(a[0] - nx * ra)} ${n(a[1] - ny * ra)}` +
    `A${ra} ${ra} 0 0 0 ${n(a[0] + nx * ra)} ${n(a[1] + ny * ra)}Z`
  );
}

export const line = (a, b) => `M${pt(a)}L${pt(b)}`;

// A smooth open curve through points (Catmull-Rom as cubic Beziers).
export function curve(points, closed = false) {
  const P = points;
  const len = P.length;
  if (len < 2) return '';
  const get = (i) => (closed ? P[(i + len) % len] : P[clamp(i, 0, len - 1)]);
  let d = `M${pt(P[0])}`;
  const segs = closed ? len : len - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? `${d}Z` : d;
}

// Angle (degrees, for an SVG rotate()) of the direction a -> b, where a
// shape drawn pointing "up" (toward -y) should end up pointing along it.
export const heading = (a, b) => n((Math.atan2(b[0] - a[0], -(b[1] - a[1])) / RAD));

// `translate(x y) rotate(deg)` for a part drawn around its own origin.
export const place = (p, deg = 0, sx = 1) =>
  `translate(${pt(p)}) rotate(${n(deg)})${sx === 1 ? '' : ` scale(${n(sx * 100) / 100} 1)`}`;
