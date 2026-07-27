// src/components/TagFilteredEvents.jsx
//
// Tag picker + recent-posts feed, built on the same club-events-plugin data
// as EventCard/RecentActivity/ClubEventsList (one source of truth, not a
// separate blog-data reader). Starts with every allowed tag selected — so
// it opens already showing the most recent matching posts — and lets the
// reader narrow down from there. Capped at 10 results, revealed 5 at a time
// via the shared useLoadMore hook.
//
// `tagIds` bounds which tags this instance considers at all (both which
// checkboxes render and which posts are eligible to match) — e.g. the
// Events page passes only the club/fest/event-type tags so it never shows
// student-voices-only or untagged/tutorial-leftover posts; the Blog page
// (`/student-voices`) omits it to consider every defined tag. Passing a
// narrower `tagIds` is a filter, not just a UI restriction: a post is only
// ever matched against tags inside this set.

import React, { useMemo, useState } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useLoadMore } from './useLoadMore';
import { EventCard } from './EventCard';

const RESULT_CAP = 10;
const PAGE_SIZE = 5;

export function TagFilteredEvents({ tagIds }) {
  const { posts, tagsMeta } = usePluginData('club-events-plugin');
  const allTagIds = useMemo(
    () => tagIds ?? Object.keys(tagsMeta),
    [tagIds, tagsMeta]
  );
  const [selected, setSelected] = useState(() => new Set(allTagIds));

  const toggleTag = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (selected.size === 0) return [];
    return posts.filter((post) => post.tags.some((t) => selected.has(t.tag))).slice(0, RESULT_CAP);
  }, [posts, selected]);

  const { visibleItems, hasMore, loadMore } = useLoadMore(filtered, PAGE_SIZE);

  return (
    <div className="margin-top--lg">
      <div className="margin-bottom--sm flex flex-wrap gap-2">
        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={() => setSelected(new Set(allTagIds))}
        >
          Select all tags
        </button>
        <button
          type="button"
          className="button button--sm button--secondary button--outline"
          onClick={() => setSelected(new Set())}
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-3 margin-bottom--md">
        {allTagIds.map((id) => (
          <label
            key={id}
            className="flex items-center gap-1 text-sm"
            style={{color: 'var(--ds-text-secondary)'}}
          >
            <input type="checkbox" checked={selected.has(id)} onChange={() => toggleTag(id)} />
            {tagsMeta[id].label}
          </label>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{color: 'var(--ds-text-secondary)'}}>
          No posts match the selected tags.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleItems.map((post) => (
            <EventCard key={post.id} {...post} />
          ))}
        </div>
      )}

      {hasMore && (
        <button type="button" onClick={loadMore} className="button button--secondary button--sm margin-top--md">
          Load more
        </button>
      )}
    </div>
  );
}
