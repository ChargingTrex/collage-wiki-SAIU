// src/components/RecentActivity.jsx
//
// Homepage section replacing the old fest-hero showcase: the 5 most recent
// posts site-wide (any club/fest), reusing the same club-events-plugin data
// and EventCard as the per-club Events pages. Fest pages themselves are
// unaffected — still reachable via /docs/fests/<slug> and the navbar.

import React from 'react';
import Heading from '@theme/Heading';
import { usePluginData } from '@docusaurus/useGlobalData';
import { EventCard } from './EventCard';

const RECENT_COUNT = 5;

export function RecentActivity() {
  const { posts } = usePluginData('club-events-plugin');
  const recent = posts.slice(0, RECENT_COUNT);

  if (recent.length === 0) {
    return null;
  }

  return (
    <section className="container margin-vert--lg">
      <Heading as="h2" className="text--center margin-bottom--md">
        Recent Activity
      </Heading>
      <div className="row">
        <div className="col col--10 col--offset-1 flex flex-col gap-5">
          {recent.map((post) => (
            <EventCard key={post.id} {...post} size="lg" />
          ))}
        </div>
      </div>
    </section>
  );
}
