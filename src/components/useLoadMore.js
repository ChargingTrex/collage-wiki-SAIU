// src/components/useLoadMore.js
//
// Generic client-side pagination for any array — not event-specific, so a
// future Archives page (or anything else with a long list) can reuse it
// as-is instead of re-implementing "load more" state per consumer.

import { useState, useMemo } from 'react';

export function useLoadMore(items, pageSize = 10) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;

  function loadMore() {
    setVisibleCount((count) => count + pageSize);
  }

  return { visibleItems, hasMore, loadMore };
}
