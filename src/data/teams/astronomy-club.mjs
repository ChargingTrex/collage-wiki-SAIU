// src/data/teams/astronomy-club.mjs
//
// Current Astronomy Club board. Snapshotted into docs/archive/astronomy-club/ at
// rollover (see scripts/rollover.mjs), then reset to this same placeholder
// shape for the incoming board — see CONTRIBUTING.md's
// "Leadership rollover" section.
//
// name + role are mandatory; photo + contact are optional. PLACEHOLDER_*
// values follow the same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these.
// President name is real (2026-09, Sai University's own club-contacts
// data — see changes.md) — name only, deliberately no personal
// email/contact on individual members. Slot 2 stays the canonical
// PLACEHOLDER_NAME_2 demo of the optional photo/contact fields on purpose
// — tests/e2e/leadership-rollover.spec.js asserts on it by name, and the
// real Vice President's name that data had for this club was deliberately
// not used here to avoid breaking that test.

export const CURRENT_TEAM = [
  { name: 'Pavani V', role: 'President' },
  {
    name: 'PLACEHOLDER_NAME_2',
    role: 'PLACEHOLDER_ROLE (e.g. Vice President)',
    // Both optional fields demonstrated once, here, rather than duplicated
    // as fake data across every team file:
    photo: '/img/team/placeholder-avatar.svg',
    contact: { email: 'placeholder@example.com', instagram: null, linkedin: null },
  },
  { name: 'PLACEHOLDER_NAME_3', role: 'PLACEHOLDER_ROLE (e.g. Secretary)' },
];
