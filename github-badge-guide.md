# GitHub repo badge — navbar pill

A rounded, GitHub-styled pill for the navbar showing the repo name, a
month/year label, and live star/fork counts. Sourced from
`y-bow/saiufosswiki` (a sibling Sai University club wiki) — reverse-engineered
from its live site since the visible markup didn't match what was in the
`ChargingTrex/saiufosswiki` fork (that fork was 2 days behind; the badge only
existed in `y-bow`'s copy).

Not yet applied to this repo — this is the reference recipe for when it is.

## What it actually is (and isn't)

- **Not a swizzled React component.** It's a plain `type: 'html'` navbar item
  plus a vanilla-JS file loaded via `docusaurus.config.js`'s `scripts` array.
  No swizzle required.
- **The "tag" isn't a git tag or release.** It's just the current month/year
  at page-load time (`"july-2026"`), formatted and lowercased client-side —
  not fetched from GitHub at all.
- **Star/fork counts are live**, fetched client-side from
  `https://api.github.com/repos/{OWNER}/{REPO}` on load and on every
  Docusaurus SPA route change (polled via `setInterval` watching
  `location.pathname`, since Docusaurus doesn't full-reload between pages).
- **No blue glow border in the real CSS** — the border is plain GitHub gray
  (`#30363d` dark / `#d0d7de` light). The blue ring seen in a screenshot of it
  was almost certainly Chrome DevTools' element-inspector highlight overlay,
  not part of the design.
- Unauthenticated GitHub API calls are capped at 60/hour per IP — the
  `.catch(() => {})` silently leaves the `—` placeholders in place if that's
  ever hit, rather than showing an error state.

## 1. `docusaurus.config.js`

Add to the top-level config:
```js
scripts: [
  { src: '/collage-wiki-SAIU/js/github-badge.js', async: true },
],
```

Add to `themeConfig.navbar.items` (replacing or alongside the existing plain
GitHub link):
```js
{
  type: 'html',
  position: 'right',
  value: `<a href="https://github.com/ChargingTrex/collage-wiki-SAIU" target="_blank" rel="noopener noreferrer" class="github-badge" aria-label="GitHub repository">
    <svg class="github-badge__icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
    <span class="github-badge__repo">collage-wiki-SAIU</span>
    <span class="github-badge__sep"></span>
    <svg class="github-badge__tag-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
    <span class="github-badge__label" id="gh-badge-date"></span>
    <span class="github-badge__sep"></span>
    <svg class="github-badge__stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.782 1.4 8.174L12 19.896l-7.334 3.271 1.4-8.174L.132 9.211l8.2-1.193z"/></svg>
    <span class="github-badge__count" id="gh-badge-stars">—</span>
    <svg class="github-badge__stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/></svg>
    <span class="github-badge__count" id="gh-badge-forks">—</span>
  </a>`,
},
```

## 2. `static/js/github-badge.js` (new file)

```js
(function () {
  var OWNER = 'ChargingTrex';
  var REPO = 'collage-wiki-SAIU';

  function init() {
    var dateEl = document.getElementById('gh-badge-date');
    if (dateEl) {
      var now = new Date();
      dateEl.textContent = now.toLocaleString('en-US', {month: 'long', year: 'numeric'}).toLowerCase().replace(' ', '-');
    }
    fetch('https://api.github.com/repos/' + OWNER + '/' + REPO)
      .then(function (res) { if (!res.ok) throw new Error('API error'); return res.json(); })
      .then(function (data) {
        var starsEl = document.getElementById('gh-badge-stars');
        var forksEl = document.getElementById('gh-badge-forks');
        if (starsEl) starsEl.textContent = data.stargazers_count;
        if (forksEl) forksEl.textContent = data.forks_count;
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Docusaurus is an SPA after first load — route changes don't reload the
  // page, so re-run on path change to catch a fresh mount of the badge DOM.
  var lastPath = location.pathname;
  setInterval(function () {
    if (location.pathname !== lastPath) { lastPath = location.pathname; init(); }
  }, 500);
})();
```

## 3. CSS — add to `src/css/custom.css`

```css
.github-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 9999px;
  padding: 4px 12px 4px 10px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11.5px;
  font-weight: 500;
  color: #8b949e;
  text-decoration: none;
  transition: border-color 0.15s ease;
  white-space: nowrap;
  line-height: 1;
  height: 28px;
  box-sizing: border-box;
}
.github-badge:hover { border-color: #484f58; text-decoration: none; }
.github-badge__icon { flex-shrink: 0; color: #e6edf3; }
.github-badge__repo { color: #e6edf3; font-weight: 600; }
.github-badge__sep { width: 1px; height: 14px; background: #30363d; flex-shrink: 0; }
.github-badge__tag-icon,
.github-badge__label,
.github-badge__stat-icon { color: #8b949e; flex-shrink: 0; }
.github-badge__count { color: #e6edf3; font-weight: 600; }

[data-theme='light'] .github-badge { background: #f6f8fa; border-color: #d0d7de; }
[data-theme='light'] .github-badge:hover { border-color: #afb8c1; }
[data-theme='light'] .github-badge__icon,
[data-theme='light'] .github-badge__repo,
[data-theme='light'] .github-badge__count { color: #1f2328; }
[data-theme='light'] .github-badge__sep { background: #d0d7de; }
[data-theme='light'] .github-badge__tag-icon,
[data-theme='light'] .github-badge__label,
[data-theme='light'] .github-badge__stat-icon { color: #656d76; }
```

## Contrast note

The colors above are GitHub's own UI palette (`#e6edf3`/`#8b949e` on
`#161b22` dark, `#1f2328`/`#656d76` on `#f6f8fa` light) — these are
GitHub's own production values, already WCAG-vetted by GitHub itself, so no
separate contrast audit needed if reused as-is.

## Open question before applying

This uses hardcoded GitHub-brand colors rather than this project's
`--ds-*`/`--club-accent` tokens. Decide whether to keep it visually identical
to the source (a recognizable "GitHub badge" look), or re-skin it onto the
Scholar hybrid palette for consistency with the rest of the site, before
wiring it in.
