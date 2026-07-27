import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {RecentActivity} from '@site/src/components/RecentActivity';
import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Sai University Wiki
        </Heading>
        <p className="hero__subtitle">
          The record of Sai University's student clubs — every event,
          project, and gathering, kept by the people who ran them.
        </p>
        <p className={styles.statRow}>18 clubs · 400+ events archived · Chennai</p>
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
            Clubs at Sai University are student-run, start to finish —
            students pitch them, students lead them, students write them
            down. This is where that record lives.
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
      description="The record of Sai University's student clubs — every event, project, and gathering, kept by the people who ran them.">
      <HomepageHeader />
      <main>
        <AboutSection />
        <RecentActivity />
        <ContributeSection />
      </main>
    </Layout>
  );
}
