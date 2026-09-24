# learn-rfm-modeling-with-phoebe - source map

Internal build document. Not linked from any audience-facing page.

Bucket `data`, difficulty 2, audience both, 6 sessions, single track, Python build-alongs.

Built 2026-09-24.

---

## Why this course exists, and what it deliberately leaves to its siblings

RFM was already taught in two live courses when this one was scoped, and both were read before a
page was written:

- `learn-customer-retention-with-phoebe` **a4 "Segmentation: who is retained"** owns the quintile
  `pd.qcut` build, the 555-style codes, four personas (Champions, At-Risk, Loyal, Hibernating),
  the qcut duplicate-edge pitfall with the rank fix, the wholesaler trap, the frozen snapshot, and
  the persona-migration crosstab between two snapshots. This course links to it for all of that
  and restates none of it.
- `learn-unsupervised-with-phoebe` u1, u7, u10 own RFM as the three-number **feature portrait**
  that feeds k-means, and the naming of clusters.
- `learn-ecommerce-metrics-with-phoebe` a6 is titled "Segment cuts" (mix effects on GMV). That
  title is avoided here.

**What is un-owned, and therefore this course:** RFM as a *decision system*. Where the knife goes
(mean, median, tercile, quintile, business threshold), what each cut does to a real skewed
customer base, how the choice of cut silently decides who is called a Champion and who is
messaged, the eight-group 2x2x2 taxonomy and its action table, the variants that swap or add a
dimension for platforms where most people never buy (engagement, live-room loyalty, referral),
proving that an action worked with a holdout, and keeping the model alive on a cadence.

The learner's own source, pasted into the brief: a Chinese tutorial chapter (风变-style) teaching
the mean-split 2x2x2 taxonomy with eight named groups (高价值 / 重点发展 / 重点唤回 / 重点潜力 /
一般潜力 / 一般发展 / 一般维系 / 低价值), `pd.cut` vs `pd.qcut`, and a per-group action list.
Everything in that chapter is covered, in English, across sessions 1, 2 and 5.

---

## The data, real and recomputed

**Brazilian E-Commerce Public Dataset by Olist** (Kaggle, CC BY-NC-SA 4.0). 99,441 orders,
2016-09 to 2018-10, nine CSVs. Cloned from a public GitHub mirror on 2026-09-24 and recomputed
here; every Olist figure on any page comes from this run.

Preparation, stated on session 1 and reused everywhere:

- delivered orders only (96,478 of 99,441)
- customer = `customer_unique_id` (96,096), not `customer_id` (99,441, one per order)
- monetary = sum of `payment_value` per order (the payments table, not items x price)
- snapshot **2018-09-01**. The last order timestamp is 2018-10-17, but only 20 orders are dated
  September or October 2018 and none of them is delivered: the export effectively stops at the
  end of August. A snapshot taken at "the last date in the file" would call every customer 47
  days staler than the data supports. Choose the snapshot at the end of the last complete month
  and write it down.
- R = days from last delivered order to the snapshot; F = delivered orders; M = total payments.

### Population canon (93,358 customers)

| Figure | Value |
|---|---|
| Customers with exactly one delivered order | **97.0%** (90,557) |
| Two orders / three / four+ | 2.76% / 0.19% / 0.05% |
| Repeat buyers | 2,801, holding **5.6%** of revenue |
| Monetary mean / median | R$ 165.20 / R$ 107.78 |
| Share above the monetary mean | **29.3%** (a median split gives 50.0% by construction) |
| Share above the frequency mean (1.033) | **3.0%** |
| Share more recent than the recency mean (239.5 days) | 54.8% |
| Top 10% of customers by spend | 38.3% of revenue |
| `pd.qcut(F, 5)` | raises `Bin edges must be unique: [1,1,1,1,1,15]` |
| Rank tie-break (`rank(method="first")`) on F | 18,672 identical F=1 customers scored 1; 15,871 identical F=1 customers scored 5 |

### Mean-split eight groups on the population

| Code | Name | Customers | Revenue |
|---|---|---|---|
| 100 | General develop (recent, once, small) | 37.88% | 19.28% |
| 000 | Low value | 31.91% | 16.16% |
| 101 | Key develop (recent, once, big) | 15.10% | **32.33%** |
| 001 | Key potential (quiet, once, big) | 12.11% | 26.63% |
| 111 | High value | **1.28%** | 3.06% |
| 011 | Key win-back (quiet, frequent, big) | 0.79% | 1.89% |
| 110 | General potential | 0.52% | 0.36% |
| 010 | General retain | 0.42% | 0.29% |

The 101 group, recent one-time buyers with a big basket, holds a third of the revenue. On a
marketplace where 97% buy once, the group the taxonomy calls "high value" is 1.28% of customers.

### Vendor maps replicated on the population

- **Putler's eleven** (rank quintiles, F+M averaged): Loyal 31.6%, Potential loyalist 24.3%,
  At risk 19.2%, **Champions 16.1%, of whom 92.1% bought exactly once.** At risk + Can't lose:
  97.6% one-time buyers.
- **Klaviyo's six** (R by 180/365 days, F and M rank terciles, as published in its help centre):
  Recent 21.6%, Loyal 21.5%, At risk 17.3%, Needs attention 15.5%, **Champions 13.9%, of whom
  91.0% bought once.** Needs attention: 96.7% one-time buyers.
- **One total score** (quintiles summed): 125 codes collapse into 13 sums; 19 different codes
  share the sum 9.

Replication note stated on the pages: Klaviyo's and Putler's tie handling for a column that is
97% ties is not documented. The replication uses the pandas `rank(method="first")` convention,
which is what every tutorial that "fixes" the duplicate-edge error does. The result is a
property of that convention on this base, not a claim about either product's live output.


### Extra canon added 2026-09-24 after the session 2 fan-out (page and map must agree)

- Spend percentiles on the population: p90 **R$ 318**, p99 **R$ 1,097**. A merchant threshold at
  R$ 300 takes roughly the top tenth.
- **Median-split eight groups** on the population: 000 25.50%, 100 24.14%, 101 23.95%,
  001 23.40%, 111 1.46%, 011 1.18%, 110 0.18%, 010 0.18%.
- **Klaviyo code lists**, as published (help centre article 17797937793179): Champions 333 332
  323; Loyal 321 322 331 232 233; Recent 312 313 311 222 223; Needs attention 213 221 123 132
  133; At risk 231 212 122 131 211; Inactive 111 112 113 121.
- **Putler score ranges**, as published (recency score / combined F+M score): Champions 4-5 /
  4-5; Loyal 2-5 / 3-5; Potential loyalist 3-5 / 1-3; New 4-5 / 0-1; Promising 3-4 / 0-1; Needs
  attention 2-3 / 2-3; About to sleep 2-3 / 0-2; At risk 0-2 / 2-5; Can't lose 0-1 / 4-5;
  Hibernating 1-2 / 1-2; Lost 0-2 / 0-2. The bench implements these on 1-5 quintile scores with
  F and M averaged and rounded.
- Klaviyo groups on the population: Recent 21.6%, Loyal 21.5%, At risk 17.3%, Needs attention
  15.5% (96.7% bought once), Champions 13.9% (91.0% once), Inactive 10.3%.
- Putler groups on the population: Loyal 31.6%, Potential loyalist 24.3%, At risk 19.2%,
  Champions 16.1% (92.1% once), Needs attention 7.3%, Hibernating 0.9%, About to sleep 0.8%;
  At risk + Can't lose are 97.6% one-time buyers.

---

## The bench (`assets/rfm-live.js` + `assets/rfm-sample.js`)

A seeded sample (`numpy.random.default_rng(20180901)`, 4,000 rows) of the real population, shipped
as three integer arrays (57 KB). Sample shape matches the population: 97.08% one-time buyers,
mean spend R$ 172.84, median R$ 110.36, mean recency 240.5 days.

Six cuts on the same 4,000 people. Verified headlessly in node on 2026-09-24 against an
independent pandas implementation before any page quoted a number; both agree to the row.

| Cut | Groups | Top group | Top group who bought once | Win-back audience | Repeat buyers in it | Net yield per message | Net incremental |
|---|---|---|---|---|---|---|---|
| Mean split, eight | 8 | 0.97% (2.42% rev) | **0%** | 33 | **100%** | **R$ 3.46** | R$ 103 |
| Median split, eight | 8 | 1.40% (2.63% rev) | 0% | 50 | 100% | R$ 2.84 | **R$ 128** |
| Klaviyo's six | 6 | 13.30% (23.6% rev) | **89.9%** | 630 | 3.7% | R$ 0.15 | R$ 83 |
| Quintiles into Putler's eleven | 7 non-empty | 15.90% (27.0% rev) | **91.5%** | 767 | 2.4% | **R$ 0.02** | R$ 13 |
| Merchant thresholds | 7 | 0.70% (1.27% rev) | 0% | 24 | 100% | R$ 2.44 | R$ 53 |
| **ANTI: one total score** | 3 | 7.98% (18.5% rev) | 83.1% | **2,555** | 2.5% | R$ 0.02 | R$ 53 |

Win-back audience per cut: mean/median = code 011; Klaviyo = Needs attention; Putler = At risk +
Can't lose; thresholds = Lapsed repeat; sum = the middle band 8-12.

**The findings the sessions are built on, all measured:**

1. **The cut decides who is called best.** Two vendor defaults name 13-16% of a base where 97%
   bought once as Champions, and nine in ten of those Champions bought exactly once. The
   mean-split top group is 1% of customers and none of them bought once. Same people.
2. **Quintiles on a tied column are decided by row order.** 800 identical one-time buyers were scored 1 and
   683 identical ones scored 5, by row order. That is what the rank "fix" for the duplicate-edge
   error does when 97% of a column is the same value, and it is why the vendor Champions are
   mostly one-time buyers.
3. **Win-back audiences differ by a factor of 77 in size** (33 vs 2,555) and, on the stated
   response model, by a factor of 170 in yield per message. The ordering of the per-message
   column is robust to the model's exact numbers because it is driven by the repeat-buyer share
   of the audience, which is measured: 100% vs 2.4%.
4. **The anti-lever.** One total score buys nothing the three digits did not already carry, and
   hides 80 different codes inside the win-back band. A 5-1-1 (just bought, once) and a 1-5-1
   (frequent, long gone) both sum to 7; a win-back message to the first is noise and to the
   second is the whole point.
5. **The honest dip.** The biggest total on the bench (median split, R$ 128) is not the best
   yield per message (mean split, R$ 3.46). Total and per-message pull in different directions
   because the median audience is larger. Neither is "the" answer; the session teaches reading
   both.

### The response model, stated on the widget and here

Modelled, not measured: lapsed one-time buyers reorder on their own 1.0% of the time and a message
lifts that by 15%; lapsed repeat buyers reorder 4.0% of the time and a message lifts that by 50%;
a message costs R$ 0.30; 10% of every audience is held out. Reactivation order value is each
customer's own average order from the data. The pages quote yields only as "on the stated model"
and never as a claim about win-back in general. What the pages DO claim from the yield column is
the ordering, and only because it follows from the measured repeat-buyer share.

### Limits stated on every page that quotes a bench figure

- The 4,000 are real, and a sample. Population figures are given alongside on session 2.
- Olist is a marketplace with a 97% one-time-buyer base. A subscription business or a grocery app
  would produce different shares under every cut; the mechanism (the cut decides) is what
  transfers, the percentages are not.
- Putler's map produced 7 non-empty of 11 segments on this base; New, Promising, Can't lose and
  Lost were empty because averaging F and M quintiles never reaches the corner values with 97%
  ties in F.

---

## The five cases and their evidence tier

| Case | What it carries | Tier |
|---|---|---|
| **Olist** (sessions 1, 2, 3, 6) | the whole numeric spine | Real public data, recomputed in this build |
| **Taobao UserBehavior** (session 4) | RFE: when 98% of rows are not purchases | Real Tianchi dataset (dataId 649): 2017-11-25 to 2017-12-03, ~100M rows, 987,994 users, 4,162,024 items, behaviours pv/buy/cart/fav. Counts from the dataset page; the pv-dominant split is cited to published analyses, NOT recomputed (3.4 GB, login-walled) |
| **Douyin live commerce** (sessions 4, 5) | room loyalty as a frequency; 店播 vs 达播 | 索象集团 + 中国直播产业研究院 《2025年抖音直播电商发展白皮书》: 2024 Douyin GMV over 3 trillion yuan, live over 58% of sales, 店播 41% vs 达播 38% (2024); CBNData 2025: 店播 revenue about 70% of live revenue, shelf/店播/达播 roughly 4:3:3. Repeat-rate figures for live rooms: NONE found in a primary source; any "复购率" number on the page is labelled a vendor or press claim |
| **Pinduoduo team purchase** (session 4) | the referral dimension | Mechanics quoted from PDD Holdings Form 20-F (FY2025): buyers share product information and invite contacts to form teams for the team price. Active-buyer counts are no longer disclosed in the 20-F; the page says so. The 882M (2023) figure circulating online is secondary and not used |
| **WeChat 私域 community shop** (sessions 2, 5) | small N, RFM-T, when quintiles break | Constructed, N=300, stated as invented. "私域复购是公域的3-5倍" is an industry/vendor claim (腾讯云开发者社区 2026), labelled unverified |
| **Klaviyo defaults** (sessions 2, 3, 5) | the tool decides your cut | Thresholds quoted from Klaviyo help centre article 17797937793179: R 3 within 180 days, 2 within 365, else 1; F and M by thirds; six groups with their code lists |
| **Putler's eleven** (sessions 2, 3) | the tutorial default | Segment table and score ranges quoted from putler.com/rfm-analysis |

Hughes 1994 (*Strategic Database Marketing*): the customer-quintile method (sort by R into
fifths, each fifth by F, each by M, 125 cells) and the test-mailing step (a random ~10% of each
cell) are described from secondary summaries; the book itself was not opened in this build and
the page says so. The "since 1961" origin in the learner's pasted source is **uncited**; RFM's
direct-mail roots are usually dated to the 1960s catalogue era without a single founding paper.
Session 1 teaches the disagreement rather than a date.

Stone (1995) weights for R, F, M (often quoted as 5-3-2 or 100-10-1): could not be read at
source. Session 4 names weighting as a live debate and gives no canonical weights.

---

## Sessions

| # | Title | Case | Signature thing |
|---|---|---|---|
| 1 | Three numbers and a snapshot date | Olist | One customer becomes three numbers; the frozen clock; the eight-group taxonomy as a mechanism |
| 2 | The cut decides the segment | Olist + 私域 N=300 | Mean vs median vs tercile vs quintile on one skewed pile; 97% ties; identical customers, different scores |
| 3 | **The RFM bench** | Olist sample | Six cuts, every share counted; the anti-lever |
| 4 | Beyond purchase | Taobao, Douyin, Pinduoduo | RFE, room loyalty, the referral axis; which axis replaces M and which adds |
| 5 | From segment to action, and proving it | Douyin 店播, Klaviyo, 私域 | Action table per group; the holdout gate; message-everyone trap |
| 6 | Keep it alive | all | Cadence, drift, the RFM spec sheet, graduation to CLV (a6) or clustering (Unsupervised) |

Seams enforced: session 2 links Retention a4 for the `qcut` build and rank fix rather than
re-teaching them; session 6 mentions the migration crosstab in one line and links a4 for it.

---

## Design system

Palette: **cobalt and tangerine.** Chosen against neighbours (rust Retention, indigo Ecommerce
Metrics, purple Unsupervised, teal Journey Analytics) and checked before the first page.

| Token | Hex | Role |
|---|---|---|
| cobalt-deep | `#1E3A8A` | darkest band, root |
| cobalt | `#1D4ED8` | primary band, links |
| cobalt-mid | `#2F5FD0` | secondary band |
| cobalt-soft | `#C3D3F5` | light fill |
| cobalt-50 | `#EEF3FC` | pale ground |
| ink | `#14213D` | text, sketch strokes |
| muted | `#4F5B7A` | secondary text |
| faint / hairline | `#CBD5EE` / `#DCE3F3` | rails, twigs |
| tangerine | `#B4530A` | accent band, the thing a figure is about |
| tangerine-ink | `#8A3E06` | accent text |
| tangerine-50 | `#FDEEDF` | accent ground |

**WCAG AA verified before the first page: 26 pairs, 0 failures, lowest 5.02:1** (white on
tangerine). Universal reds kept from the donor stylesheet unchanged: `#991B1B` `#FEF2F2`
`#7F1D1D` `#FCA5A5`; `#7F1D1D` is donor CSS only and never appears in page markup.

Scaffold donor: `learn-ship-playbook-with-phoebe` (carries the `--scrim-rgb` / `--shadow-rgb`
fix). Checked immediately after the copy: `PASSPORT_KEY` = `lwp-passport:rfm-modeling`,
`TOTAL_SESSIONS` = 6, journey `pages` array = this course's six files.

### Hand-drawn figure grammar (this course's illustration register)

Every figure is inline SVG in a sketch register, hand-authored from the hand-drawn-diagrams
skill's grammar (rectangle = thing, ellipse = actor or state, line = structure, arrow = movement,
one doodle anchor per figure, labels outside boxes where possible, no paragraph in a box):

- a `<filter>` per figure (`feTurbulence` fractal noise, `feDisplacementMap` scale about 2.4)
  applied to the **shape layer only**, so strokes wobble like ink and text stays measurable
- hachure `<pattern>` fills in cobalt for "the pile", solid tangerine only for the one thing the
  figure is about
- ink strokes `#14213D` 2px, round caps and joins; rects carry a half-degree rotation
- labels in the site sans stack at 11-12px, never inside the filtered group, so the CTM fit scan
  and the painted-rect check see them
- unique class prefix and def ids per figure (`s1a`, `s1b`, ...); markers and filters are
  document-scoped

Floor: 3 figures per session page, one per Part, plus one in the build-along.
