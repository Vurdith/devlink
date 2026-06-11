# DevLink Agent Operating Rules

These rules guide the default Codex session working on DevLink.

## Core Rule

Work as a single focused agent by default. Use additional specialist agents only when the user explicitly asks for them.

Keep changes scoped to the request. Avoid broad "whole project" edits unless the user explicitly asks for that scope.

After making changes, commit and push the working branch whenever verification passes and repository access allows it. If commit or push is not possible, leave the changes uncommitted and clearly report why.

## Branches

Use a focused branch for changes:

- `codex/<area>`

Examples:

- `codex/feed-cleanup`
- `codex/jobs-escrow-ui`
- `codex/profile-surfaces`
- `codex/discover-performance`

If a branch cannot be created, leave changes uncommitted and clearly report every changed file.

## Ownership

Handle the requested work end to end: understand the relevant code, make focused changes, verify them, commit, push, and report the outcome. If the task spans multiple disciplines, cover only the parts needed for the request unless the user asks for a broader pass.

If the user asks for additional agents, give each one a narrow scope and require a clear handoff before integrating their work.

## UI/UX Skill Requirements

Whenever handling any UI or UX task, use both of these skills before making changes:

- `redesign-existing-projects`: apply the existing-product redesign workflow for UI/UX audits, visual hierarchy, alignment, responsive polish, states, and targeted browser QA.
- `gpt-taste`: apply the product UI taste rules for premium UX judgment, anti-slop cleanup, exact alignment, interaction quality, and targeted visual QA.

For small UI/UX fixes, use the compact checklist paths from both skills and keep the edit scoped. For substantial UI/UX changes, follow their planning and browser QA guidance.

## Commit and Push Expectations

Commit and push the working branch after completing changes when possible:

1. Verify the working tree contains only intended changes.
2. Run the required checks for the scope of the work.
3. Stage only intended files.
4. Commit with a clear message.
5. Push the branch to `origin`.

If verification fails, commit is inappropriate, or push access is unavailable, report the changed files and the blocker in the handoff.

## Final Report Required

Every work session must end with:

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
