# Sai University Wiki — Easter Egg: Hidden Dino Game

> Status: proposed / not yet implemented. This doc captures the plan so it can be
> picked up later, once the main styling and animation direction is finalized.

---

## 1. Concept

A small 🦖 icon lives in the site footer (or floats in the corner). Clicking it
opens the classic Chrome "no internet" dino runner game in an overlay, right on
top of the current page — no navigation away, no announcement anywhere else on
the site. It's meant to be found, not advertised.

---

## 2. Why the Footer-Icon Approach (vs. Search-Bar Trigger)

An earlier version of this idea used a hidden keyword typed into the search bar
(`"dino game"`) to redirect to a secret page. That's still a fun option, but it
required **swizzling `SearchBar`**, which is riskier because:

- It has to preserve whatever search provider is in use (Algolia DocSearch vs.
  local search), and DOM selectors like `.DocSearch-Reset` are provider-specific
  and can break silently.
- It listens globally on `document` for `input` events, which is a bit heavier
  and harder to reason about.

The footer-icon approach is simpler and lower-risk:

- Swizzling `Footer` with `--wrap` doesn't touch any third-party search logic.
- No global event listeners — just a button and a click handler.
- Fully self-contained in one component; easy to remove later if needed.

---

## 3. Implementation Plan

### Step 1 — Install the game package

```bash
npm install react-chrome-dino
```

(Alternative if this package feels unmaintained by the time this is built:
`react-dino-game`, or hand-rolling the game from Chrome's open-source dino
source directly.)

### Step 2 — Swizzle the Footer component

```bash
npm run swizzle @docusaurus/theme-classic Footer -- --wrap
```

This generates `src/theme/Footer/index.js`, wrapping (not replacing) the
default footer so nothing else about it changes.

### Step 3 — Add the icon + game overlay

`src/theme/Footer/index.js`:

```jsx
import React, { useState } from 'react';
import Footer from '@theme-original/Footer';
import ChromeDinoGame from 'react-chrome-dino';

export default function FooterWrapper(props) {
  const [showGame, setShowGame] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Footer {...props} />

      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Tooltip — only rendered while hovering */}
        {isHovered && (
          <span
            style={{
              fontSize: '0.75rem',
              fontStyle: 'italic',
              color: 'var(--ifm-color-emphasis-700, #666)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            charging trex...
          </span>
        )}

        <button
          onClick={() => setShowGame(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="secret"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            opacity: 0.6,
          }}
        >
          🦖
        </button>
      </div>

      {showGame && (
        <div
          onClick={() => setShowGame(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ChromeDinoGame />
            <p style={{ color: '#fff', textAlign: 'center', marginTop: '10px' }}>
              click anywhere to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
```

### Placement variants to decide on later

- **Floating (as written above):** icon stays fixed in the corner, visible on
  every page regardless of scroll position. More discoverable.
- **In-flow:** drop `position: fixed` and place the button inside the actual
  footer markup, so it only appears once a visitor scrolls to the bottom.
  Feels more like a genuine "hidden" easter egg.

---

## 4. Open Questions / Things to Reconcile Later

- **Styling:** the 🦖 button and overlay currently use inline styles with no
  connection to any of the palettes under consideration (Marginalia, Scholar,
  Sai Crimson). Once a theme is chosen, this should be restyled to match —
  or deliberately left theme-agnostic since it's a hidden joke, not a core UI
  element.
- **Motion:** could integrate with the Framer Motion / Lucide setup from the
  motion guide (e.g. a spring pop-in for the overlay, a little wiggle on the
  dino icon on hover) instead of the plain CSS above — worth revisiting once
  the animation approach (Framer Motion vs. Infima/motion.css) is settled.
- **Package choice:** confirm `react-chrome-dino` builds cleanly against
  whatever React version the Docusaurus v3 site ends up on.
- **Discoverability level:** the icon now shows a "charging trex..." tooltip on
  hover (see code above) — decide if this is the right amount of hinting, or
  if it should stay fully unlabeled for a more genuine "hidden" feel.

---

## 5. Status

Not yet implemented. No files have been created in the actual project repo —
this document is the spec to build from when ready.
