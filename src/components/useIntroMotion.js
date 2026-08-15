// src/components/useIntroMotion.js
//
// One rule, shared by every hero animation:
//   Animate while the reader is arriving. Go still once they start working.
//   Replay on demand when they click/tap it.
//
// "Working" = they scrolled, keyed, or touch-scrolled. From that moment the
// hero is frozen for the rest of the page visit — it does not come back when
// they scroll back to the top, because by then they've already seen it and
// it would just be noise. A plain click/tap on the hero itself is exempted
// from "working" — it's a replay trigger, not a stop signal.
//
// Click/tap is a toggle: click once to play, click again to stop early (or
// just let it finish on its own for heroes that don't loop). Hover-to-replay
// was tried and dropped — an incidental hover (trackpad drift, cursor just
// passing through) would stop/restart the hero without the reader meaning
// to touch it at all. Click requires deliberate intent.
//
// Also respects prefers-reduced-motion: those users get the rested state
// immediately, and a click does not override that.
//
// Usage in any hero:
//   const { isPlaying, hoverProps } = useIntroMotion();
//   <div {...hoverProps}>
//     <motion.div animate={isPlaying ? 'playing' : 'rested'} variants={...} />
//   </div>
//
// `playOnVisible: true` is an opt-in for heroes placed below the fold on a
// page (e.g. the homepage's fest section) — the default mount-time check
// only looks at scroll position ONCE, at mount, which is 0 for a fresh page
// load regardless of where the hero sits in the page. That plays the intro
// immediately, off-screen, so it's already finished by the time the reader
// scrolls down to it. With this on, the intro instead waits for the hero to
// actually scroll into view, and plays once at that point. Requires
// attaching the returned `containerRef` to the hero's root element.
//
// Off-screen pause: `isPlaying` is also gated on the hero's root element
// actually intersecting the viewport at all, tracked continuously via a
// second, always-on IntersectionObserver (separate from the one-shot
// `playOnVisible` start trigger above). This matters most on pages that
// stack many heroes at once — the club/fest directory grid mounts each
// club's real, full hero component (scaled down with CSS, not a separate
// lightweight preview), so without this gate several `repeat: Infinity`
// loops (Science's orbit, Gaming's chase, etc.) would keep animating
// indefinitely while scrolled out of view.
//
// Keyboard access: `hoverProps` also carries `role="button"`, `tabIndex={0}`,
// an `aria-label`, and an `onKeyDown` that mirrors `onClick` for Enter/Space —
// replay was click/tap-only with no keyboard path at all before this.

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

export function useIntroMotion({ scrollThreshold = 24, playOnVisible = false } = {}) {
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [isClickPlaying, setIsClickPlaying] = useState(false);
  // Defaults true so a hero already in the initial viewport (the common
  // case) isn't punished before the observer below has had a chance to
  // report in, and so SSR/first paint never has to guess.
  const [isVisible, setIsVisible] = useState(true);
  // Reduced-motion is read once on mount and gates click too, so it can't
  // sneak animation past someone who asked for none.
  const allowsMotion = useRef(true);
  const containerRef = useRef(null);

  useEffect(() => {
    // SSR guard — Docusaurus prerenders these pages.
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      allowsMotion.current = false;
      setIsIntroPlaying(false);
      return;
    }

    const stop = () => setIsIntroPlaying(false);
    const addStopListeners = () => {
      const onScroll = () => {
        if (window.scrollY > scrollThreshold) stop();
      };
      // Scroll is throttled by the browser already; the others are one-shot.
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', stop, { passive: true, once: true });
      window.addEventListener('touchmove', stop, { passive: true, once: true });
      window.addEventListener('keydown', stop, { once: true });
      window.addEventListener('pointerdown', stop, { once: true });
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchmove', stop);
        window.removeEventListener('keydown', stop);
        window.removeEventListener('pointerdown', stop);
      };
    };

    if (playOnVisible) {
      if (!containerRef.current) return;
      let observer;
      // Delay starting the observer by one beat — web fonts (Playfair
      // Display/Spectral etc., loaded via @import in custom.css) swap in
      // shortly after first paint and reflow the page, shifting how much of
      // a below-the-fold hero is actually visible. Observing immediately
      // caught the pre-font-swap layout, where the hero briefly measured as
      // more visible than its true settled position, so the very first
      // (and only, since it then disconnects) callback fired on a stale
      // reading and locked in a premature "visible" verdict.
      const startTimer = setTimeout(() => {
        observer = new IntersectionObserver(
          ([entry]) => {
            // `isIntersecting` is true for ANY overlap at all, even one
            // pixel — it does not mean "at least `threshold` visible". The
            // `threshold` option only controls which ratios produce a
            // callback; the ratio itself still has to be checked explicitly.
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              setIsIntroPlaying(true);
              observer.disconnect();
            }
          },
          {threshold: 0.3}
        );
        observer.observe(containerRef.current);
      }, 250);
      const removeStopListeners = addStopListeners();
      return () => {
        clearTimeout(startTimer);
        if (observer) observer.disconnect();
        removeStopListeners();
      };
    }

    // Someone landing mid-page (deep link, refresh at scroll position, or
    // browser scroll restoration) never saw the intro and isn't "arriving" —
    // don't start animating under them. Hover still works for them.
    if (window.scrollY > scrollThreshold) {
      setIsIntroPlaying(false);
      return;
    }

    setIsIntroPlaying(true);
    return addStopListeners();
  }, [scrollThreshold, playOnVisible]);

  // Continuous off-screen pause. Unlike the `playOnVisible` observer above
  // (one-shot, only decides when to START the intro), this one runs for the
  // component's whole lifetime and just tracks whether the root element is
  // in the viewport at all right now, so `isPlaying` below can be gated on
  // it. `threshold: 0` means any overlap at all counts as visible — this
  // should stop looping heroes when nothing of them is showing, not react
  // to partial-visibility edge cases.
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleClickPlaying = useCallback(() => {
    if (!allowsMotion.current) return;
    setIsClickPlaying((was) => !was);
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (!allowsMotion.current) return;
      // Enter/Space are the native activation keys for role="button"; Space
      // also scrolls the page by default, which preventDefault suppresses
      // here since Space is being consumed as an activation, not a scroll.
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleClickPlaying();
      }
    },
    [toggleClickPlaying]
  );

  // Spread onto the hero's outer element. Kept the name `hoverProps` even
  // though it's click-driven now, so every hero's existing
  // `<div {...hoverProps}>` keeps working unchanged. `ref` is now always
  // included (not just for `playOnVisible`) since the off-screen-pause
  // observer above needs it on every hero, not only the opt-in ones.
  // `role`/`tabIndex`/`aria-label`/`onKeyDown` make the same interaction
  // mouse/touch already had reachable from the keyboard.
  const hoverProps = useMemo(
    () => ({
      onClick: toggleClickPlaying,
      onKeyDown,
      role: 'button',
      tabIndex: 0,
      'aria-label': 'Replay animation',
      // Styling hook only (cursor + focus ring, see custom.css) — kept
      // separate from role="button" so that selector stays specific to
      // this interaction rather than any button-role element sitewide.
      'data-hero-replay': '',
      ref: containerRef,
    }),
    [toggleClickPlaying, onKeyDown]
  );

  return {
    isPlaying: (isIntroPlaying || isClickPlaying) && isVisible,
    // Each hero remounts its SVG on this (via `key={isReplaying ? ... }`) so
    // Framer Motion restarts cleanly from the first keyframe instead of
    // animating from wherever it happened to be.
    isReplaying: isClickPlaying,
    hoverProps,
  };
}
