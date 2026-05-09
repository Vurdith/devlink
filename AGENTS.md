# DevLink Agent Operating Rules

These rules coordinate specialist Codex sessions working on DevLink.

## Core Rule

Specialist agents create focused changes. The DevLink Git Grandmaster integrates and pushes `master`.

Do not push directly to `master` unless the user explicitly assigns you the `devlink-git-grandmaster` role.

## Branches

Specialist agents should work on their own branch:

- `agent/refactor-<area>`
- `agent/ux-<area>`
- `agent/ui-<area>`
- `agent/perf-<area>`
- `agent/security-<area>`
- `agent/release-<area>`
- `agent/qa-<area>`

Examples:

- `agent/refactor-feed`
- `agent/ux-jobs-escrow`
- `agent/ui-profile-surfaces`
- `agent/perf-discover`
- `agent/security-api-routes`

If the agent cannot create a branch, it must leave changes uncommitted and clearly report every changed file.

## Ownership

Keep work scoped. Avoid broad "whole project" edits unless the user explicitly asked for that exact role and scope.

- Refactor Lead: code quality, flawed logic, duplication, organization, server/client boundaries.
- UX Auditor: journey clarity, interaction feedback, empty/loading/error states, mobile usability.
- UI Polisher: visual consistency, shared components, layout, responsive polish.
- Performance Auditor: query shape, caching, rendering cost, feed/discover/profile speed.
- Security Reviewer: auth, authorization, validation, data leaks, uploads, account safety.
- Release Doctor: Vercel, dependency, build, environment, production runtime issues.
- QA Tester: verification, bug reports, screenshots, regression checks.
- Git Grandmaster: integration, conflict resolution, final verification, commit, push.

## Handoff Required

Every specialist agent must end with:

- branch name
- files changed
- summary of behavior/UI/code changes
- commands run
- routes manually checked
- known risks or follow-up work

## Verification Expectations

For code changes, run at least:

```powershell
npm run lint
npx tsc --noEmit
```

For broad UI/API/server changes, also run:

```powershell
npm run build
```

For frontend changes, smoke test affected routes in browser and check:

- no visible error screen
- no horizontal overflow
- no obvious console errors
- mobile layout does not collapse awkwardly

## Conflict Rules

- Never revert another agent's work without explicit user approval.
- If two agents change the same file or flow, report the overlap in the handoff.
- Prefer shared primitives over new one-off UI or server helpers.
- Do not hide failed behavior behind broad catch blocks.
- Do not weaken auth, validation, cache safety, or type safety to make checks pass.

## Grandmaster Integration

The Grandmaster should:

1. Inspect `git status --short`, `git log --oneline -5`, and `git diff --stat`.
2. Review changed files enough to understand risk and ownership.
3. Integrate one specialist branch/batch at a time.
4. Resolve conflicts deliberately.
5. Run lint, typecheck, build, and route smoke checks.
6. Stage only intended files.
7. Commit with clear messages.
8. Push `master`.
