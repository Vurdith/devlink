---
name: start-next-devlink-cycle
description: Start and coordinate a fresh DevLink cleanup cycle with specialist agents. Use when the user asks to run the next cycle, keep improving DevLink, continue the refactor/UI/UX/performance cleanup, spawn fresh agents, integrate specialist branches, verify, and push master.
---

# Start Next DevLink Cycle

Use this skill from the DevLink repo root when the user wants another coordinated cleanup cycle.

## Preconditions

- Confirm the current branch is `master`.
- Confirm `git status --short` is clean before spawning agents.
- Read `AGENTS.md`.
- Use `devlink-git-grandmaster` for integration and publishing.
- Use fresh specialist agents for each cycle.
- Do not keep old specialists alive across cycles unless the user explicitly asks.

## Default Cycle

Spawn focused specialists with non-overlapping ownership:

- Refactor Lead: code quality, flawed logic, duplication, organization, messy modules.
- UI Polisher: visual consistency, shared components, responsive polish.
- UX Auditor: journeys, feedback, empty/loading/error states, action clarity.
- Performance Auditor A: backend/API/query/cache performance.
- Performance Auditor B: client/media/render/layout performance.
- QA Tester: spawn after integration for an independent report when the cycle is broad.

Apply `stop-slop` to the Refactor Lead and both Performance Auditors. Tell them to improve vague names, comments, labels, error text, and docs only inside their assigned scope.

## Specialist Brief Rules

Each specialist brief must include:

- Skill paths to use.
- Repo path.
- A reminder that other agents are working in parallel.
- One branch name under `agent/<role>-<area>-cycle-N`.
- Owned files/modules.
- Explicit avoid-list for other agents' scopes.
- Required checks: `npm run lint`, `npx tsc --noEmit`, and `npm run build` when risk is broad.
- Browser/API smoke expectations for touched routes.
- Required handoff: branch, commit, files changed, summary, checks, routes/APIs checked, risks.

Keep scopes narrow enough that branch conflicts should be rare. If two agents must touch the same surface, sequence them instead of spawning them together.

## Coordination Workflow

1. Run baseline `npm run lint` and `npx tsc --noEmit` on clean `master`.
2. Spawn the specialists.
3. Wait for all handoffs.
4. Treat commit hashes as source of truth because shared worktrees may move branch pointers.
5. Inspect:
   - `git status --short`
   - `git branch --show-current`
   - `git log --oneline --decorate -12`
   - `git branch --list 'agent/*cycle-*' -v`
   - `git worktree list`
6. Switch to `master` only with a clean worktree.
7. Cherry-pick intended commits in dependency-safe order.
8. Resolve conflicts deliberately. Never revert another agent's work to make a pick pass.
9. Run:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `git diff --check origin/master..HEAD`
   - `npm run build`
10. Smoke test touched routes on desktop and mobile with Playwright or the in-app browser.
11. Spawn QA for broad cycles or run the QA pass locally for narrow cycles.
12. Fix any release-blocking QA findings before push.
13. Push `master`.
14. Close the cycle agents after a successful push.

## Final Handoff

Report:

- Commits integrated.
- Checks run.
- Routes/APIs smoked.
- Push result.
- Remaining risks or follow-ups.
- Whether the working tree is clean.

