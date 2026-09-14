// src/components/HomepageBuilding.jsx
//
// The homepage hero's subject: Sai University's School of Computing & Data
// Science, drawn as a flat architectural elevation at dusk, with one lit
// window per club — 21 windows carrying the 21 real accent colors from the
// same `CLUB_ACCENTS` table every hero reads.
//
// Why a building and not a pattern: this wiki's actual subject is what
// happens in these rooms. Lit windows are that, literally — the same reason
// the heroes animate what a club *does* rather than spinning its noun. It
// replaces `HomepageClubMarks` (a row of accent dots), which carried the
// same data with none of the meaning.
//
// Drawn as a flat elevation, deliberately, not a trace of the source photo's
// three-quarter perspective: a perspective trace has one correct width, and
// this has to bleed edge-to-edge from 320px to ultrawide. The massing is
// kept faithful instead — the long two-storey left wing, the taller right
// block, and the entrance pavilion whose glazed slot breaks above the
// roofline (the building's one genuinely distinctive move), plus the
// curved-arm forecourt lamps that flank it.
//
// Colors come from CSS custom properties set on the hero in
// `index.module.css`, never hardcoded here — see DESIGN.md's Token-Only
// Rule. The per-club window fills are the documented exception that
// `CLUB_ACCENTS` already is: their own system, layered on top.

import React from 'react';
import { motion } from 'framer-motion';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useIntroMotion } from './useIntroMotion';
import { useAccentMode } from './useClubAccent';
import { CLUB_ACCENTS, UNIFIED_ACCENT } from './clubAccents';

const VIEW_W = 1600;
const VIEW_H = 460;
const GROUND_Y = 430;

// Flat elevation massing. `roof` is the parapet line; everything below it
// down to GROUND_Y is solid wall. Both wings deliberately overrun the
// viewBox on their outer edge: the building has to read as a fragment of
// something longer that the frame happens to crop, and an earlier pass that
// ended both wings inside the frame left two stray lit slabs floating at the
// edges instead.
// The entrance sits left of centre, not on the middle axis: it carries the
// tallest element (the glazed slot), and centred it rose directly behind the
// CTA row and read as a pole growing out of a button. Left-of-centre also
// matches the real elevation, where the entrance sits well left of the tall
// end block.
const LEFT_WING = { x: -40, w: 340, roof: 250 };
const PAVILION = { x: 300, w: 240, roof: 196 };
const MID_WING = { x: 540, w: 540, roof: 250 };
const RIGHT_BLOCK = { x: 1080, w: 560, roof: 222 };
const MASSES = [LEFT_WING, PAVILION, MID_WING, RIGHT_BLOCK];

const PAVILION_MID = PAVILION.x + PAVILION.w / 2;

// The sign panel above the entrance. Sized and placed to sit between the two
// flanking rooms without touching either, and to clear the canopy below it.
const SIGN = 58;
const SIGN_Y = 248;

const WIN_W = 46;
const WIN_H = 44;
const FLOOR_UPPER = 282;
const FLOOR_LOWER = 352;

// Nothing sits above y≈168: the hero band is short and wide, and the SVG
// renders with `xMidYMax slice` (anchored bottom, top cropped as the band
// gets shorter). Keeping every feature below that line means the glazed
// slot and lamp heads survive the crop rather than being decapitated on a
// laptop.
const SKYLINE_TOP = 168;

// Window bays are laid out over their own inset region rather than the wall's
// full width, so the end bays sit a proper pier's width in from the corner
// instead of running off the edge with the wall.
const WINDOW_REGIONS = [
  { x: 10, w: 270, bays: 3 },
  { x: 562, w: 496, bays: 5 },
  { x: 1104, w: 512, bays: 4 },
];

function bayCenters({ x, w }, count) {
  const bay = w / count;
  return Array.from({ length: count }, (_, i) => x + i * bay + (bay - WIN_W) / 2);
}

// 24 window slots: 12 bays across the three window-bearing walls, on two
// floors. Upper floor left-to-right, then lower floor left-to-right.
const SLOTS = [
  ...WINDOW_REGIONS.flatMap((r) => bayCenters(r, r.bays).map((x) => ({ x, y: FLOOR_UPPER }))),
  ...WINDOW_REGIONS.flatMap((r) => bayCenters(r, r.bays).map((x) => ({ x, y: FLOOR_LOWER }))),
];

// 24 slots, 21 clubs — three rooms stay dark. A fully-lit facade reads as a
// texture; three dark windows read as a real building on a real evening.
const DARK_SLOTS = new Set([5, 13, 19]);

const SLUGS = Object.keys(CLUB_ACCENTS);

// Mechanical title-case of the slug works for 18 of 21 clubs. The other 3
// were renamed (2026-09, see CLAUDE.md) but kept their old slug so no
// links/tags broke, so their real current name needs an explicit override.
const DISPLAY_NAME_OVERRIDES = {
  'gardening-club': 'Sustainability Club',
  'gaming-club': 'DOT.exe',
  'film-society': 'Creators Club',
};

function clubDisplayName(slug) {
  return (
    DISPLAY_NAME_OVERRIDES[slug] ??
    slug
      .split('-')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ')
  );
}

const LIT_SLOTS = SLOTS.map((slot, i) => ({ ...slot, index: i })).filter(
  (slot) => !DARK_SLOTS.has(slot.index)
);

// 7 and 24 are coprime, so `(i * 7) % 24` walks every slot exactly once in a
// scattered order — rooms switch on independently the way a real building
// empties and fills, instead of sweeping left-to-right like a progress bar.
// Deterministic (no Math.random), which prerender/hydration requires.
function lightDelay(slotIndex) {
  return 0.2 + (((slotIndex * 7) % 24) * 0.05);
}

const WINDOW_VARIANTS = {
  // The finished state is lit. Reduced-motion readers and anyone arriving
  // mid-page get this immediately — the animation is the only thing skipped,
  // never the content.
  rest: { opacity: 1, transition: { duration: 0 } },
  light: (delay) => ({
    opacity: 1,
    transition: { delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Lamp heads sit just under the pavilion parapet. On the real forecourt the
// lamps out-top the building, but drawn that way here they punched up
// through the CTA row — so they read tall against the two wings they
// actually stand in front of, and stop below the content.
const LAMP_HEAD_Y = 206;

function Lamp({ x }) {
  const headX = x + 38;
  return (
    <g>
      <ellipse
        cx={headX + 14}
        cy={LAMP_HEAD_Y + 22}
        rx={62}
        ry={42}
        fill="var(--sai-lamp-glow)"
        filter="url(#sai-glow-blur)"
      />
      <rect x={x - 3} y={LAMP_HEAD_Y + 18} width={6} height={GROUND_Y - LAMP_HEAD_Y - 18} fill="var(--sai-structure)" />
      <path
        d={`M ${x} ${LAMP_HEAD_Y + 30} C ${x} ${LAMP_HEAD_Y + 6}, ${x + 14} ${LAMP_HEAD_Y}, ${x + 40} ${LAMP_HEAD_Y}`}
        fill="none"
        stroke="var(--sai-structure)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <rect x={headX} y={LAMP_HEAD_Y - 4} width={30} height={9} rx={3} fill="var(--sai-structure)" />
      <rect x={headX + 3} y={LAMP_HEAD_Y + 5} width={24} height={4} rx={2} fill="var(--sai-lamp-lit)" />
    </g>
  );
}

// A lit window, not a colored square: the accent fill is inset inside its
// own dark reveal so every light carries a frame, and a mullion cross splits
// it into panes. Without these the facade read as a row of candy — the
// single change that most decides whether this is a building or a bar chart.
function Window({ x, y, fill }) {
  const m = 1.5;
  return (
    <>
      <rect x={x + 3} y={y + 3} width={WIN_W - 6} height={WIN_H - 6} fill={fill} />
      <rect x={x + WIN_W / 2 - m} y={y + 3} width={m * 2} height={WIN_H - 6} fill="var(--sai-mass)" />
      <rect x={x + 3} y={y + WIN_H / 2 - m} width={WIN_W - 6} height={m * 2} fill="var(--sai-mass)" />
    </>
  );
}

// `className` is passed in rather than imported here: the sizing/placement
// lives in the homepage's own CSS module (hashed class names), while this
// file owns only the artwork.
export function HomepageBuilding({ className }) {
  const { mode } = useAccentMode();
  const { isPlaying, isReplaying, hoverProps } = useIntroMotion();
  const isUnified = mode === 'unified';
  // Not a literal '/img/…' path: an SVG <image> href is no more
  // baseUrl-aware than a raw <img src>, so a literal would 404 on any host
  // whose baseUrl isn't this repo's GitHub Pages subpath.
  const markSrc = useBaseUrl('/img/saiu-mark.png');

  // Only the ref is taken from `hoverProps` — deliberately not the
  // role="button"/tabIndex/onClick the club heroes spread. This sits behind a
  // page header that contains the two real CTAs, and wrapping those in an
  // outer button role would nest interactive controls inside a control. The
  // ref is what the intro trigger and the off-screen pause observer need.
  const { ref } = hoverProps;

  return (
    <div className={className} aria-hidden="true" ref={ref}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMax slice"
        role="presentation"
        focusable="false"
      >
        <defs>
          <filter id="sai-glow-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>

        <Lamp x={760} />
        <Lamp x={1330} />

        {/* Wall masses, then a lighter parapet coping sitting on each roof
            line — the concrete cap that reads against brick in the source
            photo, and the only thing separating overlapping blocks
            silhouetted against each other. */}
        {MASSES.map((m) => (
          <g key={m.x}>
            <rect x={m.x} y={m.roof} width={m.w} height={GROUND_Y - m.roof} fill="var(--sai-mass)" />
            <rect x={m.x} y={m.roof} width={m.w} height={7} fill="var(--sai-parapet)" />
          </g>
        ))}

        {/* Entrance pavilion, drawn onto the pavilion wall rather than in
            front of it: a canopy band spanning the facade, a recessed lit
            lobby under it, and the glazed slot running up past the parapet.
            That slot is the building's one genuinely distinctive move, but
            it only reads as glazing while it stays slot-width — drawn fat it
            turned into a totem standing in front of the entrance. */}
        <rect x={PAVILION_MID - 8} y={SKYLINE_TOP} width={16} height={330 - SKYLINE_TOP} fill="var(--sai-glazing)" />
        {/* Two dim rooms flanking the slot, so the entrance block isn't a
            blank slab between two lit wings. Not club windows — the 21 are
            all on the window-bearing walls. */}
        <rect x={PAVILION.x + 26} y={246} width={38} height={36} fill="var(--sai-window-dark)" />
        <rect x={PAVILION.x + PAVILION.w - 64} y={246} width={38} height={36} fill="var(--sai-window-dark)" />
        {/* The university mark on a lit sign panel above the entrance, as on
            the real building. Drawn after the glazed slot so it reads as a
            panel mounted onto the tower rather than a hole cut through it.
            `rx` is a plain rounded corner, the documented fallback for
            DESIGN.md's squircle rule — SVG has no superellipse corner, and
            CSS `corner-shape` doesn't apply to an SVG rect. */}
        <rect
          x={PAVILION_MID - SIGN / 2}
          y={SIGN_Y}
          width={SIGN}
          height={SIGN}
          rx={14}
          fill="var(--sai-sign)"
        />
        <image
          href={markSrc}
          x={PAVILION_MID - SIGN / 2 + 6}
          y={SIGN_Y + 6}
          width={SIGN - 12}
          height={SIGN - 12}
          preserveAspectRatio="xMidYMid meet"
        />
        <rect x={PAVILION.x + 16} y={322} width={PAVILION.w - 32} height={9} fill="var(--sai-parapet)" />
        {/* Recessed portal with the doors lit inside it. Both warm fills are
            solid: alpha-blending warm light over the navy wall composites to
            khaki, which read as a muddy brown box rather than as an opening
            with light behind it. */}
        <rect x={PAVILION_MID - 62} y={342} width={124} height={GROUND_Y - 342} fill="var(--sai-window-dark)" />
        <rect x={PAVILION_MID - 34} y={356} width={68} height={GROUND_Y - 356} fill="var(--sai-door)" />

        {/* Dark reveals sit under every slot, so the three unlit rooms still
            read as windows rather than as blank wall. */}
        {SLOTS.map((slot, i) => (
          <rect
            key={`recess-${i}`}
            x={slot.x}
            y={slot.y}
            width={WIN_W}
            height={WIN_H}
            fill="var(--sai-window-dark)"
          />
        ))}

        <g key={isReplaying ? 'replay' : 'intro'}>
          {LIT_SLOTS.map((slot, i) => {
            const slug = SLUGS[i];
            const accent = isUnified ? UNIFIED_ACCENT : CLUB_ACCENTS[slug];
            return (
              <motion.g
                key={slug}
                style={{ pointerEvents: 'auto' }}
                initial={{ opacity: 0 }}
                animate={isPlaying ? 'light' : 'rest'}
                custom={lightDelay(slot.index)}
                variants={WINDOW_VARIANTS}
              >
                <title>{clubDisplayName(slug)}</title>
                <Window x={slot.x} y={slot.y} fill={accent.dark} />
              </motion.g>
            );
          })}
        </g>

        <rect x={0} y={GROUND_Y} width={VIEW_W} height={VIEW_H - GROUND_Y} fill="var(--sai-plaza)" />
      </svg>
    </div>
  );
}
