const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');
const {CLUB_SLUGS, FEST_SLUGS} = require('./fixtures');

test.describe('/clubs directory', () => {
  test('renders all 18 clubs as mini-hero cards, each linking to its doc page', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('clubs');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('.mini-hero-card');
    await expect(cards).toHaveCount(CLUB_SLUGS.length);

    for (const slug of CLUB_SLUGS) {
      await expect(page.locator(`a.mini-hero-card[href$="/docs/clubs/${slug}"]`)).toHaveCount(1);
    }

    expect(errors).toEqual([]);
  });

  test('Archives mention links to the real Archives page', async ({page}) => {
    await page.goto('clubs');
    await expect(page.getByRole('link', {name: 'Archives page'})).toHaveAttribute(
      'href',
      /\/docs\/resources\/archives$/
    );
  });

  test('clicking a mini-hero card navigates to that club’s doc page', async ({page}) => {
    await page.goto('clubs');
    await page.locator(`a.mini-hero-card[href$="/docs/clubs/astronomy-club"]`).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/docs\/clubs\/astronomy-club/);
  });
});

test.describe('/fests directory', () => {
  test('renders all 3 fest heroes with working view-links', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('fests');
    await page.waitForLoadState('networkidle');

    for (const slug of FEST_SLUGS) {
      await expect(page.locator(`a[href$="/docs/fests/${slug}"]`)).toHaveCount(1);
    }

    expect(errors).toEqual([]);
  });

  test('no fest audio autoplays', async ({page}) => {
    await page.goto('fests');
    expect(await page.locator('audio[autoplay]').count()).toBe(0);
  });
});
