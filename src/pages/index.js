import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {RecentActivity} from '@site/src/components/RecentActivity';
import {HomepageBuilding} from '@site/src/components/HomepageBuilding';
import styles from './index.module.css';

// Tells search engines what this site is and what it's about — a WebSite
// entity (this wiki) whose subject (`about`) is the real-world
// EducationalOrganization (Sai University). Doesn't claim to *be* the
// university's official site, just names the real institution it documents.
// `url` is built from the live `siteConfig` (not hardcoded) so it's
// automatically correct on every host this config already knows how to
// build for (GitHub Pages, a Netlify test deploy, the eventual VPS) instead
// of silently claiming the GitHub Pages URL everywhere else.
function buildStructuredData({url, baseUrl}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sai University Wiki',
    alternateName: ['Sai University Club Wiki', 'Sai University Clubs', 'Sai University Student Life'],
    url: `${url}${baseUrl}`,
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
}

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={clsx('container', styles.heroContent)}>
        <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
          Sai University Wiki
        </Heading>
        {/* The site's existing subtitle, minus its leading descriptor — "the
            Sai University wiki for student clubs, events, and student life in
            Chennai" repeated the h1, the stat row, and both CTAs directly
            underneath it. The clause that carries the actual idea is kept
            verbatim. */}
        <p className={styles.heroSubtitle}>
          Every gathering kept by the people who ran it.
        </p>
        <p className={styles.statRow}>21 clubs · Chennai</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/clubs">
            Explore Clubs
          </Link>
          <Link className="button button--secondary button--outline button--lg" to="/events">
            Browse Events
          </Link>
        </div>
      </div>
      {/* After the content in source order, not before: it's the backdrop the
          content sits on, and the only thing between them is a z-index. */}
      <HomepageBuilding className={styles.building} />
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
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Sai University Wiki"
      description="The Sai University wiki for student clubs, events, and student life in Chennai — every gathering kept by the people who ran it.">
      <Head>
        <script type="application/ld+json">{JSON.stringify(buildStructuredData(siteConfig))}</script>
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
