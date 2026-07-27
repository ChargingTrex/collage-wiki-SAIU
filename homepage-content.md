# Homepage content — draft copy

Content-only draft for the wiki's **general** homepage — kept focused on
students, activity, how many clubs exist, recent events, and how to
contribute. Club-by-club directory content and team-roster handling now live
in their own doc: [`club homepage.md`](club%20homepage.md). University
background trimmed to a single line of context. Sourced from
[saiuniversity.edu.in](https://www.saiuniversity.edu.in/) and
[the student life page](https://www.saiuniversity.edu.in/student-life-overview)
for that one line, plus the wiki's own real numbers (18 clubs, 400+ archived
events, GitHub source). Not implemented in code yet — this is copy to
review/edit first.

**LinkedIn/Instagram note:** neither is reflected here — both require login
and render via JavaScript, so they can't be fetched for real content. If
there's a specific caption, mission line, or post you want folded in, paste
the text and I'll add it.

---

## Hero

**Title:** Sai University Wiki

**Subtitle:**
> The record of Sai University's student clubs — every event, project, and
> gathering, kept by the people who ran them.

**Stat row:** 18 clubs · 400+ events archived · Chennai

**Buttons:** Explore Clubs → club directory page (see `club homepage.md`) ·
Browse Events → `/blog`

---

## About (one line, then straight into activity)

> Clubs at Sai University are student-run, start to finish — students pitch
> them, students lead them, students write them down. This is where that
> record lives.

That's the entire university-context footprint on the page. No separate
"About the University" section — a reader who wants that already knows
where the university's own site is.

---

## Recent activity — students/events front and center

Rather than pushing events to a single "Browse Events" button, consider a
homepage section that surfaces the **latest 3–4 blog posts** directly (title,
club tag, date, thumbnail if the post has one) — Docusaurus can pull this
from the blog's own data without hand-maintaining a separate list. This puts
actual student-written content on the homepage itself instead of behind a
click, which is a stronger "the students are the content" statement than a
stat row alone.

---

## Contribute

> Club leads and members write directly into this wiki — event recaps,
> project pages, and club records all come from the people who were there.
> [See the source on GitHub](https://github.com/ChargingTrex/collage-wiki-SAIU)
> to contribute.

(Skips linking `/admin` — Decap CMS isn't live yet per `CLAUDE.md`'s build
order; that link gets added once CP5 lands.)
