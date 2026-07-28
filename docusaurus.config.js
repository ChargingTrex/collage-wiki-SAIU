// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import tailwindPlugin from './src/plugins/tailwind-plugin.js';
import clubEventsPlugin from './src/plugins/club-events-plugin.js';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sai University Club & Event Wiki',
  tagline: 'Clubs, events, and archives at Sai University, Chennai',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
    // v4's `fasterByDefault` turns on the Rspack bundler + SWC + Lightning
    // CSS for faster builds. Re-enabled (left at v4's defaults) now that the
    // real Tailwind bug (missing `@tailwind` directive in custom.css) is
    // fixed — confirmed Tailwind utilities still compile correctly under
    // Rspack.
  },

  // Set the production url of your site here
  url: 'https://chargingtrex.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/collage-wiki-SAIU/',

  // GitHub pages deployment config.
  organizationName: 'ChargingTrex', // GitHub org/user name.
  projectName: 'collage-wiki-SAIU', // GitHub repo name.
  deploymentBranch: 'gh-pages',

  plugins: [
    tailwindPlugin,
    clubEventsPlugin,
    // Auto-optimizes markdown images in docs/blog (responsive + lazy-load +
    // blur placeholder) with zero content changes — see
    // feature-images-recent-activity-plan.md.
    '@docusaurus/plugin-ideal-image',
  ],

  scripts: [
    { src: '/collage-wiki-SAIU/js/github-badge.js', async: true },
  ],

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/ChargingTrex/collage-wiki-SAIU/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/ChargingTrex/collage-wiki-SAIU/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Sai University Wiki',
        logo: {
          alt: 'Sai University Wiki Logo',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/explore', label: 'Explore', position: 'left'},
          {to: '/clubs', label: 'Clubs', position: 'left'},
          {to: '/fests', label: 'Fests', position: 'left'},
          {to: '/docs/intro', label: 'Docs', position: 'left'},
          {to: '/docs/category/resources', label: 'Resources', position: 'left'},
          {to: '/docs/resources/archives', label: 'Archive', position: 'left'},
          // "Blog" is distinct from "Events": Events is the full archive
          // (fests, clubs, general posts); Blog is only posts an individual
          // student wrote on their own. Both point at custom pages, not
          // straight at Docusaurus's auto-generated /blog or /blog/tags/*
          // routes — Events is tag-filtered down to real club/fest/event-type
          // content (excludes student-voices-only and leftover tutorial
          // posts); Blog leads with the LibraryHero.
          {to: '/events', label: 'Events', position: 'left'},
          {to: '/student-voices', label: 'Blog', position: 'left'},
          {
            type: 'html',
            position: 'right',
            value: `<a href="https://github.com/ChargingTrex/collage-wiki-SAIU" target="_blank" rel="noopener noreferrer" class="github-badge" aria-label="GitHub repository">
              <svg class="github-badge__icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              <span class="github-badge__repo">collage-wiki-SAIU</span>
              <span class="github-badge__sep"></span>
              <svg class="github-badge__tag-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
              <span class="github-badge__label" id="gh-badge-date"></span>
              <span class="github-badge__sep"></span>
              <svg class="github-badge__stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.782 1.4 8.174L12 19.896l-7.334 3.271 1.4-8.174L.132 9.211l8.2-1.193z"/></svg>
              <span class="github-badge__count" id="gh-badge-stars">—</span>
              <svg class="github-badge__stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/></svg>
              <span class="github-badge__count" id="gh-badge-forks">—</span>
            </a>`,
          },
        ],
      },
      footer: {
        // No `style: 'dark'` — that forces Infima's dark footer variant
        // permanently, regardless of the site's light/dark toggle. Custom
        // properties in custom.css make the footer follow the theme instead.
        links: [
          {
            title: 'Wiki',
            items: [
              {
                label: 'Explore',
                to: '/explore',
              },
              {
                label: 'Clubs',
                to: '/clubs',
              },
              {
                label: 'Fests',
                to: '/fests',
              },
              {
                label: 'Docs',
                to: '/docs/intro',
              },
              {
                label: 'Resources',
                to: '/docs/category/resources',
              },
              {
                label: 'Archive',
                to: '/docs/resources/archives',
              },
              {
                label: 'Events',
                to: '/events',
              },
              {
                label: 'Blog',
                to: '/student-voices',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/ChargingTrex/collage-wiki-SAIU',
              },
              {
                label: 'Open an issue',
                href: 'https://github.com/ChargingTrex/collage-wiki-SAIU/issues',
              },
              // Re-enable once Decap CMS lands at /admin (CP5) — linking to
              // it now breaks the build's broken-link check since the page
              // doesn't exist yet.
              // {
              //   label: 'Decap CMS',
              //   to: '/admin',
              // },
              {
                label: 'Code License (GPL-3.0)',
                href: 'https://github.com/ChargingTrex/collage-wiki-SAIU/blob/main/LICENSE',
              },
              {
                label: 'Commons Clause (commercial use restriction)',
                href: 'https://github.com/ChargingTrex/collage-wiki-SAIU/blob/main/COMMONS-CLAUSE.md',
              },
              {
                label: 'Content License (CC BY-NC-SA 4.0)',
                href: 'https://github.com/ChargingTrex/collage-wiki-SAIU/blob/main/LICENSE-CONTENT.md',
              },
            ],
          },
        ],
        // Compact style borrowed from the sibling FOSS Club wiki
        // (github.com/y-bow/saiufosswiki): "<site name> · Content <license> ·
        // <code license>". Docusaurus renders `copyright` as raw HTML, so
        // each license name links straight to its file — same targets as
        // the "Code License"/"Content License" links above, just surfaced
        // here too where every visitor actually sees it.
        copyright: `Sai University Wiki &middot; Content <a href="https://github.com/ChargingTrex/collage-wiki-SAIU/blob/main/LICENSE-CONTENT.md">CC BY-NC-SA 4.0</a> &middot; Code <a href="https://github.com/ChargingTrex/collage-wiki-SAIU/blob/main/LICENSE">GPL-3.0</a> Licensed`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
