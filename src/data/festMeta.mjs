// src/data/festMeta.mjs
//
// Per-fest label/description/icon — the fest equivalent of a club's own
// _category_.json, read only by scripts/rollover.mjs when bootstrapping a
// fest's docs/archive/<slug>/_category_.json for the first time. Keep in
// sync with each fest's own docs/fests/<slug>.mdx frontmatter by hand.
//
// Icons match what's already live in each fest's own frontmatter
// (docs/fests/<slug>.mdx's sidebar_custom_props.icon) — Rocket, PartyPopper,
// and Music, not a fresh choice, so the archive category's icon matches the
// live fest page's icon exactly, same as clubs already do.

export const FEST_META = {
  'tech-fest': {
    title: 'Innovision',
    icon: 'Rocket',
    description: "Sai University's annual technical fest — 48 hours, build something real.",
  },
  'general-fest': {
    title: 'Annual College Fest',
    icon: 'PartyPopper',
    description: "Sai University's annual college-wide fest — where every club comes together.",
  },
  'cultural-fest': {
    title: 'MoSAIc',
    icon: 'Music',
    description: "Sai University's annual cultural fest — the heartbeat of Sai University.",
  },
};
