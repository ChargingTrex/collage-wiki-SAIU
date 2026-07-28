# Running a Leadership Rollover

Maintainer-only doc — not part of the public site. Running the script
requires terminal/repo access, so this deliberately isn't a public
`docs/resources/` page reachable by every visitor. See
`CONTRIBUTING.md`'s "Leadership rollover" section for the condensed
technical version; this is the fuller walkthrough.

A club exec board or fest organisation committee changes every year. The
live club/fest page always shows the *current* team — if someone just
edited it in place for the new year, the outgoing team's record would be
silently lost. A rollover fixes that: it copies the outgoing team into a
permanent archive page (kept forever, never edited again), then clears the
live page for the incoming team.

## Using the script

```bash
npm run rollover -- club art-club 2025-26
npm run rollover -- fest tech-fest 2025-26
```

The first argument is `club` or `fest`, the second is the club/fest's slug
(the same one in its URL, e.g. `art-club`), the third is the outgoing
year-range.

Add `--dry-run` first if you want to see what it *would* do without
changing anything:

```bash
npm run rollover -- club art-club 2025-26 --dry-run
```

**What it creates:**
- A permanent archive page — `docs/archive/<slug>/<year>-board.mdx` (or
  `-committee.mdx` for a fest) — with the outgoing team frozen exactly as
  it was.
- The first time a club/fest is rolled over, an archive category page too,
  so it shows up correctly under the live site's Archive
  (`/docs/archive`).

**What it resets:** the live page's team data
(`src/data/teams/<slug>.mjs`) goes back to placeholder names — you still
need to fill in the incoming team's real names afterward (see below).

**What it refuses to do:** overwrite a snapshot that already exists for
that slug/year. Archive pages are permanent — if you need to fix a mistake
in one, edit that file directly; the script won't touch it again.

## After running it: fill in the incoming team

Open `src/data/teams/<slug>.mjs` and replace the placeholder names/roles
with the real incoming team:

```js
export const CURRENT_TEAM = [
  { name: 'Real Name', role: 'President' },
  { name: 'Real Name', role: 'Vice President' },
  { name: 'Real Name', role: 'Secretary' },
];
```

`name` and `role` are required for every member. `photo` and `contact` are
optional — add them per member if you have them:

```js
{
  name: 'Real Name',
  role: 'President',
  photo: '/img/team/art-club/president.jpg',
  contact: { email: 'art-club@example.com', instagram: null, linkedin: null },
}
```

Then `npm run build` to confirm everything still resolves. For a full,
plain-language walkthrough of adding a member's photo specifically
(uploading the file, replacing the placeholder, removing one) see the live
[Adding a Team Member's Photo](/docs/resources/team-photos) guide — that
page is public, only this rollover how-to isn't.

## If the script isn't available

See "Leadership rollover" in `CONTRIBUTING.md` for the exact manual steps
— the same result, done by hand.

## Browsing past teams

Every past board/committee lives under the live site's Archive
(`/docs/archive`), one permanent page per club/fest per year — that page
*is* public, only this maintainer how-to isn't.
