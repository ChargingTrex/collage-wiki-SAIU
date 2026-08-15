import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {RecentActivity} from '@site/src/components/RecentActivity';
import styles from './index.module.css';

const SITE_URL = 'https://chargingtrex.github.io/collage-wiki-SAIU/';

// Tells search engines what this site is and what it's about — a WebSite
// entity (this wiki) whose subject (`about`) is the real-world
// EducationalOrganization (Sai University). Doesn't claim to *be* the
// university's official site, just names the real institution it documents.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Sai University Wiki',
  alternateName: ['Sai University Club Wiki', 'Sai University Clubs', 'Sai University Student Life'],
  url: SITE_URL,
  description:
    'A student-run wiki documenting Sai University’s clubs, events, and student life in Chennai.',
  about: {
    '@type': 'EducationalOrganization',
    name: 'Sai University',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chennai',
      addressCountry: 'IN',
    },
  },
};

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Sai University Wiki
        </Heading>
        <p className="hero__subtitle">
          The Sai University wiki for student clubs, events, and student
          life in Chennai — every gathering kept by the people who ran it.
        </p>
        <p className={styles.statRow}>21 clubs · 400+ events archived · Chennai</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/clubs">
            Explore Clubs
          </Link>
          <Link className="button button--secondary button--outline button--lg" to="/events">
            Browse Events
          </Link>
        </div>
      </div>
    </header>
  );
}

function AboutSection() {
  return (
    <section className="container margin-vert--lg">
      <div className="row">
        <div className="col col--8 col--offset-2 text--center">
          <p className={styles.aboutLine}>
            Sai University clubs are student-run, start to finish — students
            pitch them, students lead them, students write them down. This
            wiki is the record of Sai University student life: clubs,
            events, and activities, all in one place.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContributeSection() {
  return (
    <section className="container margin-vert--xl">
      <div className="row">
        <div className="col col--8 col--offset-2 text--center">
          <p>
            Club leads and members write directly into this wiki — event
            recaps, project pages, and club records all come from the people
            who were there.{' '}
            <Link href="https://github.com/ChargingTrex/collage-wiki-SAIU">
              See the source on GitHub
            </Link>{' '}
            to contribute.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Sai University Wiki"
      description="The Sai University wiki for student clubs, events, and student life in Chennai — every gathering kept by the people who ran it.">
      <Head>
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Head>
      <HomepageHeader />
      <main>
        <AboutSection />
        <RecentActivity />
        <ContributeSection />
      </main>
    </Layout>
  );
}
