# DevLink

DevLink is a professional network for Roblox developers, clients, studios, and creators. It combines creator profiles, portfolios, social posting, private messaging, jobs, escrow-style contracts, verification, reviews, notifications, and search.

## Stack

| Area | Technology |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| Data | PostgreSQL via Prisma 7 |
| Auth | NextAuth 4 with credentials and OAuth providers |
| Storage | S3-compatible object storage, Cloudflare R2-friendly |
| Cache / rate limits | Upstash Redis, Redis, or in-memory fallback |
| Observability | Sentry, custom performance metrics |
| Tests | Vitest, Playwright, k6 load-test scripts |
| Hot paths | Optional Rust service under `services/rust` |

## Project Map

```text
src/
  app/                 Next.js pages, layouts, API routes, metadata routes
  components/          Shared UI, feed, profile, portfolio, layout, providers
  hooks/               Client hooks for realtime, messages, toasts, performance
  lib/                 Shared utilities, validation, ranking, parsing, pagination
  server/              Server-only auth, database, cache, storage, events, services
  types/               Shared TypeScript API and domain types

prisma/
  schema.prisma        Main data model
  migrations/          Database migrations
  seed-skills.ts       Skill seed script

services/rust/         Optional hot-path service
e2e/                   Playwright tests
loadtests/             k6 load tests
docs/                  Setup, QA, and production notes
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
copy .env.example .env
```

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Apply or push the schema to your local database:

```bash
npx prisma db push
```

5. Start the app:

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js with Turbopack on port 3000 |
| `npm run build` | Generate Prisma client and build production app |
| `npm start` | Start the production server |
| `npm test` | Run Vitest unit tests |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright tests |
| `npm run test:load` | Run k6 smoke load test |
| `npm run tunnel` | Expose local app with Cloudflare tunnel |

## Environment Notes

Required for normal development:

- `DATABASE_URL`
- `DIRECT_URL` when using a direct local/development connection
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Common optional services:

- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, plus any enabled provider credentials
- Redis: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or `REDIS_URL`
- Storage: S3/R2 credentials such as `S3_ENDPOINT`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- Sentry: `SENTRY_DSN`

The app has fallbacks for some local services, but production should use managed PostgreSQL, Redis, object storage, and real secrets.

## Verification Baseline

Before shipping a cleanup or feature change, run:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

For UI-sensitive work, also run the relevant Playwright spec or manually verify the affected route in a browser.

## Notes For Future Cleanup

- Keep shared post response shaping in server helpers instead of copying engagement logic between API routes.
- Avoid build-time database work unless the route is intentionally static.
- Keep docs tied to `package.json`; this repo has had dependency upgrades without matching README updates before.
- Prefer small, verified refactors. The app has a broad surface area, and most regressions here will come from inconsistent API response shapes rather than single obvious syntax errors.
