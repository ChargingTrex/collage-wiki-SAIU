// src/components/ImageCarousel.jsx
//
// A reusable image carousel for blog/event posts with more than one photo —
// prev/next buttons, dot navigation, and a Framer Motion slide transition
// between images. Meant to be dropped into a blog post's MDX body (see
// CONTRIBUTING.md's "Adding photos to an event post" section for the usage
// pattern — images must be `import`ed, not passed as bare relative-path
// strings, so Docusaurus's bundler actually resolves/copies them).
//
// Respects prefers-reduced-motion the same way every hero in this project
// does: the slide still changes on click (that's a deliberate user action,
// not an ambient animation), it just snaps instead of animating.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageCarousel({ images, className = '' }) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (!images || images.length === 0) return null;

  const go = (delta) => {
    setIndex((i) => (i + delta + images.length) % images.length);
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
    <div className={`image-carousel ${className}`}>
      <div className="image-carousel__viewport">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure key={index} className="image-carousel__figure" {...transitionProps}>
            <img src={current.src} alt={current.alt || ''} className="image-carousel__img" />
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
