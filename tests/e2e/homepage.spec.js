const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');

test('homepage renders hero, stat row, Recent Activity, and Contribute section clean', async ({page}) => {
  const errors = trackConsoleErrors(page);
  await page.goto('');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('h1')).toHaveText('Sai University Wiki');
  await expect(page.getByText(/21 clubs.*400\+ events archived.*Chennai/)).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Recent Activity', level: 2})).toBeVisible();
  await expect(page.getByRole('link', {name: 'See the source on GitHub'})).toHaveAttribute(
    'href',
    'https://github.com/ChargingTrex/collage-wiki-SAIU'
  );

  expect(errors).toEqual([]);
});

test('homepage header buttons go to Clubs and Events', async ({page}) => {
  await page.goto('');
  await expect(page.getByRole('link', {name: 'Explore Clubs'})).toHaveAttribute('href', /\/clubs$/);
  await expect(page.getByRole('link', {name: 'Browse Events'})).toHaveAttribute('href', /\/events$/);
});

test('no audio autoplays anywhere on the homepage', async ({page}) => {
  await page.goto('');
  const autoplayingAudio = await page.locator('audio[autoplay]').count();
  expect(autoplayingAudio).toBe(0);
});
