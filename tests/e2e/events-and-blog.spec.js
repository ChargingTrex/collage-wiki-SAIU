const {test, expect} = require('./base');
const {trackConsoleErrors} = require('./helpers');

test.describe('/events — real content only', () => {
  test('offers exactly the 34 club/committee/fest/event-type tags, never blog or student-voices', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('events');
    await page.waitForLoadState('networkidle');

    // 21 clubs + 2 committees + 3 fests + 7 event-type + 1 explicit `events`
    // marker = 34. Excludes `blog` and `student-voices` (both are
    // /student-voices' territory) out of the 36 total tags in blog/tags.yml.
    await expect(page.locator('input[type=checkbox]')).toHaveCount(34);
    await expect(page.getByText('Student Voices', {exact: true})).toHaveCount(0);
    // "Blog" (the tag label) never renders as a checkbox — page text alone
    // isn't a safe check since /events' own intro links to "Blog"
    // (/student-voices). The checkbox count above is what proves exclusion.

    expect(errors).toEqual([]);
  });

  test('"Clear" unchecks every tag, "Select all tags" rechecks them all', async ({page}) => {
    // Checks the mechanical checkbox state — "no posts match" after Clear
    // is the correct, expected result regardless of how much real content
    // exists (zero tags selected always matches zero posts).
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
  test('renders the LibraryHero and exactly the blog + student-voices tags', async ({page}) => {
    const errors = trackConsoleErrors(page);
    await page.goto('student-voices');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', {name: 'Student Voices', level: 2})).toBeVisible();
    // Scoped to `blog` + `student-voices` only — club/fest/committee/
    // event-type content lives on /events instead. See NON_EVENT_TAGS in
    // src/pages/events.js for the complementary exclusion.
    await expect(page.locator('input[type=checkbox]')).toHaveCount(2);

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
