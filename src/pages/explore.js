import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {BookOpen, Archive, CalendarDays} from 'lucide-react';
import {MiniHeroCard} from '@site/src/components/MiniHeroCard';
import {CLUB_DIRECTORY} from '@site/src/data/clubDirectory';
import {TechFestHero} from '@site/src/components/fests/TechFestHero';
import {GeneralFestHero} from '@site/src/components/fests/GeneralFestHero';
import {CulturalFestHero} from '@site/src/components/fests/CulturalFestHero';

export default function Explore() {
  return (
    <Layout
      title="Explore"
      description="Every club and fest hero in one place, plus Events, Blog, and the Event Archives.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center margin-bottom--lg">
            <h1>Explore</h1>
            <p>
              All 18 clubs and all 3 fests in one place — click any of them
              to open the real page. Events, Blog, and Archives are below the
              grid.
            </p>
          </div>
        </div>

        <Heading as="h2" className="margin-bottom--md">
          Clubs
        </Heading>
        <div className="mini-hero-grid margin-bottom--lg">
          {CLUB_DIRECTORY.map(({slug, name, Hero}) => (
            <MiniHeroCard key={slug} to={`/docs/clubs/${slug}`} name={name} Hero={Hero} />
          ))}

          <Link to="/events" className="explore-icon-card" aria-label="Events">
            <CalendarDays size={32} strokeWidth={1.75} />
            <span className="explore-icon-card__label">Events</span>
          </Link>
          <Link to="/student-voices" className="explore-icon-card" aria-label="Blog">
            <BookOpen size={32} strokeWidth={1.75} />
            <span className="explore-icon-card__label">Blog</span>
          </Link>
          <Link to="/docs/resources/archives" className="explore-icon-card" aria-label="Event Archives">
            <Archive size={32} strokeWidth={1.75} />
            <span className="explore-icon-card__label">Archives</span>
          </Link>
        </div>

        <Heading as="h2" className="margin-bottom--md">
          Fests
        </Heading>
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
