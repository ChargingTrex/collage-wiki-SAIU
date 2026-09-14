const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');
const {CLUB_SLUGS, FEST_SLUGS} = require('./fixtures');

test('/explore renders all 21 club cards, 3 fest heroes, and Events/Blog/Archives icon cards', async ({page}) => {
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

const COMMITTEES = [
  {slug: 'cultural-committee', name: 'Cultural Society'},
  {slug: 'student-government', name: 'Student Government'},
];

test('/explore lists both committees, each linking to its doc page', async ({page}) => {
  await page.goto('explore');
  await page.waitForLoadState('networkidle');

  const cards = page.locator('.committee-card');
  await expect(cards).toHaveCount(COMMITTEES.length);

  for (const {slug, name} of COMMITTEES) {
    const card = page.locator(`a.committee-card[href$="/docs/committees/${slug}"]`);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(name);
    // The seal is the card's identity — a broken one would leave the card
    // looking like a text row, which a count-only assertion wouldn't catch.
    await expect(card.locator('img.committee-card__seal')).toHaveJSProperty(
      'complete',
      true
    );
  }
});

test('/committees renders both committees and reaches a real doc page', async ({page}) => {
  const errors = trackConsoleErrors(page);
  await page.goto('committees');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('h1')).toHaveText('Committees');
  await expect(page.locator('.committee-card')).toHaveCount(COMMITTEES.length);

  await page.locator('a.committee-card[href$="/docs/committees/cultural-committee"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/docs\/committees\/cultural-committee$/);

  expect(errors).toEqual([]);
});
