import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {CommitteeCard} from '@site/src/components/CommitteeCard';
import {COMMITTEE_DIRECTORY} from '@site/src/data/committeeDirectory';

export default function CommitteesDirectory() {
  return (
    <Layout
      title="Committees"
      description="Sai University's standing student committees — university-wide bodies distinct from the 21 student clubs.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center margin-bottom--lg">
            <h1>Committees</h1>
            <p>
              Standing university-wide bodies, distinct from the 21 clubs —
              they run campus-wide programming and represent students rather
              than organising around one interest.
            </p>
            <p>
              Each committee lists its current members. Past committees are
              kept on a separate <Link to="/docs/archive">Archive</Link> —
              nothing gets overwritten, it just moves there when a new
              committee takes over.
            </p>
          </div>
        </div>

        <div className="committee-grid">
          {COMMITTEE_DIRECTORY.map((committee) => (
            <CommitteeCard key={committee.slug} {...committee} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
