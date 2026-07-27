// src/components/ClubEventsList.jsx
//
// Consumed by each club's `docs/clubs/<slug>/events.mdx`. Reads this club's
// tagged posts from the shared club-events-plugin (the same data
// RecentActivity reads from on the homepage), paginates client-side, and
// links out to the full tag-page timeline for the complete history.
//
// Every club shows the empty state until real event posts get tagged with
// its slug — that's expected while the 400+ archive is still being
// backfilled, not a bug.

import React from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useLoadMore } from './useLoadMore';
import { EventCard } from './EventCard';

export function ClubEventsList({ clubSlug, pageSize = 10 }) {
  const { postsByTag } = usePluginData('club-events-plugin');
  const events = postsByTag[clubSlug] ?? [];
  const { visibleItems, hasMore, loadMore } = useLoadMore(events, pageSize);

  // Docusaurus only generates a /blog/tags/<tag> page for tags that have at
  // least one post — with zero events, that page doesn't exist yet, so the
  // link must not render (this site's onBrokenLinks: 'throw' would otherwise
  // hard-fail the build for every club with no events tagged yet).
  if (events.length === 0) {
    return (
      <p style={{ color: 'var(--ds-text-secondary)' }}>
        No events recorded yet for this club — check back soon.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {visibleItems.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          className="button button--secondary button--sm margin-top--md"
        >
          Load more
        </button>
      )}

      <div className="margin-top--md">
        <Link to={`/blog/tags/${clubSlug}`}>View full timeline →</Link>
      </div>
    </div>
  );
}
