// src/components/TeamSection.jsx
//
// Renders a club/fest's current board or organisation committee — one row
// per member (name, role, optional photo, optional contact). Used on both
// live club/fest pages ("Current Board"/"Current Organisation Committee")
// and permanent docs/archive/<slug>/<year>-board|committee.mdx snapshots.
//
// Deliberately renders no heading of its own — same convention ClubContact
// already follows — so the .mdx author writes "## Current Board" or
// "## 2025-26 Organisation Committee" themselves. This is what lets the
// exact wording vary correctly between clubs ("Board") and fests
// ("Organisation Committee") without this component needing to know which
// one it is.

import React from 'react';
import { Mail, UserRound } from 'lucide-react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useClubAccent } from './useClubAccent';
import { ContactLink, InstagramIcon, LinkedinIcon } from './contactIcons';

function MemberPhoto({ photo, name }) {
  // `useBaseUrl` so team-data files can use a normal absolute path
  // (`/img/team/<slug>/x.jpg`) without hardcoding this deployment's
  // `/collage-wiki-SAIU/` prefix — same convention as every other
  // site-root-relative asset path elsewhere in this codebase. Default
  // options (no `forcePrependBaseUrl`) skip re-adding the prefix for any
  // existing data that already has it hardcoded, so nothing double-prefixes.
  const resolvedPhoto = useBaseUrl(photo);

  if (!photo) {
    return (
      <div
        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--club-accent)', opacity: 0.15 }}
      >
        <UserRound
          className="h-8 w-8"
          style={{ color: 'var(--club-accent)' }}
          aria-hidden="true"
        />
      </div>
    );
  }
  return (
    <img
      src={resolvedPhoto}
      alt={name}
      className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
    />
  );
}

function TeamMember({ name, role, photo, contact }) {
  const hasContact = contact && (contact.email || contact.instagram || contact.linkedin);
  return (
    <div className="flex items-start gap-4">
      <MemberPhoto photo={photo} name={name} />
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          {role}
        </div>
        {hasContact && (
          <div className="mt-2 flex flex-col gap-1">
            {contact.email && (
              <ContactLink icon={Mail} href={`mailto:${contact.email}`}>
                {contact.email}
              </ContactLink>
            )}
            {contact.instagram && (
              <ContactLink icon={InstagramIcon} href={contact.instagram.url}>
                {contact.instagram.label}
              </ContactLink>
            )}
            {contact.linkedin && (
              <ContactLink icon={LinkedinIcon} href={contact.linkedin.url}>
                {contact.linkedin.label}
              </ContactLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TeamSection({ clubSlug, members }) {
  const { accentStyle } = useClubAccent(clubSlug);

  if (!members || members.length === 0) return null;

  return (
    <div style={accentStyle} className="my-4 grid gap-6 sm:grid-cols-2">
      {members.map((member) => (
        <TeamMember key={member.name} {...member} />
      ))}
    </div>
  );
}
