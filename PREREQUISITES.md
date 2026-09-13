# Prerequisites — Sai University Club & Event Wiki

This is a Node.js/Docusaurus project, not a Python project — there is no
pip/Python component anywhere in the stack. This file is a plain-text
prerequisites list, not an installable manifest of any kind. (It used to be
named `requirements.txt`, which some CI/build platforms — Netlify's build
image among them — auto-detect and try to `pip install`; renamed to avoid
that false positive. See `changes.md`'s 2026-09-13 entry.) Actual JS
dependencies are managed by npm via `package.json`.

## Required

- Node.js >= 18.0 (Docusaurus v3 requirement)
- npm >= 9 (ships with Node 18+)
- git

## Provided by the project once scaffolded (CP1+), not installed manually

- Docusaurus v3 (classic template)
- Tailwind CSS, via docusaurus-plugin-tailwindcss
- framer-motion
- lucide-react
- react-chrome-dino
- Decap CMS (static admin bundle, no separate install)

## Deploy target

- A GitHub account with push access to
  https://github.com/ChargingTrex/collage-wiki-SAIU
- GitHub Pages enabled on that repo (gh-pages branch), configured at CP8
