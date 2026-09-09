// src/data/clubContacts.js
//
// One entry per club, consumed by <ClubContact /> on each club's doc page.
// `null` fields render nothing (see ClubContact.jsx) rather than a broken
// link.
//
// FOSS Club's entry was already real, sourced from that club's own published
// contact page (github.com/y-bow/saiufosswiki). Most others below are now
// also real, sourced from the university's own club-overview survey +
// contacts sheet (github.com/amarnathreddy07/saiu-club-catalogue/tree/main/data,
// 2026-09) — official club-level email/Instagram/LinkedIn only, never a
// submitter's personal contact info. Clubs the survey had no data for keep
// the PLACEHOLDER convention (href: '#', same as
// src/theme/Footer/index.js's PLACEHOLDER_* constants).

export const CLUB_CONTACTS = {
  'literary-club': {
    email: 'clubofliterature@saiuniversity.edu.in',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'art-club': {
    email: 'theartclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiuartclub/', label: '@saiuartclub' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'dance-club': {
    email: 'danceclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiudanceclub/', label: '@saiudanceclub' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'gardening-club': {
    email: 'gardeningclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/sustainabilityclubsaiu/', label: '@sustainabilityclubsaiu' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'astronomy-club': {
    email: 'astronomyclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/the.accretion/', label: '@the.accretion' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'theatre-club': {
    email: 'theatreclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/thetheatreclub/', label: '@thetheatreclub' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'photography-club': {
    email: 'photographyclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/photographyclub_saiu/', label: '@photographyclub_saiu' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'gaming-club': {
    email: '#',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'oratory-club': {
    email: 'oratoryclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/oratoryclubsaiu/', label: '@oratoryclubsaiu' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'entrepreneurship-club': {
    email: 'entrepreneurclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiu_entrepreneurshipclub/', label: '@saiu_entrepreneurshipclub' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'fashion-club': {
    email: 'fashionclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiufashionclub/', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'science-society': {
    email: 'saiu.sciencesociety@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiusciencesociety/', label: '@saiusciencesociety' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'music-club': {
    email: 'musicclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiumusicclub/', label: '@saiumusicclub' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'film-society': {
    email: 'saiu.filmsociety@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/creators_club_saiuniversity/', label: '@creators_club_saiuniversity' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'turingites-computer-science-society': {
    email: 'turingites@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/turingites/', label: '@turingites' },
    linkedin: { url: 'https://www.linkedin.com/company/turingites/', label: 'Turingites on LinkedIn' },
  },
  'animal-welfare-society': {
    email: 'saiu.animalwelfare@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiuanimalwelfaresociety/', label: '@saiuanimalwelfaresociety' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'martial-arts-club': {
    email: 'martialartsclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiu.martialartsclub/', label: '@saiu.martialartsclub' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'chess-club': {
    email: '#',
    instagram: { url: 'https://www.instagram.com/saiuchessclub/', label: '@saiuchessclub' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'pugwash-society': {
    email: 'pugwash-society@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'sports-society': {
    email: 'sports-society@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },

  'foss-club': {
    email: 'fossclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/foss.saiu', label: '@foss.saiu' },
    linkedin: { url: 'https://www.linkedin.com/company/saiu-foss-club/', label: 'SaiU FOSS Club on LinkedIn' },
  },

  'cultural-committee': {
    email: 'cultural-committee@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'student-government': {
    email: 'student-government@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
};
