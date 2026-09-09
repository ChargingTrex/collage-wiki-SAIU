// src/data/teams/entrepreneurship-club.mjs
//
// Current Entrepreneurship Club board. Snapshotted into docs/archive/entrepreneurship-club/ at
// rollover (see scripts/rollover.mjs), then reset to this same placeholder
// shape for the incoming board — see CONTRIBUTING.md's
// "Leadership rollover" section.
//
// name + role are mandatory; photo + contact are optional. PLACEHOLDER_*
// values follow the same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these.
// President/VP names are real (2026-09, Sai University's own club-contacts
// data — see changes.md); neither had a confident email match in that
// source (the one submitted response for this club was from a third
// person, neither the President nor Vice President named there), so both
// emails are left blank rather than guessed. Phone numbers there were
// deliberately never used.

export const CURRENT_TEAM = [
  { name: 'Ravipati Sai', role: 'President' },
  { name: 'Tarun M R', role: 'Vice President' },
  { name: 'PLACEHOLDER_NAME_3', role: 'PLACEHOLDER_ROLE (e.g. Secretary)' },
];
