# Sai University Wiki: Motion & Animation Guide

> Reference only — no style/animation choices have been made yet. This captures the
> full guide as shared, for deciding on later.

Modern, fluid animations and expressive typography across the Docusaurus portal using
**Motion** (formerly Framer Motion), **Lucide React** icons, and custom handwriting/
calligraphy styles. Components can drop into custom React pages (`src/pages/index.js`)
or directly inside Markdown/MDX files across both the `/docs` wiki and the `/blog`
events section.

---

## 1. Prerequisites & Installation

```bash
npm install framer-motion lucide-react
```

---

## 2. Sun-to-Moon Theme Switcher (Slide & Morph Animation)

A smooth dark/light mode toggle with a sliding track, rotating Sun/Moon icons, and
spring physics.

```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Sync with Docusaurus HTML attribute [data-theme='dark']
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setIsDark(currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex h-10 w-20 items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-rose-100 border border-rose-200'
      }`}
      aria-label="Toggle Light/Dark Theme"
    >
      {/* Sliding Thumb */}
      <motion.div
        className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md ${
          isDark ? 'bg-indigo-950 text-amber-300' : 'bg-amber-400 text-amber-900'
        }`}
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        animate={{
          x: isDark ? 40 : 0,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-5 w-5 fill-current" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-5 w-5 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
```

---

## 3. Kinetic Typography, Scramble & Calligraphy Effects

### A. Split Text Animation

Staggers individual words into view. Good for hero titles like "Sai University Wiki
& Event Hub".

```jsx
import React from 'react';
import { motion } from 'framer-motion';

export function SplitText({ text, className = '' }) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 * i },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { type: 'spring', damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, index) => (
        <motion.span variants={childVariants} key={index} className="mr-2 inline-block">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
```

### B. Scramble Text Animation

Dynamic cyber/hacker decoding effect on hover. Good for tech club blogs like
Turingites CS Society or FOSS Club.

```jsx
import React, { useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

export function ScrambleText({ text, speed = 40, className = '' }) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsScrambling(false);
      }
      iteration += 1 / 3;
    }, speed);
  };

  return (
    <span
      onMouseEnter={startScramble}
      className={`cursor-pointer font-mono font-bold tracking-wide transition-colors hover:text-rose-600 ${className}`}
    >
      {displayText}
    </span>
  );
}
```

### C. Calligraphy & Handwriting Font Integration (CSS setup)

Add to the top of `src/css/custom.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&display=swap');

/* Helper classes for blog posts & MDX */
.font-handwriting {
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  line-height: 1.4;
}

.font-calligraphy {
  font-family: 'Great Vibes', cursive;
  font-size: 2.2rem;
  color: #8b0021;
}

.font-script {
  font-family: 'Dancing Script', cursive;
  font-size: 1.6rem;
}
```

### D. Pen-Drawing Handwriting / Signature Effect (SVG Path Animation)

Animates a continuous calligraphic stroke, as if written live with a fountain pen.
Good for literary quotes, event signatures, blog intros.

```jsx
import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedSignature({ text = "Sai University", subtext = "Literary & Arts Journal" }) {
  return (
    <div className="my-6 flex flex-col items-center justify-center p-6 border border-rose-200/50 bg-rose-50/30 dark:bg-rose-950/20 rounded-2xl shadow-sm">
      {/* Dynamic Animated Calligraphic Line */}
      <svg className="w-72 h-16" viewBox="0 0 300 60" fill="none">
        <motion.path
          d="M 10,40 Q 30,10 60,35 T 120,30 T 180,35 T 240,25 T 290,30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-rose-800 dark:text-rose-400"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
          viewport={{ once: true }}
        />
      </svg>

      {/* Handwriting styled text reveal */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        viewport={{ once: true }}
        className="font-calligraphy text-center"
      >
        {text}
      </motion.p>

      {subtext && (
        <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
          {subtext}
        </span>
      )}
    </div>
  );
}
```

### E. Handwriting Ink Callout / Marginalia Box

Simulates handwritten author notes, editor signatures, or journal margins inside
blog articles.

```jsx
import React from 'react';
import { motion } from 'framer-motion';

export function HandwrittenCallout({ title = "Editor's Note", children }) {
  return (
    <motion.div
      initial={{ rotate: -2, scale: 0.96, opacity: 0 }}
      whileInView={{ rotate: -1, scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      viewport={{ once: true }}
      className="my-6 p-5 bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-600 rounded-r-xl shadow-sm"
    >
      <h4 className="font-handwriting text-amber-900 dark:text-amber-300 text-xl font-bold mb-1">
        ✍️ {title}
      </h4>
      <div className="font-handwriting text-slate-800 dark:text-amber-100/90 text-lg">
        {children}
      </div>
    </motion.div>
  );
}
```

---

## 4. Scroll-Driven Effects (Highlight & Line Reveal)

Fades each word of a paragraph in based on scroll position.

```jsx
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ScrollHighlightText({ paragraph }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'start 0.25'],
  });

  const words = paragraph.split(' ');

  return (
    <p ref={containerRef} className="flex flex-wrap text-2xl font-semibold leading-relaxed">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);

        return (
          <span key={i} className="relative mr-2 inline-block">
            <motion.span style={{ opacity }} className="text-slate-900 dark:text-slate-100">
              {word}
            </motion.span>
          </span>
        );
      })}
    </p>
  );
}
```

---

## 5. Event Gallery Carousels (3D Coverflow & Autoplay)

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export function CoverflowCarousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay || images.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIndex, isAutoplay, images]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative my-8 flex flex-col items-center justify-center overflow-hidden py-6">
      <div className="relative flex h-72 w-full max-w-4xl items-center justify-center">
        {images.map((img, index) => {
          const offset = (index - currentIndex + images.length) % images.length;
          let position = offset;
          if (offset > images.length / 2) position = offset - images.length;

          const isCenter = position === 0;
          const translateX = position * 180;
          const scale = isCenter ? 1 : 0.75;
          const rotateY = position < 0 ? 35 : position > 0 ? -35 : 0;
          const zIndex = 10 - Math.abs(position);
          const opacity = Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.3;

          return (
            <motion.div
              key={index}
              className="absolute h-64 w-96 overflow-hidden rounded-2xl shadow-2xl"
              animate={{ x: translateX, scale, rotateY, opacity, zIndex }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              style={{ perspective: 1000 }}
            >
              <img
                src={img.src}
                alt={img.alt || `Event photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center space-x-4">
        <button onClick={prevSlide} className="rounded-full bg-slate-200 p-2 dark:bg-slate-800">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => setIsAutoplay(!isAutoplay)} className="rounded-full bg-slate-200 p-2 dark:bg-slate-800">
          {isAutoplay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button onClick={nextSlide} className="rounded-full bg-slate-200 p-2 dark:bg-slate-800">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Custom Hero Animations for All 18 Sai University Clubs

Drop these into each club's `.mdx` page header (e.g. `docs/clubs/astronomy-club.mdx`).
File: `src/components/ClubAnimations.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Rocket, Film, BookOpen, Palette, Music, Sprout, Clapperboard,
  Camera, Gamepad2, Mic, TrendingUp, Sparkles, Atom, Disc,
  Terminal, Footprints, Flame, GitBranch
} from 'lucide-react';

/* 1. ASTRONOMY CLUB: Rocket launching diagonally with exhaust motion */
export function AstronomyHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-slate-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-extrabold text-amber-400">Astronomy Club</h1>
        <p className="text-slate-300">Exploring the cosmos & stargazing nights.</p>
      </div>
      <div className="relative h-28 w-28">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            rotate: [0, 15, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 text-amber-400"
        >
          <Rocket className="h-14 w-14" />
        </motion.div>
      </div>
    </div>
  );
}

/* 2. FILM SOCIETY: Spinning film reel with opening film-strip banner */
export function FilmSocietyHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-bold tracking-wider text-rose-500">Film Society</h1>
        <p className="text-zinc-400">Appreciating, analyzing, and creating cinema.</p>
      </div>
      <div className="flex items-center space-x-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="text-rose-500"
        >
          <Film className="h-16 w-16" />
        </motion.div>
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 80, opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
          className="h-10 border-y-4 border-dashed border-rose-500/80 bg-rose-950/40"
        />
      </div>
    </div>
  );
}

/* 3. LITERARY CLUB: Floating feather & book flipping open */
export function LiteraryHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-amber-900/20 border border-amber-800/30 p-8 shadow-md">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-800 dark:text-amber-200">Literary Club</h1>
        <p className="text-amber-700/80 dark:text-amber-300/80">Celebrating the written and spoken word.</p>
      </div>
      <motion.div
        animate={{ rotateY: [0, 180, 0], y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-amber-600 dark:text-amber-400"
      >
        <BookOpen className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 4. ART CLUB: Swirling palette & color-splash pulse */
export function ArtHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 p-8 shadow-md">
      <div>
        <h1 className="text-3xl font-extrabold text-purple-600 dark:text-purple-300">Art Club</h1>
        <p className="text-slate-600 dark:text-slate-300">Unleashing creativity through visual arts.</p>
      </div>
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-pink-500"
      >
        <Palette className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 5. DANCE CLUB: Pulsing rhythmic equalizer waves */
export function DanceHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-rose-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-extrabold text-rose-400">Dance Club</h1>
        <p className="text-rose-200">Expressing rhythm, grace, and movement.</p>
      </div>
      <div className="flex items-end space-x-2 h-16">
        {[0.4, 0.8, 0.3, 1, 0.6].map((height, i) => (
          <motion.div
            key={i}
            animate={{ height: ['20%', '100%', '30%'] }}
            transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, repeatType: 'reverse' }}
            className="w-3 rounded-full bg-rose-500"
          />
        ))}
      </div>
    </div>
  );
}

/* 6. GARDENING CLUB: Plant sprout growing & leaf rustle */
export function GardeningHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-emerald-900/20 border border-emerald-800/30 p-8 shadow-md">
      <div>
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">Gardening Club</h1>
        <p className="text-emerald-700/80 dark:text-emerald-400/80">Cultivating green spaces across campus.</p>
      </div>
      <motion.div
        initial={{ scale: 0.5, y: 20 }}
        animate={{ scale: [0.8, 1.2, 1], y: [10, 0, 5] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
        className="text-emerald-500"
      >
        <Sprout className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 7. THEATRE CLUB: Clapperboard snap */
export function TheatreHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-purple-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-purple-300">Theatre Club</h1>
        <p className="text-purple-200">Bringing compelling stories to life on stage.</p>
      </div>
      <motion.div
        animate={{ rotate: [0, -20, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        className="text-purple-400"
      >
        <Clapperboard className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 8. PHOTOGRAPHY CLUB: Camera shutter snap & pulsing flash ring */
export function PhotographyHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Photography Club</h1>
        <p className="text-slate-300">Capturing moments through the lens.</p>
      </div>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative text-cyan-400"
      >
        <Camera className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 9. GAMING CLUB: Retro arcade floating controller */
export function GamingHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-violet-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-black text-fuchsia-400">Gaming Club</h1>
        <p className="text-violet-200">Casual, competitive, and esports community.</p>
      </div>
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-fuchsia-400"
      >
        <Gamepad2 className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 10. ORATORY CLUB: Microphone with expanding soundwaves */
export function OratoryHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-blue-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-bold text-blue-400">Oratory Club</h1>
        <p className="text-blue-200">Mastering public speaking, debate, and rhetoric.</p>
      </div>
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute h-16 w-16 rounded-full border-2 border-blue-400"
        />
        <Mic className="h-14 w-14 text-blue-400" />
      </div>
    </div>
  );
}

/* 11. ENTREPRENEURSHIP CLUB: Trending growth line & spark */
export function EntrepreneurshipHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-bold text-emerald-400">Entrepreneurship Club</h1>
        <p className="text-slate-300">Fostering startup culture and business innovation.</p>
      </div>
      <motion.div
        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-emerald-400"
      >
        <TrendingUp className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 12. FASHION CLUB: Sparkling runway highlights */
export function FashionHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-rose-900/20 border border-rose-800/30 p-8 shadow-md">
      <div>
        <h1 className="text-3xl font-serif font-bold text-rose-500">Fashion Club</h1>
        <p className="text-slate-600 dark:text-slate-300">Setting trends, design, and celebrating style.</p>
      </div>
      <motion.div
        animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="text-rose-500"
      >
        <Sparkles className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 13. SCIENCE SOCIETY: Orbiting atom nucleus */
export function ScienceHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-cyan-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-extrabold text-cyan-400">Science Society</h1>
        <p className="text-cyan-200">Advancing scientific curiosity and research.</p>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="text-cyan-400"
      >
        <Atom className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 14. MUSIC CLUB: Spinning vinyl record */
export function MusicHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-neutral-900 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-bold text-amber-500">Music Club</h1>
        <p className="text-neutral-400">Harmonizing voices, bands, and acoustic instruments.</p>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="text-amber-500"
      >
        <Disc className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 15. TURINGITES CS SOCIETY: Blinking cursor terminal prompt */
export function TuringitesHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-black p-8 font-mono text-green-400 shadow-xl border border-green-800/50">
      <div>
        <h1 className="text-3xl font-bold text-green-400">&gt; Turingites CS Society</h1>
        <p className="text-green-600">Coding, algorithms, and hackathons.</p>
      </div>
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <Terminal className="h-16 w-16 text-green-400" />
      </motion.div>
    </div>
  );
}

/* 16. ANIMAL WELFARE SOCIETY: Walking paw prints */
export function AnimalWelfareHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-amber-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-bold text-amber-400">Animal Welfare Society</h1>
        <p className="text-amber-200">Advocating, feeding, and caring for campus animals.</p>
      </div>
      <motion.div
        animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-amber-400"
      >
        <Footprints className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 17. MARTIAL ARTS CLUB: Slash/flame effect */
export function MartialArtsHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-red-950 p-8 text-white shadow-xl">
      <div>
        <h1 className="text-3xl font-extrabold text-red-500">Martial Arts Club</h1>
        <p className="text-red-200">Building discipline, fitness, and self-defense.</p>
      </div>
      <motion.div
        animate={{ scale: [1, 1.25, 1], rotate: [-10, 10, -10] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-red-500"
      >
        <Flame className="h-16 w-16" />
      </motion.div>
    </div>
  );
}

/* 18. FOSS CLUB: Git branching tree animation */
export function FossHero() {
  return (
    <div className="relative flex h-48 w-full items-center justify-between rounded-2xl bg-slate-900 p-8 text-white shadow-xl border border-sky-800/40">
      <div>
        <h1 className="text-3xl font-mono font-bold text-sky-400">FOSS Club</h1>
        <p className="text-slate-300">Promoting Free and Open Source Software.</p>
      </div>
      <motion.div
        animate={{ rotate: [0, 90, 180, 270, 360] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="text-sky-400"
      >
        <GitBranch className="h-16 w-16" />
      </motion.div>
    </div>
  );
}
```

---

## 7. Handwriting & Scramble Effects in Blog Posts (`.mdx`)

Embed handwriting fonts, calligraphic signatures, and scramble text directly inside
a blog post, e.g. `blog/2026-08-15-annual-literary-fest/index.mdx`:

```mdx
---
title: "Sai Uni Annual Literary Fest 2026"
authors: [editor]
tags: [literary-club, poetry, calligraphy]
---

import { AnimatedSignature, HandwrittenCallout } from '@site/src/components/KineticText';
import { ScrambleText } from '@site/src/components/ScrambleText';

# Annual Literary & Poetry Slam ✒️

Welcome to our recap of the 2026 Annual Literary Fest hosted at Sai University, Chennai.

<AnimatedSignature
  text="In the quiet of words, universe speaks."
  subtext="Opening Poetry Slam Dedication"
/>

Hover over our secret tech keyphrase below to scramble:
### Keynote Subject: <ScrambleText text="CYBER POETRY & ARTIFICIAL MINDS" />

<HandwrittenCallout title="Note from the Club President">
  "We had over 200 participants this year! Thank you to everyone who submitted original calligraphic poems and spoken word pieces."
</HandwrittenCallout>

<p className="font-calligraphy">
  Created with passion at Sai University, Chennai.
</p>
```

---

## 8. Special Event, Fest & Library Animations

Drop these into overarching fest pages (Tech Fest, Cultural Fest, Library Resources).
File: `src/components/FestAnimations.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Book, BookMarked, PartyPopper, Sparkles,
  Terminal, Code, Cpu, Plane,
  Music, Mic2, Users, Gamepad2, Dices, Crown, Smile
} from 'lucide-react';

/* --------------------------------------------------------
   A. LIBRARY EFFECT (Books flowing in and out)
   -------------------------------------------------------- */
export function LibraryFlow() {
  const books = [Book, BookOpen, BookMarked, Book];

  return (
    <div className="relative w-full h-40 overflow-hidden bg-amber-900/10 rounded-2xl flex items-center justify-center shadow-inner border border-amber-800/20">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-amber-50 dark:from-slate-900 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-amber-50 dark:from-slate-900 to-transparent z-10" />

      {books.map((Icon, i) => (
        <motion.div
          key={i}
          initial={{ x: 300, opacity: 0, rotate: 10 }}
          animate={{ x: -300, opacity: [0, 1, 1, 0], rotate: -10 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "linear"
          }}
          className="absolute text-amber-700 dark:text-amber-400"
        >
          <Icon className="w-16 h-16 drop-shadow-md" />
        </motion.div>
      ))}
      <h2 className="z-20 font-serif font-bold text-2xl text-amber-900 dark:text-amber-200 bg-white/60 dark:bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm">
        Campus Library Archive
      </h2>
    </div>
  );
}

/* --------------------------------------------------------
   B. GENERAL FEST (Confetti & party popper celebration)
   -------------------------------------------------------- */
export function GeneralFestHero({ title = "Annual College Fest" }) {
  return (
    <div className="relative w-full h-48 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white shadow-xl">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <PartyPopper className="w-16 h-16 mb-2" />
      </motion.div>
      <h1 className="text-4xl font-black tracking-tight">{title}</h1>

      {/* Confetti Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 50, x: 0, opacity: 0, scale: 0 }}
          animate={{
            y: -100,
            x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 100),
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          className="absolute text-yellow-300"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------
   C. TECH FEST (Drone delivery -> terminal expand)
   -------------------------------------------------------- */
export function TechFestHero({
  title = "INNOVISION 2026",
  content = "Welcome to the ultimate Hackathon and Tech Symposium. Join us for 48 hours of uninterrupted coding, hardware modeling, and AI workshops."
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full min-h-[16rem] bg-slate-950 rounded-2xl border border-blue-900/50 p-8 flex flex-col items-center justify-center font-mono overflow-hidden cursor-pointer"
         onClick={() => setIsOpen(!isOpen)}>

      {/* 1. Drone flying in and out */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="drone"
            initial={{ x: -200, y: -50, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: 200, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="absolute top-6 text-blue-400 flex flex-col items-center"
          >
            <Plane className="w-10 h-10 rotate-45 mb-2" />
            <span className="text-xs text-blue-500 animate-pulse">DEPLOYING PAYLOAD...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Terminal box & expanding content */}
      <motion.div
        layout
        className={`bg-black border border-green-500/50 rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col ${isOpen ? 'w-full max-w-2xl mt-4' : 'w-48 h-16 mt-16'}`}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2 flex items-center space-x-2 border-b border-green-500/30">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400 ml-2">tech_fest.sh</span>
        </div>

        {/* Terminal Body */}
        <div className="p-4 text-green-400 flex-1">
          {!isOpen ? (
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                _
              </motion.span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">&gt; {title}</h2>
              <p className="text-green-300/80 mb-4">{content}</p>
              <div className="flex space-x-4 text-blue-400">
                <Code className="w-6 h-6" />
                <Cpu className="w-6 h-6" />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {!isOpen && (
        <p className="absolute bottom-4 text-slate-500 text-sm">Click terminal to execute</p>
      )}
    </div>
  );
}

/* --------------------------------------------------------
   D. CULTURAL FEST (High-speed slideshow reel)
   -------------------------------------------------------- */
const CULTURAL_ICONS = [
  { icon: Music, color: "text-pink-500", label: "Music" },
  { icon: Users, color: "text-amber-500", label: "Dance" },
  { icon: Mic2, color: "text-purple-500", label: "Vocals" },
  { icon: Gamepad2, color: "text-blue-500", label: "Gaming" },
  { icon: Crown, color: "text-yellow-400", label: "Chess" },
  { icon: Dices, color: "text-rose-500", label: "Boardgames" },
];

export function CulturalFestHero({ title = "VIBRANCE 2026" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CULTURAL_ICONS.length);
    }, 1200); // Fast-paced cycle
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-48 bg-fuchsia-950 rounded-2xl overflow-hidden flex items-center justify-between px-12 shadow-xl border border-fuchsia-800/50">

      {/* Title Area */}
      <div className="z-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300">
          {title}
        </h1>
        <p className="text-fuchsia-200 mt-2 font-medium tracking-wide">
          The heartbeat of Sai University.
        </p>
      </div>

      {/* Dynamic Slideshow Area */}
      <div className="relative w-32 h-32 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center ${CULTURAL_ICONS[currentIndex].color}`}
          >
            {React.createElement(CULTURAL_ICONS[currentIndex].icon, { className: "w-14 h-14 drop-shadow-lg" })}
            <span className="text-xs font-bold mt-1 uppercase tracking-widest text-white/80">
              {CULTURAL_ICONS[currentIndex].label}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background abstract shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
    </div>
  );
}
```

---

## Notes for later (not decisions — just things to reconcile)

- This guide assumes **Framer Motion + Lucide React + Tailwind utility classes**,
  which lines up with the Tailwind/Shadcn stack in the main project spec, but is a
  different animation approach from the pure-CSS `motion.css` / Infima-based system
  built earlier for Marginalia/Scholar. The two aren't compatible as-is — worth
  deciding which animation approach to standardize on once the styling direction
  is picked.
- Per-club hero colors here (amber, rose, cyan, fuchsia, etc. per club) are
  independent of any of the palettes explored so far (Marginalia, Scholar,
  Sai Crimson) and would need to be reconciled with whichever one is chosen.
- The handwriting/calligraphy fonts (Caveat, Dancing Script, Great Vibes) are a
  new typography addition not present in the Marginalia or Scholar type systems.
