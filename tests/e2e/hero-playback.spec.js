// Tests the useIntroMotion contract end-to-end on Astronomy Club (the
// project's original CP2 smoke-test hero). Deliberately doesn't reach into
// React internals (`isPlaying` state) — instead diffs pixel screenshots of
// the animated SVG, the same way this behavior was manually verified
// throughout the project: if the pixels are changing, something is
// animating; if repeated samples are byte-identical, it's at rest.
const crypto = require('crypto');
const {test, expect} = require('./base');

const HERO_SELECTOR = '[aria-label="An observer at a telescope beneath a constellation"]';

async function hash(locator) {
  const buf = await locator.screenshot();
  return crypto.createHash('md5').update(buf).digest('hex');
}

// A single before/after pair can land on two identical frames by sheer
// timing luck (e.g. both samples catching the same brief hold in the
// keyframe timeline), reporting "no motion" for a hero that is genuinely
// animating. Sampling several times over a spread and requiring only ONE
// differing pair is far less timing-sensitive than requiring one specific
// 300ms gap to land on a visible difference.
async function isAnimating(locator, {samples = 6, intervalMs = 120} = {}) {
  const hashes = [await hash(locator)];
  for (let i = 1; i < samples; i++) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, intervalMs));
    // eslint-disable-next-line no-await-in-loop
    hashes.push(await hash(locator));
  }
  return new Set(hashes).size > 1;
}

test.describe('useIntroMotion contract (Astronomy Club hero)', () => {
  test('plays its intro automatically on arrival', async ({page}) => {
    await page.goto('docs/clubs/astronomy-club');
    const hero = page.locator(HERO_SELECTOR);
    await hero.waitFor();

    expect(
      await isAnimating(hero),
      'hero should visibly change frame-to-frame while its intro plays'
    ).toBe(true);
  });

  test('goes still once the reader scrolls', async ({page}) => {
    await page.goto('docs/clubs/astronomy-club');
    const hero = page.locator(HERO_SELECTOR);
    await hero.waitFor();

    // Let any in-flight intro finish, then scroll — this is the "arrival is
    // over" signal useIntroMotion listens for.
    await page.waitForTimeout(2500);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);

    expect(await isAnimating(hero), 'hero should be static after the reader scrolls').toBe(false);
  });

  test('replays from a click after going still', async ({page}) => {
    await page.goto('docs/clubs/astronomy-club');
    const hero = page.locator(HERO_SELECTOR);
    await hero.waitFor();

    await page.waitForTimeout(2500);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);

    // `force: true`: the SVG itself is `pointer-events-none` (the outer
    // div is the real click target, per useIntroMotion's `hoverProps`) — a
    // real click here passes straight through to the div underneath, but
    // Playwright's actionability check flags that as "intercepted" since
    // the resolved event target differs from the locator element.
    await hero.click({force: true});

    expect(
      await isAnimating(hero),
      'clicking a rested hero should restart its animation'
    ).toBe(true);
  });

  test('respects prefers-reduced-motion, and a click does not override it', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('docs/clubs/astronomy-club');
    const hero = page.locator(HERO_SELECTOR);
    await hero.waitFor();

    expect(
      await isAnimating(hero),
      'reduced-motion visitors should see the rested state immediately, no intro'
    ).toBe(false);

    await hero.click({force: true});

    expect(
      await isAnimating(hero),
      'a click should not override prefers-reduced-motion'
    ).toBe(false);
  });
});
