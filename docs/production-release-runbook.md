# Independent production release runbook — Abhyaas VIT 2.0

Canonical public address: https://www.abhyaasvit.space. The apex https://abhyaasvit.space must redirect permanently to www.

## Source isolation
- Production source: abtknox399/Abhyaasvit2.0, not legacy AbhyaasVIT.
- Provision a separate Vercel Git-linked project and a separate PostgreSQL database. Do not reuse the old project's secrets, data or deployments.

## Authorization blockers (checked 21 November 2026)
- Vercel team AbhyaasVIT refused new project creation with HTTP 403. The owner must authorize the connector and/or grant project creation permission.
- Supabase project creation needs the user to select an organization and approve any nonzero quoted cost. The only existing project is the legacy project and must be left untouched.

## New project configuration
- Next.js App Router; root directory '.', Node 22.x, function region bom1 if available.
- DATABASE_URL: new database connection only, held as encrypted/sensitive project environment variable.
- AUTH_SECRET: unique randomly generated secret of at least 32 characters.
- ENABLE_DEMO_ACCOUNT=false: never deploy predictable demo credentials.
- OPENAI_API_KEY/OPENAI_MODEL optional. Adaptive AI is unavailable without these.
- CODE_RUNNER_ENDPOINT/CODE_RUNNER_API_KEY optional. Never execute student code in the Next.js server process.
- Never place credentials in NEXT_PUBLIC_* or a committed .env file.

## Database initialization
- Apply the reviewed Prisma schema to the NEW empty database; seed original sample courses and questions with NODE_ENV=production and demo account disabled.
- Review migrations before changing any populated database; do not run accept-data-loss.
- Admin role assignment must be done through an audited, server-side process, never from public registration.

## Domain cutover
- Prepare a healthy release with a working new DB and valid AUTH_SECRET BEFORE moving any domain.
- Protect generated deployment .vercel.app addresses and preview URLs with Vercel Deployment Protection.
- Move the verified www and apex project-domain assignments from the paused legacy project to the NEW project.
- Keep www as canonical, redirect apex with 308, and test TLS, redirects, registration, session cookies, CBT, reports and student resources.
- Do not unpause the old project or link old source and database.

## Must-pass release gates
- TypeScript, production Next.js build, Postgres integration, HTTP authentication+CBT smoke and Playwright browser acceptance on exact release SHA.
- Confirm login brute-force throttling, server-side logout revocation and cross-origin mutation rejection.
- Confirm email verification and password recovery plan before broad public enrollment: current custom auth does not yet include these.
- Publish only verified VIT exam dates and legally reusable/author-owned notes and PDFs.

## Quizrr reference
- The private Quizrr website blocked direct authenticated inspection from current tools; do not imply user-account access.
- Its public feature descriptions are benchmarked in docs/quizrr-benchmark-2026.md. Inspect private UI using an authorized supported browser session; catalogue document metadata and permission settings, not wholesale copyrighted content.