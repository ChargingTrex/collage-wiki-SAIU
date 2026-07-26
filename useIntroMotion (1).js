// src/components/useIntroMotion.js
//
// One rule, shared by every hero animation:
//   Animate while the reader is arriving. Go still once they start working.
//   Replay on demand when they hover it.
//
// "Working" = they scrolled, clicked, keyed, or touched. From that moment the
// hero is frozen for the rest of the page visit — it does not come back when
// they scroll back to the top, because by then they've already seen it and
// it would just be noise.
//
// Hover is the deliberate exception: the reader is pointing at the thing and
// asking to see it again, so it plays for as long as the cursor is on it.
// Hover is pointer-only — it never fires on touch, where there's no such
// thing as "hovering without tapping."
//
// Also respects prefers-reduced-motion: those users get the rested state
// immediately, and hover does not override that.
//
// Usage in any hero:
//   const { isPlaying, hoverProps } = useIntroMotion();
//   <div {...hoverProps}>
//     <motion.div animate={isPlaying ? 'playing' : 'rested'} variants={...} />
//   </div>

import { useState, useEffect, useMemo, useRef } from 'react';

export function useIntroMotion({ scrollThreshold = 24 } = {}) {
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Reduced-motion is read once on mount and gates hover too, so a hover
  // can't sneak animation past someone who asked for none.
  const allowsMotion = useRef(true);

  useEffect(() => {
    // SSR guard — Docusaurus prerenders these pages.
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      allowsMotion.current = false;
      setIsIntroPlaying(false);
      return;
    }

    // Someone landing mid-page (deep link, refresh at scroll position, or
    // browser scroll restoration) never saw the intro and isn't "arriving" —
    // don't start animating under them. Hover still works for them.
    if (window.scrollY > scrollThreshold) {
      setIsIntroPlaying(false);
      return;
    }

    setIsIntroPlaying(true);

    const stop = () => setIsIntroPlaying(false);

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
  }, [scrollThreshold]);

  // Spread onto the hero's outer element. Pointer events (not mouse events)
  // so we can filter out touch, where "hover" doesn't exist — on a phone,
  // a tap would otherwise both stop the intro and immediately replay it.
  const hoverProps = useMemo(
    () => ({
      onPointerEnter: (e) => {
        if (e.pointerType === 'touch') return;
        if (!allowsMotion.current) return;
        setIsHovered(true);
      },
      onPointerLeave: (e) => {
        if (e.pointerType === 'touch') return;
        setIsHovered(false);
      },
    }),
    []
  );

  return {
    isPlaying: isIntroPlaying || isHovered,
    isHovered,
    hoverProps,
  };
}
