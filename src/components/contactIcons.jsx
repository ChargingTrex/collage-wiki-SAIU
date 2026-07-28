// src/components/contactIcons.jsx
//
// Shared contact-row primitives, extracted out of ClubContact.jsx so
// TeamSection.jsx can reuse the identical icons/link styling for each
// member's optional contact row instead of duplicating them.
//
// lucide-react dropped brand/logo icons (no Instagram or LinkedIn export as
// of 1.27.0) — inlined as plain SVGs in the same stroke style so they still
// read as part of the same icon set visually.

import React from 'react';

export function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function ContactLink({ icon: Icon, href, children }) {
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
