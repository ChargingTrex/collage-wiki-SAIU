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
    // Scoped to <main> — the navbar's own "Archive" item (added later, to
    // /docs/resources/archives, the *event* archive) and the footer's copy
    // of the same navbar both also match "Archive" by exact text now, so an
    // unscoped locator is a strict-mode violation with 3 hits.
    await page.goto('clubs');
    await page.locator('main').getByRole('link', {name: 'Archive', exact: true}).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/docs\/archive$/);
  });
});

test.describe('Leadership archive (docs/archive)', () => {
  // MoSAIc (cultural-fest) is the one real worked example on the live
  // site — its actual 2026 Organising Committee (7 real names, sourced
  // from @mosaic.2026's own "Meet the Core Committee" post, confirmed by
  // the wiki maintainer), not fabricated placeholder data. `docs/archive/`
  // uses Docusaurus's generated-index again (not a hand-authored index
  // page) — safe now that it has at least one permanent child category,
  // which a `generated-index` needs to produce a route at all (confirmed
  // directly: it produced zero routes while the folder was empty).
  test('the Archive index lists MoSAIc', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('docs/archive');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('.theme-doc-card-container').filter({hasText: 'MoSAIc Archive'})
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('the MoSAIc archive category lists its 2026 snapshot', async ({page}) => {
    await page.goto('docs/archive/cultural-fest');
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('.theme-doc-card-container').filter({hasText: '2026 Organisation Committee'})
    ).toBeVisible();
  });

  // Heading query uses `level: 2` — the page's own `<h1>` title ("MoSAIc —
  // 2026 Organisation Committee") contains this text as a substring too.
  test('the 2026 snapshot renders all 7 real committee members', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('docs/archive/cultural-fest/2026-committee');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', {level: 2, name: /2026 Organisation Committee/})
    ).toBeVisible();
    for (const name of ['Arun S', 'Mirudula J', 'Viniya Ravi', 'Joshua John', 'Vishalini Oviya', 'Shishir Silveru', 'Anish P']) {
      await expect(page.getByText(name, {exact: true})).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("cultural-fest's live page shows placeholder data again, not the archived committee", async ({page}) => {
    await page.goto('docs/fests/cultural-fest');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('PLACEHOLDER_NAME_1')).toBeVisible();
    await expect(page.getByText('Arun S', {exact: true})).toHaveCount(0);
  });
});
