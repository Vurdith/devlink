# DevLink UI Layout Rework Checklist

Goal: work through DevLink route by route and remove the "AI-generated slop" feeling by improving layout quality, visual taste, UX flow, information hierarchy, and route-specific composition without reducing auth, validation, accessibility, or type safety.

## Priority Order

1. P0: Shared shell, navigation, layout primitives, loading/error/empty states. Fix the frame before polishing individual rooms.
2. P1: Core logged-in workflows: `/home`, `/discover`, `/search`, `/u/[username]`, `/me`, `/profile-hub`, `/messages`, `/messages/[threadId]`, `/notifications`.
3. P2: Marketplace and trust workflows: `/jobs`, `/jobs/[jobId]`, `/escrow`, `/verification`, `/verify`, `/report`.
4. P3: Content detail workflows: `/p/[postId]`, `/p/[postId]/analytics`, `/hashtag/[hashtag]`, followers/following lists.
5. P4: Public and lower-frequency surfaces: `/`, auth pages, settings pages, legal/static pages, menus, modals, toasts.

## Cycle 11 Integrated Layout Pass

- [x] Added shared app shell/page-frame primitives and route-aware navigation states.
- [x] Reworked `/home` into a feed workspace with a distinct feed lane, composer placement, side rail, and matching loading geometry.
- [x] Reworked `/discover` and `/search` into denser exploration/search flows with stronger filter/result hierarchy and route-specific empty states.
- [x] Reworked public profile, reviews tab deep-linking, followers, and following layouts around identity, credibility signals, compact network rows, and cleaner tab context.
- [x] Verified the integrated batch with `npm run lint`, `npx tsc --noEmit`, `npm run build`, and production route smoke checks at desktop and mobile widths.
- [ ] Continue the layout rework on `/profile-hub`, `/messages`, `/notifications`, `/jobs`, `/escrow`, settings, auth, modals, menus, and post/detail routes.
- [ ] Add authenticated owner-state screenshots for `/home`, `/profile-hub`, `/u/[username]`, composer/modal flows, and settings once seeded login smoke is available.

## Agent Ownership

- [ ] UI layout lead owns route composition, spacing rhythm, page density, visual hierarchy, responsive layout, and anti-slop review.
- [ ] UX journey lead owns user intent per route, primary/secondary actions, empty/error copy, onboarding friction, and workflow clarity.
- [ ] Shared primitives/refactor agent owns reusable shells, page headers, tab bars, side panels, cards, forms, list rows, skeletons, and shared modal/menu primitives.
- [ ] QA screenshot tester owns desktop and mobile route screenshots, horizontal overflow checks, console error checks, keyboard/focus smoke checks, and screenshot diff notes.
- [ ] Performance auditor is pulled in when layout changes affect virtualized feeds, heavy media grids, messaging threads, profile tabs, or discover/search result rendering.

## Cross-Cutting Anti-Slop Rules

- [ ] For every route, define the route's real job in one sentence before changing layout; remove sections that do not serve that job.
- [ ] Replace generic stacked card pages with route-specific compositions: feed lanes, conversation panes, profile identity bands, job detail/task flows, settings forms, or legal reading layout.
- [ ] Avoid repetitive icon-card grids unless the user is genuinely choosing among peer actions; convert filler grids into grouped controls, tables, lists, timelines, or inline guidance.
- [ ] Reduce nested panels: no card inside card inside bordered region unless each layer has a distinct interaction or scroll boundary.
- [ ] Use deliberate page rhythm: visible primary area, supporting sidebar/rail only where useful, consistent section spacing, and clear start/end points.
- [ ] Make hierarchy obvious without relying on glow, gradients, or large shadows; use scale, alignment, whitespace, contrast, and content priority first.
- [ ] Keep decorative glow/drop shadow effects restrained and purposeful; flag any route where effects compete with data or actions.
- [ ] Remove filler labels and vague copy such as "powerful", "seamless", "next-level", "all-in-one", "unlock", or repeated marketing adjectives from product workflows.
- [ ] Make primary actions visually and spatially obvious; demote secondary actions into menus, quiet buttons, or contextual areas.
- [ ] Ensure every empty/loading/error state gives a useful next step, not just a centered icon and generic sentence.
- [ ] Design mobile intentionally instead of letting desktop columns collapse into a long stack of similar panels.
- [ ] Do not introduce new one-off components when an existing shared primitive can be strengthened and reused.
- [ ] Keep route-specific imagery/media real and inspectable; avoid purely atmospheric placeholders for product, profile, post, or job content.
- [ ] Every route pass includes desktop, tablet, and mobile checks for overflow, clipped controls, repeated headings, awkward vertical gaps, and action placement.

## Batch 0: Route Inventory And Baseline Capture

Done means future agents know exactly what exists, what screenshots prove, and which routes need authentication, seed data, or mocked states.

- [ ] Confirm every current page route from `src/app`: `/`, `/login`, `/register`, `/complete-signup`, `/reset-password`, `/verify-email-change`, `/home`, `/discover`, `/search`, `/u/[username]`, `/u/[username]/followers`, `/u/[username]/following`, `/me`, `/profile-hub`, `/messages`, `/messages/[threadId]`, `/notifications`, `/jobs`, `/jobs/[jobId]`, `/escrow`, `/verification`, `/verify`, `/report`, `/p/[postId]`, `/p/[postId]/analytics`, `/hashtag/[hashtag]`, `/settings`, `/settings/appearance`, `/settings/messaging`, `/settings/notifications`, `/settings/security`, `/settings/skills`, `/privacy`, and `/terms`.
- [ ] Add any discovered hidden surfaces from client-only tabs, modals, drawers, command menus, dropdowns, and post composer states to this checklist before implementation starts.
- [ ] Capture baseline screenshots for each route at 1440x1000, 1024x768, 390x844, and one narrow height case such as 390x640.
- [ ] Record route state requirements: logged out, logged in with empty account, logged in with populated feed/profile/jobs/messages, owner profile, non-owner profile, and error/404 cases.
- [ ] Mark routes where test data is missing and create QA seed notes instead of designing against impossible empty mocks.
- [ ] Create a screenshot naming convention such as `cycle-10-ui-layout/<route>/<viewport>/<state>.png`.
- [ ] Run a baseline horizontal overflow check on every meaningful route and note any route where `document.documentElement.scrollWidth > window.innerWidth`.

## Batch 1: Shared App Shell, Navigation, And Page Frame

Done means the whole application frame feels designed once, routes sit inside it cleanly, and mobile/desktop navigation support the user's next action.

- [ ] Audit `src/components/layout/AppShell.tsx` for max width, padding, top spacing, bottom spacing, and landing-page exceptions; define when routes should be full-width, narrow, or multi-column.
- [ ] Replace one-size-fits-all route containers with named layout primitives such as narrow form, reading page, feed with rail, two-pane workspace, and detail page.
- [ ] Verify authenticated pages do not inherit landing-specific spacing, hero behavior, or excessive vertical padding.
- [ ] Audit `Sidebar`, `Navbar`, `MobileNav`, `NavbarSearch`, and `ProfileMenu` for repeated actions, unclear active states, cramped labels, and inconsistent icon/button sizing.
- [ ] Make active navigation state obvious on desktop sidebar and mobile nav without oversized pills or noisy glow.
- [ ] Ensure mobile nav does not cover primary actions, message composers, forms, or bottom sheet controls.
- [ ] Define a shared page header pattern with optional title, context label, primary action, tabs, filters, and compact metadata.
- [ ] Ensure page headers are not generic title cards; headers should connect to the route's workflow and current state.
- [ ] Review global background treatment and remove effects that make dense work surfaces feel like a marketing page.
- [ ] Verify skip link/focus path reaches main content and that fixed nav does not trap keyboard focus.
- [ ] Screenshot verify `/home`, `/messages`, `/jobs`, `/settings`, and `/` after shell changes on desktop and mobile.

## Batch 2: Shared Primitives, States, And Interaction Surfaces

Done means route teams can improve layout without inventing new visual vocabulary every time.

- [ ] Inventory repeated cards, panels, tabs, list rows, stat blocks, toolbars, forms, filter bars, and empty states across `src/components` and route files.
- [ ] Define when to use a card, row, table-like list, split pane, timeline, inline editor, modal, drawer, or full page.
- [ ] Refactor generic "icon plus title plus description" blocks into domain-specific primitives where repeated across discover, settings, profile hub, verification, and jobs.
- [ ] Establish compact, default, and spacious density variants for lists and panels so routes can avoid identical card stacks.
- [ ] Strengthen `FeedbackState`, `LoadingSpinner`, skeletons, toasts, and error boundary presentation with route-aware actions and stable dimensions.
- [ ] Make loading states match final layout geometry for feed, profile, messages, jobs, settings, and post detail instead of using generic centered spinners.
- [ ] Ensure error states offer retry, back, report, or navigation actions appropriate to the route.
- [ ] Ensure empty states show the next productive action and avoid filler copy or isolated decorative icons.
- [ ] Audit modals (`BaseModal`, post edit/reply/delete, portfolio media) for focus trap, close affordance, mobile fit, scroll boundaries, and action hierarchy.
- [ ] Audit dropdowns/menus (`ProfileMenu`, `PostActionsMenu`, nav search suggestions) for anchor alignment, destructive action treatment, touch target size, and overflow clipping.
- [ ] Audit toasts for stacking, timing, color contrast, action affordance, and whether they obscure mobile controls.
- [ ] Verify shared primitive changes with screenshot states on `/home`, `/u/[username]`, `/messages/[threadId]`, `/jobs/[jobId]`, `/settings/security`, and a modal-heavy post composer flow.

## Batch 3: Landing Root `/`

Done means the public first viewport communicates DevLink clearly, feels specific to a developer social/work marketplace, and does not look like a generic AI SaaS landing page.

- [ ] Audit `src/app/page.tsx` plus landing sections for hero hierarchy: brand/product should be immediately clear, with supporting copy carrying the value prop.
- [ ] Replace vague feature-card rhythm with a composition tied to actual DevLink workflows: profile credibility, feed activity, jobs, messaging, escrow, and verification.
- [ ] Ensure the first viewport hints at the next section on desktop and mobile instead of becoming a sealed hero poster.
- [ ] Reduce generic network/glow effects if they overpower product evidence or make the page feel template-generated.
- [ ] Add real product surface previews or concrete workflow snippets where possible instead of abstract icon grids.
- [ ] Make logged-in and logged-out CTA placement distinct and useful; logged-in users should be guided back into their next app task.
- [ ] Verify mobile hero text does not overlap background detail, CTAs, or subsequent content.
- [ ] Screenshot verify `/` logged out and logged in at desktop and mobile.

## Batch 4: Auth And Account Entry

Done means auth pages are calm, trustworthy, and task-focused rather than decorative SaaS splash screens.

- [ ] Audit `/login` for a narrow, readable form layout with clear primary path, OAuth/passkey alternatives, password reset access, and error placement.
- [ ] Audit `/register` for field grouping, username validation feedback, password requirements, legal consent placement, and no overwhelming two-column marketing filler.
- [ ] Audit `/complete-signup` for progressive information hierarchy: required identity steps first, optional profile enrichment second, clear save/continue affordances.
- [ ] Audit `/reset-password` for single-task clarity, success confirmation, resend/retry affordance, and mobile keyboard ergonomics.
- [ ] Audit `/verify-email-change` for status clarity, expired-token handling, and a direct path back to settings or login.
- [ ] Ensure auth error states do not shift layout or hide recovery actions below the fold.
- [ ] Verify all auth pages at 390px width with browser autofill, validation errors, and long email addresses.
- [ ] Screenshot verify `/login`, `/register`, `/complete-signup`, `/reset-password`, and `/verify-email-change`.

## Batch 5: Home Feed `/home`

Done means the home screen feels like a focused product workspace with a credible feed, not a stack of generic panels.

- [ ] Define the core above-the-fold job of `/home`: compose, scan feed, resume conversations/jobs, or discover updates; layout should prioritize that job.
- [ ] Audit composer placement, collapsed/expanded states, media attachments, polls, validation, and submit feedback for spatial stability.
- [ ] Rework feed item hierarchy so author, post content, media, actions, replies, and metadata are easy to scan without repeated decorative framing.
- [ ] Avoid identical card rhythm between composer, posts, suggestions, and side panels; each should have distinct purpose and density.
- [ ] Audit side rail content for usefulness; remove or demote generic stats/prompts that do not affect the next user action.
- [ ] Ensure virtualized and non-virtualized feed layouts share the same spacing and state treatment.
- [ ] Strengthen feed empty state for new users with follow/search/post actions, not just a blank feed message.
- [ ] Strengthen feed loading skeleton to preserve composer and feed geometry.
- [ ] Verify infinite scroll/load-more states do not create duplicate spacing, jumpy layout, or hidden controls.
- [ ] Screenshot verify `/home` with populated feed, empty feed, loading state, composer expanded, composer validation error, and mobile view.

## Batch 6: Discover And Search `/discover`, `/search`

Done means discovery feels like purposeful exploration with strong filtering and result hierarchy, not a generic grid of recommendation cards.

- [ ] Audit `/discover` for clear sections such as people, posts, projects, jobs, skills, or trending topics; each section needs a reason to exist.
- [ ] Replace repeated icon/stat cards with scannable result rows, featured modules, or ranked/trending lists where appropriate.
- [ ] Make filter/search controls visually connected to results and sticky only if they remain useful while scrolling.
- [ ] Define empty, no-results, loading, partial-results, and error states for discover data.
- [ ] Audit `/search` for query-first layout, tab/filter hierarchy, result type switching, and result snippets that explain why each item matched.
- [ ] Ensure long queries, no query, and zero results have distinct states and useful recovery actions.
- [ ] Verify search suggestions and navbar search do not conflict with the full search route.
- [ ] Ensure mobile discover/search keeps filters usable without creating a tall pre-results wall.
- [ ] Screenshot verify `/discover`, `/search?q=react`, `/search` empty query, no-results state, and mobile filters.

## Batch 7: Profile Routes `/u/[username]`, `/me`, Followers, Following

Done means profile pages feel like credible developer identities and social surfaces, not a banner plus repeated card modules.

- [ ] Audit public profile header for identity hierarchy: avatar, name, handle, role, verification, relationship action, availability, location, links, and credibility signals.
- [ ] Ensure owner and visitor variants have distinct primary actions: edit/profile hub for owner, follow/message/hire/report for visitor.
- [ ] Rework profile tabs so posts, replies, reposts, liked, portfolio, reviews, skills, and activity are visually connected to the profile story.
- [ ] Remove repeated stat-card layouts where counts can live in header metadata or compact tab labels.
- [ ] Make profile media, portfolio, and pinned content feel curated instead of auto-stacked.
- [ ] Audit `/me` as a route: decide whether it redirects, mirrors owner profile, or becomes an edit/profile dashboard; avoid duplicate ambiguous layouts.
- [ ] Audit `/u/[username]/followers` and `/u/[username]/following` for list density, follow-back actions, relationship labels, search/filter, empty states, and back navigation.
- [ ] Handle blocked/private/missing-user states with clear layout and next actions.
- [ ] Verify long names, long bios, many links, missing avatar, verified state, and unverified state.
- [ ] Screenshot verify `/u/[username]` owner, `/u/[username]` visitor, `/me`, `/u/[username]/followers`, `/u/[username]/following`, empty tab, loading state, and mobile profile header.

## Batch 8: Profile Hub `/profile-hub`

Done means profile editing and optimization feels like a guided working area, not a dashboard of generic improvement cards.

- [ ] Define whether `/profile-hub` is for profile editing, completion, analytics, portfolio management, or all of these; give each job a clear region.
- [ ] Replace broad recommendation cards with a prioritized checklist or workflow queue tied to actual profile completeness and user goals.
- [ ] Make edit actions open the right form or route directly; avoid cards that only describe capabilities.
- [ ] Group profile media, skills, availability, portfolio, social links, and verification into meaningful sections with obvious save states.
- [ ] Ensure incomplete, complete, and error states are visibly different.
- [ ] Verify mobile flow does not require excessive scrolling to reach the current edit task.
- [ ] Screenshot verify `/profile-hub` for incomplete profile, mostly complete profile, validation error, and mobile.

## Batch 9: Messages `/messages`, `/messages/[threadId]`

Done means messaging behaves like a real communication workspace with clear conversation hierarchy and stable composer behavior.

- [ ] Audit `/messages` layout for conversation list, selected/empty thread panel, requests/invites, search, unread state, and mobile list-to-thread transition.
- [ ] Audit `/messages/[threadId]` for participant header, message grouping, timestamp rhythm, read receipts, attachment/media treatment, and composer affordance.
- [ ] Ensure two-pane desktop layout has deliberate column widths and no card-within-card conversation nesting.
- [ ] Ensure mobile thread view gives users a clear back path to conversation list and keeps composer reachable above mobile nav/keyboard.
- [ ] Replace generic empty thread states with actions such as choose a conversation, search people, or review message requests.
- [ ] Handle blocked users, deleted accounts, loading history, failed send, offline/retry, and permission states.
- [ ] Verify long messages, code snippets, media attachments, many short messages, and empty conversation list.
- [ ] Screenshot verify `/messages`, `/messages/[threadId]` desktop, mobile conversation list, mobile thread, empty inbox, failed send, and loading state.

## Batch 10: Notifications `/notifications`

Done means notifications are triageable, grouped, and actionable instead of a vertical list of similar cards.

- [ ] Audit notification list density, grouping by time/type, unread emphasis, mark-read controls, and per-item actions.
- [ ] Make notification item hierarchy clear: actor, action, target content, timestamp, status, and next action.
- [ ] Avoid over-framing each notification; use rows with subtle dividers where scanning matters.
- [ ] Provide useful empty state with discovery/feed/profile actions.
- [ ] Provide loading and error states that preserve list geometry.
- [ ] Verify mobile bulk actions and filters do not crowd the header.
- [ ] Screenshot verify `/notifications` with unread items, all-read state, empty state, loading state, and mobile.

## Batch 11: Jobs `/jobs`, `/jobs/[jobId]`

Done means jobs feel like a credible marketplace with scannable listings, clear application flow, and strong detail-page composition.

- [ ] Audit `/jobs` for search/filter placement, listing density, featured/saved/applied states, and whether cards or rows best support scanning.
- [ ] Ensure job metadata hierarchy is clear: title, company/client, budget/rate, skills, location/remote, deadline, trust signals, and status.
- [ ] Avoid repeated large cards when a compact list plus detail preview would better serve browsing.
- [ ] Make job empty/no-results states guide users to adjust filters, save search, or create/post work if supported.
- [ ] Audit `/jobs/[jobId]` layout for primary content, application CTA, client/trust rail, related jobs, and escrow/payment context.
- [ ] Make application state transitions clear: not applied, draft, submitted, accepted/rejected, closed, own job.
- [ ] Verify mobile detail page keeps apply/save actions reachable without covering content.
- [ ] Screenshot verify `/jobs` populated, filtered no-results, `/jobs/[jobId]` open job, closed job, own job, application flow, loading state, and mobile.

## Batch 12: Escrow `/escrow`

Done means escrow reads as a trust-and-money workflow with clear state, risk, and next action.

- [ ] Define the route's primary user states: no contracts, active client contract, active freelancer contract, pending milestone, disputed, completed.
- [ ] Replace generic dashboard cards with workflow-specific contract rows, milestone timeline, balance/status summary, and primary action area.
- [ ] Make money amounts, due dates, funding status, release/submit actions, and dispute warnings visually precise.
- [ ] Ensure destructive or financial actions have clear confirmation, disabled state reason, and success/failure feedback.
- [ ] Avoid decorative glow around financial state; use calm trust-oriented hierarchy.
- [ ] Verify empty escrow state explains how escrow is reached from jobs/messages and what to do next.
- [ ] Screenshot verify `/escrow` empty, active contract, milestone submission, release confirmation, disputed state, loading state, and mobile.

## Batch 13: Verification `/verification`, `/verify`

Done means verification feels trustworthy and procedural, with no generic badge-marketing clutter.

- [ ] Audit `/verification` for status-first layout: current status, required steps, submitted evidence, review timeline, and support/report path.
- [ ] Ensure form steps are grouped by what the user must provide, with clear privacy/security reassurance near sensitive fields.
- [ ] Make pending, approved, rejected, expired, and resubmission states visually distinct and actionable.
- [ ] Audit `/verify` public/token route for concise status, expired/invalid handling, and safe navigation back to profile or login.
- [ ] Remove generic benefits cards unless tied to a concrete verification decision.
- [ ] Verify mobile file upload, long document names, validation errors, and status history.
- [ ] Screenshot verify `/verification` unstarted, pending, approved, rejected, `/verify` valid, `/verify` invalid, and mobile.

## Batch 14: Report `/report`

Done means reporting is clear, calm, and safe, with strong progressive disclosure.

- [ ] Audit `/report` for report type selection, target context, evidence/details, review expectations, and submission confirmation.
- [ ] Replace large generic category cards with a focused selection pattern that supports quick scanning and serious intent.
- [ ] Ensure sensitive reporting copy is specific and does not sound like filler trust-and-safety language.
- [ ] Make validation errors, missing target states, and success states clear without pushing users into unrelated content.
- [ ] Verify mobile form flow, keyboard behavior, long text input, and confirmation page/state.
- [ ] Screenshot verify `/report` default, validation error, submitted state, prefilled target state if supported, and mobile.

## Batch 15: Posts, Post Detail, Analytics, And Hashtag

Done means content detail routes support reading, engagement, and insight without feeling like stretched feed cards.

- [ ] Audit `/p/[postId]` for detail-page hierarchy: original post, author context, media, replies, related content, and engagement actions.
- [ ] Avoid simply centering a feed card on a blank page; create a detail composition with context and reply flow.
- [ ] Ensure missing/deleted/private post states give clear explanation and back/search actions.
- [ ] Audit `/p/[postId]/analytics` for metric hierarchy, time range controls, engagement breakdown, referrers/audience if present, and interpretation notes.
- [ ] Replace generic stat cards in analytics with purposeful groupings, charts, tables, and insight summaries.
- [ ] Audit `/hashtag/[hashtag]` for hashtag identity, trend context, post feed, related hashtags, follow/save if supported, and empty state.
- [ ] Ensure hashtag pages do not duplicate discover/search composition without route-specific value.
- [ ] Verify long posts, media-only posts, polls, reposts, deleted authors, analytics zero-data state, and mobile.
- [ ] Screenshot verify `/p/[postId]`, `/p/[postId]/analytics`, `/hashtag/[hashtag]`, missing post, analytics empty, hashtag empty, loading state, and mobile.

## Batch 16: Settings `/settings/*`

Done means settings are predictable, low-drama, and dense enough for repeated use.

- [ ] Audit `/settings` overview for whether it should be an index, redirect, or summary dashboard; avoid generic category cards if direct navigation is better.
- [ ] Audit settings layout/sidebar for current section visibility, mobile section switching, save state, and unsaved-change handling.
- [ ] Audit `/settings/appearance` for theme controls, preview behavior, reset action, and no decorative overreach.
- [ ] Audit `/settings/messaging` for permission/privacy controls, request handling, blocked/muted states, and immediate feedback.
- [ ] Audit `/settings/notifications` for channel grouping, frequency, quiet hours if present, granular toggles, and bulk actions.
- [ ] Audit `/settings/security` for password, two-factor, passkeys, sessions, email change, danger zone, and risk hierarchy.
- [ ] Audit `/settings/skills` for skill editing density, suggestions, validation, and how it connects to profile/discover/jobs.
- [ ] Ensure forms align labels, inputs, descriptions, errors, and buttons consistently without excessive card wrapping.
- [ ] Verify long labels, many toggles, validation errors, disabled states, loading save, success toast, and mobile.
- [ ] Screenshot verify `/settings`, each settings child route, unsaved changes state, validation error, danger zone confirmation, and mobile.

## Batch 17: Legal And Static Pages `/privacy`, `/terms`

Done means legal pages are readable and trustworthy, not treated like generic marketing sections.

- [ ] Audit `LegalPageShell` and legal pages for reading width, heading rhythm, table-of-contents behavior, last-updated placement, and anchor link usability.
- [ ] Remove unnecessary cards, glow, or promotional components from legal reading surfaces.
- [ ] Ensure legal pages have clear navigation back to app/home and consistent footer/header treatment.
- [ ] Verify mobile reading comfort, long headings, anchor jumps under fixed nav, and print/readability basics.
- [ ] Screenshot verify `/privacy` and `/terms` desktop and mobile.

## Batch 18: Loading, Error, Not Found, And Empty States

Done means non-happy paths feel designed for the exact route and never expose a generic placeholder as the main experience.

- [ ] Inventory every `loading.tsx` and decide whether it matches the final page geometry for that route.
- [ ] Add missing loading states for high-latency pages where the default transition feels blank or jumpy.
- [ ] Inventory route-level error and not-found behavior; add route-specific states where missing.
- [ ] Replace centered spinner-only states on feed, messages, jobs, profile, verification, and escrow with structured skeletons or meaningful progress states.
- [ ] Ensure every empty state names what is empty, why it might be empty, and the next useful action.
- [ ] Verify empty states never use the same generic icon-card treatment across unrelated routes.
- [ ] Test slow network simulation for `/home`, `/discover`, `/messages`, `/jobs`, `/u/[username]`, and `/p/[postId]`.
- [ ] Screenshot verify route-specific loading, error, not found, and empty states in both desktop and mobile where applicable.

## Batch 19: Responsive And Accessibility QA

Done means layout polish survives real viewport constraints and basic assistive technology use.

- [ ] Check all target routes at 1440, 1280, 1024, 768, 430, 390, and 360px widths.
- [ ] Verify no horizontal overflow, clipped focus rings, clipped dropdowns, inaccessible fixed-position controls, or hidden primary actions.
- [ ] Verify text does not overlap inside buttons, tabs, cards, stat blocks, nav items, or modals with long labels/data.
- [ ] Verify mobile layouts avoid endless same-looking panels by changing composition, collapsing rails intentionally, or using tabs/drawers.
- [ ] Keyboard test nav, search, composer, modal close, dropdown menus, settings forms, message composer, and report/verification forms.
- [ ] Check focus order follows visual order after any multi-column layout changes.
- [ ] Check headings are meaningful and do not repeat multiple H1-like route titles in the same viewport.
- [ ] Check reduced-motion behavior for animated landing, feed transitions, menus, and skeletons.
- [ ] Check color contrast for subdued text, borders, disabled controls, badges, and destructive actions.
- [ ] Document any known accessibility issues that require deeper component refactors.

## Batch 20: Verification Commands And Handoff Standard

Done means each route batch ends with evidence, not vibes.

- [ ] For documentation-only checklist edits, run a markdown/file sanity check and `git diff --check`.
- [ ] For UI/layout implementation batches, run `npm run lint`.
- [ ] For UI/layout implementation batches, run `npx tsc --noEmit`.
- [ ] For broad shared shell or route primitive changes, run `npm run build`.
- [ ] For frontend implementation batches, run browser smoke checks on affected routes and capture screenshots at desktop and mobile.
- [ ] Record checked routes, viewports, account state, screenshots, failed states, and known data limitations in the agent handoff.
- [ ] Confirm no broad unrelated files were changed and no other agent's work was reverted.
- [ ] End every specialist pass with branch name, files changed, summary, commands run, routes manually checked, known risks, and follow-up work.

## Open Questions For First Implementation Cycle

- [?] Which seeded users, jobs, posts, conversations, contracts, and verification states should become the canonical UI screenshot dataset?
- [?] Should `/me` remain a distinct route, redirect to `/u/[username]`, or become the owner-focused profile workspace?
- [?] Should discover and search remain separate route experiences, or should one become the full workflow and the other a focused entry state?
- [?] Should jobs and escrow share a trust/workflow rail primitive for payment, milestone, client, and freelancer state?
- [?] Should settings use a shared form section primitive with sticky save controls across all child routes?
