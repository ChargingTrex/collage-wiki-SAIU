# Upgrading to Traced Handwriting (SVG Path Animation)

The Literary hero currently uses a **font-mask** reveal: real text in `Caveat`,
wiped open left to right. Legible and editable, but the reveal is a wipe — it
doesn't follow the loops and lifts of the letters the way a pen does.

This guide covers upgrading to a **traced path**, where the line is drawn
stroke-by-stroke along the actual letterforms. It's the better effect. It needs
about 20 minutes of one-time work in a vector editor, because tracing legible
handwriting is a drawing task, not something that can be generated as raw path
data.

The same technique applies to `AnimatedSignature` and any other
handwriting animation.

---

## What you're producing

A single SVG `d` attribute — one long string of path commands — where the path
follows the *centerline* of each letter, in writing order, as one continuous
stroke (or a few strokes, one per pen lift).

Critical distinction: you want the path the **pen tip travels**, not the
**outline of the letter shapes**. Converting text to outlines gives you the
silhouette; animating `pathLength` on an outline traces *around* each letter
like a cookie cutter, which looks nothing like writing.

---

## Method A — Figma (free, recommended)

1. **Set the text.** Type your line, set it in `Caveat` (or any handwriting
   face) at a large size — 200px or so. Big is easier to trace accurately.

2. **Lock it as a reference.** Select the text layer, set opacity to ~30%,
   and lock it (right-click → Lock). It's a tracing guide now, not content.

3. **Trace with the pen tool.** Press `P`. Click along the centerline of the
   first letter, following the direction you'd actually write it. Click for
   corners, click-and-drag for curves. Keep going through connected letters
   without ending the path — cursive is meant to be continuous.

4. **Lift the pen where a writer would.** Press `Esc` to end a stroke at a
   natural pen lift (between unconnected words, crossing a `t`, dotting an
   `i`). Start a new path for each. Multiple paths are fine and are more
   authentic than one impossible unbroken line.

5. **Delete the reference text.** Keep only your traced paths.

6. **Export.** Select all paths → right-click → Copy as → Copy as SVG. Paste
   into a text editor. You'll see one or more `<path d="...">` elements.

7. **Combine.** If you have multiple paths, concatenate their `d` values into
   one string separated by spaces. Each will start with `M` (moveto), which
   creates the pen lift automatically:

   ```
   d="M 10,40 C ... M 88,36 C ... M 140,44 C ..."
   ```

---

## Method B — Illustrator

Same principle. Type the text, `Object → Lock → Selection`, trace with the Pen
tool (`P`) along centerlines, then `File → Export → Export As → SVG` and pull
the `d` attributes out of the result.

Do **not** use `Type → Create Outlines` or Image Trace — both give you letter
silhouettes, which is the wrong thing (see above).

---

## Method C — Write it by hand and trace a photo

Most authentic result if you want a specific person's handwriting — a club
president's signature, for instance.

1. Write the line on unlined white paper with a dark pen.
2. Photograph or scan it, straight on, good light.
3. Drop the image into Figma, lock it, trace with the pen tool as in Method A.

---

## Dropping it into the component

Once you have the `d` string, swap the font-mask implementation for the traced
one:

```jsx
const POETRY_PATH = 'M 14,52 c 6,-14 ...';  // your traced path

<motion.path
  d={POETRY_PATH}
  stroke="var(--club-accent)"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  fill="none"
  style={{ pathLength: progress }}   // progress is the same 0→1 value
/>
```

Everything else — the quill riding `progress`, the hover replay, the
scroll-to-still behavior — stays exactly as it is. The quill's
`useTransform` ranges may need adjusting so the nib lands on the wet end of
your specific path.

---

## Gotchas

- **`fill="none"` is mandatory.** Without it the browser closes the path and
  floods it with color.
- **Match the viewBox.** If you traced at 200px tall, either trace inside a
  frame matching your component's `viewBox`, or scale the group with a
  `transform` afterward. Mismatched coordinate spaces are the most common
  reason a pasted path renders as a tiny dot or vanishes entirely.
- **Keep the node count reasonable.** A few hundred points is fine; a few
  thousand (typical of auto-trace output) will make the animation stutter on
  phones.
- **`pathLength` normalizes automatically.** Framer Motion maps the path to
  0→1 regardless of its real length, so you don't need to measure anything.
- **Test at the real size.** Handwriting that reads beautifully at 200px can
  turn to noise at 60px. Check before committing to the trace.

---

## Is it worth it?

For the Literary hero, on the homepage or a club landing page: yes. It's the
difference between an animation *about* writing and an animation that *is*
writing.

For 18 club heroes: no. Trace the one or two places it carries real weight.
The font-mask is a perfectly good default everywhere else.
