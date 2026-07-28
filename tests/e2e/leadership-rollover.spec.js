const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');

test.describe('Current Board / Organisation Committee sections', () => {
  test('a club page renders "Current Board" with placeholder members', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('docs/clubs/astronomy-club');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', {name: 'Current Board'})).toBeVisible();
    await expect(page.getByText('PLACEHOLDER_NAME_1')).toBeVisible();
    await expect(page.getByText('PLACEHOLDER_ROLE (e.g. President)', {exact: true})).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('a member with no photo shows the generic fallback icon, not a broken image', async ({page}) => {
    await page.goto('docs/clubs/astronomy-club');
    // First and third placeholder members have no `photo` field.
    const brokenImages = await page.locator('article img').evaluateAll((imgs) =>
      imgs.filter((img) => img.naturalWidth === 0).map((img) => img.src)
    );
    expect(brokenImages).toEqual([]);
  });

  test('the demo member with a photo + contact renders both', async ({page}) => {
    await page.goto('docs/clubs/astronomy-club');
    await expect(page.getByText('PLACEHOLDER_NAME_2')).toBeVisible();
    await expect(page.locator('article img[alt="PLACEHOLDER_NAME_2"]')).toHaveCount(1);
    await expect(page.locator('article').getByRole('link', {name: 'placeholder@example.com'})).toHaveAttribute(
      'href',
      'mailto:placeholder@example.com'
    );
  });

  test('a fest page renders "Current Organisation Committee"', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('docs/fests/general-fest');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', {name: 'Current Organisation Committee'})).toBeVisible();
    await expect(page.getByText('PLACEHOLDER_NAME_1')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('/clubs "Archive" mention navigates to the leadership archive', async ({page}) => {
    await page.goto('clubs');
    await page.getByRole('link', {name: 'Archive', exact: true}).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/docs\/archive$/);
  });
});

test.describe('Leadership archive (docs/archive)', () => {
  // Scoped to the generated-index cards specifically (`.theme-doc-card-container`)
  // rather than a bare role/name query — the same link also appears in the
  // sidebar menu and the page's "Next" pagination footer, which would
  // otherwise resolve to 3 matching elements (a strict-mode violation).
  test('the top-level Archive index lists at least the rolled-over slugs', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('docs/archive');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('.theme-doc-card-container');
    await expect(cards.filter({hasText: 'Art Club Archive'})).toBeVisible();
    await expect(cards.filter({hasText: 'Innovision Archive'})).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('a per-club archive category lists its year snapshot', async ({page}) => {
    await page.goto('docs/archive/art-club');
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('.theme-doc-card-container').filter({hasText: '2025-26 Board'})
    ).toBeVisible();
  });

  // Heading queries use `level: 2` — the page's own `<h1>` title ("Art Club —
  // 2025-26 Board") contains "2025-26 Board" as a substring too, and would
  // otherwise also match.
  test('an archived year snapshot renders the frozen team, under its own year heading', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('docs/archive/art-club/2025-26-board');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', {level: 2, name: /2025-26 Board/})).toBeVisible();
    await expect(page.getByText('PLACEHOLDER_NAME_1')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('a fest committee snapshot renders under its own year heading', async ({page}) => {
    await page.goto('docs/archive/tech-fest/2025-26-committee');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', {level: 2, name: /2025-26 Organisation Committee/})
    ).toBeVisible();
  });
});
