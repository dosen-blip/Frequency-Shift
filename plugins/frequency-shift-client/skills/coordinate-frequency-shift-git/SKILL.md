---
name: coordinate-frequency-shift-git
description: Safely coordinate Frequency Shift website changes with GitHub and other collaborators by inspecting repository state, isolating task-owned work, synchronizing remote changes, resolving routine conflicts, staging precisely, committing, and pushing without exposing Git jargon to non-technical clients. Use before any commit or live publication and whenever the worktree is dirty, origin/main changed, a push is rejected, conflicts occur, branches differ, or multiple people may be editing the site.
---

# Coordinate Frequency Shift Git

Protect every collaborator's work while moving one verified website change onto the current shared history.

## Start With Evidence

Run:

```sh
node plugins/frequency-shift-client/skills/coordinate-frequency-shift-git/scripts/repo-preflight.mjs
git fetch origin
```

Inspect status, task-owned files, staged files, unresolved entries, branch, HEAD, `origin/main`, and remotes. Never assume a clean tree or current remote.

## Isolation Choice

- Clean worktree on current `main`: fast-forward to `origin/main`, implement, verify, stage exact paths, and commit.
- Existing changes all belong to the current task: continue carefully and stage exact paths.
- Existing unrelated or uncertain changes: preserve them and create a temporary branch or worktree from current `origin/main` for the new task.
- Unresolved merge or rebase already in progress: diagnose that state before starting new work. Do not layer another operation on top.

Do not use stashing as a casual hiding place for someone else's work. If a temporary stash is truly required, name it clearly, record it, restore it, and verify it before completion.

## Stage and Commit

1. Review the exact diff.
2. Run required checks.
3. Stage only explicit task-owned paths with `git add -- <paths>`.
4. Confirm `git diff --cached --name-only`.
5. Commit with a short visible-result message.
6. Fetch again if remote movement is plausible.
7. Integrate onto current remote history.
8. Rerun checks after conflict resolution or history replay.
9. Push normally.

Never use `git add .` or `git add -A` around unrelated work.

## Conflict Rule

Resolve mechanical conflicts internally when both intended results are clear. Examples: import order, adjacent CSS rules, test-list additions, or compatible record additions.

If the conflict is a real human choice, keep both versions safe and ask one plain-English question:

> Someone else changed the same event description. I kept both versions safe. Should the live page use [short version A] or [short version B]?

Read `references/conflict-recovery.md` before resolving a rejected push, divergent history, or conflict.

## Prohibited Actions

- Never force-push `main`, including `--force-with-lease`.
- Never use `git reset --hard`, `git clean`, or destructive checkout on unknown work.
- Never discard, overwrite, or silently absorb unrelated changes.
- Never claim that a push made the site live.
