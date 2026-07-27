import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {TechFestHero} from '@site/src/components/fests/TechFestHero';
import {GeneralFestHero} from '@site/src/components/fests/GeneralFestHero';
import {CulturalFestHero} from '@site/src/components/fests/CulturalFestHero';

export default function FestsDirectory() {
  return (
    <Layout
      title="Fests"
      description="Sai University's three annual, university-wide fests.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center margin-bottom--lg">
            <h1>Fests</h1>
            <p>
              Three annual, university-wide fests — every club pitches in,
              every student shows up.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col col--12 margin-bottom--sm">
            <TechFestHero audioSrc="/collage-wiki-SAIU/audio/innovision-theme.mp3" />
            <div className="text--right">
              <Link to="/docs/fests/tech-fest">View Innovision →</Link>
            </div>
          </div>
          <div className="col col--12 margin-top--md margin-bottom--sm">
            <GeneralFestHero audioSrc="/collage-wiki-SAIU/audio/fest-fanfare.mp3" />
            <div className="text--right">
              <Link to="/docs/fests/general-fest">View the Annual College Fest →</Link>
            </div>
          </div>
          <div className="col col--12 margin-top--md">
            <CulturalFestHero audioSrc="/collage-wiki-SAIU/audio/vibrance-anthem.mp3" />
            <div className="text--right">
              <Link to="/docs/fests/cultural-fest">View MoSAIc →</Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
