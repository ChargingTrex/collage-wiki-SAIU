// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import tailwindPlugin from './src/plugins/tailwind-plugin.js';

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

  plugins: [tailwindPlugin],

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
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Clubs',
          },
          {to: '/blog', label: 'Events', position: 'left'},
          {
            href: 'https://github.com/ChargingTrex/collage-wiki-SAIU',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Wiki',
            items: [
              {
                label: 'Clubs',
                to: '/docs/intro',
              },
              {
                label: 'Events',
                to: '/blog',
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
              // Re-enable once Decap CMS lands at /admin (CP5) — linking to
              // it now breaks the build's broken-link check since the page
              // doesn't exist yet.
              // {
              //   label: 'Decap CMS',
              //   to: '/admin',
              // },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sai University Club & Event Wiki. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
