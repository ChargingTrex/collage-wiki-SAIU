// src/data/committeeDirectory.js
//
// The two standing committees, for the /committees directory and the
// Committees section of /explore. Deliberately separate from
// `clubDirectory.js`: clubs are listed by their hero component, and
// committees have no hero (see CLAUDE.md — `useClubAccent` falls back to the
// unified accent for any slug outside `CLUB_ACCENTS`). What they do have is
// a real institutional seal, so that's what their card leads with.
//
// `name` is the real current name, which for both of these differs from the
// slug: the slug is frozen at whatever it was first published as so no
// links, tags, or archive paths break (same rule as the three renamed
// clubs). `logo` is a site-absolute path resolved through `useBaseUrl` at
// render time, never concatenated by hand.

export const COMMITTEE_DIRECTORY = [
  {
    slug: 'cultural-committee',
    name: 'Cultural Society',
    logo: '/img/cultural-society-logo.jpeg',
    logoAlt:
      'Cultural Society seal — a dancer, film camera, speaker at a podium, chess knight, telescope, musical notes and game controller, ringed by the words “SaiU Cultural Society · Art gives voice to soul”',
    blurb:
      'Runs cultural events and performances across campus, and reviews proposals for new clubs in the Arts, Culture & Performing Arts category.',
  },
  {
    slug: 'student-government',
    name: 'Student Government',
    logo: '/img/student-council-logo.jpeg',
    logoAlt:
      'Student Council seal — a ring of stylised students linking arms around the Sai University mark, captioned “SaiU Student Council · Unity · Strength”',
    blurb:
      'The elected body representing the student community, running university-wide initiatives and events on behalf of students at large.',
  },
];
