const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');

test.describe('/events — real content only', () => {
  test('offers exactly the 28 club/fest/event-type tags, never student-voices', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('events');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[type=checkbox]')).toHaveCount(28);
    await expect(page.getByText('Student Voices', {exact: true})).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('"Clear" unchecks every tag, "Select all tags" rechecks them all', async ({page}) => {
    // Checks the mechanical checkbox state rather than "posts appear",
    // because the archive currently has zero real event-tagged posts —
    // "no posts match" is the correct, expected result of Select All too
    // right now, not a sign either button is broken. See changes.md: every
    // club/event view shows this empty state until the archive is backfilled.
    await page.goto('events');
    const checkboxes = page.locator('input[type=checkbox]');
    const count = await checkboxes.count();

    await page.getByRole('button', {name: 'Clear'}).click();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
    await expect(page.getByText('No posts match the selected tags.')).toBeVisible();

    await page.getByRole('button', {name: 'Select all tags'}).click();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('a post tagged only student-voices never appears here', async ({page}) => {
    await page.goto('events');
    // "stop-asking-ai-for-answers" carries only the student-voices tag —
    // it must not show up on the real-content Events feed.
    await expect(page.getByText('stop asking ai for answers', {exact: false})).toHaveCount(0);
  });

  test('links to /student-voices for individual student writing', async ({page}) => {
    await page.goto('events');
    // Scoped to <main> — "Blog" also appears in the navbar and footer.
    await expect(page.locator('main').getByRole('link', {name: 'Blog'})).toHaveAttribute(
      'href',
      /\/student-voices$/
    );
  });
});

test.describe('/student-voices — the Blog landing page', () => {
  test('renders the LibraryHero and all 29 tags', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('student-voices');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', {name: 'Student Voices', level: 2})).toBeVisible();
    await expect(page.locator('input[type=checkbox]')).toHaveCount(29);

    expect(errors).toEqual([]);
  });

  test('links out to the full tag listing and to Events', async ({page}) => {
    await page.goto('student-voices');
    const main = page.locator('main');
    await expect(main.getByRole('link', {name: 'Read all Student Voices posts →'})).toHaveAttribute(
      'href',
      /\/blog\/tags\/student-voices$/
    );
    // Scoped to <main> — "Events" also appears in the navbar and footer.
    await expect(main.getByRole('link', {name: 'Events', exact: true})).toHaveAttribute('href', /\/events$/);
  });
});
