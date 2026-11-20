# Abhyaas VIT · independent 2.0 build

A newly built VIT Pune exam-preparation workspace with course catalog, chapter practice, timed CBT mock tests, analysis, revision notebook, resource kit, verified exam timeline, and an AI-assisted syllabus/PYQ staging studio.

> **Independent repository.** Nothing imports from, deploys to, or connects to the previous Abhyaas VIT project, database, or Vercel application.

## Local start

Requires Node 20+ and Docker.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:setup
npm run dev
```

Visit http://localhost:3000. Sign in with **demo@abhyaasvit.test** / **Demo@2026Abhyaas**, or create an account. Replace `AUTH_SECRET` before production; the demo account is not seeded for production unless explicitly enabled with `ENABLE_DEMO_ACCOUNT=true`. `DATABASE_URL` must be server-only.

## What works

- Session-authenticated student data, personal study preferences, course catalog, original VIT-topic-aligned sample questions, chapter practice and immediate feedback.
- Durable CBT attempts with five palette states, server-enforced deadline, persisted answers/visits/time, MCQ/numerical/program output and rubric-guided descriptive items.
- Results with **15 diagnostic sections**, score and pace, units/COs, weakness flags, answer solutions and recommended drills. **Predicted grades and peer stats are never presented as official without actual cohort data and published rules.**
- Bookmarks with notes/tags, mistake retries, active-recall flashcards, and student-specific study plans.
- Exam Hub with tentative/unverified state until administrator confirms dates; campus, building, room, seat and notice source fields.
- Syllabus Studio: paste text or upload a PDF up to 8MB, structured parse, admin-only non-destructive syllabus sync and schema-validated publication of editor-reviewed practice (AI_DRAFT, not official PYQ). Optional LLM-assisted draft generation with `OPENAI_API_KEY`; no claims of AI output when unconfigured.
- Math/code scratchpad. Python/C/Java execution requires a **separately configured isolated runner**. The website never executes student code in the Next.js server.
- Search, branch/year/semester selector, accessible light/dark theme, responsive academic dashboard.

## Data provenance and limits

VIT Pune official FY 2026–27 source references:
- [Official FY syllabus, user-provided URL](https://www.vit.edu/DESH/wp-content/uploads/2026/10/FYBTech_Syllabus_A.Y2026-27-Revision_2.pdf)
- [Official FY Semester I academic calendar, user-provided URL](https://www.vit.edu/wp-content/uploads/2026/09/SCAN_AC_FIRST_YEAR_AY_26_27_SEM_I.pdf)

During this build both PDFs could not be directly opened by the source reader. The seed uses **user-specified course outlines and original representative questions**, not a claim of line-by-line verification of the PDF. **No dates, room allocations, PYQs, weightages, or actual VIT marking rules have been invented.** All exam rules and official source material require admin verification before marking them official. SY courses are clearly illustrative pending a department-specific official syllabus.

## Security/production checklist

Use a managed PostgreSQL database with TLS and least-privilege credentials; set `AUTH_SECRET` to an unpredictable production secret; provision HTTPS; configure rate limiting and monitoring; review authentication and upload security; leave ENABLE_DEMO_ACCOUNT disabled for production; run a full-browser accessibility and load test. Do not deploy automatically to the previous Vercel project. Admin flag is set only via database administration (not the registration API).

## Structure

- `prisma/schema.prisma`, `prisma/seed.ts`: canonical models and deterministic demo data.
- `app/api/**`: server-authenticated JSON/upload endpoints.
- `app/(workspace)/**`: dashboard and application pages.
- `app/attempt/[id]/**`: distraction-free timed test runner.
- `components/**`: original UI and chart components.
- `lib/**`: authentication, scoring, sample content, analysis, ingestion helpers.

## Publishing imported syllabus and practice questions

1. A student or administrator imports selectable syllabus/PYQ text or a searchable PDF. The import stays a **DRAFT**.
2. Review the extracted units and AI-generated questions for errors. Mark the import **REVIEWED**.
3. An administrator selects the existing target course, optionally syncs the **unit/topic outline without overwriting existing unit titles**, corrects the question JSON, then publishes only questions passing the schema validation.
4. Published questions appear with source `AI_DRAFT` in the practice vault. **They are never relabelled official PYQs.** The real-PYQ verification flow still requires original paper provenance and institutional/rights review.

Suggested validated MCQ fields: `unit`, `type`, `stem`, `options` with A–D IDs, `correctAnswer`, `solution`, `topic`, `concept`, `maxMarks`, and `idealSeconds`. Descriptive questions require a stepwise `rubric`. The admin publishing path is exercised by the Studio acceptance test.

## Engineering boundaries

- The CBT engine keeps answer keys off test attempt responses, enforces deadlines server-side, and blocks instant-practice answer reveal for active-test questions. It is **not** a proctoring or anti-cheat service.
- The dashboard counts answered practice questions and completed CBT answers in daily progress, streaks, and course coverage. Mistake retries include wrong and skipped questions.
- Exam dates, campus rooms, institutional grading boundaries, official question papers, peer percentiles, OCR of scanned PDFs, and a production code-execution sandbox require independently verified data/services and are not silently fabricated.
- Current CI tests include TypeScript, production compilation, isolated PostgreSQL integration, authenticated HTTP API tests, Playwright browser navigation and the administrator publication flow. No GitHub PR is deployed automatically by this repository.
