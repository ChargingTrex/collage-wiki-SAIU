// src/components/clubs/MusicHero.jsx
//
// Music Club — a waveform, not a spinning record.
//
// A spinning vinyl is a picture of music. A waveform responding IS music.
// Bars rise from a center line in a shape that reads as a phrase — quiet
// intro, swell, decay — rather than random jitter. Random heights read as
// a loading spinner; a shaped envelope reads as a performance.
//
// Optional audio: click-to-play, NOT hover. Hover-triggered sound fires
// accidentally when a cursor crosses on the way elsewhere, and browsers
// block audio before first interaction so the first hover would be silently
// broken. A click is intentional and satisfies autoplay policy.
// Pass `audioSrc` to enable; omit it and the speaker button doesn't render.

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useIntroMotion } from '../useIntroMotion';
import { useClubAccent } from '../useClubAccent';

// Hand-shaped envelope: a phrase with a beginning, a peak, and a tail.
// Each entry is that bar's peak height (0–1). 32 bars reads as "audio"
// without turning into mush at hero size.
const ENVELOPE = [
  0.18, 0.24, 0.20, 0.32, 0.41, 0.35, 0.52, 0.63,
  0.55, 0.71, 0.86, 0.74, 0.95, 0.82, 1.00, 0.88,
  0.93, 0.76, 0.84, 0.62, 0.70, 0.51, 0.58, 0.44,
  0.49, 0.35, 0.39, 0.27, 0.31, 0.22, 0.25, 0.17,
];

const BAR_W = 3;
const BAR_GAP = 2.4;
const MAX_H = 46;
const CENTER_Y = 60;

export function MusicHero({ audioSrc }) {
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const { accent, accentStyle } = useClubAccent('music-club');
  const state = isPlaying ? 'playing' : 'rested';

  const audioRef = React.useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);

  const toggleAudio = React.useCallback((e) => {
    // Stop this from bubbling to the hero's own root onClick/onKeyDown —
    // both now live on the same div (role="button" for keyboard replay),
    // so without this, playing/stopping the sample also toggled the hero's
    // animation replay on every click.
    e.stopPropagation();
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      // .play() rejects if the browser blocks it — swallow rather than
      // throwing an unhandled rejection into the console.
      el.play().then(() => setIsAudioPlaying(true)).catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
      setIsAudioPlaying(false);
    }
  }, []);

  return (
    <div
      {...hoverProps}
      style={accentStyle}
      className="relative my-6 flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-neutral-900 p-8 text-white shadow-xl"
    >
      <div className="z-10 max-w-[42%]">
        <h1 className="text-3xl font-bold" style={{ color: accent.dark }}>
          Music Club
        </h1>
        <p className="mt-1 text-neutral-400">
          Harmonizing voices, bands, and acoustic instruments.
        </p>

        {audioSrc && (
          <>
            <button
              onClick={toggleAudio}
              onKeyDown={(e) => e.stopPropagation()}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-solid border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
              aria-label={isAudioPlaying ? 'Stop the sample' : 'Play a short sample'}
            >
              {isAudioPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {isAudioPlaying ? 'Stop' : 'Hear us'}
            </button>
            <audio
              ref={audioRef}
              src={audioSrc}
              preload="none"
              onEnded={() => setIsAudioPlaying(false)}
            />
          </>
        )}
      </div>

      <svg
        key={isReplaying ? 'hover' : 'intro'}
        viewBox={`0 0 ${ENVELOPE.length * (BAR_W + BAR_GAP)} 120`}
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5 opacity-90"
        role="img"
        aria-label="An audio waveform"
      >
        {ENVELOPE.map((peak, i) => {
          const h = peak * MAX_H;
          const x = i * (BAR_W + BAR_GAP);

          return (
            <motion.rect
              key={i}
              x={x}
              width={BAR_W}
              rx={BAR_W / 2}
              fill={accent.dark}
              initial="rested"
              animate={state}
              variants={{
                // At rest the waveform stays drawn — it's the shape of the
                // piece, not an activity indicator.
                rested: { y: CENTER_Y - h, height: h * 2, opacity: 0.75 },
                playing: {
                  // Bars rise from the center line outward, left to right,
                  // like a playhead sweeping the track.
                  y: [CENTER_Y, CENTER_Y - h],
                  height: [0, h * 2],
                  opacity: [0, 0.95, 0.75],
                  transition: {
                    delay: i * 0.028,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
