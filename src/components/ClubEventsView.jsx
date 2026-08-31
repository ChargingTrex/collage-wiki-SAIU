// src/components/ClubEventsView.jsx
//
// What every club/committee/fest's events.mdx (or timeline.mdx, for fests)
// actually imports — one clean `<ClubEventsView clubSlug="..." />` that
// encapsulates the List/Timeline toggle and both views. List
// (ClubEventsList) stays the default so the existing experience is
// unchanged for anyone who never touches the toggle; Timeline
// (ClubTimeline) is the discoverable upgrade.
//
// `clubSlug` is tag-agnostic — club-events-plugin.js groups by whatever tag
// a post carries, so this works identically for a club, a committee, or a
// fest without knowing which one it's rendering for.

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClubEventsList } from './ClubEventsList';
import { ClubTimeline } from './ClubTimeline';
import { EventViewToggle } from './EventViewToggle';

const STORAGE_KEY = 'sai-wiki-event-view';

function readStoredView() {
  if (typeof window === 'undefined') return 'list';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'timeline' ? 'timeline' : 'list';
  } catch {
    // Storage can throw in private-mode Safari and some embedded webviews.
    return 'list';
  }
}

export function ClubEventsView({ clubSlug }) {
  // Always start at the default so server and first client render agree —
  // reading storage during render would cause a hydration mismatch, same
  // reasoning as useAccentMode.
  const [view, setView] = useState('list');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setView(readStoredView());
    if (typeof window === 'undefined') return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const handleChange = (next) => {
    setView(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* non-fatal — the preference just won't persist */
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <EventViewToggle view={view} onChange={handleChange} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reducedMotion ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {view === 'timeline' ? (
            <ClubTimeline clubSlug={clubSlug} />
          ) : (
            <ClubEventsList clubSlug={clubSlug} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
