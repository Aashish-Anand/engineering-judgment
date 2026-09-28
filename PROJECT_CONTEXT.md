# Project Context

Last reviewed: 2026-09-26

## Product

**Engineering Judgment — Architecture Under Pressure** is a content-first educational site about real production architecture decisions. It teaches through bottlenecks, failure modes, trade-offs, and operational consequences rather than generic system-design definitions.

The recurring reasoning chain is:

> Problem → Constraint → Bottleneck → Decision → Trade-off → Failure → What breaks next?

## Current Scope

Four complete topics are available:

1. Safely migrating a high-traffic production database
2. Surviving a 10-million-user flash sale for 10,000 items
3. Fixing a hot partition receiving 70% of traffic after a hypothetical Taylor Swift post
4. Publishing an event only if the database transaction succeeds (transactional outbox)

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

- Main article: `components/articles/HotPartitionArticle.tsx`.
- Supporting content/TOC: `data/topics/fix-hot-partition.ts`; metadata: `data/topics/catalog.ts`.
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
