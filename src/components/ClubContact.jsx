// src/components/ClubContact.jsx
//
// Reusable "how to reach us" block for a club's doc page. One component +
// one data entry per club (see src/data/clubContacts.js) instead of copying
// a block of hand-written inline-SVG links onto every club page — add a
// contact channel once here and all 18 pages get it.
//
// Icon color rides `var(--club-accent)` (via useClubAccent), so each club's
// contact links pick up its own accent and stay theme-reactive, same as
// every other per-club UI element on the site.
//
// The "open an issue" link lives in the site footer, not here — it's about
// the wiki itself, not any one club, so it doesn't need repeating on all 18
// pages.

import React from 'react';
import { Mail } from 'lucide-react';
import { useClubAccent } from './useClubAccent';
import { ContactLink, InstagramIcon, LinkedinIcon } from './contactIcons';

export function ClubContact({ clubSlug, email, instagram, linkedin }) {
  const { accentStyle } = useClubAccent(clubSlug);

  if (!email && !instagram && !linkedin) {
    return (
      <p className="my-4" style={{ color: 'var(--ds-text-secondary)' }}>
        No contact info published yet for this club — check back soon.
      </p>
    );
  }

  return (
    <div style={accentStyle} className="my-4 flex flex-col gap-4">
      {email && (
        <ContactLink icon={Mail} href={`mailto:${email}`}>
          {email}
        </ContactLink>
      )}
      {instagram && (
        <ContactLink icon={InstagramIcon} href={instagram.url}>
          {instagram.label}
        </ContactLink>
      )}
      {linkedin && (
        <ContactLink icon={LinkedinIcon} href={linkedin.url}>
          {linkedin.label}
        </ContactLink>
      )}
    </div>
  );
}
