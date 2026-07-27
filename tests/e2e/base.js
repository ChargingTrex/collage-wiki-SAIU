// tests/e2e/base.js
//
// Every page load fires a real client-side fetch to api.github.com (the
// navbar badge, static/js/github-badge.js) — fine for a single visitor, but
// running dozens of tests in parallel hammers GitHub's unauthenticated rate
// limit within seconds and starts getting real 403s back, which is a
// self-inflicted testing artifact, not a site bug. Mocking the endpoint
// here (once, for every test that imports `test` from this file instead of
// `@playwright/test` directly) makes the suite deterministic and stops it
// from spamming a real third-party API on every run.
const base = require('@playwright/test');

const test = base.test.extend({
  page: async ({page}, use) => {
    await page.route('https://api.github.com/repos/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({stargazers_count: 0, forks_count: 0}),
      })
    );
    await use(page);
  },
});

module.exports = {test, expect: base.expect};
