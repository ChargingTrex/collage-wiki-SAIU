import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {LibraryHero} from '@site/src/components/LibraryHero';
import {TagFilteredEvents} from '@site/src/components/TagFilteredEvents';

// Non-event writing only — `blog` (general club-authored posts, not tied to
// a dated event) and `student-voices` (individual student writing). This is
// the counterpart to /events' NON_EVENT_TAGS exclusion: between the two
// pages, every real content-type tag is accounted for exactly once.
const BLOG_TAG_IDS = ['blog', 'student-voices'];

export default function StudentVoices() {
  return (
    <Layout
      title="Blog"
      description="Club updates, announcements, and individual student writing — not tied to a specific dated event.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12 margin-bottom--lg">
            <LibraryHero />
          </div>
        </div>

        <div className="row">
          <div className="col col--8 col--offset-2 text--center">
            <p>
              General club writing and individual student posts — opinion
              pieces, personal projects, reflections, club updates and
              announcements — separate from dated event coverage. For the
              full event archive, see <Link to="/events">Events</Link>.
            </p>
            <p>
              <Link to="/blog/tags/student-voices">Read all Student Voices posts →</Link>
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col col--8 col--offset-2">
            <TagFilteredEvents tagIds={BLOG_TAG_IDS} />
          </div>
        </div>
      </main>
    </Layout>
  );
}
