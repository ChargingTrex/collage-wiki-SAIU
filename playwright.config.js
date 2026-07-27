// playwright.config.js
//
// Runs against the real production build (`docusaurus serve`), not the dev
// server — dev mode serves a near-empty CSR-only shell in its raw HTML
// (confirmed earlier this project: view-source on a dev route shows just a
// `<div id="__docusaurus">` and script tags), so testing the built output is
// closer to what a real visitor/CI actually gets, and it's what
// `onBrokenLinks: 'throw'` already gates on. `npm run test:e2e` runs the
// build first (see package.json's `pretest:e2e`); running `npx playwright
// test` directly requires `build/` to already exist.
//
// Written as plain CommonJS (`require`/`module.exports`), not `import`,
// because this file is executed directly by Node via the Playwright CLI —
// unlike docusaurus.config.js (loaded through Docusaurus's own ESM-tolerant
// config loader), package.json here has no `"type": "module"`, so a bare
// `.js` file is CommonJS by Node's default.

const { defineConfig, devices } = require('@playwright/test');

const PORT = 3100;
// Trailing slash is load-bearing: baseURL has its own path segment
// (Docusaurus's `baseUrl: '/collage-wiki-SAIU/'`), and WHATWG URL
// resolution treats any goto()/request path starting with "/" as absolute
// from the origin — it would silently drop this segment rather than
// extend it. Every test navigates with a path WITHOUT a leading slash
// (e.g. `page.goto('clubs')`, `page.goto('')` for the homepage) so it
// resolves as relative-to-this-directory instead. Without the trailing
// slash here too, even a leading-slash-free `clubs` would resolve against
// the parent directory and drop the last segment of the base itself.
const BASE_URL = `http://localhost:${PORT}/collage-wiki-SAIU/`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', {open: 'never', outputFolder: 'playwright-report'}],
    ['json', {outputFile: 'test-results/results.json'}],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: {
    command: `npx docusaurus serve --port ${PORT} --no-open`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
