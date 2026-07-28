// src/components/CoverflowCarousel.jsx
//
// Type 2 of 3 carousels — "Coverflow": several images visible at once,
// tilted and scaled by distance from the centered one (3D perspective,
// spring physics). More visually elaborate than ImageCarousel (Type 1),
// good for a fest recap or a "wall of photos" moment rather than a plain
// documentation gallery. See sai-uni-wiki-motion-guide.md §5 for the
// original spec this is adapted from — reworked here to use real `import`ed
// images (not raw `src` strings), the shared `useCarouselAutoplay` hook,
// and this project's prefers-reduced-motion convention.
//
// Reduced motion: the 3D tilt/scale/fade-by-distance positions are still
// applied (removing them would make off-center images illegible pile-ups),
// but the spring animation between positions is replaced with an instant
// snap — same "state still changes, it just doesn't animate" rule as
// every other motion-sensitive component in this project.

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useCarouselAutoplay } from './useCarouselAutoplay';

export function CoverflowCarousel({ images, className = '', autoplay = false, autoplayInterval = 4000 }) {
  const {index, go, isPlaying, togglePlaying, reducedMotion, hoverProps} = useCarouselAutoplay(
    images?.length ?? 0,
    {autoplay, interval: autoplayInterval}
  );

  if (!images || images.length === 0) return null;

  return (
    <div className={`coverflow-carousel ${className}`} {...hoverProps}>
      <div className="coverflow-carousel__viewport">
        {images.map((img, i) => {
          let position = i - index;
          // Wrap around so the shortest path is used (e.g. going from the
          // last image to the first moves one step right, not all the way
          // back left).
          if (position > images.length / 2) position -= images.length;
          if (position < -images.length / 2) position += images.length;

          const isCenter = position === 0;
          const translateX = position * 170;
          const scale = isCenter ? 1 : 0.72;
          const rotateY = position < 0 ? 35 : position > 0 ? -35 : 0;
          const zIndex = 10 - Math.abs(position);
          const opacity = Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.3;

          return (
            <motion.figure
              key={i}
              className="coverflow-carousel__card"
              animate={{x: translateX, scale, rotateY, opacity}}
              transition={
                reducedMotion
                  ? {duration: 0}
                  : {type: 'spring', stiffness: 260, damping: 25}
              }
              style={{zIndex, perspective: 1000}}
              onClick={() => !isCenter && go(i > index ? 1 : -1)}>
              <img src={img.src} alt={img.alt || ''} className="coverflow-carousel__img" draggable={false} />
              {isCenter && img.caption && (
                <figcaption className="coverflow-carousel__caption">{img.caption}</figcaption>
              )}
            </motion.figure>
          );
        })}
      </div>

      {images.length > 1 && (
        <div className="coverflow-carousel__controls">
          <button type="button" className="coverflow-carousel__btn" onClick={() => go(-1)} aria-label="Previous image">
            <ChevronLeft />
          </button>
          {autoplay && !reducedMotion && (
            <button
              type="button"
              className="coverflow-carousel__btn"
              onClick={togglePlaying}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
              {isPlaying ? <Pause /> : <Play />}
            </button>
          )}
          <button type="button" className="coverflow-carousel__btn" onClick={() => go(1)} aria-label="Next image">
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
