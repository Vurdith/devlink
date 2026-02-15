# Quality Audit Framework (V3.0)

> **Purpose**: A systematic, production-grade audit checklist for the DevLink codebase. Designed for high-reasoning AI models to catch defects, eliminate waste, and enforce engineering standards across every layer of the stack.

---

## How to Use

Run `/qa full` to trigger this framework. The AI will:

1. **Audit** — Systematically walk through each phase, reading relevant files and checking compliance.
2. **Report** — Surface violations with file paths, line numbers, and severity (Critical / Warning / Info).
3. **Fix** — Automatically resolve issues where the fix is unambiguous. Propose options where trade-offs exist.
4. **Verify** — Re-check after fixes to confirm zero regressions.

You can also run individual phases: `/qa perf`, `/qa security`, `/qa types`, etc.

---

## Phase 1: Performance (Core Web Vitals + Runtime)

### 1.1 Largest Contentful Paint (LCP) — Target < 1.2s
- [ ] Hero images use `priority` prop on `next/image` with correct `sizes` attribute.
- [ ] Fonts loaded with `next/font` (no external Google Fonts stylesheet).
- [ ] Critical CSS inlined; no render-blocking third-party scripts in `<head>`.
- [ ] Server Components used by default; `"use client"` only where interactivity is required.
- [ ] Database queries in Server Components avoid N+1 patterns (use `include`/`select` in Prisma).

### 1.2 Interaction to Next Paint (INP) — Target < 200ms
- [ ] Event handlers offload heavy work with `useTransition` or `startTransition`.
- [ ] No synchronous `JSON.parse` / `JSON.stringify` on large payloads in the render path.
- [ ] Modals, dropdowns, and pickers are lazy-loaded (`React.lazy` / dynamic imports).
- [ ] `useMemo` / `useCallback` used correctly (not over-applied; only where re-renders are measured).

### 1.3 Cumulative Layout Shift (CLS) — Target 0
- [ ] All images and media have explicit `width`/`height` or use `fill` with a sized container.
- [ ] Skeleton/placeholder states match final layout dimensions.
- [ ] Web fonts declare `font-display: swap` with matched fallback metrics.
- [ ] Dynamic content (toasts, banners) inserts below the fold or uses `position: fixed`.

### 1.4 Bundle Hygiene
- [ ] No duplicate libraries (e.g., multiple date libs, multiple icon sets).
- [ ] Heavy libraries listed in `optimizePackageImports` in `next.config.ts`.
- [ ] Route-level code splitting verified — no single chunk > 200KB gzipped.
- [ ] `next build` output reviewed for unexpected page sizes.
- [ ] Tree-shaking confirmed for barrel exports (no full-library imports).

### 1.5 Runtime Performance
- [ ] Lists > 50 items use virtualization (`react-window` or similar).
- [ ] Debounced inputs (search, typing indicators) use 300-500ms delays.
- [ ] Supabase realtime subscriptions cleaned up on unmount (no leaked channels).
- [ ] No `useEffect` with missing/wrong dependency arrays causing infinite loops.
- [ ] Redis/Upstash caching applied to expensive or frequently-hit API routes.

---

## Phase 2: Security Hardening

### 2.1 Authentication
- [ ] All API routes validate session via `getAuthSession()` (not `getServerSession` directly in Next.js 16).
- [ ] JWT secrets are strong (min 32 chars), rotated periodically, never committed to git.
- [ ] Session cookies use `Secure`, `HttpOnly`, `SameSite=Lax` flags.
- [ ] OAuth callback URLs are explicitly whitelisted (no open redirects).
- [ ] Password hashing uses bcrypt with cost factor >= 12.

### 2.2 Authorization
- [ ] Every mutation API route checks ownership (`userId === resource.ownerId`).
- [ ] Admin-only routes verify role server-side, never trust client-sent roles.
- [ ] Message threads verify membership before allowing read/write.
- [ ] File uploads validate user identity and apply rate limiting.
- [ ] Escrow contract operations verify both parties' authorization.

### 2.3 Input Validation & Injection
- [ ] All API request bodies validated with Zod schemas (type + length + format).
- [ ] User-generated content sanitized before rendering (XSS prevention).
- [ ] SQL injection prevented via Prisma parameterized queries (no raw SQL with string interpolation).
- [ ] File uploads validate MIME type server-side (not just file extension).
- [ ] Upload size limits enforced both client-side and server-side (5MB max).

### 2.4 Headers & Transport
- [ ] `Strict-Transport-Security` header set with `max-age=63072000; includeSubDomains`.
- [ ] `X-Content-Type-Options: nosniff` present on all responses.
- [ ] `X-Frame-Options: DENY` prevents clickjacking.
- [ ] Content-Security-Policy restricts inline scripts and untrusted origins.
- [ ] CORS configured to allow only trusted origins (not `*` in production).
- [ ] API responses include `Cache-Control: no-store` for authenticated data.

### 2.5 Secrets Management
- [ ] `.env` is in `.gitignore` — never committed.
- [ ] No API keys, tokens, or secrets hardcoded in source files.
- [ ] `NEXT_PUBLIC_` prefix used only for truly public values (never secrets).
- [ ] Database connection strings use SSL in production.

---

## Phase 3: Type Safety & Code Quality

### 3.1 TypeScript Strictness
- [ ] `strict: true` in `tsconfig.json` (includes `strictNullChecks`, `noImplicitAny`).
- [ ] No `any` types — use `unknown` with type narrowing, or explicit interfaces.
- [ ] API response types defined in `src/types/` and shared between client/server.
- [ ] Prisma-generated types used directly (no manual re-typing of models).
- [ ] Union types preferred over `string` for known values (e.g., `"PENDING" | "ACCEPTED"`).

### 3.2 Code Hygiene
- [ ] No dead code: unused imports, unreachable branches, commented-out blocks.
- [ ] No deprecated API usage (check Next.js 16, React 19, Prisma 7 changelogs).
- [ ] Functions under 50 lines; files under 400 lines (extract components/utils if larger).
- [ ] Consistent naming: `camelCase` variables, `PascalCase` components, `UPPER_SNAKE` constants.
- [ ] No `console.log` in production code (use structured logging or Sentry).

### 3.3 Error Handling Patterns
- [ ] `try/catch` in every `async` function with meaningful error messages.
- [ ] API routes return proper HTTP status codes (400, 401, 403, 404, 500).
- [ ] Client-side fetches handle non-200 responses gracefully (not just `.json()` blindly).
- [ ] `safeJson()` utility used consistently for parsing API responses.
- [ ] Error boundaries wrap page-level and feature-level component trees.

---

## Phase 4: Database & Data Integrity

### 4.1 Prisma Best Practices
- [ ] All queries use `select` or `include` to fetch only needed fields (no full-model fetches).
- [ ] Relation filters avoid `some`/`every` on PostgreSQL adapter (use direct table queries).
- [ ] `@unique` and `@@unique` constraints match application-level uniqueness rules.
- [ ] Indexes exist on all foreign keys and frequently-queried columns.
- [ ] `onDelete: Cascade` used appropriately (e.g., user deletion cascades to posts).

### 4.2 Migrations
- [ ] `prisma migrate deploy` runs cleanly — no pending or failed migrations.
- [ ] Schema changes are backward-compatible (no column drops without migration steps).
- [ ] Seed data exists for development (`prisma/seed.ts`).

### 4.3 Transaction Safety
- [ ] Multi-step mutations wrapped in `prisma.$transaction()`.
- [ ] Escrow operations (create, submit, release) use atomic transactions.
- [ ] Follow/unfollow + notification creation are atomic.
- [ ] Optimistic UI updates are rolled back on server failure.

### 4.4 Query Performance
- [ ] No N+1 queries (e.g., looping `findFirst` inside a `map` — use batch queries).
- [ ] Pagination uses cursor-based approach for large datasets (not `skip/take` for deep pages).
- [ ] Connection pooling configured (PgBouncer / Supabase pooler).
- [ ] Expensive aggregations cached in Redis with TTL.

---

## Phase 5: UX & Design Quality

### 5.1 Zero-Slop Standards
- [ ] No placeholder text: "Coming Soon", "Lorem ipsum", "TODO", empty states without purpose.
- [ ] No non-functional buttons or links (every clickable element does something).
- [ ] Loading states are meaningful (skeletons match content shape, not generic spinners everywhere).
- [ ] Error states provide actionable guidance (not just "Something went wrong").
- [ ] Empty states guide users toward the next action (CTAs, not just "Nothing here").

### 5.2 Visual Consistency
- [ ] CSS variables used for all colors (`--color-accent`, `--color-bg`, etc.) — no hardcoded hex.
- [ ] Spacing follows a consistent scale (Tailwind defaults: 4px increments).
- [ ] Typography scale is limited and intentional (not random `text-[13px]` everywhere).
- [ ] Borders, shadows, and opacity levels are consistent across similar components.
- [ ] Gradient buttons use `from-[var(--color-accent)] to-[var(--color-accent-hover)]` site-wide.

### 5.3 Responsive Design
- [ ] All layouts tested at 320px, 768px, 1024px, 1440px, and 1920px widths.
- [ ] Touch targets minimum 44x44px on mobile.
- [ ] No horizontal scroll on any viewport.
- [ ] Mobile navigation (bottom nav) doesn't overlap content.
- [ ] Fixed/sticky elements account for safe areas (`env(safe-area-inset-*)`, `100dvh`).

### 5.4 Accessibility (a11y)
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative).
- [ ] Focus indicators visible on all interactive elements.
- [ ] Keyboard navigation works for modals (focus trap), dropdowns, and forms.
- [ ] Color contrast ratios meet WCAG 2.1 AA (4.5:1 for text, 3:1 for UI components).
- [ ] `aria-label` on icon-only buttons; `role` attributes on custom widgets.
- [ ] Screen reader announcements for dynamic content (toast notifications, form errors).

### 5.5 Animations & Motion
- [ ] Animations respect `prefers-reduced-motion` media query.
- [ ] No animation blocks interaction (user can click/type during transitions).
- [ ] Duration < 300ms for micro-interactions; < 500ms for page transitions.
- [ ] `will-change` used sparingly (only on elements that actually animate).

---

## Phase 6: API Design & Consistency

### 6.1 Route Conventions
- [ ] REST naming: plural nouns (`/api/posts`, `/api/messages/threads`).
- [ ] HTTP methods match intent: `GET` reads, `POST` creates, `PATCH` updates, `DELETE` removes.
- [ ] Query params for filtering/pagination; request body for creation/mutation data.
- [ ] Consistent response shape: `{ data, error, pagination }` across all endpoints.

### 6.2 Error Responses
- [ ] 400 for validation failures (include field-level error details).
- [ ] 401 for unauthenticated requests.
- [ ] 403 for unauthorized actions (authenticated but not permitted).
- [ ] 404 for missing resources.
- [ ] 429 for rate-limited requests (include `Retry-After` header).
- [ ] 500 for unexpected server errors (log to Sentry, return generic message to client).

### 6.3 Rate Limiting
- [ ] Auth endpoints rate-limited (login, register, password reset).
- [ ] Upload endpoints rate-limited per user.
- [ ] Search/discovery endpoints rate-limited to prevent scraping.
- [ ] Rate limits use sliding window (Redis/Upstash).

---

## Phase 7: Real-Time & State Synchronization

### 7.1 Supabase Realtime
- [ ] Channels scoped to specific resources (e.g., `messages:threadId`).
- [ ] Subscriptions cleaned up on component unmount (`channel.unsubscribe()`).
- [ ] Reconnection handled gracefully (Supabase client auto-reconnects).
- [ ] New messages deduplicated before adding to state (check `id` existence).

### 7.2 State Consistency
- [ ] Optimistic updates revert on failure with user notification.
- [ ] Multi-tab sync via `BroadcastChannel` or `storage` events for critical state (session, theme).
- [ ] Stale data detection: refetch on window focus for time-sensitive data.
- [ ] Cache invalidation: mutating endpoints clear relevant cached queries.

---

## Phase 8: Media & File Handling

### 8.1 Uploads
- [ ] Client-side: file type + size validation before upload attempt.
- [ ] Server-side: MIME type validation, virus/malware scanning consideration.
- [ ] Uploaded to S3/R2 with unique filenames (UUID-based, no user-supplied names).
- [ ] CDN delivery via `cdn.devlink.ink` with proper cache headers.
- [ ] Progress indicators shown during upload.

### 8.2 Image Optimization
- [ ] All user images served via `next/image` with `sizes` attribute.
- [ ] Avatar components use consistent sizing (32, 48, 64, 84px).
- [ ] Banner images lazy-loaded with blur placeholder.
- [ ] GIF/video files render correctly in message bubbles and posts.

---

## Phase 9: SEO & Discoverability

### 9.1 Metadata
- [ ] Every page has unique `<title>` and `<meta name="description">`.
- [ ] `generateMetadata()` used in dynamic routes (profiles, posts, jobs).
- [ ] `robots.txt` and `sitemap.xml` generated and accurate.
- [ ] Canonical URLs set to prevent duplicate content issues.

### 9.2 Social Sharing
- [ ] Open Graph tags (`og:title`, `og:description`, `og:image`) on all public pages.
- [ ] Twitter/X card tags (`twitter:card`, `twitter:image`) configured.
- [ ] OG images are 1200x630px with readable text at small sizes.

### 9.3 Structured Data
- [ ] JSON-LD for user profiles (`Person` schema).
- [ ] JSON-LD for job listings (`JobPosting` schema).
- [ ] JSON-LD for portfolio items (`CreativeWork` schema).

---

## Phase 10: Observability & Monitoring

### 10.1 Error Tracking (Sentry)
- [ ] Sentry initialized in both client and server environments.
- [ ] Source maps uploaded to Sentry for readable stack traces.
- [ ] Custom context attached to errors (userId, route, request data).
- [ ] Performance monitoring enabled (transaction tracing).
- [ ] Alert rules configured for error spikes.

### 10.2 Logging
- [ ] No sensitive data in logs (passwords, tokens, PII).
- [ ] Structured logging format (JSON) for machine parsing.
- [ ] Log levels appropriate: `error` for failures, `warn` for degraded state, `info` for events.
- [ ] No `console.log` in production — use Sentry breadcrumbs or a logging library.

---

## Phase 11: Testing Strategy

### 11.1 Unit Tests (Vitest)
- [ ] Utility functions in `src/lib/` have test coverage.
- [ ] Permission logic (`canSendMessage`, auth helpers) tested with edge cases.
- [ ] Prisma queries tested with mocked client or test database.
- [ ] Tests run in CI before merge (when CI is set up).

### 11.2 Integration Tests
- [ ] API routes tested with real HTTP requests (supertest or similar).
- [ ] Auth flows tested end-to-end (register, login, session, logout).
- [ ] File upload tested with actual file payloads.

### 11.3 Manual Smoke Tests
- [ ] **The Mutation Test**: Change profile data -> verify it updates in header, profile page, settings, and message threads.
- [ ] **The Multi-Tab Test**: Actions in Tab A (send message, follow user) reflect in Tab B.
- [ ] **The Mobile Test**: Full flow on actual mobile device (not just DevTools responsive mode).
- [ ] **The Offline Test**: Graceful degradation when network drops mid-action.
- [ ] **The Fresh User Test**: Sign up as new user -> verify onboarding, empty states, and first actions work.

---

## Phase 12: Developer Experience

### 12.1 Setup & Documentation
- [ ] `README.md` has clear setup instructions (clone, install, env setup, seed, run).
- [ ] `.env.example` exists with all required variables (no secrets, just keys).
- [ ] `npm run dev` starts cleanly without manual steps.
- [ ] Seed script populates enough data for meaningful local development.

### 12.2 Code Organization
- [ ] Feature code co-located: route + components + hooks in same directory.
- [ ] Shared utilities in `src/lib/`, shared components in `src/components/`.
- [ ] No circular imports (verify with build output).
- [ ] Import aliases (`@/`) used consistently (no relative `../../../` imports).

### 12.3 Git Hygiene
- [ ] Commits are atomic (one logical change per commit).
- [ ] Commit messages follow conventional format (`feat:`, `fix:`, `refactor:`, `chore:`).
- [ ] No large generated files committed (build output, node_modules, .next).
- [ ] `.gitignore` covers all generated/sensitive files.

---

## Phase 13: Legal & Compliance

- [ ] Privacy Policy page exists and covers data collection, storage, and sharing.
- [ ] Terms of Service page exists and is linked during registration.
- [ ] Cookie consent mechanism if required by jurisdiction.
- [ ] User data export capability (GDPR right to data portability).
- [ ] Account deletion fully removes or anonymizes user data.
- [ ] Third-party services (Sentry, Supabase, S3) comply with data processing requirements.

---

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **Critical** | Security vulnerability, data loss risk, or broken core functionality | Fix immediately |
| **Warning** | Performance issue, UX degradation, or best practice violation | Fix before next deploy |
| **Info** | Code style, minor optimization, or future improvement | Track for next sprint |
