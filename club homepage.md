# Club homepage content — draft copy

The clubs-focused page/section — the directory of all 18 clubs, plus how
current vs. past team rosters are split. Pulled out of the general homepage
draft (`homepage-content.md`) so that page can stay focused on students and
activity overall, with this as the deeper, club-specific landing spot.

---

## Clubs — the actual centerpiece

Section intro line:
> **Clubs** — 18 of them, each one student-led. Pick one to see what they're
> actually doing.

(18 club cards, each linking to `/docs/clubs/<slug>`, colored by the club's
own accent per `clubAccents.js` — so the grid can be scanned by color as well
as by name, same idea as the hero components.)

Consider adding, directly under the grid or as a small caption per card:
- a one-line "what this club actually does" blurb per club (pulled from each
  club's own doc page intro, not invented here) — makes the grid scannable
  without opening every page.
- a small "X events archived" count per club once the blog archive is
  populated, so the grid also signals which clubs have the most recorded
  history.

---

## Team lists — current and past

Each club's own page carries its **current** exec board/team (per
`CLAUDE.md`'s content model — exec boards live in `/docs` alongside
constitutions and directories). **Past** teams — prior years' officers,
outgoing members, club history — belong on the **Archives page**
(`ArchivesHero`/`ArchivesHero.jsx` already exists in the component set)
rather than cluttering the current club page. Worth a short line on this page
pointing the split out explicitly, directly under the Clubs intro:

> Every club page lists its current team. Past members and past teams are
> kept on the [Archives](/docs/archives) page — nothing gets overwritten, it
> just moves there when a new team takes over.

(Link target is a placeholder — point it at wherever `ArchivesHero` actually
gets wired to a doc route.)
