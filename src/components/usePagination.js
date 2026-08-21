// src/components/usePagination.js
//
// Generic page-number pagination for any array — a companion to
// useLoadMore.js's "load more" pattern, not a replacement for it.
// useLoadMore stays exactly as-is for ClubEventsList (an ever-growing
// appended list fits a single club's own event history fine); this hook is
// for TagFilteredEvents specifically, where the result set can be the
// *entire* event archive and jump-to-page navigation matters more than an
// infinite "load more" button that, in practice, someone stops clicking
// long before reaching an old post.

import { useState, useMemo, useEffect } from 'react';

export function usePagination(items, pageSize = 10, resetKey) {
  const [page, setPage] = useState(1);

  // A new filter selection means a genuinely different result set — always
  // land back on page 1 for it, rather than keeping whatever page number
  // the reader happened to be on for the previous selection.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Defensive clamp for any other case the result set shrinks out from
  // under the current page (not just the resetKey path above).
  const currentPage = Math.min(page, totalPages);

  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return { page: currentPage, setPage, totalPages, visibleItems };
}
