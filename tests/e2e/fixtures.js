// tests/e2e/fixtures.js
//
// Shared, hand-kept-in-sync-with-source lists for parameterized tests.
// Deliberately not `require()`d from the actual `.jsx` source (that would
// need a JSX-aware loader inside a plain Node test run) — kept as flat data
// instead. If a club/fest is added, add it here too.

const CLUB_SLUGS = [
  'literary-club',
  'art-club',
  'dance-club',
  'gardening-club',
  'astronomy-club',
  'theatre-club',
  'photography-club',
  'gaming-club',
  'oratory-club',
  'entrepreneurship-club',
  'fashion-club',
  'science-society',
  'music-club',
  'film-society',
  'turingites-computer-science-society',
  'animal-welfare-society',
  'martial-arts-club',
  'foss-club',
];

const FEST_SLUGS = ['tech-fest', 'general-fest', 'cultural-fest'];

module.exports = {CLUB_SLUGS, FEST_SLUGS};
