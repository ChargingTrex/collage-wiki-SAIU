const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');
const {FEST_SLUGS} = require('./fixtures');

test.describe('fest doc pages', () => {
  for (const slug of FEST_SLUGS) {
    test(`docs/fests/${slug} renders clean`, async ({page}) => {
      const errors = trackConsoleErrors(page);
      const response = await page.goto(`docs/fests/${slug}`);
      expect(response.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
});

test('the raw /blog index still exists (individual posts, RSS, tag pages depend on it)', async ({page}) => {
  const response = await page.goto('blog');
  expect(response.status()).toBe(200);
});

test('MoSAIc is Cultural Fest\'s real name, not the old placeholder', async ({page}) => {
  await page.goto('docs/fests/cultural-fest');
  // "MoSAIc" legitimately appears 4x on this page (heading, breadcrumb, nav
  // link, body text) — the heading alone is enough to confirm the real
  // name rendered.
  await expect(page.getByRole('heading', {name: 'MoSAIc'})).toBeVisible();
  await expect(page.getByText('VIBRANCE 2026')).toHaveCount(0);
});

// The toggle is a 3-way cycle — system → light → dark → system — not a
// simple on/off. Starting from "system" (which resolves to "light" in this
// test environment), the first click just locks in "light" explicitly
// (same visual state, so a single click looked like a no-op); it takes a
// second click to actually reach "dark". Clicking until `data-theme` is
// "dark" (capped at 3 tries) is robust regardless of which state it starts
// from.
async function switchToDarkMode(page) {
  const toggle = page.getByRole('button', {name: /switch between dark and light/i});
  for (let i = 0; i < 3; i++) {
    if ((await page.locator('html').getAttribute('data-theme')) === 'dark') return;
    await toggle.click();
    await page.waitForTimeout(300);
  }
}

test.describe('theme toggle', () => {
  test('switching to dark mode does not break the homepage or introduce console errors', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('');
    await page.waitForLoadState('networkidle');

    await switchToDarkMode(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await expect(page.locator('h1')).toHaveText('Sai University Wiki');
    expect(errors).toEqual([]);
  });

  test('footer follows the theme toggle (not frozen dark)', async ({page}) => {
    await page.goto('');
    const footer = page.locator('footer');

    const lightBg = await footer.evaluate((el) => getComputedStyle(el).backgroundColor);

    await switchToDarkMode(page);

    const darkBg = await footer.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg, 'footer background should change between themes, not stay frozen').not.toBe(lightBg);
  });
});
