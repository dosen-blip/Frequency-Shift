# Git Conflict and Push Recovery

## Rejected Push

1. Do not force.
2. Fetch `origin`.
3. Compare the task commit with current `origin/main`.
4. If remote work is compatible, replay the task commit onto current `origin/main`.
5. Resolve only task-related mechanical conflicts.
6. Rerun lint, tests, diff checks, and visual checks.
7. Push normally.

## Dirty Worktree

Classify every changed path:

- Current task
- Known collaborator work
- Unknown

If unrelated or unknown work exists, do not stage, stash, commit, or discard it. Isolate the new task in a temporary branch or worktree from `origin/main`.

## Semantic Conflict

A semantic conflict exists when both versions are technically valid but express different facts, copy, design direction, ticket destination, or content priority.

Keep both safe. Ask a single choice in visitor-facing language. Do not ask the client how to merge branches.

## Mechanical Conflict

Mechanical conflicts can usually be resolved without interruption:

- Both sides add different imports
- Both sides add distinct event records
- Both sides add compatible tests
- Formatting moved lines around unchanged intent
- CSS additions affect separate selectors

After resolving, inspect the combined rendered behavior. A clean conflict marker is not proof the merge is correct.

## Safe Rollback

If an already published task must be undone:

1. Identify the exact task commit.
2. Create a new revert commit for only that task.
3. Resolve any later compatible work forward.
4. Verify.
5. Publish the new commit.

Do not rewrite shared history.
