# Engineering Judgment

A field guide to architecture under pressure: real production constraints, worked decisions, failure modes, and the trade-offs that follow.

Each blueprint follows a reasoning chain:

```text
Constraint → Bottleneck → Decision → Trade-off → Failure → What breaks next?
```

## What’s included

- Nine published architecture blueprints with explanations, diagrams, code examples, incident runbooks, and engineering-level rubrics.
- Interactive workbenches for exploring database cutover, traffic spikes, inventory reservations, and hot partitions. Their numbers are illustrative models, not production benchmarks.
- Twelve inline concept checks embedded in the articles. Select a response and explicitly check it to reveal the reasoning; these checkpoints are unscored.
- A dedicated five-scenario quiz for each article: 45 scenarios in total, with explanations for every option, progress, a scored review, and retry.
- Quiz entry points near the end of each article and a dismissible invitation after sufficient reading progress.
- Search with `Cmd+K` or `Ctrl+K`, article navigation, responsive tables of contents, reading progress, and back-to-top controls.
- Static article and quiz routes, canonical metadata, a sitemap, and robots metadata.

## Published blueprints

These links use the local development server at `http://localhost:3000`.

| Blueprint | Main decisions | Practice |
| --- | --- | --- |
| [Fix a hot partition](http://localhost:3000/topics/traffic/fix-hot-partition) | Cache repeated reads, distribute independent writes, preserve ordering, and migrate routing safely. | [Quiz](http://localhost:3000/topics/traffic/fix-hot-partition/quiz) |
| [Migrate a production database](http://localhost:3000/topics/database/safely-migrate-production-database) | Snapshot, CDC, validation, controlled cutover, and rollback after new writes. | [Quiz](http://localhost:3000/topics/database/safely-migrate-production-database/quiz) |
| [Survive a flash sale](http://localhost:3000/topics/traffic/survive-flash-sale) | Admission control, atomic inventory reservations, asynchronous settlement, and idempotent payments. | [Quiz](http://localhost:3000/topics/traffic/survive-flash-sale/quiz) |
| [Use a transactional outbox](http://localhost:3000/topics/correctness/transactional-outbox) | Commit state and event intent together, relay reliably, and handle duplicate delivery. | [Quiz](http://localhost:3000/topics/correctness/transactional-outbox/quiz) |

Five additional blueprints are available, each with an interactive failure workbench and five-scenario quiz:

- [Retry payments safely](http://localhost:3000/topics/correctness/retry-payments-safely)
- [Handle poison messages](http://localhost:3000/topics/messaging/handle-poison-messages)
- [Stop retry storms](http://localhost:3000/topics/reliability/stop-retry-storms)
- [Diagnose connection pool exhaustion](http://localhost:3000/topics/performance/database-connection-pool-exhaustion)
- [Change schemas without downtime](http://localhost:3000/topics/deployment/change-schema-without-downtime)

Their topic-specific prose, runbooks, trade-offs, references, and questions live in `data/topics/production-blueprints.ts`. Worked code examples live in `data/topics/blueprint-examples.ts`; `ProductionBlueprintArticle` supplies their shared reading layout. `ProductionPressureLab` provides the controls, with deterministic teaching calculations in `data/pressure-models.ts`.

Each quiz lives at its article’s URL with `/quiz` appended.

## Design

The current interface uses a restrained editorial style: bounded reading widths, clear information hierarchy, quiet borders, and muted sage, blue, amber, and lavender accents.

- **Typography:** Plus Jakarta Sans for interface text, Georgia for selected editorial passages, and JetBrains Mono for code and technical labels.
- **Homepage:** layered surfaces, soft shadows, and gentle pointer-responsive card tilt. Motion respects reduced-motion preferences; tilt is limited to mouse interaction.
- **Articles:** readable prose, responsive navigation, architecture diagrams, and space for interactive tools.
- **Inline checks:** larger answer targets, explicit submission, explanatory feedback, and retry/collapse controls.

The homepage has no cursor trail or animated canvas background.

## Stack

- Next.js 16.3.5 with the App Router
- React 19.2.8 and TypeScript 5
- Tailwind CSS v4, shared global styles, and component CSS Modules
- Google fonts through `next/font`
- Custom SVG diagrams and React-based simulations
- Vitest for model and content validation; ESLint for linting

## Local development

Requires Node.js 20.9 or newer and npm.

```bash
git clone https://github.com/Aashish-Anand/engineering-judgment.git
cd engineering-judgment
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Development uses Next.js’s default Turbopack bundler.

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm test` | Run the Vitest suite once. |
| `npm run lint` | Run ESLint. |
| `npx tsc --noEmit` | Check TypeScript types. |
| `npm run build` | Create a production build. |
| `npm run build -- --webpack` | Build with webpack; an alternative when Turbopack cannot run in the environment. |
| `npm run start` | Serve an existing production build. |

The Google fonts configured in `app/layout.tsx` require network access during the build.

### Site URL

For deployment, set `NEXT_PUBLIC_SITE_URL` to the public origin before building (on Vercel it defaults to the production domain from `VERCEL_PROJECT_PRODUCTION_URL`):

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

It can be set in `.env.local` or the deployment environment. `data/site.ts` uses this value for metadata and discovery URLs, with `http://localhost:3000` as the development fallback.

## Project structure

```text
app/
  layout.tsx                          Shared header, footer, fonts, and reading controls
  page.tsx                            Homepage library, workbench, and approach
  globals.css                         Design tokens and shared layouts
  sitemap.ts                          Homepage, article, and quiz discovery
  robots.ts                           Crawling metadata
  topics/[category]/[slug]/
    page.tsx                          Static article routing
    quiz/page.tsx                     Static per-article quiz routing
components/
  Hero.tsx                            Featured homepage blueprint
  DepthLink.tsx                       Pointer-responsive card depth
  SiteHeader.tsx / SiteFooter.tsx      Shared navigation
  CommandPalette.tsx                  Topic search
  TableOfContents.tsx                 Responsive article outline
  InlineCheck.tsx                     Unscored in-article checkpoints
  ArticleQuizEntry.tsx                Quiz link and reading invitation
  ArchitectureQuiz.tsx                Quiz questions, feedback, and results
  articles/                           Article layouts and inline questions
  diagrams/                           Architecture diagrams and worked examples
  doodle/                             Reusable illustration primitives
  *Workbench.tsx / *Simulator.tsx      Interactive tools
data/
  site.ts                             Site identity and public URL
  cutover-model.ts                     Database migration simulation model
  hot-partition-model.ts               Hot-partition simulation model
  topics/catalog.ts                   Published topics, metadata, and routes
  topics/quizzes.ts                   Topic-to-quiz mapping
  topics/*.ts                         Article content and judgment questions
tests/
  cutover-model.test.ts                Migration invariants
  hot-partition-model.test.ts          Traffic and capacity calculations
  topic-catalog.test.ts                Route and discovery coverage
  topic-quizzes.test.ts                Question completeness and answer validity
```

## Adding a blueprint

1. Add its ID and metadata to `data/topics/catalog.ts`.
2. Add the topic’s content and `judgmentQuiz` questions in `data/topics/`.
3. Create the article component in `components/articles/` and register it in `components/articles/registry.ts`.
4. Register the questions in `data/topics/quizzes.ts` and add the homepage display title in `app/page.tsx`.
5. Include `ArticleQuizEntry` in the article, with the matching `/quiz` URL. Add inline checks where they help reinforce a specific section.
6. Run the tests, lint, type check, and production build. Check the article and quiz at desktop and mobile widths.

The catalog supplies static parameters for both article and quiz routes and supplies sitemap entries. Quiz validation requires at least five distinct scenarios, at least three distinct options per question, exactly one correct option, explanations for every option, and varied correct-answer positions.

Before changing Next.js code, follow `AGENTS.md` and read the relevant version-specific documentation in `node_modules/next/dist/docs/`.

## License

MIT © [Aashish Anand](https://github.com/Aashish-Anand)

## Library navigation

The homepage shows six explicitly curated blueprints from `featuredIds` in `data/library.ts`. The `/library` page searches titles, summaries, tags, topic identifiers, prompts, and curated symptom aliases. It supports category filters, recommended/newest/title sorting, and 12 results per page. Query, category, sort, and page are encoded in the URL; browser Back returns to the filtered results.

Every article shares a collapsible desktop navigator with “This article” and “Library” tabs. The library tab groups articles by category, expands the current category, highlights the current article, and searches all categories. Mobile readers use a modal drawer with the same controls. Escape closes the drawer; native dialog behavior contains keyboard focus and restores it to the trigger.

When adding a topic, also add its compact title, symptom aliases, and unique increasing `addedOrder` to `libraryDetails`. The newest sort uses that editorial addition order, not a claimed publication date. Categories and counts derive from the catalog. For the five shared-shell blueprints, metadata is in `data/topics/production-catalog.ts`; article prose stays in `production-blueprints.ts` so navigation does not import all article content. Featured selection is explicit and remains capped at six.

## Appearance

The header’s sun/moon button switches light and dark mode. The first visit follows the operating system; an explicit choice is saved under `engineering-judgment-theme` in local storage and synchronized across open tabs. The root layout applies the preference before the first paint. If storage is unavailable, toggling still works for the current page. Print styling retains the light palette.

Shared editorial styles use semantic `--theme-*` colors with their original light colors as fallbacks. Dark colors and compatibility rules for the existing Tailwind and SVG diagrams live in `app/theme.css`. Add theme-aware colors when introducing new surfaces or diagrams.

Category accents are defined in `app/category-colors.css`. Cards, category links, and the five shared-shell articles use `data-category` to inherit a matching accent, background wash, and border color. The palette supplies separate light and dark values. Article headings, diagrams, workbenches, runbooks, tables, and quiz invitations reuse those tokens while body text stays neutral.

## Website icons

`app/icon.svg` is the editable layered-architecture mark, using cream and sage on a dark green background. Next.js automatically supplies it as the scalable browser icon, alongside `app/favicon.ico` (16, 32, 48, and 64 px) and `app/apple-icon.png` (180 px, full-bleed background for iOS masking). After editing the SVG, run `node scripts/generate-icons.mjs` to regenerate the raster formats using the installed Sharp package.
