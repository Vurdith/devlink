# DevLink QA Regression Follow-Up - 2026-05-09

Branch: `agent/qa-regression-followup`

Base observed before branching: `agent/ui-messages-polish` at `283b2f8 Refactor profile page data loading`

## Summary

Static checks passed. The requested route smoke set rendered successfully at desktop `1440x900` and mobile `390x844` with no visible error screen, no page crash, no failed browser requests, and no horizontal overflow detected.

This was an unauthenticated smoke pass. Authenticated mutations and account-only interactions were not exercised.

## Checks Run

- `npm run lint` - passed
- `npx tsc --noEmit` - passed
- `npm run build` - passed
- Headless Playwright route smoke at desktop `1440x900` - passed with warnings below
- Headless Playwright route smoke at mobile `390x844` - passed with warnings below

## Routes Checked

- `/home`
- `/discover`
- `/search?q=reece`
- `/u/reeceleneveu`
- `/u/reeceleneveu/followers`
- `/u/reeceleneveu/following`
- `/jobs`
- `/escrow`
- `/messages`
- `/notifications`
- `/settings`
- `/profile-hub`

## Findings

### P3: Discover still logs image LCP warnings

Routes:
- `/discover`

Viewports:
- Desktop
- Mobile

Steps:
1. Visit `/discover`.
2. Inspect console warnings.

Expected:
- Above-the-fold profile media should avoid avoidable LCP warnings.

Actual:
- Next.js warns that above-the-fold images were detected as Largest Contentful Paint candidates without eager loading.

Likely area:
- `src/app/(main)/discover`
- profile/discover card image rendering

### P3: Local cache connectivity warnings appear during smoke

Routes observed:
- `/discover`
- `/home`

Viewports:
- Desktop
- Mobile

Steps:
1. Visit `/discover` or `/home`.
2. Inspect console warnings.

Expected:
- Local smoke should either connect to cache cleanly or degrade quietly.

Actual:
- Console warnings report that Upstash Redis cache is being disabled temporarily due to a connectivity error.

Likely area:
- cache helper / Upstash Redis integration

Notes:
- This did not block rendering or cause failed page requests in the browser pass.

### P3: Profile hub redirects to login with framework warnings

Route:
- `/profile-hub`

Viewports:
- Desktop
- Mobile

Steps:
1. Visit `/profile-hub` while signed out.
2. Observe redirect to `/login`.
3. Inspect console warnings.

Expected:
- Redirect behavior is fine, but login should avoid avoidable framework warnings.

Actual:
- `/profile-hub` redirects to `/login`, which appears intentional for signed-out users.
- The login page logs:
  - Next.js smooth scroll behavior warning.
  - Next.js image aspect-ratio warning for `/logo/logo-purple.png`.

Likely area:
- `src/app/(auth)/login`
- global document scroll behavior

## Notes

- `/messages`, `/notifications`, and `/settings` render signed-out prompts cleanly.
- `/jobs` and `/escrow` render signed-out calls to action cleanly.
- `/u/reeceleneveu/followers` and `/u/reeceleneveu/following` render without horizontal overflow after the recent network-card changes.
- No screenshots were saved because the automated smoke did not find a visual or runtime failure requiring capture.

## Known Risks

- No authenticated session was available for this pass, so composer posting, follow/unfollow, profile editing, settings saves, message threads, notifications actions, job applications, and escrow mutations were not tested.
- This QA branch was created from the current checked-out agent branch, not directly from `master`, because the worktree was already on `agent/ui-messages-polish` when QA began.
- The smoke pass reused the running local server on `localhost:3000`; it did not start a fresh isolated dev server.
