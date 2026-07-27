const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');
const {CLUB_SLUGS, FEST_SLUGS} = require('./fixtures');

test('/explore renders all 18 club cards, 3 fest heroes, and Events/Blog/Archives icon cards', async ({page}) => {
  const errors = trackConsoleErrors(page);
  await page.goto('explore');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.mini-hero-card')).toHaveCount(CLUB_SLUGS.length);

  const iconCards = page.locator('.explore-icon-card');
  await expect(iconCards).toHaveCount(3);
  await expect(iconCards).toHaveText(['Events', 'Blog', 'Archives']);

  await expect(page.getByRole('link', {name: 'Events'}).first()).toHaveAttribute('href', /\/events$/);
  await expect(page.getByRole('link', {name: 'Blog'}).first()).toHaveAttribute('href', /\/student-voices$/);
  await expect(page.getByRole('link', {name: 'Archives'}).first()).toHaveAttribute(
    'href',
    /\/docs\/resources\/archives$/
  );

  for (const slug of FEST_SLUGS) {
    await expect(page.locator(`a[href$="/docs/fests/${slug}"]`)).toHaveCount(1);
  }

  expect(errors).toEqual([]);
});
