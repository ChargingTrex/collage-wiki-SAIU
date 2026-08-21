// src/components/PageCounter.jsx
//
// Page-number navigation for TagFilteredEvents — sits right below the
// article list, at the bottom ("footer") of that list specifically, not
// the site's own <Footer>. Renders nothing for a single-page result set;
// there's nothing to navigate between.
//
// Windowed page-number display (first, last, current, one neighbor each
// side, "…" for the gaps) rather than one button per page — the event
// archive is meant to grow well past what a flat 1..N button row could
// hold without wrapping into an unusable wall of buttons.

import React from 'react';

// Builds the list of page numbers/ellipsis markers to render, e.g. for
// page=7, totalPages=20: [1, '…', 6, 7, 8, '…', 20]. Small page counts
// (<= 7) just show every page, no ellipsis needed.
function buildPageWindow(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const withEllipsis = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      withEllipsis.push('…');
    }
    withEllipsis.push(p);
  });
  return withEllipsis;
}

export function PageCounter({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pageWindow = buildPageWindow(page, totalPages);

  return (
    <nav
      aria-label="Article list pages"
      className="flex items-center justify-center gap-1 margin-top--lg"
    >
      <button
        type="button"
        className="button button--sm button--secondary button--outline"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ‹ Prev
      </button>

      {pageWindow.map((p, i) =>
        p === '…' ? (
          <span
            // Two ellipses can appear (one on each side of the current
            // page window) — index them into the key so both are unique.
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="padding-horizontal--xs"
            style={{color: 'var(--ds-text-tertiary)'}}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`button button--sm ${p === page ? 'button--primary' : 'button--secondary button--outline'}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}${p === page ? ', current page' : ''}`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="button button--sm button--secondary button--outline"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        Next ›
      </button>
    </nav>
  );
}
