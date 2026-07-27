const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');

const NAVBAR_LINKS = [
  {label: 'Explore', path: '/explore'},
  {label: 'Clubs', path: '/clubs'},
  {label: 'Fests', path: '/fests'},
  {label: 'Docs', path: '/docs/intro'},
  {label: 'Events', path: '/events'},
  {label: 'Blog', path: '/student-voices'},
];

const FOOTER_WIKI_LINKS = [
  {label: 'Explore', path: '/explore'},
  {label: 'Clubs', path: '/clubs'},
  {label: 'Fests', path: '/fests'},
  {label: 'Docs', path: '/docs/intro'},
  {label: 'Events', path: '/events'},
  {label: 'Blog', path: '/student-voices'},
];

test.describe('navbar', () => {
  test('shows all six items in order', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('');
    const items = (await page.locator('.navbar__item.navbar__link').allTextContents())
      .map((s) => s.trim())
      .filter(Boolean);
    expect(items).toEqual(NAVBAR_LINKS.map((l) => l.label));
    expect(errors).toEqual([]);
  });

  for (const {label, path} of NAVBAR_LINKS) {
    test(`"${label}" resolves to ${path} and loads clean`, async ({page}) => {
      const errors = trackConsoleErrors(page);
      const response = await page.goto(path.slice(1));
      expect(response.status(), `${path} should respond 200`).toBe(200);
      // Not just a 200 — confirm we actually landed on the right page. A
      // baseURL with its own path segment plus a leading-slash goto() call
      // silently lands on `/` instead (WHATWG URL resolution treats a
      // leading slash as absolute-from-origin, dropping baseURL's own
      // path) — this exact bug slipped through here once already because
      // nothing checked the resulting URL, only the status code.
      await expect(page, `should land on ${path}, not silently fall back elsewhere`).toHaveURL(
        new RegExp(`${path.replace(/\//g, '\\/')}$`)
      );
      await page.waitForLoadState('networkidle');
      expect(errors, `console/page errors on ${path}`).toEqual([]);
    });
  }
});

test.describe('footer', () => {
  test('Wiki column links match the navbar targets', async ({page}) => {
    await page.goto('');
    const footer = page.locator('footer');
    for (const {label, path} of FOOTER_WIKI_LINKS) {
      const link = footer.getByRole('link', {name: label, exact: true});
      await expect(link, `footer "${label}" link should exist`).toHaveAttribute(
        'href',
        new RegExp(`${path.replace(/\//g, '\\/')}$`)
      );
    }
  });

  test('GitHub and issue links point at the real repo', async ({page}) => {
    await page.goto('');
    const footer = page.locator('footer');
    // Not `exact: true` — the accessible name folds in the trailing
    // "(opens in new tab)" external-link icon's alt text, so the full
    // computed name is "GitHub (opens in new tab)", not just "GitHub".
    await expect(footer.getByRole('link', {name: /^GitHub/})).toHaveAttribute(
      'href',
      'https://github.com/ChargingTrex/collage-wiki-SAIU'
    );
    await expect(footer.getByRole('link', {name: 'Open an issue'})).toHaveAttribute(
      'href',
      'https://github.com/ChargingTrex/collage-wiki-SAIU/issues'
    );
  });

  test('no Decap CMS link yet (not scaffolded)', async ({page}) => {
    await page.goto('');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', {name: /decap/i})).toHaveCount(0);
  });
});
