# Publishing a blueprint

All nine existing articles use `components/articles/BlueprintArticleFrame.tsx` and the shared neo-brutalist styles in `components/Neo.module.css`. Reuse that frame for every new article. The frame owns the breadcrumb, title, scenario brief, four-step journey, central idea, chapter navigation, and content width. Dedicated quiz pages inherit the same visual system automatically.

## Start from the saved template

Copy `templates/blueprint/Article.tsx.example` to `components/articles/YourTopicArticle.tsx`. Copy the entry in `templates/blueprint/presentation.ts.example` into `data/topics/presentation.ts`, under the new topic ID. These example files are deliberately excluded from application compilation and publishing. Replace every TODO before registering a published article.

The template has eight sections: constraints, first failure, mental model, architecture, experiment, trade-offs and recovery, practice, and related reading. Additional worked examples, runbooks, scaling sections, or career rubrics can be inserted when the topic needs them. Keep the failure-to-decision sequence; do not pad a short topic to match another article’s length.

## Register the content

1. Add the stable ID to `TopicId` and its metadata/route to `topicCatalog` in `data/topics/catalog.ts`. Existing data-driven topics live in `data/topics/production-catalog.ts` and are merged into that catalog.
2. Add a presentation entry in `data/topics/presentation.ts`: a unique publication number, short title, central idea, four concise scenario facts, four journey steps, and the first section ID. Facts must agree with the article and experiment. Label illustrative assumptions clearly.
3. Add the component to `components/articles/registry.ts`. Keep the ID consistent with the catalog and presentation entry.
4. Add its library title, search aliases, and order to `libraryDetails` in `data/library.ts`. The library discovers registered topics automatically; homepage featured IDs are an explicit editorial choice.
5. Add at least five scenario questions to `topicQuizzes` in `data/topics/quizzes.ts`, using the `QuizQuestion` type. Each question needs at least three distinct options, exactly one correct answer, and an explanation for every option. Vary the correct option’s position across the set.

The topic route, quiz route, static parameters, sitemap, and previous/next navigation are generated from the catalog. Do not create a separate route layout for the new topic.

## Use the shared components

- `BlueprintArticleFrame`: supply `topicId`, `toc`, and section content. Optional `brief` holds a longer architecture summary behind a native disclosure.
- `BlueprintSection`: supply the section ID, number, and title once. Each TOC target must resolve to one unique rendered ID.
- `BlueprintPanel kind="diagram"`: place a labeled, responsive architecture visualization in the shared compact diagram container (up to 720px for SVG and 800px for HTML). Align it with the content’s left edge instead of stretching it to prose width. Use contained horizontal scrolling when reducing a dense diagram would make labels unreadable.
- `BlueprintPanel`: contain an interactive client workbench with compact controls and a clear result. The article frame remains a server component; put state in the workbench.
- `BlueprintPanel kind="detail"`: contain a comparison, diagnostics hub, or career rubric.
- `InlineCheck className={neo.conceptCheck}`: use a contextual decision checkpoint. `ArticleQuizEntry` links to the dedicated quiz, so questions do not dominate the reading page.
- `CareerRubricHub initiallyExpanded={false}`: show the rubric while keeping the longer candidate synthesis available on demand.

Use the shared type scale: 16px reading copy, 14px controls/supporting text, labels at least 12px, section headings 22–28px, and a responsive article title. The article layout spans the same outer width as the journey bar. Chapter navigation sits on the left, and the content fills the remaining width; on smaller screens it fills the frame. Paragraphs, headings, code blocks, tables, labs, and quizzes share that responsive content column and aligned outer edges. Diagrams use compact widths instead: SVG panels cap at 720px, HTML diagrams at 800px, and simple illustrations at 640px, all aligned to the left edge of the content. Preserve intrinsic aspect ratios and readable labels; reflow tall diagrams into compact numbered layouts rather than magnifying them. Do not add independent width caps or breakout widths to other body blocks. Keep section gaps at the shared 32–40px. Use solid reading surfaces and restrained hard shadows. The dotted texture belongs to the homepage canvas.

For articles with the same fifteen-section structure as the five data-driven blueprints, `ProductionBlueprintArticle` can still be reused. It already uses the shared frame. Extend its typed data/model support deliberately; do not force a different experiment into an existing lab kind.

## Verify before publication

Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build`. Read the relevant installed Next.js guide in `node_modules/next/dist/docs/` before changing routing or rendering conventions, as required by the root AGENTS.md.

Review the article and quiz in light/dark modes at desktop and mobile widths. Verify every chapter link, the header’s experiment link, quiz submission/next/result behavior, and meaningful workbench state changes. Confirm no horizontal page overflow; local diagram/table scrolling is allowed. Check headings, scenario facts, diagrams, code samples, failure explanations, and sources against the actual content. Leave no TODOs, empty panels, or invented testimonials/metrics in a published page.
