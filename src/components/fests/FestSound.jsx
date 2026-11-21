// src/components/fests/FestSound.jsx
//
// Shared sound control for fest heroes. Same contract as the Music Club audio:
//   - click-to-play, NEVER autoplay (hostile on load, and blocked pre-interaction)
//   - renders nothing unless an audioSrc is provided AND that file actually
//     exists — every fest page already passes its audioSrc (the wiring in
//     CLAUDE.md), but static/audio/ is still empty, and a button whose
//     .play() 404s silently is a dead control. static-audio-plugin.js lists
//     what's really in static/audio/ at build time; the button appears on
//     the next build once the file is committed.
//   - .play() rejections swallowed so a blocked attempt doesn't throw
//
// The AUDIO FILE itself is the caller's to supply. See caveats §12: real music
// on a public site is a licensing matter — use royalty-free or original audio.
//
//   <FestSound audioSrc="/audio/innovision-theme.mp3" label="Play theme" />

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePluginData } from '@docusaurus/useGlobalData';

export function FestSound({ audioSrc, label = 'Play theme', className = '' }) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  // Build-time list of files in static/audio/ (static-audio-plugin.js).
  // Compared by file name, so the caller's baseUrl prefix doesn't matter.
  const { files } = usePluginData('static-audio-plugin');
  const available = Boolean(audioSrc) && files.includes(audioSrc.split('/').pop());

  const toggle = React.useCallback((e) => {
    // Stop this from bubbling to the hero's own root onClick/onKeyDown —
    // both now live on the same div (role="button" for keyboard replay),
    // so without this, playing/stopping the theme also toggled the hero's
    // animation replay on every click. preventDefault matters separately
    // (not just belt-and-suspenders): on /fests the hero itself is now
    // wrapped in a real <a href> (see .fest-hero-link), and a plain
    // stopPropagation only stops React's synthetic dispatch from reaching
    // that ancestor Link's own onClick — the underlying <a> still performs
    // its native default navigation regardless, since nothing told it not
    // to. Confirmed via a real click in tests/e2e/clubs-and-fests.spec.js
    // before this fix — stopPropagation alone did not stop it.
    e.stopPropagation();
    e.preventDefault();
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

  if (!available) return null;

  return (
    <>
      <button
        onClick={toggle}
        onKeyDown={(e) => e.stopPropagation()}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-solid border-white/30 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-black/70 ${className}`}
        aria-label={playing ? 'Stop the audio' : label}
      >
        {playing ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        {playing ? 'Stop' : label}
      </button>
      <audio ref={audioRef} src={audioSrc} preload="none" onEnded={() => setPlaying(false)} />
    </>
  );
}
