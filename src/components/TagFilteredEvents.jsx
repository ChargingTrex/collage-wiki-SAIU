// src/components/TagFilteredEvents.jsx
//
// Tag picker + recent-posts feed, built on the same club-events-plugin data
// as EventCard/RecentActivity/ClubEventsList (one source of truth, not a
// separate blog-data reader). Starts with every allowed tag selected — so
// it opens already showing the most recent matching posts — and lets the
// reader narrow down from there.
//
// Real page-number pagination (usePagination), not "load more" — this feed
// considers the *entire* matching result set (previously hard-capped at 10
// posts total, which started actively hiding real content once the
// club/committee intro posts landed and pushed the archive past that cap).
// A reader can now actually reach every post via page numbers instead of
// only whatever a "load more" button happened to reveal before they
// stopped clicking it.
//
// `tagIds` bounds which tags this instance considers at all (both which
// checkboxes render and which posts are eligible to match) — e.g. the
// Events page passes only the club/fest/event-type tags so it never shows
// student-voices-only or untagged/tutorial-leftover posts; the Blog page
// (`/student-voices`) omits it to consider every defined tag. Passing a
// narrower `tagIds` is a filter, not just a UI restriction: a post is only
// ever matched against tags inside this set.

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePluginData } from '@docusaurus/useGlobalData';
import { usePagination } from './usePagination';
import { EventCard } from './EventCard';
import { PageCounter } from './PageCounter';

const PAGE_SIZE = 10;

// `date` is stored as an ISO string (club-events-plugin.js), so a plain
// string comparison already sorts chronologically correctly without
// parsing to a Date first — ISO 8601's byte order is its sort order.
const SORTS = {
  newest: {
    label: 'Newest first',
    compare: (a, b) => b.date.localeCompare(a.date),
  },
  oldest: {
    label: 'Oldest first',
    compare: (a, b) => a.date.localeCompare(b.date),
  },
  alphabetical: {
    label: 'Alphabetical (A–Z)',
    compare: (a, b) => a.title.localeCompare(b.title),
  },
};

export function TagFilteredEvents({ tagIds }) {
  const { posts, tagsMeta } = usePluginData('club-events-plugin');
  const allTagIds = useMemo(
    () => tagIds ?? Object.keys(tagsMeta),
    [tagIds, tagsMeta]
  );
  const [selected, setSelected] = useState(() => new Set(allTagIds));
  const [sortKey, setSortKey] = useState('newest');
  // Motion only after the reader has changed something: the first render
  // (and the server render) must ship the list fully visible, never at
  // opacity 0 waiting on hydration.
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const toggleTag = (id) => {
    setHasInteracted(true);
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
    return posts
      .filter((post) => post.tags.some((t) => selected.has(t.tag)))
      .sort(SORTS[sortKey].compare);
  }, [posts, selected, sortKey]);

  // Reset to page 1 whenever the tag selection or sort order changes (a
  // genuinely different page-1-through-N result set either way), not on
  // every re-render — a stable, sorted string key so toggling the same
  // tags back to the same combination doesn't spuriously reset the page.
  const resetKey = useMemo(
    () => `${Array.from(selected).sort().join(',')}|${sortKey}`,
    [selected, sortKey]
  );
  const { page, setPage, totalPages, visibleItems } = usePagination(filtered, PAGE_SIZE, resetKey);

  return (
    <div className="margin-top--lg">
      <div className="margin-bottom--sm flex flex-wrap gap-2">
        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={() => {
            setHasInteracted(true);
            setSelected(new Set(allTagIds));
          }}
        >
          Select all tags
        </button>
        <button
          type="button"
          className="button button--sm button--secondary button--outline"
          onClick={() => {
            setHasInteracted(true);
            setSelected(new Set());
          }}
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

      <div className="flex items-center gap-2 margin-bottom--md">
        <label htmlFor="event-sort" className="text-sm" style={{color: 'var(--ds-text-secondary)'}}>
          Sort by
        </label>
        <select
          id="event-sort"
          value={sortKey}
          onChange={(e) => {
            setHasInteracted(true);
            setSortKey(e.target.value);
          }}
          className="button button--sm button--secondary button--outline"
        >
          {Object.entries(SORTS).map(([key, {label}]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* The status signal a filter change was missing: the count updates
          with every toggle, and is announced politely to screen readers. */}
      <p
        className="text-sm margin-bottom--sm"
        style={{color: 'var(--ds-text-secondary)'}}
        aria-live="polite"
        aria-atomic="true"
      >
        {filtered.length === 1 ? '1 post' : `${filtered.length} posts`}
        {totalPages > 1 && `, page ${page} of ${totalPages}`}
      </p>

      {filtered.length === 0 ? (
        <p style={{color: 'var(--ds-text-secondary)'}}>
          No posts match the selected tags.
        </p>
      ) : (
        <>
          {/* Keyed on the result set + page, so a filter/sort/page change
              re-enters the list with a short settle (150ms, ease-out) that
              reads as "this list was just replaced", not as a page load. */}
          <motion.div
            key={`${resetKey}|${page}`}
            className="flex flex-col gap-3"
            initial={hasInteracted && !reducedMotion ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {visibleItems.map((post) => (
              <EventCard key={post.id} {...post} />
            ))}
          </motion.div>

          <PageCounter
            page={page}
            totalPages={totalPages}
            onChange={(next) => {
              setHasInteracted(true);
              setPage(next);
            }}
          />
        </>
      )}
    </div>
  );
}
