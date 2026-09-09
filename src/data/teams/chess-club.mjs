// src/data/teams/chess-club.mjs
//
// Current Chess Club board. Snapshotted into docs/archive/chess-club/ at
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
// Phone numbers in that source were deliberately never used either way.

export const CURRENT_TEAM = [
  { name: 'Kokkula Sai', role: 'President' },
  { name: 'Sai Sadhvik Dasam', role: 'Vice President' },
  { name: 'PLACEHOLDER_NAME_3', role: 'PLACEHOLDER_ROLE (e.g. Secretary)' },
];
