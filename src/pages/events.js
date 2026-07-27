import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import {TagFilteredEvents} from '@site/src/components/TagFilteredEvents';

// Real event content only — every club tag, every fest tag, every
// event-type tag. Deliberately excludes `student-voices` (that's the Blog
// page's territory, /student-voices) and anything not defined in
// blog/tags.yml at all (the leftover Docusaurus tutorial posts carry tags
// like `hola`/`hello`/`facebook`/`docusaurus`, none of which are real
// content categories).
function useEventTagIds() {
  const {tagsMeta} = usePluginData('club-events-plugin');
  return Object.keys(tagsMeta).filter((id) => id !== 'student-voices');
}

export default function Events() {
  const eventTagIds = useEventTagIds();

  return (
    <Layout
      title="Events"
      description="Every club and fest event this wiki has recorded — filterable by tag.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center margin-bottom--lg">
            <h1>Events</h1>
            <p>
              The full event archive — every club and fest, in one
              tag-filterable feed. Only posts tagged to an actual club, fest,
              or event type show up here. For individual student writing,
              see <Link to="/student-voices">Blog</Link>.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col col--8 col--offset-2">
            <TagFilteredEvents tagIds={eventTagIds} />
          </div>
        </div>
      </main>
    </Layout>
  );
}
