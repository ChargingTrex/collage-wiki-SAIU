const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Absolute paths — Rspack's build workers may run with a different cwd
  // than the process that invoked `docusaurus build`, which silently broke
  // relative-glob content detection (0 utility classes were being generated).
  content: [
    path.join(__dirname, 'src/**/*.{js,jsx,ts,tsx}'),
    path.join(__dirname, 'docs/**/*.{md,mdx}'),
    path.join(__dirname, 'blog/**/*.{md,mdx}'),
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: {
    // Infima already provides a global CSS reset; Tailwind's preflight would
    // fight it (resets margins/headings Infima relies on for its typography).
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
