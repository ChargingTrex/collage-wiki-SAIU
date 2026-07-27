// src/data/clubContacts.js
//
// One entry per club, consumed by <ClubContact /> on each club's doc page.
// `null` fields render nothing (see ClubContact.jsx) rather than a broken
// link — fill each club in as real contact info comes in.
//
// FOSS Club's entry is real, sourced from that club's own published contact
// page (github.com/y-bow/saiufosswiki, a sibling Sai University club wiki
// for the same real-world FOSS Club). Every other club below is a
// placeholder — replace with that club's actual email/social links before
// publishing its contact section.

export const CLUB_CONTACTS = {
  'literary-club': { email: null, instagram: null, linkedin: null },
  'art-club': { email: null, instagram: null, linkedin: null },
  'dance-club': { email: null, instagram: null, linkedin: null },
  'gardening-club': { email: null, instagram: null, linkedin: null },
  'astronomy-club': { email: null, instagram: null, linkedin: null },
  'theatre-club': { email: null, instagram: null, linkedin: null },
  'photography-club': { email: null, instagram: null, linkedin: null },
  'gaming-club': { email: null, instagram: null, linkedin: null },
  'oratory-club': { email: null, instagram: null, linkedin: null },
  'entrepreneurship-club': { email: null, instagram: null, linkedin: null },
  'fashion-club': { email: null, instagram: null, linkedin: null },
  'science-society': { email: null, instagram: null, linkedin: null },
  'music-club': { email: null, instagram: null, linkedin: null },
  'film-society': { email: null, instagram: null, linkedin: null },
  'turingites-computer-science-society': { email: null, instagram: null, linkedin: null },
  'animal-welfare-society': { email: null, instagram: null, linkedin: null },
  'martial-arts-club': { email: null, instagram: null, linkedin: null },

  'foss-club': {
    email: 'fossclub@saiuniversity.edu.in',
    instagram: { url: 'https://www.instagram.com/foss.saiu', label: '@foss.saiu' },
    linkedin: { url: 'https://www.linkedin.com/company/saiu-foss-club/', label: 'SaiU FOSS Club on LinkedIn' },
  },
};
