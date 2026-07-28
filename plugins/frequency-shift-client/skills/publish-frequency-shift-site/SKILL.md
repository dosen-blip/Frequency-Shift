---
name: publish-frequency-shift-site
description: Test, commit, push, publish, monitor, and verify Frequency Shift website changes through the repository's existing OpenAI Sites project. Use when the user says update the website, make it live, publish, push, deploy, undo a live change, asks whether a change is live, or when a Sites deployment or public verification needs diagnosis or recovery.
---

# Publish Frequency Shift Site

Complete the full path from verified source to verified public result. A local build, commit, push, saved version, or non-terminal deployment is never sufficient alone.

## Publication Boundary

- Publish after a concrete requested change unless the user says preview, draft, show me first, save only, or do not publish.
- For a preview, do not commit, push, save a Sites version, or deploy.
- Publish only task-owned changes.
- Also use `$coordinate-frequency-shift-git`.

## Release Workflow

1. Run repository preflight and classify every changed path.
2. Inspect the exact task diff.
3. Run:

   ```sh
   git diff --check
   npm run lint
   npm test
   ```

   Or use:

   ```sh
   node plugins/frequency-shift-client/skills/publish-frequency-shift-site/scripts/release-preflight.mjs --full
   ```

4. Inspect affected routes visually at phone and computer widths when appearance changed.
5. Fetch and reconcile current `origin/main`.
6. Stage explicit task paths only.
7. Commit with a visible-result message.
8. Push normally according to repository policy.
9. Read `.openai/hosting.json` and reuse the exact `project_id`.
10. Use Sites to push the exact committed source state.
11. Save a version with that commit SHA.
12. Deploy only the saved version.
13. Inspect deployment status until terminal.
14. Open the production URL and verify the requested result on each affected route.
15. Confirm links and media involved in the request.

The Sites project ID is opaque. Copy it exactly from `.openai/hosting.json`; never derive or replace it.

## Live Verification

Use Sites/browser inspection for visual confirmation. The packaged HTTP checker can provide an additional deterministic check:

```sh
node plugins/frequency-shift-client/skills/publish-frequency-shift-site/scripts/verify-live.mjs \
  https://frequency-shift-ottawa.hydrogenyoga.chatgpt.site/ \
  --path /events \
  --contains "Upcoming"
```

Use the current production URL returned by Sites when it differs from repository documentation.

## Recovery

Read `references/release-recovery.md` before retrying a failed deployment, diagnosing a live mismatch, or undoing a release.

Fix forward when safe. If a task caused a serious public regression, create a targeted revert commit, test it, publish it, and verify it. Never reset shared history.

## Completion Language

Say "live" only when:

1. The intended commit is on the correct GitHub history.
2. The matching saved Sites version deployed successfully.
3. The public URL shows the requested result.

If any condition fails, state what is verified, what is not, and one next action in plain English.
