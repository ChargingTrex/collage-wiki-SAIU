// src/components/fests/TechFestHero.jsx
//
// Tech Fest — ONE idea: a terminal that runs itself. Boot prompt → a command
// types out → the output floods in as scrambled characters → the scramble
// resolves into a clean tech-styled title. Then it holds.
//
// This deliberately replaces the original's four-competing-ideas version
// (drone + terminal + click-to-expand + payload metaphor). No drone, no click,
// no reveal gate. One coherent beat: garble decoding into meaning, which is
// exactly the "hacker resolve" feeling a tech fest wants.
//
// The scramble→resolve uses a per-character lock: each slot flips through
// random glyphs until its turn, then locks to the real letter, left to right.

import React from 'react';
import { motion } from 'framer-motion';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { FestSound } from './FestSound';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*<>/\\[]{}=+';

function useScramble(target, active, { speed = 34, lockEvery = 2.2 } = {}) {
  const [text, setText] = React.useState(active ? '' : target);

  React.useEffect(() => {
    if (!active) {
      setText(target);
      return;
    }
    let frame = 0;
    // Advance frame/locked BEFORE building the display string (not after) —
    // building it first meant the tick that finally reached
    // `locked >= target.length` cleared the interval using the previous,
    // still-one-short `locked` value, so the very last character was never
    // actually rendered as resolved and stayed scrambled forever.
    const id = setInterval(() => {
      frame += 1;
      const locked = Math.floor(frame / lockEvery);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') { out += ' '; continue; }
        if (i < locked) out += target[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setText(out);
      if (locked >= target.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [target, active, speed, lockEvery]);

  return text;
}

// A short typewriter for the command line.
function useTypewriter(target, active, { speed = 55, startDelay = 500 } = {}) {
  const [text, setText] = React.useState(active ? '' : target);

  React.useEffect(() => {
    if (!active) { setText(target); return; }
    setText('');
    let i = 0;
    let id;
    const start = setTimeout(() => {
      id = setInterval(() => {
        i += 1;
        setText(target.slice(0, i));
        if (i >= target.length) clearInterval(id);
      }, speed);
    }, startDelay);
    return () => { clearTimeout(start); clearInterval(id); };
  }, [target, active, speed, startDelay]);

  return text;
}

export function TechFestHero({
  title = 'INNOVISION 2026',
  command = './innovision --launch',
  tagline = '48 HOURS. BUILD SOMETHING REAL.',
  audioSrc,
}) {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion({ playOnVisible: true });
  const { accent, accentStyle } = useClubAccent('turingites-computer-science-society'); // shares the CS "terminal" hue

  const typed = useTypewriter(command, isPlaying);
  const commandDone = typed === command;
  // Title scramble starts only once the command finishes typing.
  const resolved = useScramble(title, isPlaying && commandDone, { speed: 32, lockEvery: 2.4 });

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 w-full overflow-hidden rounded-2xl border border-solid border-emerald-900/50 bg-slate-950 shadow-xl"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-solid border-emerald-500/20 bg-slate-900/80 px-4 py-2.5 font-mono">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-slate-500">tech_fest — bash</span>
        <div className="ml-auto">
          <FestSound audioSrc={audioSrc} label="Play theme" />
        </div>
      </div>

      {/* Terminal body */}
      <div
        key={isReplaying ? 'hover' : 'intro'}
        className="min-h-[9rem] px-6 py-5 font-mono"
        style={{ color: accent.dark }}
      >
        {/* Command line */}
        <div className="text-sm sm:text-base">
          <span className="text-slate-500">visitor@sai-uni</span>
          <span className="text-slate-600">:</span>
          <span className="text-emerald-400">~/fest</span>
          <span className="text-slate-500">$ </span>
          <span>{typed}</span>
          {/* Cursor blinks only while typing the command. */}
          {isPlaying && !commandDone && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            >
              ▋
            </motion.span>
          )}
        </div>

        {/* Resolved title — the scramble decodes into this. */}
        <motion.div
          className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: commandDone || !isPlaying ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="text-2xl font-black tracking-[0.18em] sm:text-3xl"
            style={{ color: accent.dark }}
          >
            {resolved}
          </div>
          <div className="mt-1 text-xs tracking-[0.3em] text-slate-500">{tagline}</div>
        </motion.div>
      </div>
    </div>
  );
}
