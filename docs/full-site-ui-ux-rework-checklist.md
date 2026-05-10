# DevLink Full-Site UI/UX Rework Checklist

Goal: bring every DevLink route and reusable UI surface into one premium, consistent, usable product system, while removing generic filler labels and copy.

## Global Rules
- [ ] Use the current DevLink dark product style, theme variables, shared primitives, and single-hue theme system before creating new one-off classes.
- [ ] Remove generic labels and filler copy such as "Feed", "Available", "Coming soon", "seamless", "next-gen", "transform", and vague helper text unless the label is genuinely useful.
- [ ] Keep copy short, specific, and human. Name the user action or object instead of describing the UI itself.
- [ ] Fix hierarchy through spacing, type size, grouping, and contrast before adding glow, blur, shadow, or decorative gradients.
- [ ] Keep all interactive controls at least 44px tall on touch layouts, with visible hover, focus, active, disabled, loading, and empty states.
- [ ] Avoid nested cards, card stacks, random drop shadows, unbounded hero sections, center-aligned filler layouts, and repeated equal card grids.
- [ ] Use Lucide or existing SVG icon language consistently; no emoji as UI icons.
- [ ] Check desktop, tablet, and mobile for every touched route: no overlap, no horizontal overflow, no cramped tap targets.

## Batch 1: Foundations And Shared Primitives
- [x] Audit `src/components/ui/design-system.ts` for surface, icon, menu, active, control, and motion tokens that still encourage old UI. Owner: `agent/ui-settings-shared-primitives`.
- [x] Replace one-off panel/card/button styling with shared primitives where the same UI pattern appears in 3+ places. Owner: `agent/ui-settings-shared-primitives`.
- [x] Normalize modal shell design, motion, scroll locking, focus trap, close placement, and mobile sheet behavior. Owner: `agent/ui-settings-shared-primitives`.
- [x] Normalize tabs/segmented controls across profile, profile hub, reviews, settings, discover filters, jobs filters, and messages. Owners: `agent/ui-settings-shared-primitives`, route agents as consumers.
- [x] Normalize loading skeletons so route loading states use the same density, radius, shimmer, and hierarchy. Owner: `agent/ui-settings-shared-primitives`.
- [x] Create or refine compact empty/error/loading primitives for pages, lists, modals, and inline panels. Owner: `agent/ui-settings-shared-primitives`.
- [ ] Remove stale components that duplicate shared primitives, after confirming no route imports them.
- [ ] Verify lint, typecheck, and representative screenshots for shared component changes.

## Batch 2: Shell, Navigation, Search, And Account Menus
- [x] Rework desktop sidebar spacing, active states, icon rhythm, back control, and responsive collapse. Owner: `agent/ui-shell-auth-landing`.
- [x] Rework top navbar search, auth actions, profile menu, notification entry, and theme logo handling. Owner: `agent/ui-shell-auth-landing`.
- [x] Rework mobile nav and hamburger sheet for clear tap targets, active state clarity, and no duplicated navigation labels. Owner: `agent/ui-shell-auth-landing`.
- [x] Replace generic nav/helper copy with route-specific labels that match user intent. Owner: `agent/ui-shell-auth-landing`.
- [x] Check signed-out and signed-in shell states. Owner: `agent/ui-shell-auth-landing`.
- [x] Smoke test `/`, `/home`, `/discover`, `/jobs`, `/messages`, `/notifications`, `/settings`. Owner: `agent/ui-shell-auth-landing`.

## Batch 3: Public Landing, Auth, Legal, And Verification
- [x] Rework landing hero hierarchy so it sells DevLink’s actual network/product value without generic SaaS filler. Owner: `agent/ui-shell-auth-landing`.
- [x] Rework landing feature/stat/CTA sections to avoid repeated equal cards and vague metrics. Owner: `agent/ui-shell-auth-landing`.
- [x] Tighten login, register, complete signup, reset password, verify, and email-change screens for form labels, inline errors, loading states, and mobile ergonomics. Owner: `agent/ui-shell-auth-landing`.
- [x] Remove filler labels from auth panels and replace vague descriptions with direct instructions. Owner: `agent/ui-shell-auth-landing`.
- [x] Rework privacy/terms shells for readability, table of contents, text rhythm, and mobile scanning. Owner: `agent/ui-shell-auth-landing`.
- [x] Rework verification screens for clear status, requirements, and next actions. Owner: `agent/ui-shell-auth-landing`.
- [x] Smoke test `/`, `/login`, `/register`, `/complete-signup`, `/reset-password`, `/verify`, `/verify-email-change`, `/privacy`, `/terms`, `/verification`. Owner: `agent/ui-shell-auth-landing`.

## Batch 4: Home Feed, Posts, Composer, Polls, And Reviews
- [x] Rework home route composition so the feed and side content have clear priority without generic "Feed" labels. Owner: `agent/ui-feed-posts-reviews`.
- [x] Rework post composer layout, media grid, poll creation, scheduling, attachment previews, and disabled/loading states. Owner: `agent/ui-feed-posts-reviews`.
- [x] Rework post cards, post detail, post actions menu, engagement bar, and reply modal for consistent padding, hierarchy, and tactile feedback. Owner: `agent/ui-feed-posts-reviews`.
- [x] Rework edit/delete/report flows so destructive actions are clear and not visually noisy. Owner: `agent/ui-feed-posts-reviews`.
- [x] Rework polls display and create poll UI for compact reading, vote feedback, and mobile spacing. Owner: `agent/ui-feed-posts-reviews`.
- [x] Rework reviews section, create review modal, sentiment filters, review cards, and empty states. Owner: `agent/ui-feed-posts-reviews`.
- [x] Smoke test `/home`, `/p/[postId]`, `/p/[postId]/analytics`, review sections on profile routes, post composer modals. Owner: `agent/ui-feed-posts-reviews`.

## Batch 5: Profile, Profile Hub, Skills, Portfolio, Network Pages
- [x] Rework public profile header for banner/avatar/bio/profile type/action hierarchy on desktop and mobile. Owner: `agent/ui-profile-network-hub`.
- [x] Rework profile tabs and profile hub tabs to use one shared tab system with consistent active glows. Owner: `agent/ui-profile-network-hub`.
- [x] Rework About tab skills so capabilities feel premium and not like tag spam. Owner: `agent/ui-profile-network-hub`.
- [x] Rework profile media editor, about editor, portfolio editor, portfolio display, and media viewer for consistent controls and clear empty states. Owner: `agent/ui-profile-network-hub`.
- [x] Rework followers/following network pages and profile cards so banners have room, cards align, and labels match discover/profile type display. Owner: `agent/ui-profile-network-hub`.
- [x] Rework profile tooltips and preview cards for compact hierarchy, no cramped banners, and consistent type badges. Owner: `agent/ui-profile-network-hub`.
- [x] Remove generic capability counts and labels that read like generated text. Owner: `agent/ui-profile-network-hub`.
- [x] Smoke test `/u/[username]`, `/u/[username]/followers`, `/u/[username]/following`, `/profile-hub`, `/settings/skills`, portfolio modals. Owner: `agent/ui-profile-network-hub`.

## Batch 6: Discover, Search, Jobs, Escrow, Messages, Notifications, Reports
- [x] Rework discover filters, user cards, profile type labels, empty/error states, and responsive grid rhythm. Owner: `agent/ui-discover-jobs-messages`.
- [x] Rework search results tabs, query states, result cards, and no-results guidance. Owner: `agent/ui-discover-jobs-messages`.
- [x] Rework jobs list/detail/application flows for scanability, CTA clarity, salary/skill display, and mobile layout. Owner: `agent/ui-discover-jobs-messages`.
- [x] Rework escrow dashboard and contract detail surfaces for status hierarchy, milestones, warnings, and action grouping. Owner: `agent/ui-discover-jobs-messages`.
- [x] Rework messages sidebar, thread header, message list, intro state, new message modal, and profile preview card for density and responsiveness. Owner: `agent/ui-discover-jobs-messages`.
- [x] Rework notifications header/list/states for clear grouping, action feedback, and read/unread hierarchy. Owner: `agent/ui-discover-jobs-messages`.
- [x] Rework report page and scam report form for trust, clarity, validation, and submit feedback. Owner: `agent/ui-discover-jobs-messages`.
- [x] Smoke test `/discover`, `/search`, `/jobs`, `/jobs/[jobId]`, `/escrow`, `/messages`, `/messages/[threadId]`, `/notifications`, `/report`. Owner: `agent/ui-discover-jobs-messages`.

## Batch 7: Settings And Account Management
- [x] Rework settings layout/sidebar/content width so each settings route feels intentional in the same shell. Owner: `agent/ui-settings-shared-primitives`.
- [x] Rework appearance theme studio as needed after real-user review. Owner: `agent/ui-settings-shared-primitives`.
- [x] Rework account linking cards, profile type card, messaging settings, notification settings, skills settings, security panels, password strength, reset password, email change, and danger zone. Owner: `agent/ui-settings-shared-primitives`.
- [x] Remove "coming soon" panels unless the route has a real actionable placeholder. Owner: `agent/ui-settings-shared-primitives`.
- [x] Verify auth-required settings states do not feel like generic blockers. Owner: `agent/ui-settings-shared-primitives`.
- [x] Smoke test `/settings`, `/settings/appearance`, `/settings/security`, `/settings/messaging`, `/settings/notifications`, `/settings/skills`. Owner: `agent/ui-settings-shared-primitives`.

## Batch 8: Accessibility, Responsive, Performance, And QA
- [x] Check keyboard navigation for nav, menus, modals, composer, tabs, filters, and settings.
- [x] Check focus visible styles and aria labels for icon-only buttons.
- [x] Check contrast of theme colors in red, yellow, green, blue, indigo, and purple.
- [x] Check reduced-motion behavior for modal transitions, animated backgrounds, and feed interactions.
- [x] Check 375px, 768px, 1024px, 1440px layouts for all main routes.
- [ ] Check modal lag and heavy rerenders after UI changes, especially add skill, portfolio item, composer, review, and message modals.
- [x] Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- [x] Run browser smoke screenshots for every touched route group and record any remaining issues.

## Batch 9: Visible Taste Pass
- [x] Remove the generic landing hero badge and replace the equal proof-card row with a glass DevLink workflow preview.
- [x] Replace the sidebar and mobile menu brand tagline with product-specific wording.
- [ ] Sweep visible route headers for generated-sounding labels that describe the UI instead of the object, person, or action.
- [ ] Revisit high-traffic route padding at 1440px and 390px: landing, home, discover, profile, profile hub, settings, jobs, messages, notifications.
- [ ] Check that major page blocks use clear composition instead of centered content plus repeated equal cards.
- [ ] Tighten button and tab hover/focus/active states where the new visual system has not reached older surfaces.
- [x] Screenshot-check the public landing page on desktop and mobile after the glass hero change.

## Next UI/UX Cycle Candidates
- [ ] Do a dedicated modal-performance pass on add skill, portfolio item, composer, review, new message, report, and media viewer modals.
- [ ] Run authenticated browser screenshots with a seeded account so profile hub, settings skills, messages, notifications, and composer states can be visually checked beyond redirects.
- [ ] Revisit algorithm score UI in a dedicated algorithm redesign cycle, including copy, score breakdown hierarchy, and data trust.
- [ ] Continue slop-copy pass after real screenshots: remove any remaining labels that describe the UI instead of the object or action.

## Current Known Risks
- [?] `public/uploads/005e220c-0ab9-4de7-9706-b2483b9f269e.png` is deleted locally but unrelated to this UI/UX pass. Do not stage it without user confirmation.
- [?] Some authenticated routes may need seeded or existing local session data for complete route screenshots.
- [?] The algorithm score UI needs a later dedicated redesign; during this pass, only fix obvious layout, copy, and theming issues unless the agent owns analytics.
