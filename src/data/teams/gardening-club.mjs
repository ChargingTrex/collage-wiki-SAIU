// src/data/teams/gardening-club.mjs
//
// Current Sustainability Club (formerly Gardening Club) board. Snapshotted into docs/archive/gardening-club/ at
// rollover (see scripts/rollover.mjs), then reset to this same placeholder
// shape for the incoming board — see CONTRIBUTING.md's
// "Leadership rollover" section.
//
// name + role are mandatory; photo + contact are optional. PLACEHOLDER_*
// values follow the same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these.
// President/VP names are real (2026-09, Sai University's own club-contacts
// data — see changes.md) — names only, deliberately no personal
// email/contact on individual members; the club's own official
// email/Instagram is already on this page via ClubContact/clubContacts.js.

export const CURRENT_TEAM = [
  { name: 'Shruthika Nair P J', role: 'President' },
  { name: 'Rhia Kinger', role: 'Vice President' },
  { name: 'PLACEHOLDER_NAME_3', role: 'PLACEHOLDER_ROLE (e.g. Secretary)' },
];
