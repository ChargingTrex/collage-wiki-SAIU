import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {ClubPlateCard} from '@site/src/components/ClubPlateCard';
import {CLUB_DIRECTORY} from '@site/src/data/clubDirectory';

// Each card's one-line description is the club's own `_category_.json`
// description, the same text the sidebar's generated index shows, so
// there's no third copy of it to keep in sync.
const categoryFiles = require.context('../../docs/clubs', true, /^\.\/[^/]+\/_category_\.json$/);
const DESCRIPTIONS = Object.fromEntries(
  categoryFiles.keys().map((key) => [key.split('/')[1], categoryFiles(key).description])
);

export default function ClubsDirectory() {
  return (
    <Layout
      title="Clubs"
      description="All 22 student-led clubs at Sai University — pick one to see what they're actually doing.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center margin-bottom--lg">
            <h1>Clubs</h1>
            <p>
              22 of them, each one student-led. Pick one to see what they're
              actually doing.
            </p>
            <p>
              Every club page lists its current team. Past members and past
              teams are kept on a separate <Link to="/docs/archive">Archive</Link> —
              nothing gets overwritten, it just moves there when a new team
              takes over.
            </p>
          </div>
        </div>

        <div className="club-plate-grid">
          {CLUB_DIRECTORY.map(({slug, name, Hero}) => (
            <ClubPlateCard
              key={slug}
              slug={slug}
              to={`/docs/clubs/${slug}`}
              name={name}
              description={DESCRIPTIONS[slug]}
              Hero={Hero}
            />
          ))}
        </div>
      </main>
    </Layout>
  );
}
