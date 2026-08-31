// src/components/ClubTimeline.jsx
//
// Vertical, academic-year-grouped timeline for a club's or fest's real
// events — the alternate "annual report" view alongside ClubEventsList's
// flat card list (see ClubEventsView, which renders both and toggles
// between them). Same plugin data as ClubEventsList
// (`usePluginData('club-events-plugin')` → `postsByTag[slug]`), so there is
// no separate content source to keep in sync.
//
// Deliberately narrower than ClubEventsList: only posts carrying the
// explicit `events` content-type tag qualify (see blog/tags.yml's
// blog-vs-events split) — a club's "Welcome to X" intro post is real
// content for the flat list, but isn't a dated event, so it would misrepresent
// an annual activity report if counted here.

import React, { useMemo, useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import { motion } from 'framer-motion';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useClubAccent } from './useClubAccent';
import { TimelineEmptyState } from './TimelineEmptyState';
import styles from './ClubTimeline.module.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Academic year runs June -> May, matching how club/committee/fest
// leadership terms are already framed elsewhere on the site (rollover.mjs's
// own "2025-26"-style outgoingYear). A January post belongs to the academic
// year that started the previous June.
function academicYearLabel(iso) {
  const d = new Date(iso);
  const month = d.getMonth(); // 0-indexed; June = 5
  const startYear = month >= 5 ? d.getFullYear() : d.getFullYear() - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return { key: startYear, label: `${startYear}–${endYearShort}` };
}

// Groups events into academic-year buckets, most recent year first;
// chronological (oldest -> newest) within each year, so a single year's
// section reads as a journey through that year rather than a reverse feed.
function groupByAcademicYear(events) {
  const byYear = new Map();
  for (const event of events) {
    const { key, label } = academicYearLabel(event.date);
    if (!byYear.has(key)) byYear.set(key, { key, label, events: [] });
    byYear.get(key).events.push(event);
  }
  const groups = [...byYear.values()].sort((a, b) => b.key - a.key);
  for (const group of groups) {
    group.events.sort((a, b) => (a.date < b.date ? -1 : 1));
  }
  return groups;
}

export function ClubTimeline({ clubSlug }) {
  const { postsByTag } = usePluginData('club-events-plugin');
  const { accentStyle } = useClubAccent(clubSlug);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const events = useMemo(() => {
    const tagged = postsByTag[clubSlug] ?? [];
    return tagged.filter((post) => post.tags.some((t) => t.tag === 'events'));
  }, [postsByTag, clubSlug]);

  const groups = useMemo(() => groupByAcademicYear(events), [events]);
  const mostRecentId = groups[0]?.events[groups[0].events.length - 1]?.id;

  if (events.length === 0) {
    return <TimelineEmptyState clubSlug={clubSlug} />;
  }

  const nodeVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  let runningIndex = -1;

  return (
    <div
      className={styles.timeline}
      style={{ ...accentStyle, '--timeline-accent': 'var(--club-accent)' }}
    >
      {groups.map((group) => (
        <div key={group.key} className={styles.yearGroup}>
          <h3 className={styles.yearHeader}>{group.label}</h3>
          <div className={styles.spine}>
            {group.events.map((event) => {
              runningIndex += 1;
              const side = runningIndex % 2 === 0 ? styles.nodeLeft : styles.nodeRight;
              const isPulsing = event.id === mostRecentId;
              return (
                <motion.div
                  key={event.id}
                  className={`${styles.node} ${side}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={nodeVariants}
                  transition={{
                    duration: reducedMotion ? 0 : 0.5,
                    delay: reducedMotion ? 0 : (runningIndex % 6) * 0.08,
                    ease: 'easeOut',
                  }}
                >
                  <span
                    className={`${styles.nodeDot} ${isPulsing ? styles.nodeDotPulse : ''}`}
                    aria-hidden="true"
                  />
                  <Link to={event.permalink} className={styles.nodeCard}>
                    <div className={styles.nodeDate}>{formatDate(event.date)}</div>
                    <div className={styles.nodeBody}>
                      {event.image && (
                        <Image img={event.image} alt={event.title} className={styles.nodeImage} />
                      )}
                      <div className={styles.nodeText}>
                        <div className={styles.nodeTitle}>{event.title}</div>
                        {event.description && (
                          <div className={styles.nodeDescription}>{event.description}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
