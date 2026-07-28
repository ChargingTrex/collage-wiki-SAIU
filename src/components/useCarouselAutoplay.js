// src/components/useCarouselAutoplay.js
//
// Shared autoplay timer for all three carousel types (ImageCarousel,
// CoverflowCarousel, StackCarousel) — one place for the play/pause state,
// the interval, the reduced-motion gate, and pause-on-hover, rather than
// three separate reimplementations of the same clock.
//
// Autoplay never actually runs for prefers-reduced-motion visitors,
// regardless of the `autoplay` prop or play/pause button state — moving
// content automatically is exactly what that preference asks to avoid.
// Consumers should hide their pause/play button entirely when
// `reducedMotion` is true (no point offering a control that does nothing).
// A visible pause/play toggle is otherwise required whenever autoplay is
// on — WCAG 2.2.2, "Pause, Stop, Hide" — every carousel using this hook
// renders one.
//
// Also pauses on hover (common, expected carousel behavior — a reader
// looking at a photo shouldn't have it yanked away mid-look) independent
// of the play/pause button's own state.

import { useState, useEffect, useCallback } from 'react';

export function useCarouselAutoplay(itemCount, { autoplay = false, interval = 4000 } = {}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isHovered, setIsHovered] = useState(false);
  const [index, setIndexState] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const go = useCallback(
    (delta) => {
      setIndexState((i) => (i + delta + itemCount) % itemCount);
    },
    [itemCount]
  );

  const setIndex = useCallback((i) => setIndexState(i), []);

  useEffect(() => {
    if (!isPlaying || reducedMotion || isHovered || itemCount <= 1) return;
    const id = setInterval(() => go(1), interval);
    return () => clearInterval(id);
  }, [isPlaying, reducedMotion, isHovered, itemCount, interval, go]);

  const togglePlaying = useCallback(() => setIsPlaying((p) => !p), []);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return {index, setIndex, go, isPlaying, togglePlaying, reducedMotion, hoverProps};
}
