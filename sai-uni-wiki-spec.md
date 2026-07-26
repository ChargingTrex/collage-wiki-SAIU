# Master Specification & Setup Guide: Sai University College & Club Wiki

> Style and color palette to be decided later — this file is the project/technical context only.

## 1. Project Executive Summary

- **Institution:** Sai University, Chennai
- **Portal scope:** Centralized, highly customized student wiki and chronological event portal
- **Scale:** 18 active student clubs, 400+ past event archives, adding ~2+ events/month per club

**Selected tech stack:**

| Layer | Choice |
|---|---|
| Core engine | Docusaurus (v3) |
| Styling framework | Tailwind CSS + custom CSS (`custom.css`) |
| UI component library | Shadcn UI (powered by Radix UI primitives) |
| Hosting | GitHub Pages ($0 cost, automated deployments) |
| Content management for students | Decap CMS / GitHub web UI |

**Key architectural rationale:**

- **Dual content engine** — `/docs` handles permanent, structured pages (constitutions, executive boards, rules, directories); `/blog` handles time-sensitive, chronological content (event recaps, photography showcases, announcements).
- **Co-located image pipeline** — images live in the same folder as their Markdown file (`index.md`), enabling automatic Webpack/Rspack image compression, lazy loading, and easy maintenance without breaking site-wide links.
- **Zero UI conflicts** — Shadcn UI via Tailwind CSS avoids style collisions with Docusaurus's native Infima styles, keeping the bundle slim while providing modern components (carousels, tabs, cards).

---

## 2. Directory Structure

```
sai-uni-wiki/
├── docusaurus.config.js       # Main site configuration
├── tailwind.config.js         # Tailwind & Shadcn configuration
├── sidebars.js                # Custom sidebar navigation logic
├── static/                    # Global static assets
│   └── img/
│       ├── sai-uni-logo.png
│       └── favicon.ico
├── src/
│   ├── css/
│   │   └── custom.css         # "Sai Crimson" light/dark theme (TBD)
│   ├── components/            # Custom React / Shadcn UI components
│   │   └── ClubCard.jsx
│   └── pages/
│       └── index.js           # Custom homepage (hero + 18-club directory)
│
├── docs/                      # PERMANENT WIKI SECTION
│   ├── resources/
│   │   ├── student-guidelines.md
│   │   └── campus-map.md
│   └── clubs/                 # 18 club wiki directories
│       ├── animal-welfare-society.md
│       ├── art-club.md
│       ├── astronomy-club.md
│       ├── dance-club.md
│       ├── entrepreneurship-club.md
│       ├── fashion-club.md
│       ├── film-society.md
│       ├── foss-club.md
│       ├── gaming-club.md
│       ├── gardening-club.md
│       ├── literary-club.md
│       ├── martial-arts-club.md
│       ├── music-club.md
│       ├── oratory-club.md
│       ├── photography-club.md
│       ├── science-society.md
│       ├── theatre-club.md
│       └── turingites-computer-science-society.md
│
└── blog/                      # CHRONOLOGICAL EVENTS & POSTS
    ├── authors.yml            # Roster of club leads & editors
    └── 2026-07-25-foss-club-linux-fest/
        ├── index.md           # Event article
        ├── poster.jpg         # Co-located image
        └── group-photo.png    # Co-located image
```

---

## 3. Roster of 18 Official Clubs & Route Slugs

| # | Club / Society Name | Wiki Route Path |
|---|---|---|
| 1 | Literary Club | `/docs/clubs/literary-club` |
| 2 | Art Club | `/docs/clubs/art-club` |
| 3 | Dance Club | `/docs/clubs/dance-club` |
| 4 | Gardening Club | `/docs/clubs/gardening-club` |
| 5 | Astronomy Club | `/docs/clubs/astronomy-club` |
| 6 | Theatre Club | `/docs/clubs/theatre-club` |
| 7 | Photography Club | `/docs/clubs/photography-club` |
| 8 | Gaming Club | `/docs/clubs/gaming-club` |
| 9 | Oratory Club | `/docs/clubs/oratory-club` |
| 10 | Entrepreneurship Club | `/docs/clubs/entrepreneurship-club` |
| 11 | Fashion Club | `/docs/clubs/fashion-club` |
| 12 | Science Society | `/docs/clubs/science-society` |
| 13 | Music Club | `/docs/clubs/music-club` |
| 14 | Film Society | `/docs/clubs/film-society` |
| 15 | Turingites Computer Science Society | `/docs/clubs/turingites-computer-science-society` |
| 16 | Animal Welfare Society | `/docs/clubs/animal-welfare-society` |
| 17 | Martial Arts Club | `/docs/clubs/martial-arts-club` |
| 18 | FOSS Club | `/docs/clubs/foss-club` |

---

## 4. Homepage Code (`src/pages/index.js`)

Renders a hero section for Sai University, Chennai, followed by an interactive grid of all 18 clubs.

```jsx
import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

const ClubList = [
  { title: 'Literary Club', description: 'Celebrating the written and spoken word.' },
  { title: 'Art Club', description: 'Unleashing creativity through visual arts.' },
  { title: 'Dance Club', description: 'Expressing rhythm, grace, and movement.' },
  { title: 'Gardening Club', description: 'Cultivating green spaces across campus.' },
  { title: 'Astronomy Club', description: 'Exploring the cosmos, telescopes, and stargazing.' },
  { title: 'Theatre Club', description: 'Bringing compelling stories to life on stage.' },
  { title: 'Photography Club', description: 'Capturing moments and campus life through the lens.' },
  { title: 'Gaming Club', description: 'Casual, competitive, and esports community.' },
  { title: 'Oratory Club', description: 'Mastering public speaking, debate, and rhetoric.' },
  { title: 'Entrepreneurship Club', description: 'Fostering startup culture and business innovation.' },
  { title: 'Fashion Club', description: 'Setting trends, design, and celebrating individual style.' },
  { title: 'Science Society', description: 'Advancing scientific curiosity, projects, and research.' },
  { title: 'Music Club', description: 'Harmonizing voices, bands, and acoustic instruments.' },
  { title: 'Film Society', description: 'Appreciating, analyzing, and creating cinema.' },
  { title: 'Turingites Computer Science Society', description: 'Coding, algorithms, hackathons, and tech innovation.' },
  { title: 'Animal Welfare Society', description: 'Advocating, feeding, and caring for our campus animals.' },
  { title: 'Martial Arts Club', description: 'Building discipline, physical fitness, and self-defense.' },
  { title: 'FOSS Club', description: 'Promoting Free and Open Source Software and hardware.' },
];

function ClubCard({ title, description }) {
  const slug = title.toLowerCase().replace(/ /g, '-');
  return (
    <div className={clsx('col col--4', 'margin-bottom--lg')}>
      <div className="card shadow--md" style={{ height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="card__header">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
        </div>
        <div className="card__body">
          <p style={{ color: 'var(--ifm-font-color-subtle)', fontSize: '0.95rem' }}>{description}</p>
        </div>
        <div className="card__footer" style={{ paddingTop: '1rem' }}>
          <a
            className="button button--primary button--block"
            style={{ borderRadius: '8px', fontWeight: '600' }}
            href={`/docs/clubs/${slug}`}>
            Explore Wiki
          </a>
        </div>
      </div>
    </div>
  );
}

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} style={{ backgroundColor: 'var(--ifm-color-primary)', color: 'white', padding: '4rem 1rem', textAlignment: 'center' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="hero__title" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
          Sai University Wiki &amp; Event Hub
        </h1>
        <p className="hero__subtitle" style={{ fontSize: '1.25rem', opacity: '0.9', lineHeight: '1.6' }}>
          Located in Chennai, Sai University is an ecosystem of innovators, creators, and future leaders.
          This central repository connects students to club constitutions, executive leadership directories,
          resource libraries, and archives of hundreds of campus events.
        </p>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Official Student Club Wiki and Event Portal for Sai University, Chennai">
      <HomepageHeader />
      <main>
        <section className="padding-vert--xl">
          <div className="container">
            <h2 className="text--center margin-bottom--xl" style={{ fontSize: '2rem', fontWeight: '700' }}>
              Student Clubs &amp; Societies
            </h2>
            <div className="row">
              {ClubList.map((props, idx) => (
                <ClubCard key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
```

> Note: this homepage code uses Docusaurus's native `.card` / `.button` classes and inline
> styles — it does not actually use Shadcn UI components yet, despite Shadcn being in the
> planned stack. Worth reconciling once the styling direction is chosen.

---

## 5. Image Management Strategy for 400+ Photos

Co-location pattern — images live next to the post that uses them, so URLs never break as the archive grows.

```
blog/
└── 2026-08-10-astronomy-stargazing-night/
    ├── index.md             <-- The event post
    ├── galaxy-view.jpg      <-- Event Photo 1
    └── crowd-photo.png      <-- Event Photo 2
```

Usage in `index.md`:

```md
# Annual Stargazing Night 🌌

The Astronomy Club hosted over 150 students at the Sai University sports grounds.

![Galaxy View](./galaxy-view.jpg)

### Highlights
Here is a shot of our telescope setup:

![Crowd Photo](./crowd-photo.png)
```

**Automatic optimization:** during `npm run build`, Docusaurus automatically compresses these images, outputs web-friendly formats, and generates hashed static URLs.

---

## 6. Installing Shadcn UI & Tailwind CSS

**Step 1 — install the Tailwind plugin:**

```bash
npm install -D tailwindcss postcss autoprefixer docusaurus-plugin-tailwindcss
```

**Step 2 — configure `docusaurus.config.js`:**

```js
module.exports = {
  // ... other config settings
  plugins: ['docusaurus-plugin-tailwindcss'],
};
```

**Step 3 — initialize Shadcn UI:**

```bash
npx shadcn@latest init
```

Select standard options: Default style, Slate neutral color, CSS variables = Yes.

---

## 7. Non-Technical Workflow (Decap CMS)

Lets non-technical club leads publish events and upload photos without touching Git.

Create `static/admin/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sai Uni Wiki CMS Admin</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

Club leads navigate to `https://your-wiki-domain.com/admin`. They use a visual form with
Title, Event Date, Club Name, and Photo Upload drag-and-drop. Decap CMS automatically commits
the `.md` file and images to the GitHub repository in the background.

---

## 8. Initializing, Building & Deploying

**Local development:**

```bash
# 1. Initialize project
npx create-docusaurus@latest sai-uni-wiki classic

# 2. Enter directory
cd sai-uni-wiki

# 3. Start local development server
npm run start
```

Open `http://localhost:3000` to preview changes in real time.

**Deployment to GitHub Pages** — add repository details to `docusaurus.config.js`:

```js
module.exports = {
  title: 'Sai University Wiki',
  url: 'https://sai-university.github.io',
  baseUrl: '/',
  organizationName: 'sai-university', // GitHub org/user
  projectName: 'sai-uni-wiki',        // Repository name
  deploymentBranch: 'gh-pages',
  // ...
};
```

Run the deployment command:

```bash
cmd /C "set GIT_USER=YOUR_GITHUB_USERNAME && npm run deploy"
```

Site goes live on GitHub Pages with dark mode, full search, and automated photo optimization.
