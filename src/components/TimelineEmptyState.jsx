// src/components/TimelineEmptyState.jsx
//
// Shown by ClubTimeline when a club/fest has no posts carrying the
// `events` content-type tag yet. Tailwind + inline accent color rather than
// its own CSS module — small enough not to need one, same convention
// ClubContact.jsx already follows for a component this size.

import React from 'react';
import { CalendarClock } from 'lucide-react';
import { useClubAccent } from './useClubAccent';

export function TimelineEmptyState({ clubSlug }) {
  const { accentStyle } = useClubAccent(clubSlug);

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-lg border border-dashed px-6 py-12 text-center"
      style={{ ...accentStyle, borderColor: 'var(--ds-border)' }}
    >
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
        style={{ color: 'var(--club-accent)', opacity: 0.8 }}
      >
        <line x1="36" y1="6" x2="36" y2="66" stroke="currentColor" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
        <circle cx="36" cy="16" r="5" fill="currentColor" opacity="0.9" />
        <circle cx="36" cy="36" r="5" fill="currentColor" opacity="0.5" />
        <circle cx="36" cy="56" r="5" fill="currentColor" opacity="0.25" />
        <CalendarClock x="46" y="8" width="20" height="20" color="currentColor" />
      </svg>
      <div>
        <p className="font-semibold" style={{ color: 'var(--ds-text)' }}>
          No events on the timeline yet
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          Start documenting your club's journey — tag a post <code>events</code> and it'll
          appear here.
        </p>
      </div>
    </div>
  );
}
