// src/data/teams/fashion-club.mjs
//
// Current Fashion Club board. Snapshotted into docs/archive/fashion-club/ at
// rollover (see scripts/rollover.mjs), then reset to this same placeholder
// shape for the incoming board — see CONTRIBUTING.md's
// "Leadership rollover" section.
//
// name + role are mandatory; photo + contact are optional. PLACEHOLDER_*
// values follow the same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these.

export const CURRENT_TEAM = [
  {
    name: 'ISABEL ALEX',
    role: 'President',
    // Both optional fields demonstrated once, here, rather than duplicated
    // as fake data across every team file:
    photo: '/img/team/placeholder-avatar.svg',
    contact: { email: 'placeholder@example.com', instagram: null, linkedin: null },
  },
  {
    name: 'CHRISLYN VERONICA',
    role: 'Vice President',
    photo: '/img/team/placeholder-avatar.svg',
    contact: { email: 'placeholder@example.com', instagram: null, linkedin: null },
  },
  {
    name: 'ABISHEK RAJ', role: 'Treasurer',
    photo: '/img/team/placeholder-avatar.svg',
  },

  {
    name: 'NAVIN VISHWA ', role: 'Model Head',
    photo: '/img/team/placeholder-avatar.svg',
  },
  {
    name: 'KHUSHI TUDEKAR', role: 'Model Head',
    photo: '/img/team/placeholder-avatar.svg',
  },
  {
    name: 'JISHNU M DHARAM', role: 'Model Head',
    photo: '/img/team/placeholder-avatar.svg',
  },

  {
    name: 'DHIYANESH RAJAPPA  ', role: ' Design Team',
    photo: '/img/team/placeholder-avatar.svg',
  },
  {
    name: ' SADHANA IYER', role: ' Design Team',
    photo: '/img/team/placeholder-avatar.svg',
  },

  {
    name: 'ARMAAN SADAT', role: 'Tech Head',
    photo: '/img/team/placeholder-avatar.svg',
  },

  {
    name: 'RHIA KINGER', role: 'Photography  Head',
    photo: '/img/team/placeholder-avatar.svg',
  },

  {
    name: 'SADHANA SHREE V', role: 'Media Head',
    photo: '/img/team/placeholder-avatar.svg',
  },

  {
    name: 'ISHITHA ILAN', role: 'Make Up Head',
    photo: '/img/team/placeholder-avatar.svg',
  },

];
