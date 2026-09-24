# Agent brief - shared by every fan-out page of learn-rfm-modeling-with-phoebe

Internal build document. Not linked from any audience-facing page.

You are writing ONE static HTML session page. No servers, no npm. Write the file, return its path
and one line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-rfm-modeling-with-phoebe/courses/01-three-numbers-and-a-snapshot.html`
2. The source map, which holds every verified number and its evidence tier. Use ONLY numbers from
   it. Never invent a statistic. If a fact is not in the map, teach the uncertainty instead:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-rfm-modeling-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-rfm-modeling-with-phoebe/assets/style.css`

## Page skeleton (from the template, keep every component)

toolbar (crumb "Session N of 6", #toggle-all, #zoom-toggle) · masthead (eyebrow "Learn RFM Modeling
with Phoebe · Session N of 6", h1 with one `<span class="accent">`, .sub, .chip-row with
`🟡 Core` level chip (session 3 is the bench and is not yours), .agenda a1-a4) · main.wrap ·
section#intro (Part 0: kicker, .lede, .legend pills, .callout.win "★ What you walk out with tonight")
· 3 or 4 Parts, each `section.section#part-N` with section-kicker (klabel "Part N · covers ...", h2,
`.tag.concept "N min live"`), a `.lede`, ONE hand-drawn figure, `details.card` accordions (summary
with `.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example` with
`span.ex-pill` "Real world" somewhere on the page · section#demo-1 Build-along (kicker with
`.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure, `.steps > .step` each with a
`.prompt-box.good` code box carrying a `span.label`) · section#exercise Homework (ol, 4 items) ·
section#quiz (3 x `.quiz-q data-answer="0-based"` with `p.qtext`, FOUR `button.qopt` "A · ...",
`p.qwhy`; one `p.quiz-score` after the last) · section#official Sources covered, h2 EXACTLY
"What this session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ /
light ◐ + name + note), then the `.mono` line EXACTLY: "Every fact on this page, and its
verification tier, is recorded in the course's source map." · section.cheat#cheatsheet (h3
"Session N cheat sheet <span>· pin this</span>", .grid-2 of six .cheat-item) · `.callout.next`
with `.nx-pill` "Next session" · footer.pagefoot (prev/next chain) · `<script src="../assets/app.js?v=1">`.

Head: the social meta block as in the template with this page's own title/description/url,
`<title>Session N · [name] - learn rfm modeling with phoebe</title>`,
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other card is. Sentence case headings.
Warm practitioner voice, concrete, never dry. Escape `&` as `&amp;` and `<` as `&lt;` inside
prompt-boxes. 420 to 650 lines: guidance about depth, never a target to minify toward. Never
collapse whitespace, never dissolve a list into a paragraph, never drop a component to fit.

## HARD RULES (a violation is rework)

- NEVER an em dash or en dash anywhere, in prose, code, aria-labels or comments. Hyphen only.
- No meta or course-instruction text. Never "this course", "in this course", "the course teaches",
  "banned here". State the professional norm directly, as domain knowledge with its reason. The
  two estate-standard phrases above ("What this session teaches..." heading and the `.mono`
  line) are the ONLY allowed self-references. "Session 2", "session 5" cross-references are fine.
- Attribution is "by Phoebe Fu". Never "built with", never a tool name as author.
- Every number on the page comes from the source map or is explicitly labelled constructed.
  Code boxes may print real Olist numbers ONLY where the map states them; for constructed data,
  do not print invented outputs as if run. Say "your numbers will differ" where appropriate.
- Where the evidence is contested or missing, teach the disagreement. Do not resolve what the
  literature has not resolved.
- Colours in figures: ONLY these hexes, nothing else, including no invented greys:
  `#1D4ED8` cobalt · `#1E3A8A` cobalt-deep · `#2F5FD0` cobalt-mid · `#C3D3F5` cobalt-soft ·
  `#EEF3FC` cobalt-50 · `#14213D` ink · `#4F5B7A` muted · `#CBD5EE` faint · `#DCE3F3` hairline ·
  `#B4530A` tangerine · `#8A3E06` tangerine-ink · `#FDEEDF` tangerine-50 · `#FFFFFF` white ·
  `#991B1B` `#FEF2F2` `#FCA5A5` universal reds (only for a wrong-way panel).
- Chinese terms: default to the English word. When the Chinese is genuinely the name (a publisher,
  a platform feature with no settled English), write `中文 (English)` with the translation in
  brackets after it, on EVERY occurrence. Grep `[\u4e00-\u9fff]` before you finish; the gate
  does not check this. Phoebe's rule, 2026-09-24.
- Titles and widget ids must not collide with sibling courses: do not title anything
  "Segment cuts", "Segmentation: who is retained", or use `id="cut-bench"`.

## The hand-drawn figure grammar (every figure, no exceptions)

Study the four figures in the template and reproduce the register. Each figure:

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns=... role="img" aria-label="describes
  the data, not the shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom -
  one-line takeaway</figcaption>`. Never widen past 880; grow H.
- `<defs>` holds THREE things with a prefix unique to this figure (session 2 uses `s2a`, `s2b`,
  `s2c`, `s2d`, `s2e`; session 4 `s4a`...; session 5 `s5a`...; session 6 `s6a`...):
  a wobble filter `id="s2aSk"` (`feTurbulence type="fractalNoise" baseFrequency="0.02"
  numOctaves="2" seed="<any int>"` + `feDisplacementMap scale="2.4" xChannelSelector="R"
  yChannelSelector="G"`, with `x="-3%" y="-3%" width="106%" height="106%"`), a hachure pattern
  `id="s2aHc"` (7x7 userSpaceOnUse, rotate(-38), one cobalt line, opacity .5), and an open
  arrowhead marker `id="s2aAr"` (path `M1 1 L9 5 L1 9`, fill none, ink stroke 1.6).
- ALL shapes (rects, circles, paths, arrows) go inside ONE `<g filter="url(#s2aSk)" fill="none"
  stroke="#14213D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`. Rects carry a
  tiny rotation (`transform="rotate(-0.6 cx cy)"`, between -4 and 4 degrees for "hand-placed"
  items, under 1 degree for panels). Fills: white, `#EEF3FC`, the hachure `url(#s2aHc)` for "the
  pile" or "the data", and solid `#B4530A` or `#FDEEDF` with a tangerine stroke ONLY for the one
  thing the figure is about. One doodle anchor per figure (a person, a clock, a receipt, a
  funnel, a knife, a phone, a room, two friends, a dial): simple strokes, never a mascot.
- ALL `<text>` sits OUTSIDE the filtered group, in the sans stack, using classes like the
  template's (`.s2aH` 800 12px ink heading · `.s2aL` 600 12px ink label · `.s2aS` 400 11px muted
  · `.s2aB` 800 11px tangerine-ink · `.s2aV` 800 16-20px cobalt-deep value · `.s2aW` 800 12px
  white on a cobalt fill · `.s2aN` 400 12px muted bottom note). Never below 10.5px.
- Text must fit its box AND the viewBox. Budget 7px per character at 12px (6.4 at 11px): a 150px
  box holds about 18 characters, 240px about 33, a full-width note line under 110. Labels beside a
  corner or a dot: keep 40px between neighbouring labels. When in doubt, shorten.
- Bottom note at least 22px below the last content row, H clears it by 8px.
- Floor: one figure per Part plus one in the build-along, so 4 or 5 per page. Illustrate the
  MECHANISM (where the knife sits, what a tie does, which axis is added), never a metaphor
  literally and never decoration.

## Voice and honesty

Real world callouts sell the concept; every Part gets at least one story grounded in the map's
cases. Where a case is constructed (the WeChat shop) say "constructed" or "invented" on the page.
Where a figure is a vendor or press claim, say "a vendor claim" or "reported by" with the named
report. Never state a repeat-purchase rate for Douyin as fact: none exists in a primary source.

## Cross-links (absolute URLs, audience-facing)

- Retention a4 (qcut build, personas, migration crosstab):
  https://phoebefu6.github.io/learn-customer-retention-with-phoebe/courses/a4-segmentation-rfm.html
- Retention a6 (CLV, BG/NBD): https://phoebefu6.github.io/learn-customer-retention-with-phoebe/courses/a6-clv-buy-till-you-die.html
- Retention a7 (churn model): https://phoebefu6.github.io/learn-customer-retention-with-phoebe/courses/a7-churn-prediction.html
- Unsupervised Learning: https://phoebefu6.github.io/learn-unsupervised-with-phoebe/
- Experimentation: https://phoebefu6.github.io/learn-experimentation-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain

01-three-numbers-and-a-snapshot.html → 02-the-cut-decides-the-segment.html → 03-the-rfm-bench.html
→ 04-beyond-purchase.html → 05-from-segment-to-action.html → 06-keep-it-alive.html
Footer left: "Session N of 6 · learn-rfm-modeling-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "← Prev: <title>" and "Next: <title> →" (session 6: "← Prev" and "Course home").
