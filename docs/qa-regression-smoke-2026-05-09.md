# DevLink QA Regression Smoke - 2026-05-09

Branch: `agent/devlink-qa-tester-regression-smoke`

## Summary

Static checks passed and the unauthenticated route smoke set rendered without visible error screens, 5xx responses, or horizontal overflow at desktop `1440x900` and mobile `390x844`.

The first automated pass was blocked by the local site lock and only verified `/site-lock` redirects. A second pass used the same `devlink_site_lock` cookie produced by `/api/site-lock` with the local `.env` password, then verified the real target routes.

## Checks Run

- `npm run lint` - passed
- `npx tsc --noEmit` - passed
- `npm run build` - passed
- Browser smoke via Playwright at desktop `1440x900` and mobile `390x844` - passed with notes below
- In-app browser spot check of `/jobs` after site-lock unlock - passed with notes below

## Routes Checked

- `/home`
- `/discover`
- `/search?q=reece`
- `/u/reeceleneveu`
- `/u/reeceleneveu/followers`
- `/u/reeceleneveu/following`
- `/profile-hub`
- `/settings`
- `/jobs`
- `/messages`
- `/notifications`

## Findings

### P3: Unauthenticated settings and notifications log 401 console errors

Routes:
- `/settings`
- `/notifications`

Steps:
1. Unlock the local site lock.
2. Visit `/settings` or `/notifications` while signed out.
3. Inspect browser console output.

Expected:
- Signed-out states render without noisy console errors, or protected API calls are skipped until authenticated.

Actual:
- Both routes render usable signed-out UI, but the browser logs `Failed to load resource: the server responded with a status of 401 (Unauthorized)`.

Likely area:
- `src/app/(main)/settings`
- `src/app/(main)/notifications`

### P3: Search request can log a failed fetch while navigating away

Route:
- Navigation from `/search?q=reece` to `/u/reeceleneveu`

Steps:
1. Unlock the local site lock.
2. Visit `/search?q=reece`.
3. Navigate to `/u/reeceleneveu`.
4. Inspect browser console output.

Expected:
- In-flight search work is cancelled quietly during navigation.

Actual:
- A console error appeared once: `Search error: TypeError: Failed to fetch`.

Likely file:
- `src/app/(routes)/search/page.tsx`

## Notes

- `/profile-hub` redirects signed-out users to `/login`; this looked intentional.
- `/messages` shows the signed-out empty/auth prompt; this looked intentional.
- `/discover` logs Next.js image optimization warnings for above-the-fold LCP images. No functional failure observed.
- The in-app browser `/jobs` spot check confirmed the page renders through the site lock without visible error UI.
- No saved screenshots were added.

## Known Risks

- No authenticated smoke pass was run, so composer actions, account settings mutations, notifications actions, messaging threads, profile editing, and follow/unfollow flows were not exercised.
- Earlier in the session the checkout briefly pointed at another agent branch. The QA branch was reset back to `master` before this report was staged or committed.
