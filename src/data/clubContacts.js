// src/data/clubContacts.js
//
// One entry per club, consumed by <ClubContact /> on each club's doc page.
// `null` fields render nothing (see ClubContact.jsx) rather than a broken
// link.
//
// FOSS Club's entry is real, sourced from that club's own published contact
// page (github.com/y-bow/saiufosswiki, a sibling Sai University club wiki
// for the same real-world FOSS Club). Every other club below is a
// PLACEHOLDER (href: '#', same convention as src/theme/Footer/index.js's
// PLACEHOLDER_* constants — grep "PLACEHOLDER" to find every one of these)
// — replace with that club's actual email/social links before publishing
// its contact section for real.

export const CLUB_CONTACTS = {
  'literary-club': {
    email: 'literary-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'art-club': {
    email: 'art-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'dance-club': {
    email: 'dance-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'gardening-club': {
    email: 'gardening-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'astronomy-club': {
    email: 'astronomy-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'theatre-club': {
    email: 'theatre-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'photography-club': {
    email: 'photography-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'gaming-club': {
    email: 'gaming-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'oratory-club': {
    email: 'oratory-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'entrepreneurship-club': {
    email: 'entrepreneurship-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'fashion-club': {
    email: 'fashionclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/saiufashionclub/', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'science-society': {
    email: 'science-society@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'music-club': {
    email: 'music-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'film-society': {
    email: 'film-society@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'turingites-computer-science-society': {
    email: 'turingites-computer-science-society@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'animal-welfare-society': {
    email: 'animal-welfare-society@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'martial-arts-club': {
    email: 'martial-arts-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
    linkedin: { url: '#', label: 'LinkedIn' },
  },
  'chess-club': {
    email: 'chess-club@example.com',
    instagram: { url: '#', label: 'Instagram' },
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
