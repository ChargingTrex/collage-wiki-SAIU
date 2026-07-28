// src/components/StackCarousel.jsx
//
// Type 3 of 3 carousels — "Stack": a Tinder-style deck of photos, drag the
// top one away to reveal the next. The most playful/tactile of the three —
// good for an informal event recap rather than a documentation gallery
// (ImageCarousel) or a fest "wall of photos" moment (CoverflowCarousel).
//
// The drag-to-dismiss gesture is a well-known, officially-documented Framer
// Motion pattern (their own examples site has one under the name "swipe to
// remove cards") — built on the same `drag`/`onDragEnd` primitives as
// ImageCarousel's swipe, not a separate bespoke gesture system.
//
// Known, disclosed simplification: a manual swipe plays the full
// fly-off-then-reveal-next animation (the dragged card visibly exits before
// the next one becomes top); an autoplay-triggered advance just reshuffles
// depths directly, without that same exit flourish. Giving autoplay the
// identical animation would mean autoplay driving the same per-card exit
// state as a real drag, which the shared `useCarouselAutoplay` hook doesn't
// expose a hook for — judged not worth restructuring the shared hook for a
// polish-only difference that only shows up when autoplay is on.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useCarouselAutoplay } from './useCarouselAutoplay';

const SWIPE_OFFSET_THRESHOLD = 80; // px
const SWIPE_VELOCITY_THRESHOLD = 500; // px/s
const STACK_DEPTH = 3; // how many cards peek behind the top one

function StackCard({ img, isTop, depth, reducedMotion, onSwipeComplete }) {
  const [exitDirection, setExitDirection] = useState(null);

  const handleDragEnd = (_event, info) => {
    if (info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      setExitDirection(1);
    } else if (info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      setExitDirection(-1);
    }
  };

  return (
    <motion.figure
      className="stack-carousel__card"
      style={{zIndex: STACK_DEPTH - depth}}
      animate={
        exitDirection
          ? {x: exitDirection * 500, rotate: exitDirection * 20, opacity: 0}
          : {scale: 1 - depth * 0.05, y: depth * 10, x: 0, rotate: 0, opacity: 1}
      }
      transition={reducedMotion ? {duration: 0} : {type: 'spring', stiffness: 300, damping: 30}}
      onAnimationComplete={() => {
        if (exitDirection) onSwipeComplete(exitDirection);
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{left: 0, right: 0}}
      dragElastic={1}
      onDragEnd={isTop ? handleDragEnd : undefined}>
      <img src={img.src} alt={img.alt || ''} className="stack-carousel__img" draggable={false} />
      {img.caption && <figcaption className="stack-carousel__caption">{img.caption}</figcaption>}
    </motion.figure>
  );
}

export function StackCarousel({ images, className = '', autoplay = false, autoplayInterval = 4000 }) {
  const {index, go, isPlaying, togglePlaying, reducedMotion, hoverProps} = useCarouselAutoplay(
    images?.length ?? 0,
    {autoplay, interval: autoplayInterval}
  );

  if (!images || images.length === 0) return null;

  const visibleCount = Math.min(STACK_DEPTH, images.length);

  return (
    <div className={`stack-carousel ${className}`} {...hoverProps}>
      <div className="stack-carousel__viewport">
        {Array.from({length: visibleCount}).map((_, depth) => {
          const i = (index + depth) % images.length;
          return (
            <StackCard
              key={i}
              img={images[i]}
              isTop={depth === 0}
              depth={depth}
              reducedMotion={reducedMotion}
              onSwipeComplete={go}
            />
          );
        })}
      </div>

      <div className="stack-carousel__controls">
        <button type="button" className="stack-carousel__btn" onClick={() => go(-1)} aria-label="Previous image">
          <ChevronLeft />
        </button>
        {autoplay && !reducedMotion && (
          <button
            type="button"
            className="stack-carousel__btn"
            onClick={togglePlaying}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
            {isPlaying ? <Pause /> : <Play />}
          </button>
        )}
        <button type="button" className="stack-carousel__btn" onClick={() => go(1)} aria-label="Next image">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
