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
    // Scoped to <main> — the navbar's own "Archive" item (added later, to
    // /docs/resources/archives, the *event* archive) and the footer's copy
    // of the same navbar both also match "Archive" by exact text now, so an
    // unscoped locator is a strict-mode violation with 3 hits.
    await page.goto('clubs');
    await expect(page.locator('main').getByRole('link', {name: 'Archive', exact: true})).toHaveAttribute(
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
    // Default 30s per-test timeout was tight even at 18 clubs, then 60s
    // still wasn't enough at 21 (sequential goto + networkidle per club, and
    // the archive is heavier now with 23 real posts to load plugin data
    // for on every page) — bumped again rather than relaxing what's
    // actually being checked. If this keeps growing, worth switching to
    // `test.step`-per-slug or checking a sample instead of all 21
    // sequentially.
    test.setTimeout(120_000);
    const errors = trackConsoleErrors(page);
    for (const slug of CLUB_SLUGS) {
      await page.goto(`docs/clubs/${slug}/contact`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', {name: 'Contact', exact: true})).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("FOSS Club's contact page shows its real email/Instagram/LinkedIn", async ({page}) => {
    // Scoped to <article> — the site footer also credits FOSS Club (its
    // Instagram is the one real, verified contact on file, reused there) on
    // every page including this one, so an unscoped "@foss.saiu" link
    // locator is a strict-mode violation with 2 hits.
    await page.goto('docs/clubs/foss-club/contact');
    const article = page.locator('article');
    await expect(article.getByRole('link', {name: 'fossclub@saiuniversity.edu.in'})).toHaveAttribute(
      'href',
      'mailto:fossclub@saiuniversity.edu.in'
    );
    await expect(article.getByRole('link', {name: '@foss.saiu'})).toHaveAttribute(
      'href',
      'https://www.instagram.com/foss.saiu'
    );
  });

  test('a club with placeholder contact info shows all 3 icons (email/Instagram/LinkedIn)', async ({page}) => {
    // pugwash-society, not astronomy-club — the 2026-09 real-data pass
    // (see changes.md) gave astronomy-club a real email/Instagram from
    // Sai University's own club-contacts sheet, so it's no longer a valid
    // "still placeholder" example. pugwash-society and sports-society are
    // the clubs that sheet had no data for at all.
    await page.goto('docs/clubs/pugwash-society/contact');
    await expect(page.locator('article').getByRole('link', {name: 'pugwash-society@example.com'})).toHaveAttribute(
      'href',
      'mailto:pugwash-society@example.com'
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

    // 2 links per fest: the hero itself (now wrapped in a Link, see
    // .fest-hero-link in custom.css) and the explicit "View X →" text CTA
    // below it — kept both rather than removing the CTA once the hero
    // became clickable.
    for (const slug of FEST_SLUGS) {
      await expect(page.locator(`a[href$="/docs/fests/${slug}"]`)).toHaveCount(2);
    }

    expect(errors).toEqual([]);
  });

  test('clicking a fest hero navigates to that fest\'s page', async ({page}) => {
    await page.goto('fests');
    await page.waitForLoadState('networkidle');
    // Click near the top-left of the hero (title/background, not the
    // audio button, which intentionally stops propagation instead of
    // navigating — see FestSound.jsx).
    await page.locator('a.fest-hero-link').first().click({position: {x: 20, y: 20}});
    await expect(page).toHaveURL(/\/docs\/fests\/tech-fest$/);
  });

  test('the fest hero audio button does not navigate away when clicked', async ({page}) => {
    // Doesn't assert the button flips to "Stop" — static/audio/ only has a
    // .gitkeep right now (see CLAUDE.md's "Fest audio wiring"), so .play()
    // 404s and the promise rejects in every environment, not just this
    // test. What this guards against is real: FestSound.jsx's toggle
    // handler used to only call stopPropagation(), which stopped it from
    // re-triggering the hero's own replay handler but did nothing about
    // the ancestor <a href> (.fest-hero-link) still performing its native
    // default navigation — confirmed by a real failure here before
    // FestSound.jsx also gained preventDefault().
    await page.goto('fests');
    await page.waitForLoadState('networkidle');
    const playButton = page.locator('a.fest-hero-link').first().getByRole('button', {name: /play theme/i});
    await playButton.click();
    await expect(page).toHaveURL(/\/fests$/);
  });

  test('no fest audio autoplays', async ({page}) => {
    await page.goto('fests');
    expect(await page.locator('audio[autoplay]').count()).toBe(0);
  });
});
