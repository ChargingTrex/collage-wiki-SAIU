import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {LibraryHero} from '@site/src/components/LibraryHero';
import {TagFilteredEvents} from '@site/src/components/TagFilteredEvents';

export default function StudentVoices() {
  return (
    <Layout
      title="Student Voices"
      description="Writing, projects, and reflections — published by students, for themselves, not on behalf of any club or fest.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12 margin-bottom--lg">
            <LibraryHero />
          </div>
        </div>

        <div className="row">
          <div className="col col--8 col--offset-2 text--center">
            <p>
              This is where individual students publish on their own — opinion
              pieces, personal projects, reflections — separate from anything
              posted on behalf of a club or fest. For the full event archive,
              see <Link to="/events">Events</Link>.
            </p>
            <p>
              <Link to="/blog/tags/student-voices">Read all Student Voices posts →</Link>
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col col--8 col--offset-2">
            <TagFilteredEvents />
          </div>
        </div>
      </main>
    </Layout>
  );
}
