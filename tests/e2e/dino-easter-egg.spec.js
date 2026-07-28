// The hidden footer dino easter egg (CP6, saiu-collage-wiki-easter-egg.md).
// Locked decisions: in-flow at the bottom of the page (not a floating
// corner icon), "charging trex..." tooltip, click opens a full-screen
// overlay, click anywhere on the overlay closes it, dino tints green by
// default / the unified site accent when unified accent-mode is on.
const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');

test('the 🦖 trigger sits in-flow at the bottom of the page, not a floating corner icon', async ({page}) => {
  await page.goto('');
  const trigger = page.locator('.footer-dino-trigger__button');
  await expect(trigger).toBeVisible();
  const position = await trigger.evaluate((el) => getComputedStyle(el).position);
  expect(position, 'trigger should be in normal document flow, not fixed/floating').not.toBe('fixed');
});

test('hovering shows the "charging trex..." tooltip without shifting the button', async ({page}) => {
  await page.goto('');
  const trigger = page.locator('.footer-dino-trigger__button');
  // Scroll it into view first — otherwise hover()'s own auto-scroll would
  // shift the "before" measurement, making this look like a false failure.
  await trigger.scrollIntoViewIfNeeded();
  const before = await trigger.boundingBox();

  await trigger.hover();
  await expect(page.locator('.footer-dino-trigger__tooltip')).toHaveText('charging trex...');

  const after = await trigger.boundingBox();
  // Regression test for a real bug: the tooltip used to be a flex sibling
  // of the button, so it appearing nudged the button sideways, which
  // re-triggered mouseenter/mouseleave in a loop and made the button
  // permanently un-clickable (Playwright reported "element is not
  // stable" indefinitely). The tooltip is absolutely positioned now
  // specifically so this can't happen.
  expect(after.x, 'button must not move when the tooltip appears').toBe(before.x);
  expect(after.y).toBe(before.y);
});

test('clicking opens a full-screen overlay with a sized, playable canvas', async ({page}) => {
  const errors = trackConsoleErrors(page);
  await page.goto('');
  await page.locator('.footer-dino-trigger__button').click();

  const overlay = page.locator('.dino-overlay');
  await expect(overlay).toBeVisible();
  await expect(overlay.getByText('click anywhere to close')).toBeVisible();

  const canvas = overlay.locator('canvas');
  const box = await canvas.boundingBox();
  // Regression test for a real bug: the game reads its container's
  // offsetWidth once at mount to size the canvas; without an explicit
  // width on that container (it sits in a flex column with
  // align-items: center, which has nothing to shrink-to-fit yet), that
  // read returned 0 and the canvas was permanently invisible.
  expect(box.width, 'canvas must have a real width, not 0').toBeGreaterThan(100);
  expect(box.height).toBeGreaterThan(50);

  expect(errors).toEqual([]);
});

test('clicking the overlay background closes it; clicking the game itself does not', async ({page}) => {
  await page.goto('');
  await page.locator('.footer-dino-trigger__button').click();
  const overlay = page.locator('.dino-overlay');
  await expect(overlay).toBeVisible();

  // Click inside the game panel — must NOT close (event should stop
  // propagating before it reaches the overlay's own close handler).
  await page.locator('.dino-overlay__game').click();
  await expect(overlay).toBeVisible();

  // Click the background itself — must close.
  await page.mouse.click(20, 20);
  await expect(overlay).toHaveCount(0);
});

test('dino tints green by default, and the site accent color in unified mode', async ({page}) => {
  await page.goto('');
  await page.locator('.footer-dino-trigger__button').click();
  const defaultTint = await page
    .locator('.dino-overlay__tint')
    .evaluate((el) => getComputedStyle(el).backgroundColor);

  await page.mouse.click(20, 20); // close

  await page.evaluate(() => window.localStorage.setItem('sai-wiki-accent-mode', 'unified'));
  await page.reload();
  await page.locator('.footer-dino-trigger__button').click();
  const unifiedTint = await page
    .locator('.dino-overlay__tint')
    .evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(unifiedTint, 'tint color should change between per-club (default) and unified mode').not.toBe(
    defaultTint
  );
});

test('no audio autoplays and no unexpected console errors on open/close', async ({page}) => {
  const errors = trackConsoleErrors(page);
  await page.goto('');
  await page.locator('.footer-dino-trigger__button').click();
  await page.waitForTimeout(300);
  expect(await page.locator('audio[autoplay]').count()).toBe(0);
  await page.mouse.click(20, 20);
  expect(errors).toEqual([]);
});
