const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');
const {CLUB_SLUGS, FEST_SLUGS} = require('./fixtures');

test.describe('/clubs directory', () => {
  test('renders all 21 clubs as mini-hero cards, each linking to its doc page', async ({page}) => {
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

  test('Archive mention links to the leadership archive, not the event archive', async ({page}) => {
    await page.goto('clubs');
    await expect(page.getByRole('link', {name: 'Archive', exact: true})).toHaveAttribute(
      'href',
      /\/docs\/archive$/
    );
  });

  test('clicking a mini-hero card navigates to that club’s doc page', async ({page}) => {
    await page.goto('clubs');
    await page.locator(`a.mini-hero-card[href$="/docs/clubs/astronomy-club"]`).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/docs\/clubs\/astronomy-club/);
  });
});

test.describe('Club contact pages', () => {
  test('every club has a working /contact page', async ({page}) => {
    // Default 30s per-test timeout was tight even at 18 clubs and is now
    // exceeded at 21 (sequential goto + networkidle per club) — bump it
    // rather than relaxing what's actually being checked.
    test.setTimeout(60_000);
    const errors = trackConsoleErrors(page);
    for (const slug of CLUB_SLUGS) {
      await page.goto(`docs/clubs/${slug}/contact`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', {name: 'Contact', exact: true})).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("FOSS Club's contact page shows its real email/Instagram/LinkedIn", async ({page}) => {
    await page.goto('docs/clubs/foss-club/contact');
    await expect(page.getByRole('link', {name: 'fossclub@saiuniversity.edu.in'})).toHaveAttribute(
      'href',
      'mailto:fossclub@saiuniversity.edu.in'
    );
    await expect(page.getByRole('link', {name: '@foss.saiu'})).toHaveAttribute(
      'href',
      'https://www.instagram.com/foss.saiu'
    );
  });

  test('a club with placeholder contact info shows all 3 icons (email/Instagram/LinkedIn)', async ({page}) => {
    await page.goto('docs/clubs/astronomy-club/contact');
    await expect(page.locator('article').getByRole('link', {name: 'astronomy-club@example.com'})).toHaveAttribute(
      'href',
      'mailto:astronomy-club@example.com'
    );
    await expect(page.locator('article').getByRole('link', {name: 'Instagram', exact: true})).toBeVisible();
    await expect(page.locator('article').getByRole('link', {name: 'LinkedIn', exact: true})).toBeVisible();
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
