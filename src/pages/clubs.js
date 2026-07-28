import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {MiniHeroCard} from '@site/src/components/MiniHeroCard';
import {CLUB_DIRECTORY} from '@site/src/data/clubDirectory';

export default function ClubsDirectory() {
  return (
    <Layout
      title="Clubs"
      description="All 18 student-led clubs at Sai University — pick one to see what they're actually doing.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center margin-bottom--lg">
            <h1>Clubs</h1>
            <p>
              18 of them, each one student-led. Pick one to see what they're
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

        <div className="mini-hero-grid">
          {CLUB_DIRECTORY.map(({slug, name, Hero}) => (
            <MiniHeroCard key={slug} to={`/docs/clubs/${slug}`} name={name} Hero={Hero} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
