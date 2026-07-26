// src/components/fests/FestSound.jsx
//
// Shared sound control for fest heroes. Same contract as the Music Club audio:
//   - click-to-play, NEVER autoplay (hostile on load, and blocked pre-interaction)
//   - renders nothing unless an audioSrc is provided
//   - .play() rejections swallowed so a blocked attempt doesn't throw
//
// The AUDIO FILE itself is the caller's to supply. See caveats §12: real music
// on a public site is a licensing matter — use royalty-free or original audio.
//
//   <FestSound audioSrc="/audio/innovision-theme.mp3" label="Play theme" />

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function FestSound({ audioSrc, label = 'Play theme', className = '' }) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);

  const toggle = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
    }
  }, []);

  if (!audioSrc) return null;

  return (
    <>
      <button
        onClick={toggle}
        className={`inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white ${className}`}
        aria-label={playing ? 'Stop the audio' : label}
      >
        {playing ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        {playing ? 'Stop' : label}
      </button>
      <audio ref={audioRef} src={audioSrc} preload="none" onEnded={() => setPlaying(false)} />
    </>
  );
}
