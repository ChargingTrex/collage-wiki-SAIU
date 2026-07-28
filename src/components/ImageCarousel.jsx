// src/components/ImageCarousel.jsx
//
// Type 1 of 3 carousels — "Fade": the plain, most accessible option. One
// image at a time, a simple crossfade between them. See CoverflowCarousel
// (Type 2, 3D coverflow) and StackCarousel (Type 3, draggable card stack)
// for the others — CONTRIBUTING.md's "Adding photos to an event post"
// section explains when to reach for which.
//
// Navigation: prev/next buttons, dot navigation, drag-to-swipe, and
// optional autoplay (see useCarouselAutoplay.js — shared across all three
// carousel types). Meant to be dropped into a blog post's MDX body — see
// CONTRIBUTING.md for the usage pattern. Images must be `import`ed, not
// passed as bare relative-path strings, so Docusaurus's bundler actually
// resolves/copies them.
//
// Swipe uses Framer Motion's own built-in drag gesture system (`drag`,
// `dragConstraints`, `onDragEnd`'s velocity/offset) rather than hand-rolled
// touch/pointer listeners — this is the pattern Framer Motion's own docs
// demonstrate for swipeable carousels, not something bespoke to this
// project. `dragConstraints={{left: 0, right: 0}}` + `dragElastic` gives a
// rubber-band feel that snaps back on release; `onDragEnd` only actually
// changes slides once a drag clears a distance or velocity threshold.
//
// Respects prefers-reduced-motion the same way every hero in this project
// does: the slide still changes on click/swipe (that's a deliberate user
// action, not an ambient animation), it just snaps instead of animating —
// and autoplay is disabled outright (see useCarouselAutoplay).

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useCarouselAutoplay } from './useCarouselAutoplay';

const SWIPE_OFFSET_THRESHOLD = 50; // px
const SWIPE_VELOCITY_THRESHOLD = 500; // px/s

export function ImageCarousel({ images, className = '', autoplay = false, autoplayInterval = 4000 }) {
  const {index, setIndex, go, isPlaying, togglePlaying, reducedMotion, hoverProps} =
    useCarouselAutoplay(images?.length ?? 0, {autoplay, interval: autoplayInterval});

  if (!images || images.length === 0) return null;

  const handleDragEnd = (_event, info) => {
    if (info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      go(1);
    } else if (info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      go(-1);
    }
  };

  const current = images[index];
  const transitionProps = reducedMotion
    ? {initial: false, animate: {opacity: 1}, exit: {opacity: 0}, transition: {duration: 0}}
    : {
        initial: {opacity: 0, x: 40},
        animate: {opacity: 1, x: 0},
        exit: {opacity: 0, x: -40},
        transition: {duration: 0.35, ease: 'easeOut'},
      };

  return (
    <div className={`image-carousel ${className}`} {...hoverProps}>
      <div className="image-carousel__viewport">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={index}
            className="image-carousel__figure"
            {...transitionProps}
            drag={images.length > 1 ? 'x' : false}
            dragConstraints={{left: 0, right: 0}}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}>
            <img
              src={current.src}
              alt={current.alt || ''}
              className="image-carousel__img"
              draggable={false}
            />
            {current.caption && (
              <figcaption className="image-carousel__caption">{current.caption}</figcaption>
            )}
          </motion.figure>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="image-carousel__nav image-carousel__nav--prev"
              onClick={() => go(-1)}
              aria-label="Previous image">
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="image-carousel__nav image-carousel__nav--next"
              onClick={() => go(1)}
              aria-label="Next image">
              <ChevronRight />
            </button>
          </>
        )}

        {autoplay && images.length > 1 && !reducedMotion && (
          <button
            type="button"
            className="image-carousel__nav image-carousel__nav--play"
            onClick={togglePlaying}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
            {isPlaying ? <Pause /> : <Play />}
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="image-carousel__dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`image-carousel__dot ${i === index ? 'image-carousel__dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1} of ${images.length}`}
              aria-current={i === index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
