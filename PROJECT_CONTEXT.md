# Project Context

Last reviewed: 2026-09-26

## Product

**Engineering Judgment — Architecture Under Pressure** is a content-first educational site about real production architecture decisions. It teaches through bottlenecks, failure modes, trade-offs, and operational consequences rather than generic system-design definitions.

The recurring reasoning chain is:

> Problem → Constraint → Bottleneck → Decision → Trade-off → Failure → What breaks next?

## Current Scope

Nine complete topics are available:

1. Safely migrating a high-traffic production database
2. Surviving a 10-million-user flash sale for 10,000 items
3. Fixing a hot partition receiving 70% of traffic after a hypothetical Taylor Swift post
4. Publishing an event only if the database transaction succeeds (transactional outbox)
5. Retrying a payment safely after an ambiguous timeout
6. Handling poison messages with durable quarantine and controlled replay
7. Stopping retry storms and cascading dependency failures
8. Diagnosing database connection pool exhaustion
9. Evolving database schemas across mixed application versions

The homepage advertises several additional categories and problems, but those are currently placeholders.

## Technical Architecture

- Next.js 16.3 App Router
- React 19.2
- Strict TypeScript
- Tailwind CSS v4 with CSS-first design tokens
- Mostly server-rendered components
- Small client-side islands for navigation, animated hero text, tooltips, accordions, and table-of-contents tracking
- Handcrafted React/SVG diagrams; no conventional image asset library

Important locations:

- `app/page.tsx` — homepage composition
- `app/layout.tsx` — global layout, metadata, fonts, header, and footer
- `app/topics/[category]/[slug]/page.tsx` — topic validation, metadata, and article selection
- `data/homepage.ts` — homepage categories and featured content
- `data/topics/` — structured topic metrics, timelines, decisions, failure modes, and interview material
- `components/articles/` — long-form topic layouts and prose
- `components/diagrams/` — topic-specific architecture diagrams
- `components/doodle/` — reusable notebook-style visual primitives
- `app/globals.css` — design system and shared styling

## Article Structure

Both current articles use approximately the same 14-section structure:

1. Problem
2. Naive approach and why it fails
3. Why the problem is difficult
4. Mental model
5. Recommended architecture
6. Operational phases
7. Topic-specific correctness concern
8. Trade-offs
9. Failure modes
10. Behavior at 10× scale
11. What to avoid
12. Interview explanation
13. Expectations by engineering level
14. Follow-up and related topics

## Design Direction

The interface resembles an experienced engineer's notebook:

- Warm dotted-paper background
- Shantell Sans handwritten headings
- Plus Jakarta Sans body copy
- JetBrains Mono technical text
- Pastel highlighter colors
- Imperfect borders and stamp-like shadows
- Hand-drawn architecture diagrams
- Recurring “What breaks next?” callouts

## Verification Status

- `npm run lint` passes.
- `npm test` passes with five catalog and discovery-metadata regression tests.
- TypeScript and a production webpack build pass with `npx next build --webpack`.
- The production dependency audit reports zero known vulnerabilities.
- The default Turbopack build failed in the managed execution environment because a helper process could not bind to a port. This appears environment-specific rather than an application compilation error.

## Completed Foundation Fixes

- Added a central topic catalog for routes, metadata, links, and static parameters.
- Statically generates both topic routes and rejects unregistered dynamic routes.
- Added canonical metadata, `sitemap.xml`, `robots.txt`, and a custom not-found page.
- Changed the hero prompt so it only cycles through real topics and always opens the visible topic.
- Added regression tests for catalog uniqueness, route lookup, static parameters, sitemap coverage, and robots metadata.
- Explicitly configured the Next.js project root to avoid parent-lockfile detection warnings.
- Updated the README to match Shantell Sans and Next.js 16's Node.js requirement.

## Known Gaps

- Three advertised topics are implemented; the remaining categories contain placeholders.
- The two large article components duplicate their overall layout.
- Much of the prose remains embedded in article components even though supporting data is separated.
- Production builds depend on downloading Google Fonts unless the fonts are self-hosted or already cached.

## Recommended Next Steps

## Resume Tomorrow — Latest Handoff

The user asked to save context and continue tomorrow. The latest completed task is the full hot-partition article rewrite, following the stronger explanatory structure of Database Migration and Flash Sale. Do not restart the rewrite or assume the user has reviewed and approved the new content yet.

- Main article: `content/blueprints/hot-partition.mdx` (sections 01–05, rendered by `components/articles/BlueprintMdx.tsx`).
- Supporting content (sections 06–12, `blueprint` export): `data/topics/fix-hot-partition.ts`; metadata: `data/topics/catalog.ts`.
- Diagrams: `components/diagrams/HotPartitionDiagram.tsx`, `HotPartitionFlow.tsx`, and `HotPartitionWorkedExamples.tsx`.
- Interactive experiment: `components/HotPartitionLab.tsx`; arithmetic: `data/hot-partition-model.ts`.
- Latest checks passed: lint, eight tests, TypeScript, whitespace checks, and `npx next build --webpack`. Generated HTML verified 15 section IDs matching TOC data and ten figures.
- Remaining verification: review desktop/mobile layout and verify simulator controls in a browser. Previous interaction checks were inconclusive, not a confirmed application defect.
- Suggested first step: ask for the user's feedback on the revised article, or review the rendered page if requested. Keep the wording accessible and preserve the detailed reasoning and inline examples.
- Work remains uncommitted; preserve existing tracked changes and untracked files. No commit, push, or scheduled reminder was requested.

### Broader Project Options

Suggested order when work resumes:

1. Decide whether the next priority is adding content or improving the platform architecture.
2. Extract the common article shell while retaining topic-specific prose and diagrams.
3. Decide whether the rotating problem picker should eventually become genuine search.
4. Add interaction tests for the hero picker, table of contents, and expandable questions.
5. Consider self-hosting fonts for deterministic builds.

## Working Principle

Latest hot-partition review: clarified hot keys versus hot partitions, rebuilt diagrams with parallel write branches and cache hit/miss paths, and added fixed-scale simulator bars with capacity/headroom feedback. Eight tests pass, including cache arithmetic, conservation of write traffic, and capacity boundaries. Production build passes. Browser rendering was inspected; simulator interaction verification remained inconclusive in the in-app browser (controls did not visibly update).

Latest full rewrite verification: lint, all eight tests, TypeScript, diff whitespace checks, and the production webpack build pass. Generated HTML contains all 15 section IDs matching the table-of-contents data and ten figures. This content rewrite did not re-verify simulator interactions in a browser.

Content should be understandable from junior to senior level. Introduce ideas with plain language and concrete examples; define terms on first use. The user prefers the continuous, substantive walkthrough structure of Database Migration and Flash Sale over many short lessons with the essential reasoning hidden in expandable notes. The hot-partition article was reworked into the same 15-section arc: scenario, failed first fix, diagnosis, mental model, architecture, incident response, worked reaction design, trade-offs, failures, next bottleneck, interview guidance, and follow-ups. Core DB request-gate, reaction-key, retry, migration, and comment-paging examples are inline. The interactive lab uses isolated read-only/write-only teaching workloads, not mixed-operation production benchmarks. Use “partition” or “DB node,” not vague “destination” or “traffic lane”; distinguish post-like actions from the verb “like.”

Preserve the project's strongest characteristic: it is opinionated editorial teaching material, not a generic component showcase. Refactors should make new topics easier to add without flattening the topic-specific reasoning or diagrams.


## Content expansion — 2026-10-22

Added five blueprints with 15-section walkthroughs, worked code examples, architecture flows, production runbooks, interactive labs, primary references, and five questions each. New articles use a shared server-rendered shell, with topic-specific prose in `data/topics/production-blueprints.ts` and worked examples in `data/topics/blueprint-examples.ts`. Registered discovery, quizzes, navigation, and previously unavailable related-topic links. Existing four article layouts remain in place. No commit or push requested.

Validation: 29 tests, ESLint, TypeScript, and production webpack build pass. Reviewed desktop and mobile article layouts and exercised workbench controls and a dedicated quiz in the browser. Google Fonts required a network-enabled build initially; subsequent builds used the cache.

## Scalable navigation — 2026-10-22

Implemented a six-card curated homepage, category links, and a dedicated `/library` with URL-backed search/filter/sort/page state and 12-item pagination. Replaced the shared TableOfContents with a collapsible desktop navigator and native mobile dialog, offering current-article sections and category/search access to all articles. Header/footer link to Library; Cmd+K shares symptom matching. Production metadata is separated from prose to keep client navigation imports small. Search and 101-item pagination are covered by regression tests.

## Appearance toggle — 2026-10-22

Added a header sun/moon toggle, OS preference default, local-storage persistence, and cross-tab synchronization. The root layout initializes the theme before hydration using Next Script. Shared CSS now uses semantic theme variables with original light colors as fallbacks; `app/theme.css` supplies dark surfaces, utility compatibility, and SVG text/fill colors. Print keeps the light palette. Theme initialization has four regression tests, including blocked storage and system changes. Legacy simulator number formatting now specifies en-US so server/browser locale differences cannot trigger hydration recovery that resets appearance. Verified desktop and narrow mobile layouts, reload persistence, library, article sidebar, migration diagrams, and quiz feedback in the browser.

## Category color refinement — 2026-10-23

Added category-specific accent/wash/border tokens for both themes. Homepage and full-library cards now have subtle tinted backgrounds, colored category badges, and edge accents; category links and search controls also have restrained color. Applied the same identities to all five new articles through their shared shell: framed headers, numbered section markers, diagrams, labs, runbooks, tables, interview quotes, engineering-level cards, and quiz invitations. Checked light/dark desktop layouts and mobile article wrapping. Category labels retain at least 4.5:1 contrast against their washes in both palettes.

## Article review fixes — 2026-10-30

Reviewed the live migration and payment articles and fixed what the review found. UI: the cutover workbench controls no longer clip on mobile (grid tracks use `minmax(0, …)`); 900/950-level Tailwind text colors now have dark-theme overrides (Emergency Rollback was ~1.6:1); the theme script is a plain inline `<script>` in `<head>` because `next/script` `beforeInteractive` executed after first paint and caused a light-to-dark flash; the chapter navigator derives the active section from scroll position; mobile chapter jumps clear the sticky bar. Related links: `RelatedTopics` now takes catalog `TopicId`s only, so unpublished placeholders can no longer appear, and related cards plus previous/next links use the library title for each topic. Migration content: added a five-phase walkthrough (slot before snapshot, idempotent apply, range checksums and shadow reads, read ramp, fenced write cutover with reverse replication), reconciled dataset figures (250M rows, ~500 GB), removed duplicate trade-off rows, replaced the dual-write interview question and an unsupported "top tech companies" claim. Blueprints: every "What breaks next?" question now has an expandable answer; related links moved after the quiz; the payment article gained two trade-offs, two failure modes, Stripe and IETF sources, and a harder concept check (`conceptCheck`). Added `tests/blueprint-content.test.ts`. Flash-sale, hot-partition and outbox prose were not reviewed beyond their related links.

## Industry-practice review, P1 fixes — 2026-10-31

`docs/ARTICLE_REVIEW.md` records a review of all nine articles against primary sources (Stripe, Google SRE, Uber, Debezium, AWS, HikariCP, Redis, martinfowler.com) with prioritized corrections, additions, and visual work. All P1 items are fixed: flash sale (row locks serialize rather than oversell; one admission rate of 10,000 req/s and ~13 settlement orders/s; holds released by a sorted-set sweeper with a release script instead of keyspace events; conditional DB decrement as the final guard; randomized waiting-room admission; no "eliminates overselling"/"100% up" claims), outbox (at-least-once wording; no ID high-water mark; per-aggregate ordering under SKIP LOCKED; provider idempotency key for the consumer's external charge; atomicity-first concept check; lab opens healthy at the 5,000/s brief peak), hot partition (8 buckets everywhere, resharding 8→16, idempotent reaction write sample, duplicate table removed), and migration (CDC and Stripe-style application dual writes presented as two proven families). Remaining: diagram kit for the five data-driven blueprints, then P2 additions.

## Diagram kit — 2026-10-31

Added `components/diagrams/kit/` (DiagramKit primitives, CSS module, and a client `DiagramMotion` wrapper) and `components/diagrams/BlueprintConceptDiagrams.tsx`, which places one diagram per data-driven blueprint after a named section: payment crash-window sequence (worked-example), poison-message acknowledgement branches (mental-model), retry amplification 27 vs 3 (naive), connection budget against 160 sessions (mental-model), and the schema expand-to-contract swimlane (mental-model). Diagrams are visible without JavaScript; motion arms only for diagrams below the fold and respects reduced motion, with a Replay button in the title bar. Verified desktop light and mobile dark. Note: screenshots of the in-app browser pane can show stale animation frames; nudge the scroll before capturing.

## Industry-practice additions (P2) — 2026-10-31

Added `components/InPractice.tsx`, a sourced callout, and `data/topics/blueprint-practice.ts` (one note per data-driven blueprint, rendered after a named section; its sources merge into section 15). Notes: Stripe's idempotency contract, broker and Uber quarantine designs, Google SRE retry defaults, HikariCP pool-sizing formula, Parallel Change with PostgreSQL lock guidance. Hand-written articles gained callouts for DynamoDB partition limits and hot-key detection (hot partition), Debezium's Outbox Event Router (outbox), and migration tooling including DMS loopback prevention (migration). Replaced the unused `MigrationArchitectureDiagram` and `CutoverDiagram` with kit diagrams in `components/diagrams/MigrationPhaseDiagrams.tsx`. Every cited fact was checked against the primary source; tests require each blueprint's note to sit in a real section with https sources. P3 polish remains in `docs/ARTICLE_REVIEW.md`.

## Workbenches folded into diagrams — 2026-10-31

The five data-driven blueprints no longer have a separate "Try the failure scenario" section. Its text-only `ProductionPressureLab` largely repeated the new diagrams, so it was removed. The retry amplification (layers and attempts sliders), connection budget (replicas, pool size, checkout time; adds rolling-deploy surge and Little's Law occupancy), and payment crash window (fresh-key toggle showing a second charge) diagrams are now interactive client components in `components/diagrams/InteractiveConceptDiagrams.tsx`. Poison and schema keep static diagrams. Each blueprint's diagram carries `id="workbench"`; the header link says "Jump into the workbench" or "Jump to the diagram". Articles now have 14 sections. Unused `poisonTrace` and `schemaPhases` models were removed.

## Retention Tier 1 — 2026-10-31

Reviewed AlgoMaster, Hello Interview, Educative, and EnjoyAlgorithms (`docs/RETENTION_REVIEW.md`). Built Tier 1:
- **Learning paths** (`data/learning-paths.ts`): every article declares depth and prerequisites; paths are ordered article lists. Tests enforce coverage, non-decreasing depth, prerequisite order, and no cycles, so the structure scales as articles are added. `/paths` page, "Paths" in the header, a homepage section, an in-article path line, and `ArticleNav` rewritten as path-aware end-of-article navigation (previous and next within the reader's path instead of catalog order).
- **Progress without accounts** (`data/progress.ts`, `components/useProgress.ts`): localStorage only, synced across tabs. Articles are marked read when the path panel scrolls into view (or by checkbox); quizzes save the best score; the homepage offers "Continue where you left off"; ✓ marks in the library and navigator.
- **Recognize it / remember it** (`data/article-guides.ts`, `components/learning/ArticleGuide.tsx`): three recognition signals and a collapsible, printable quick-reference card under each article's central idea.
RSS and newsletter are deferred until about 25 articles. Print rules live in `app/globals.css` because CSS modules reject selectors without a local class.

## Retention Tier 2, part 1 — 2026-10-31

- **Spaced review** (`data/progress.ts` review functions, `data/review.ts`, `/review`, homepage due tile): every quiz answer is scheduled by a stable key (article ID plus a hash of the scenario). Wrong answers return in 3 days; right answers step to 7 and 21 days, then retire. Sessions show at most 8 due decisions with their source article, and freeze their list so answering does not reshuffle it. `/review` is `noindex` and outside the sitemap.
- **Interview corner:** the data-driven blueprints merge "What to avoid", "Explain the decision", and "Expectations by level" into one section; articles now have 12 sections.
Pattern index and incident teardowns wait until the library is larger.

## UI consistency and contrast — 2026-10-31

- **Dark-mode visibility:** the hand-written SVG diagrams used light fills `#FDE8E8` and `#F4E0D0` with no dark remap, while all SVG text turns light in dark mode, so labels were unreadable. Added remaps to soft rose and soft amber, and mapped red, green, and gray SVG text to dark accents. Fixed muted text on mint (current navigator chapter, decision-note label) and made disabled buttons dashed and legible instead of 45% opacity.
- **Light mode:** darkened pale fallback grays in the navigator, concept-check letters, quiz-entry note, and table captions.
- **One design system everywhere:** the neo header on every page; nav is Library · Paths · Review (with a due badge) · About; footer matches; the mobile menu lists learning paths instead of four hard-coded articles; `/library` and the 404 page are restyled in the neo system.
- Verified with a WCAG contrast audit script over every page type in both themes: 0 failures, except a known false positive (Tailwind v4 `oklch()` backgrounds are not parsed by the script). The script skips SVG, so diagrams were checked visually.

## Dark-mode reading contrast — 2026-10-31

Passing 4.5:1 was not enough: about 58% of article text in dark mode was the muted gray at 8–9:1, which read as dim. Raised the dark palette (neo: paper `#171b19`, surface `#20251f`, ink `#f3f2ea`, muted `#d0d5ca`, grid `#555e55`; theme: text `#eef3ef`, muted `#c9d5cd`, link `#b6d6f8`, border `#4d6157`). Measured by character count, text at 10:1 or better went from about 40% to 94–95% on articles. Also fixed the flash-sale funnel's pastel stage cards, whose descriptions were light text on light fills in dark mode. Light mode is unchanged.

## Paragraph readability — 2026-10-31

Article paragraphs ran about 112–150 characters per line on desktop, in the muted gray, which read as messy in dark mode. Prose (direct paragraphs and lists in a section) now uses a 36em reading column (about 79 characters at 17px), a dedicated `--neo-body` color (dark `#e6e7dd`, light `#3b3f37`), 17px size, and slight letter spacing in dark mode. `ch` was not usable for the cap because this font's "0" is wide (70ch fit about 112 characters). Diagrams, labs, tables, and callouts keep the full width; "In practice" lists cap at 44em.

Follow-up: capping only paragraphs at 36em left a ragged empty strip beside full-width callouts and diagrams. Replaced it with one 680px article column (`.article-content`, centered beside the navigator) shared by every block, so all right edges align; paragraphs fill it at about 85 characters per line. Verified at 1440, 1024, and 800px with no overflow; the migration workbench and flash-sale lab fit.

Reverted the 680px centered column at the owner's request: on 1080p and wider screens it left large empty areas on both sides. Article content again fills the full width beside the navigator; the body color, 17px size, and dark letter spacing stay.
