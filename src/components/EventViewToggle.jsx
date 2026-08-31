// src/components/EventViewToggle.jsx
//
// Controlled List/Timeline switch — ClubEventsView owns the actual state
// and localStorage persistence. Deliberately a single button, not a
// two-option radio group: it reads "Timeline" (enter) while on List, and
// "List" (exit) while on Timeline, so only one control is ever on screen —
// simpler, and there's no second/inactive button whose style needs to work
// on every accent color in both themes at once (a two-button version here
// previously used --ds-neutral-0 for the active button's text, which is
// near-white in light mode but redefined near-black in dark mode — fine as
// a background token, unreadable as "always-light text on an accent fill").
// Border + --ds-text-secondary only, both already theme-adaptive.

import React from 'react';
import { List, Milestone } from 'lucide-react';

export function EventViewToggle({ view, onChange }) {
  const isTimeline = view === 'timeline';
  const Icon = isTimeline ? List : Milestone;
  const label = isTimeline ? 'List' : 'Timeline';
  const nextView = isTimeline ? 'list' : 'timeline';

  return (
    <button
      type="button"
      onClick={() => onChange(nextView)}
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
      style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text-secondary)' }}
      aria-label={isTimeline ? 'Exit timeline, switch to list view' : 'Switch to timeline view'}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
