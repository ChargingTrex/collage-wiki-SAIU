const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');
const {CLUB_SLUGS} = require('./fixtures');

test('/docs/intro is a real wiki overview, not the stock Docusaurus tutorial', async ({page}) => {
  const errors = trackConsoleErrors(page);
  await page.goto('docs/intro');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('h1')).toHaveText('Sai University Club & Event Wiki');
  await expect(page.getByText('Tutorial Intro')).toHaveCount(0);
  await expect(page.getByText(/creating a new site/i)).toHaveCount(0);

  // Scoped to the doc's own body content — "Clubs"/"Fests"/etc. all also
  // appear in the navbar, sidebar, and footer, so an unscoped getByRole
  // matches 3-4 elements at once (strict-mode violation).
  const article = page.getByRole('article');
  await expect(article.getByRole('link', {name: 'Clubs', exact: true})).toHaveAttribute('href', /\/clubs$/);
  await expect(article.getByRole('link', {name: 'Fests', exact: true})).toHaveAttribute('href', /\/fests$/);
  await expect(article.getByRole('link', {name: 'Explore', exact: true})).toHaveAttribute('href', /\/explore$/);
  await expect(article.getByRole('link', {name: 'Events', exact: true})).toHaveAttribute('href', /\/events$/);
  await expect(article.getByRole('link', {name: 'Blog', exact: true})).toHaveAttribute('href', /\/student-voices$/);

  expect(errors).toEqual([]);
});

test('the leftover tutorial content is not reachable from the sidebar', async ({page}) => {
  await page.goto('docs/intro');
  const sidebarText = await page.locator('.theme-doc-sidebar-container').innerText();
  expect(sidebarText).not.toMatch(/Tutorial/i);
});

test('/docs/resources/archives renders the ArchivesHero', async ({page}) => {
  const errors = trackConsoleErrors(page);
  await page.goto('docs/resources/archives');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('Event Archives').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('every club doc page', () => {
  for (const slug of CLUB_SLUGS) {
    test(`docs/clubs/${slug} renders clean and its events subpage loads`, async ({page}) => {
      const errors = trackConsoleErrors(page);

      const clubResponse = await page.goto(`docs/clubs/${slug}`);
      expect(clubResponse.status()).toBe(200);
      await page.waitForLoadState('networkidle');

      const eventsResponse = await page.goto(`docs/clubs/${slug}/events`);
      expect(eventsResponse.status()).toBe(200);
      await page.waitForLoadState('networkidle');

      expect(errors, `console/page errors for ${slug}`).toEqual([]);
    });
  }
});
