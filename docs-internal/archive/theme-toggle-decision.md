# Theme toggle UI — explored, not adopted

A custom animated light/auto/dark toggle was proposed and iterated on. Final
call: **don't build it** — Docusaurus's own built-in toggle already does
everything this was solving for, for free. Kept here for the record and in
case the animated version is ever wanted purely for visual flourish.

## Outcome

`docusaurus.config.js` already has `colorMode: { respectPrefersColorScheme:
true } }`. With that set, Docusaurus's built-in `ColorModeToggle` (see
`node_modules/@docusaurus/theme-classic/src/theme/ColorModeToggle/index.tsx`)
already cycles through **three real states** — `system (null) → light → dark
→ system → ...` — with its own `IconSystemColorMode` icon, a proper
translated aria-label ("Switch between dark and light mode (currently system
mode)"), live OS-preference tracking while in system mode, and a native
keyboard-operable button. That's the exact feature (an explicit, returnable
"Auto" state) the custom toggle below was built to add. No custom code
needed — it ships for free, already correctly wired, already accessible.

The only thing the custom version adds on top is a decorative sky/cloud/star
animation. Given the open WCAG/animation backlog elsewhere in this project
(see `docs-internal/animation-caveats.md`), that's not judged worth the added code
surface right now.

## Original idea (as given)

Three-way cycling toggle: light → "middle" (later clarified as **Auto**, not
a distinct third palette) → dark. Track and thumb both animate color/position
per state; sun/cloud/star iconography signals which state is active.

```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Cloud, Star, SunMoon } from 'lucide-react';

function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check initial system or stored preference
    const storedTheme = localStorage.getItem('theme');
    const isDarkMode = document.documentElement.classList.contains('dark');

    if (storedTheme === 'middle') {
      setTheme('middle');
    } else if (storedTheme === 'dark' || (!storedTheme && isDarkMode)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const cycleTheme = () => {
    let nextTheme = 'light';
    if (theme === 'light') nextTheme = 'middle';
    else if (theme === 'middle') nextTheme = 'dark';

    setTheme(nextTheme);

    // Dark mode class is only applied for the 'dark' state
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', nextTheme);
  };

  let trackBg = 'bg-sky-300 border-sky-400 shadow-inner';
  if (theme === 'middle') trackBg = 'bg-gradient-to-r from-sky-300 to-slate-800 border-transparent shadow-inner';
  if (theme === 'dark') trackBg = 'bg-slate-800 border-slate-700 shadow-inner';

  let thumbBg = 'bg-amber-300 text-amber-600 shadow-amber-500/30';
  if (theme === 'middle') thumbBg = 'bg-gradient-to-br from-amber-200 to-indigo-800 text-slate-100 shadow-indigo-900/50';
  if (theme === 'dark') thumbBg = 'bg-slate-900 text-amber-200 shadow-slate-950/50';

  let thumbX = 0;
  if (theme === 'middle') thumbX = 36;
  if (theme === 'dark') thumbX = 72;

  return (
    <button
      onClick={cycleTheme}
      className={`relative flex h-10 w-28 items-center rounded-full p-1 transition-colors duration-500 focus:outline-none overflow-hidden ${trackBg}`}
      aria-label="Toggle Theme"
    >
      {/* Background Decorative Elements */}
      <AnimatePresence>
        {theme === 'light' && (
          <motion.div
            key="clouds"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Cloud className="absolute left-10 top-1 h-7 w-7 text-white/95" fill="currentColor" />
            <Cloud className="absolute right-2 bottom-1 h-5 w-5 text-white/80" fill="currentColor" />
          </motion.div>
        )}

        {theme === 'middle' && (
          <motion.div
            key="middle"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Cloud className="absolute left-2 top-1.5 h-6 w-6 text-white/80" fill="currentColor" />
            <Star className="absolute right-2 bottom-1.5 h-6 w-6 text-yellow-300" fill="currentColor" />
          </motion.div>
        )}

        {theme === 'dark' && (
          <motion.div
            key="stars"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Star className="absolute left-2 top-1 h-7 w-7 text-yellow-300" fill="currentColor" />
            <Star className="absolute left-10 bottom-1.5 h-5 w-5 text-yellow-400" fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding Thumb */}
      <motion.div
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-md ${thumbBg}`}
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        animate={{ x: thumbX }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' && (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-5 w-5 fill-current" />
            </motion.div>
          )}
          {theme === 'middle' && (
            <motion.div
              key="sunmoon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SunMoon className="h-5 w-5 fill-current" />
            </motion.div>
          )}
          {theme === 'dark' && (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-5 w-5 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="space-y-6 flex flex-col items-center bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <h1 className="text-2xl font-bold tracking-tight">Theme Toggle</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center mb-4 leading-relaxed">
          Click the switch below to cycle through Light, Twilight, and Dark modes.
        </p>
        <ThemeToggle />
      </div>
    </div>
  );
}
```

## Compatibility issues found in the original

1. **Toggled a `.dark` class on `documentElement`.** This site's dark mode —
   every hero, `custom.css`, the `useClubAccent` bridge — is driven by
   Docusaurus's own `data-theme="dark"` attribute, set via `useColorMode()`.
   A second, parallel mechanism would desync from it. (Turned out
   `tailwind.config.js`'s `darkMode: ['class', '[data-theme="dark"]']`
   already accepts either, so this specific mismatch was recoverable — but
   only for Tailwind's own utilities, not for Infima/`custom.css`.)
2. **Read/wrote `localStorage.getItem('theme')`.** Docusaurus's own
   color-mode persistence also uses the key `"theme"` — two systems writing
   incompatible value formats (`'light'/'dark'` vs `'light'/'middle'/'dark'`)
   to the same key would stomp on each other across reloads.
3. **"Middle" only ever removed the dark class** (fell into the `else`
   branch in `cycleTheme`) — so before the "auto" clarification, it was
   cosmetic only: the toggle animated through three visual states but the
   page underneath only ever rendered light or dark, never a real third
   theme.
4. **No OS-preference subscription.** Initial state was read from
   `classList` once on mount; if "middle"/auto were meant to track the OS
   live, nothing re-checked `prefers-color-scheme` after that.
5. **`focus:outline-none` with no replacement** — removes keyboard focus
   visibility entirely (WCAG 2.4.7).
6. **Static `aria-label="Toggle Theme"`** — never reflects current or next
   state, so screen-reader users get no state information from the control
   itself.
7. **Initial-mount flash** — `useState('light')` renders before the
   `useEffect` corrects it on mount, so returning dark/auto users see a
   flash of the wrong icon/position.
8. **Redundant `layout` + explicit `animate={{ x: thumbX }}`** on the
   thumb — both animate position; only the explicit one is needed.

## Compatibility-fixed version (auto = live OS-tracking, not a third palette)

Rewritten to go through Docusaurus's actual `useColorMode()` (owns
`data-theme` + its own persistence) rather than hand-rolled `classList`/
`localStorage`, with the 3-way *choice* (`'light' | 'auto' | 'dark'`) kept in
a separate key so it never collides with Docusaurus's own:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Cloud, Star, SunMoon } from 'lucide-react';
import { useColorMode } from '@docusaurus/theme-common';
import useIsBrowser from '@docusaurus/useIsBrowser';

// Separate from Docusaurus's own 'theme' localStorage key, which only ever
// stores the *resolved* light/dark value — this remembers whether the user
// wants that resolved value to keep tracking the OS live ('auto') or stay
// pinned to an explicit choice.
const CHOICE_KEY = 'sai-wiki-color-choice';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function ThemeToggle() {
  const isBrowser = useIsBrowser();
  const { setColorMode } = useColorMode();
  const [choice, setChoice] = useState('auto');

  // Restore the user's 3-way choice on mount. If it's 'auto' (or nothing was
  // ever chosen), resolve against the current OS preference right away.
  useEffect(() => {
    if (!isBrowser) return;
    const stored = localStorage.getItem(CHOICE_KEY);
    const initial = stored === 'light' || stored === 'dark' ? stored : 'auto';
    setChoice(initial);
    if (initial === 'auto') setColorMode(systemPrefersDark() ? 'dark' : 'light');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowser]);

  // While 'auto' is active, keep tracking OS changes live (not just at mount)
  // — e.g. the reader's system switches to dark at sunset.
  useEffect(() => {
    if (!isBrowser || choice !== 'auto') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setColorMode(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [isBrowser, choice, setColorMode]);

  const cycle = useCallback(() => {
    const order = ['light', 'auto', 'dark'];
    const next = order[(order.indexOf(choice) + 1) % order.length];
    setChoice(next);
    localStorage.setItem(CHOICE_KEY, next);
    setColorMode(next === 'auto' ? (systemPrefersDark() ? 'dark' : 'light') : next);
  }, [choice, setColorMode]);

  let trackBg = 'bg-sky-300 border-sky-400 shadow-inner';
  if (choice === 'auto') trackBg = 'bg-gradient-to-r from-sky-300 to-slate-800 border-transparent shadow-inner';
  if (choice === 'dark') trackBg = 'bg-slate-800 border-slate-700 shadow-inner';

  let thumbBg = 'bg-amber-300 text-amber-600 shadow-amber-500/30';
  if (choice === 'auto') thumbBg = 'bg-gradient-to-br from-amber-200 to-indigo-800 text-slate-100 shadow-indigo-900/50';
  if (choice === 'dark') thumbBg = 'bg-slate-900 text-amber-200 shadow-slate-950/50';

  const thumbX = choice === 'auto' ? 36 : choice === 'dark' ? 72 : 0;
  const label =
    choice === 'auto' ? 'Theme: following system. Click for light.' :
    choice === 'light' ? 'Theme: light. Click to follow system.' :
    'Theme: dark. Click for light.';

  return (
    <button
      onClick={cycle}
      className={`relative flex h-10 w-28 items-center rounded-full p-1 transition-colors duration-500 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ifm-color-primary)] ${trackBg}`}
      aria-label={label}
    >
      <AnimatePresence>
        {choice === 'light' && (
          <motion.div key="clouds" className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
            <Cloud className="absolute left-10 top-1 h-7 w-7 text-white/95" fill="currentColor" />
            <Cloud className="absolute right-2 bottom-1 h-5 w-5 text-white/80" fill="currentColor" />
          </motion.div>
        )}
        {choice === 'auto' && (
          <motion.div key="auto" className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
            <Cloud className="absolute left-2 top-1.5 h-6 w-6 text-white/80" fill="currentColor" />
            <Star className="absolute right-2 bottom-1.5 h-6 w-6 text-yellow-300" fill="currentColor" />
          </motion.div>
        )}
        {choice === 'dark' && (
          <motion.div key="stars" className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
            <Star className="absolute left-2 top-1 h-7 w-7 text-yellow-300" fill="currentColor" />
            <Star className="absolute left-10 bottom-1.5 h-5 w-5 text-yellow-400" fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-md ${thumbBg}`}
        animate={{ x: thumbX }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {choice === 'light' && (
            <motion.div key="sun" initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sun className="h-5 w-5 fill-current" />
            </motion.div>
          )}
          {choice === 'auto' && (
            <motion.div key="sunmoon" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
              <SunMoon className="h-5 w-5 fill-current" />
            </motion.div>
          )}
          {choice === 'dark' && (
            <motion.div key="moon" initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Moon className="h-5 w-5 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

export default ThemeToggle;
```

## Why it wasn't adopted

`docusaurus.config.js` already has `colorMode: { respectPrefersColorScheme:
true } }`. With that set, Docusaurus's built-in `ColorModeToggle` (source:
`node_modules/@docusaurus/theme-classic/src/theme/ColorModeToggle/index.tsx`)
already cycles **system (null) → light → dark → system → ...**, with its own
`IconSystemColorMode` icon, a proper translated aria-label, live
`prefers-color-scheme` tracking while in system mode, and a native
keyboard-operable button — the exact feature this custom component exists to
add. It ships for free, already wired correctly, already accessible.

If the animated version is ever wanted anyway, purely for visual polish, the
compatibility-fixed code above is the one to start from — not the original.
