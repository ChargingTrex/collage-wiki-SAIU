// src/components/clubs/rig/RigParts.jsx
//
// The React side of the figure rig (see rig.js for the maths).
//
//   const clock = useRigClock(isPlaying, isReplaying, DURATION);
//   const frame = useRigFrame(clock, (t) => ({ ...joints at time t... }));
//   <Rig as="path" frame={frame} attrs={(f) => ({ d: capsule(f.shL, f.elL, 3) })} />
//
// One Framer Motion value (the clock, in seconds) drives the whole figure.
// It rests at `duration`, i.e. the finished picture, so server render,
// reduced motion and mid-page landings all get the final pose with no
// JavaScript animation at all; while the hero is playing it runs 0 ->
// duration once and stops there. Nothing loops.
//
// `Rig` renders its element with the attributes for the current frame and
// then writes later frames straight to the DOM (no React re-render per
// frame). Attributes are written with setAttribute rather than as Framer
// transforms because Framer pivots SVG transforms on each element's own
// bounding box, which moves as a limb's children swing.

import React, { useEffect, useRef } from 'react';
import { animate, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';

export function useRigClock(isPlaying, isReplaying, duration) {
  const clock = useMotionValue(duration);
  useEffect(() => {
    if (!isPlaying) {
      clock.set(duration);
      return undefined;
    }
    clock.set(0);
    const controls = animate(clock, duration, { duration, ease: 'linear' });
    return () => controls.stop();
  }, [isPlaying, isReplaying, duration, clock]);
  return clock;
}

export function useRigFrame(clock, compute) {
  return useTransform(clock, compute);
}

// attrs() returns DOM attribute names ('stroke-dashoffset', not
// strokeDashoffset); this maps them to React props for the first render.
const toProp = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

export function Rig({ as: Tag = 'path', frame, attrs, children, ...rest }) {
  const ref = useRef(null);
  useMotionValueEvent(frame, 'change', (f) => {
    const el = ref.current;
    if (!el) return;
    const next = attrs(f);
    for (const name in next) el.setAttribute(name, next[name]);
  });
  const now = attrs(frame.get());
  const props = {};
  for (const name in now) props[toProp(name)] = now[name];
  return (
    <Tag ref={ref} {...props} {...rest}>
      {children}
    </Tag>
  );
}
