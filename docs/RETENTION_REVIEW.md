# Retention review: what popular system-design sites do that we don't

Reviewed (October 2026): AlgoMaster (homepage and feature tour), Hello Interview (public "System Design in a Hurry" pages; the dashboard needs a login), Educative's *Grokking Modern System Design* lesson on load balancers, and EnjoyAlgorithms' database-replication post. Compared with Engineering Judgment's nine blueprints.

## What each site does to keep readers

| Site | Teaching frame | Retention mechanics |
|---|---|---|
| AlgoMaster | "Master patterns, not problems": problems grouped under ~20 named patterns (Hot Keys, Traffic Spikes, Fanout, High Write Traffic). | Progress tracking (done / starred), highlights and inline notes, a course notebook, inline quizzes, listen mode, AI tutor, practice problems with tests, AI mock interviews, newsletter and large social following. |
| Hello Interview | One ordered path ("In a Hurry"): introduction → delivery framework → core concepts → key technologies → patterns → question breakdowns. Pattern pages share a fixed shape: problem, options, choosing an approach, **recognition signals**, **when not to overcomplicate**, common deep dives. | Clear next step on every page, "In the Wild" real-company case studies (Shopify inventory reservations, Discord message storage), a quick-reference summary, "Vote for new content", level expectations per problem, freemium paywall mid-page, tutor and mock interviews. |
| Educative | Short lessons (~575 words) in a numbered course. Each opens with what you will learn, uses "Note" callouts, and ends with a reveal-the-answer question. | Course progress, small units that are easy to finish, next-lesson momentum. |
| EnjoyAlgorithms | Textbook blog: definition, types, advantages, disadvantages, book references. | Newsletter, course links, feedback form. Content is shallower than ours. |

## Where we already lead

Keep these; they are our identity, not gaps.

- **Failure-first scenarios** with a real constraint, not definitions. None of the four teaches through a production incident the way our blueprints do.
- **Interactive diagrams and labs** that change with the reader's input. Competitors mostly use static images; AlgoMaster's visual animations are for algorithms, not systems.
- **Sourced practice** ("In practice" callouts citing Stripe, Google SRE, Debezium, AWS).
- **No paywall, no account.** Every page is complete.

## The real gap: nothing brings a reader back

A reader can finish a blueprint and leave with no reason to return. All four competitors give at least one of: a path to follow, visible progress, something to revisit, or a channel that announces new content. We have none, and only nine articles, so each reader's second visit matters more than more breadth.

## Recommendations

### Tier 1: small effort, direct retention impact

1. **Learning paths.** Group the nine blueprints into three or four ordered tracks with a visible next step, for example *Correctness under failure* (idempotent payments → transactional outbox → poison messages), *Traffic and hot spots* (flash sale → hot partition → retry storms), *Changing live systems* (schema evolution → database migration → connection pools). Show "Path 2 of 3 · Next: …" at the end of each article instead of catalog-order previous/next. Hello Interview and Educative both rely on this.
2. **Progress without accounts.** Store read chapters, completed quizzes, and quiz scores in the browser (`localStorage`). Show ✓ marks in the library and article navigator, "Continue where you left off" on the homepage, and path progress ("2 of 3 done"). No backend, no sign-in.
3. **Recognition signals box** in every article, Hello Interview style: "You are probably facing this when…" (one key gets most traffic; a money-moving call times out; a deploy runs old and new code together). This turns a story into a reusable pattern and is the bridge to interviews.
4. **Quick reference card** per article: one screen with the invariant, the decision, the three numbers to remember, and the top failure mode, printable. It gives readers a reason to come back before an interview or incident review.

### Tier 2: medium effort, builds the habit loop

5. **Review queue.** Resurface quiz questions a reader got wrong, or finished 3 / 7 / 21 days ago, on the homepage ("3 decisions to revisit"). Still browser-only. No competitor reviewed offers spaced review for system design; it fits our judgment-practice framing.
6. **Pattern index** in the library: tag each blueprint with patterns (hot keys, contention, exactly-once effects, backpressure, mixed-version deploys) so readers can browse by pattern as well as by category, as AlgoMaster does.
7. **Incident teardowns** as a second, short content type (~800 words): a published postmortem retold through our chain (constraint → decision → failure → what broke next), linking to the matching blueprint. Hello Interview's "In the Wild" shows readers want real systems; ours would be about real *failures*, which matches the site's name.
8. **A way to hear about new content**: an RSS feed (no service needed) and optionally an email newsletter. EnjoyAlgorithms and AlgoMaster both lean on newsletters. Choosing an email provider is a product decision for you.

### Tier 3: defer

9. **AI tutor, listen mode, highlights and notes, AI mock interviews.** Strong at AlgoMaster and Hello Interview, but expensive, need accounts or paid APIs, and would not differentiate us. Revisit after paths, progress, and review prove that readers return.

### Remove or trim

- **Shorten the end of each article.** Fourteen sections is long next to Educative's ~575-word lessons. Merge "What to avoid", "Explain the decision", and "Expectations by level" into one compact "Interview corner", and keep the hand-written articles' large career-rubric hubs collapsed. Keep the depth; cut the repetition.
- **Do not add** testimonials, follower counts, or "used by engineers at…" claims until they are real (the authoring guide already forbids invented ones), and do not add a paywall: being complete and free is an advantage against all four.

## Status

- **Done (Tier 1):** learning paths with path-aware end-of-article navigation and a `/paths` page; browser-only progress (read marks, quiz best scores, continue where you left off) in the library, navigator, homepage, and paths page; recognition signals and a printable quick-reference card in every article.
- **Deferred:** RSS and newsletter until the library reaches about 25 articles.
- **Done (Tier 2, part 1):** spaced review queue (`/review`, homepage due tile, every quiz answer scheduled at 3 / 7 / 21 days) and the merged "Interview corner" in the data-driven blueprints (14 → 12 sections).
- **Waiting for more articles:** browse-by-pattern index (about 15–20 articles) and incident teardowns (a content track alongside new articles).

## Suggested order

1. Learning paths + path-aware "next" link.
2. Browser progress (✓ in library and navigator, continue reading).
3. Recognition signals + quick reference card, added to the article template so new topics get them.
4. Review queue on the homepage.
5. Pattern index. (RSS waits for about 25 articles.)
6. First incident teardown as a pilot.
