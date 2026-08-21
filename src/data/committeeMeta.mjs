// src/data/committeeMeta.mjs
//
// Per-committee heading word + role examples — read only by
// scripts/rollover.mjs when rolling over a committee. `label`/`icon` are
// already sourced from each committee's own docs/committees/<slug>/
// _category_.json, same as clubs already do — this file only adds what
// that file doesn't have: the actual on-page heading word (this varies per
// committee — "Current Committee" on the Cultural Committee page, "Current
// Government" on Student Government's — unlike clubs, which are uniformly
// "Board") and example roles for the fresh placeholder team after a
// rollover.

export const COMMITTEE_META = {
  'cultural-committee': {
    heading: 'Committee',
    roleExamples: ['Chairperson', 'Vice Chairperson', 'Secretary'],
  },
  'student-government': {
    heading: 'Government',
    roleExamples: ['President', 'Vice President', 'General Secretary'],
  },
};
