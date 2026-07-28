// src/data/teams/cultural-fest.mjs
//
// Current MoSAIc organisation committee. Snapshotted into
// docs/archive/cultural-fest/ at rollover (see scripts/rollover.mjs), then reset to
// this same placeholder shape for the incoming team — see CONTRIBUTING.md's
// "Leadership rollover" section.
//
// name + role are mandatory; photo + contact are optional. PLACEHOLDER_*
// values follow the same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these.

export const CURRENT_TEAM = [
  { name: 'PLACEHOLDER_NAME_1', role: 'PLACEHOLDER_ROLE (e.g. Fest Director)' },
  {
    name: 'PLACEHOLDER_NAME_2',
    role: 'PLACEHOLDER_ROLE (e.g. Operations Lead)',
    // Both optional fields demonstrated once, here, rather than duplicated
    // as fake data across every team file:
    photo: '/img/team/placeholder-avatar.svg',
    contact: { email: 'placeholder@example.com', instagram: null, linkedin: null },
  },
  { name: 'PLACEHOLDER_NAME_3', role: 'PLACEHOLDER_ROLE (e.g. Sponsorship Lead)' },
];
