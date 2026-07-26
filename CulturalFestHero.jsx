// src/components/fests/CulturalFestHero.jsx
//
// Cultural Fest — a cultural fest IS many things in rapid succession, so the
// intro flashes through the categories fast (music, dance, vocals, gaming,
// chess, boardgames). But instead of cycling forever (ambient noise), it runs
// through the set once or twice, then SETTLES into a composed cluster showing
// them all together — the fest as a whole rather than a slideshow stuck on loop.
//
// Two phases driven by one timer: `cycling` (single icon swapping fast) then
// `settled` (all icons arranged, gently arrived). Click-to-play sound, same
// contract as Music Club.

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Users, Mic2, Gamepad2, Crown, Dices } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';
import { FestSound } from './FestSound';

const CATS = [
  { Icon: Music,    color: '#f472b6', label: 'Music' },
  { Icon: Users,    color: '#fbbf24', label: 'Dance' },
  { Icon: Mic2,     color: '#c084fc', label: 'Vocals' },
  { Icon: Gamepad2, color: '#60a5fa', label: 'Gaming' },
  { Icon: Crown,    color: '#fcd34d', label: 'Chess' },
  { Icon: Dices,    color: '#fb7185', label: 'Boardgames' },
];

const CYCLE_MS = 260;      // per-icon flash during the intro
const CYCLES = 2;          // how many full passes before settling

export function CulturalFestHero({ title = 'VIBRANCE 2026', audioSrc }) {
  const { isPlaying, isHovered, hoverProps } = useIntroMotion();
  const { accentStyle } = useClubAccent('theatre-club'); // shares a rich cultural-purple heading accent

  const [phase, setPhase] = React.useState(isPlaying ? 'cycling' : 'settled');
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!isPlaying) { setPhase('settled'); return; }
    setPhase('cycling');
    setCurrent(0);

    let step = 0;
    const total = CATS.length * CYCLES;
    const id = setInterval(() => {
      step += 1;
      setCurrent(step % CATS.length);
      if (step >= total) {
        clearInterval(id);
        setPhase('settled');
      }
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [isPlaying, isHovered]);

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-52 w-full items-center justify-between overflow-hidden rounded-2xl border border-fuchsia-800/50 bg-fuchsia-950 px-10 shadow-xl"
    >
      {/* Ambient blurred blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="z-10">
        <h1
          className="text-4xl font-black"
          style={{
            color: 'transparent',
            backgroundImage: 'linear-gradient(to right, #f9a8d4, #fcd34d)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h1>
        <p className="mt-2 font-medium tracking-wide text-fuchsia-200/80">
          The heartbeat of Sai University.
        </p>
        <div className="mt-3">
          <FestSound audioSrc={audioSrc} label="Play anthem" />
        </div>
      </div>

      {/* Icon stage: single flashing icon during cycling, composed cluster once settled. */}
      <div
        key={isHovered ? 'hover' : 'intro'}
        className="relative flex h-32 w-32 shrink-0 items-center justify-center"
      >
        {phase === 'cycling' ? (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.4, opacity: 0, rotate: 30 }}
                transition={{ duration: 0.18 }}
                style={{ color: CATS[current].color }}
              >
                {React.createElement(CATS[current].Icon, { className: 'h-12 w-12' })}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          // Settled: all six arranged in a ring, each easing into place.
          <div className="relative h-32 w-32">
            {CATS.map((cat, i) => {
              const angle = (i / CATS.length) * Math.PI * 2 - Math.PI / 2;
              const R = 44;
              const x = Math.cos(angle) * R;
              const y = Math.sin(angle) * R;
              return (
                <motion.div
                  key={cat.label}
                  className="absolute left-1/2 top-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
                  style={{ color: cat.color, marginLeft: -18, marginTop: -18 }}
                  initial={isPlaying ? { x: 0, y: 0, scale: 0, opacity: 0 } : false}
                  animate={{ x, y, scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {React.createElement(cat.Icon, { className: 'h-5 w-5' })}
                </motion.div>
              );
            })}
            {/* Center mark once composed */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-4 w-4 rounded-full"
              style={{ marginLeft: -8, marginTop: -8, background: 'linear-gradient(to right, #f9a8d4, #fcd34d)' }}
              initial={isPlaying ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
