/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx}',
    './blog/**/*.{md,mdx}',
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
