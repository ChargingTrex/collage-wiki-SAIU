// tests/e2e/helpers.js
//
// The one console 404 every page load produces is already documented,
// expected, non-fixable-by-us behavior (github-badge.js hitting
// api.github.com for a private repo — GitHub 404s unauthenticated requests
// to private repos rather than 403ing, to avoid confirming they exist; see
// changes.md's GitHub-badge entry). Filtering it out here means real,
// unexpected console errors still fail a test instead of being buried in
// noise every single page carries.
const KNOWN_NOISE = [/api\.github\.com\/repos\//];

function trackConsoleErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (KNOWN_NOISE.some((re) => re.test(text))) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

module.exports = {trackConsoleErrors};
