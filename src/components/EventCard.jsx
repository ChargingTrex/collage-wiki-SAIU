// src/components/EventCard.jsx
//
// Single-post summary shared by ClubEventsList and RecentActivity (and,
// later, a sitewide Archives page) — one place to change how an event
// summary looks rather than duplicating the markup per consumer.

import React from 'react';
import Link from '@docusaurus/Link';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function EventCard({ title, date, permalink, description }) {
  return (
    <Link
      to={permalink}
      className="block rounded-lg border p-4 no-underline hover:no-underline"
      style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
    >
      <div className="text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
        {formatDate(date)}
      </div>
      <div className="font-semibold mt-1">{title}</div>
      {description && (
        <div className="text-sm mt-1" style={{ color: 'var(--ds-text-secondary)' }}>
          {description}
        </div>
      )}
    </Link>
  );
}
