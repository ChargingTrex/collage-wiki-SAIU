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

// lucide-react dropped brand/logo icons (no Instagram or LinkedIn export as
// of 1.27.0) — inlined as plain SVGs in the same stroke style so they still
// read as part of the same icon set visually.
function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function ContactLink({ icon: Icon, href, children }) {
  const isMailto = href.startsWith('mailto:');
  return (
    <a
      href={href}
      {...(!isMailto && { target: '_blank', rel: 'noopener noreferrer' })}
      className="flex items-center gap-3 no-underline hover:no-underline"
      style={{ color: 'var(--ds-text)' }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--club-accent)' }} aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
}

export function ClubContact({ clubSlug, email, instagram, linkedin }) {
  const { accentStyle } = useClubAccent(clubSlug);

  if (!email && !instagram && !linkedin) return null;

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
