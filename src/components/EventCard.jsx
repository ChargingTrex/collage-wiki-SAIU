// src/components/EventCard.jsx
//
// Single-post summary shared by ClubEventsList and RecentActivity (and,
// later, a sitewide Archives page) — one place to change how an event
// summary looks rather than duplicating the markup per consumer.

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// `size="lg"` is used by the homepage's RecentActivity (a handful of cards,
// more room to breathe); ClubEventsList keeps the default compact size since
// a club's Events page can list many more of these at once.
export function EventCard({ title, date, permalink, description, image, size = 'sm' }) {
  const isLarge = size === 'lg';
  return (
    <Link
      to={permalink}
      className={clsx(
        'flex items-start rounded-lg border no-underline hover:no-underline',
        isLarge ? 'gap-6 p-6' : 'gap-4 p-4',
      )}
      style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
    >
      {image && (
        <Image
          img={image}
          alt={title}
          className={clsx(
            'flex-shrink-0 rounded-md object-cover',
            isLarge ? 'h-28 w-28 sm:h-36 sm:w-36' : 'h-20 w-20 sm:h-24 sm:w-24',
          )}
        />
      )}
      <div className="min-w-0 flex-1">
        <div
          className={isLarge ? 'text-base' : 'text-sm'}
          style={{ color: 'var(--ds-text-tertiary)' }}
        >
          {formatDate(date)}
        </div>
        <div className={clsx('mt-1 font-semibold', isLarge && 'text-xl')}>{title}</div>
        {description && (
          <div
            className={clsx('mt-1', isLarge ? 'text-base' : 'text-sm')}
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            {description}
          </div>
        )}
      </div>
    </Link>
  );
}
