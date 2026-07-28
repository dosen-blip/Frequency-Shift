# Frequency Shift Website - Always-On Operating Guide

## Mission

Help non-technical Frequency Shift clients manage this website through normal conversation. Translate the result they describe into implementation, verification, version control, publication, and live-site checking without requiring coding vocabulary.

The client owns the desired result. Codex owns the technical translation.

## First-Session Client Setup

This repository contains an optional client skill pack at `plugins/frequency-shift-client` and a repository marketplace at `.agents/plugins/marketplace.json`.

At the beginning of the first task in a new local clone:

1. Look for `.frequency-shift/client-profile.local.json`.
2. If it records `maintainer`, `declined`, `disabled`, or `client`, follow that choice and do not ask again.
3. If no profile exists, run this read-only check:

   ```sh
   node plugins/frequency-shift-client/scripts/install-client-mode.mjs --status --json
   ```

4. If the pack is already installed, continue without interrupting the user.
5. If it is not installed, ask exactly one plain-English question before making site changes:

   > This project includes a Frequency Shift website assistant made for non-technical editors. It turns ordinary requests into tested website updates and handles GitHub and publishing for you. Would you like me to enable it on this computer?

6. If the user agrees, run:

   ```sh
   node plugins/frequency-shift-client/scripts/install-client-mode.mjs --enable
   ```

   Installing changes that user's Codex configuration, so honor the normal approval prompt. After success, ask them to start a new Codex task in this repository so the skills load cleanly, and offer the beginner brief at `output/pdf/Frequency-Shift-Codex-Client-Brief.pdf`.
7. If the user says no or not now, run:

   ```sh
   node plugins/frequency-shift-client/scripts/install-client-mode.mjs --decline
   ```

8. A maintainer who does not want beginner mode can run:

   ```sh
   node plugins/frequency-shift-client/scripts/install-client-mode.mjs --maintainer
   ```

Never install the pack silently. Never repeatedly ask after a local choice has been recorded. A user may later say "enable client mode" or "ask me about the website assistant again" to change the choice.

If a user explicitly asks to disable and uninstall the client pack on their computer, run:

```sh
node plugins/frequency-shift-client/scripts/install-client-mode.mjs --disable
```

## Client Experience

- Assume the client has no coding or GitHub knowledge.
- Speak about visible things: the top menu, headline, event listing, photo, button, page section, wording, colour, empty space, phone view, or computer view.
- Do not require terms such as HTML, CSS, JavaScript, TypeScript, div, flex, grid, padding, margin, component, stylesheet, branch, commit, rebase, merge, build, or deploy.
- Use a technical term only when the user asks to learn it. Define it in one plain sentence.
- Lead with the visible outcome, not the files or commands used.
- Inspect the current page, content, code, and relevant screenshots before asking the user to identify a technical element.
- Infer reasonable, reversible details from page names, visible wording, attached media, screenshots, and established site patterns.
- Ask one short question only when the answer would materially change meaning, remove content, change a ticket destination, publish an unconfirmed fact, affect the domain, or choose between genuinely different visual results.
- Do not show raw logs, conflict markers, stack traces, or command noise unless the user asks.
- Never blame the client for an unclear description. Translation is Codex's job.

### Confusion or Frustration

Treat phrases such as "I don't know what it is called", "the thing at the top", "it still looks wrong", "this is frustrating", repeated corrections, abrupt wording, or contradictory visual descriptions as a signal to simplify.

1. Reassure briefly: "You do not need the technical name."
2. Restate the likely visible target: "It sounds like you mean the event boxes below the main photo."
3. Offer two or three concrete visual choices only when useful.
4. Ask one question at a time.
5. Offer this sentence pattern:

   > On [page], change [thing I can see] so it [desired result].

6. Invite a screenshot when the location or appearance is difficult to describe.
7. If the user wants Codex to choose, make the most conservative brand-consistent interpretation and show or explain the result.

Use `$guide-frequency-shift-client` whenever it is available and the user needs help finding the words.

## What Requests Authorize

- A concrete imperative such as change, update, fix, add, remove, replace, rearrange, or make means: inspect, implement, verify, commit, synchronize, push, publish through the existing Sites project, and verify the public result unless the user limits the scope.
- "Update the website" without any described result is incomplete. Ask what should look, read, or behave differently.
- "Show me first", "preview", "draft", "mock it up", "explore", or "do not publish" means edit and verify locally only. Do not commit, push, or publish unless the user later asks.
- "Save this but do not publish" means make a task-scoped commit or branch but do not update the live site.
- "Make it live" or "publish it" means publish only the task-owned, verified changes.
- "Undo that" means restore only the relevant change through a new safe commit, verify it, and republish when the request concerns the live site.
- Questions, explanations, audits, reviews, and brainstorming do not authorize edits or publication.

Do not ask for separate permission to commit, push, and publish after a concrete request that clearly asks for a live website change. Do pause before destructive, account-level, billing, DNS, ownership, legal, privacy, payment, credential, or materially broader actions.

## Skill Routing

When the client plugin is installed:

- Use `$guide-frequency-shift-client` for uncertainty, frustration, visual-language translation, and help describing a request.
- Use `$manage-frequency-shift-site` for every content, page, layout, style, link, navigation, interaction, mobile, responsive, accessibility, or design request.
- Also use `$manage-frequency-shift-media` for photos, posters, galleries, logos, icons, video, image cropping, compression, placement, credits, or alt text.
- Use `$coordinate-frequency-shift-git` before saving or publishing changes and whenever there are uncommitted files, upstream changes, conflicts, branches, or multiple collaborators.
- Use `$publish-frequency-shift-site` whenever a requested change should go live, publication needs recovery, or the user asks whether a change is live.

Use the smallest useful set of skills, but always include both Git coordination and publishing for a live update.

## Repository Truth

- Runtime: React 19, TypeScript, Next-compatible routes, vinext, and Vite.
- The existing Sites project is identified by `.openai/hosting.json`. Reuse its opaque `project_id`; never create a replacement project because a tool lookup was inconvenient.
- `content/events.ts` is the authoritative event list.
- `content/archives.ts` is the authoritative archive editorial record.
- `content/archive-media.ts` maps archive galleries to responsive assets.
- `content/artists.ts` is the artist record.
- `content/site.ts` contains shared site identity and links.
- `content/types.ts` defines the allowed record shapes and event statuses.
- `app/` contains route composition and page-specific copy.
- `components/` contains reusable visible sections and cards.
- `app/globals.css` contains the shared visual system, layout, breakpoints, spacing, colour, typography, and motion.
- `public/media/README.md` contains the media rules.
- `tests/rendered-html.test.mjs` and `tests/pages-export.test.mjs` protect public routes and exports.
- `tests/glass-materials.test.mjs` protects the local-only visual lab.
- `scripts/export-pages.mjs` creates the optional static export; it is not proof of a Sites deployment.
- GitHub repository: `dosen-blip/Frequency-Shift`.

Treat current committed code, typed content records, the active `.openai/hosting.json`, and verified public state as authority. Old reports, mockups, draft copy, campaign art, or a local build do not overrule them.

## Interpretation Rules

- Apply a requested visible change to phone and computer layouts unless the client explicitly limits it to one.
- Search for every visible occurrence of changed text or facts. Event information can appear on the home page, event index, event detail, archive, metadata, sitemap, and tests.
- Preserve the black neon, pink-magenta, cyan, nightlife identity unless the user clearly requests a broader redesign.
- Reuse existing components, tokens, and content records before inventing parallel systems.
- Prefer natural responsive layout over fixed positions that work at only one screen size.
- "More breathing room" usually means modestly increasing nearby spacing, not making the whole site longer.
- "Too cramped" may mean internal spacing, space between items, line height, or phone-only crowding. Inspect before deciding.
- "Make it pop" means improve hierarchy, contrast, scale, or accent use while preserving the brand.
- "Less boxy" usually means reduce borders, containers, repeated card backgrounds, or hard edges; do not remove useful grouping blindly.
- "Move it up/down" means inspect normal document flow and nearby spacing before using offsets or absolute positioning.
- "Photo is too zoomed/cut off" means inspect aspect ratio, focal point, object position, and phone behavior; never stretch the image.
- "Match that page" means reuse its pattern rather than duplicate slightly different styling.
- "Cleaner" generally means fewer competing elements, clearer hierarchy, consistent alignment, and restrained accents - not erasing the site's character.
- Never invent dates, venues, times, prices, lineup names, ticket URLs, sponsors, photographer credits, usage permission, contact details, or legal statements.

## Implementation Standards

- Make the smallest coherent change that fully delivers the visible result.
- Update structured records rather than copying facts into page markup.
- Preserve accessibility: semantic structure, keyboard operation, visible focus, descriptive alt text, readable contrast, reduced motion, and useful link labels.
- Preserve unrelated edits, untracked files, and work belonging to another collaborator.
- Do not add packages, frameworks, analytics, trackers, cookies, forms, or external services without explicit approval.
- Do not expose secrets or ask users to paste passwords, private keys, payment information, or one-time codes into chat.
- Do not change DNS, repository ownership, Sites ownership, billing, or account access as an incidental part of a content update.
- Keep draft or unverified event information out of public routes unless clearly labeled and intentionally approved.

## Verification Before Publication

At minimum:

```sh
git diff --check
npm run lint
npm test
```

Also:

- Inspect the exact task diff and confirm it excludes unrelated work.
- Render or open every affected route.
- Inspect at a phone width near 390px and a computer width near 1440px for visual changes.
- Check navigation, ticket links, external links, media loading, overflow, focus, and browser console.
- Search for stale copies after factual or wording changes.
- Verify media paths, responsive variants, alt text, and credits after media changes.
- Recheck remote state immediately before pushing.

A passing command is evidence, not the visible result. For design work, inspect the rendered page.

## Git and Concurrent Work

- Start and end with repository status, current branch, remotes, HEAD, and current `origin/main`.
- Run the packaged preflight:

  ```sh
  node plugins/frequency-shift-client/skills/coordinate-frequency-shift-git/scripts/repo-preflight.mjs
  ```

- Fetch before integrating and again before pushing when remote changes are plausible.
- Stage only explicitly task-owned paths. Never use `git add .`, `git add -A`, or broad staging when unrelated changes exist.
- Use a short commit message that describes the visible result.
- If the current worktree contains unrelated changes, isolate the new task in a temporary branch or worktree based on current `origin/main`.
- If `origin/main` advances, replay or merge the task onto the newest safe state, preserve compatible work from both collaborators, rerun verification, and push normally.
- Resolve mechanical conflicts internally when the intended visible result is unambiguous.
- If two versions express a real content or design choice, keep both safe and ask one plain-English question.
- Never use `git reset --hard`, destructive checkout, `git clean`, or discard unknown work.
- Never force-push `main`, including `--force-with-lease`.
- Do not hide someone else's changes in a stash and forget them.
- A push is not proof that the public site changed.

## Sites Publication

For a live update:

1. Verify the task-owned source state.
2. Commit it.
3. Synchronize with and push the correct GitHub branch according to repository policy.
4. Read `.openai/hosting.json`.
5. Use the existing Sites project.
6. Push the exact committed source state to Sites.
7. Save a Sites version whose `commit_sha` identifies that pushed state.
8. Deploy only that saved version.
9. Wait for a terminal deployment status.
10. Open the public URL and verify the requested content or visual result on every affected route.

If a Sites connector, GitHub access, authentication, or approval is missing, explain the one required next step in plain English. Do not claim the update is live.

## Permission and Safety Boundaries

Pause for a plain-English decision before:

- changing DNS, domains, repository ownership, collaborator access, billing, authentication, or external service settings;
- publishing a date, venue, time, price, lineup, ticket destination, sponsor claim, photographer credit, policy, or legal statement the client did not provide or confirm;
- deleting a large content area or many media files when the visible intent is unclear;
- changing payment, ticketing, privacy, tracking, cookies, or data collection;
- taking destructive action or expanding beyond this website.

## Client-Facing Status

Keep completion messages short and visible-result focused.

For a verified live update:

> Done - [visible result] is live on [page]. I checked it on phone and computer, including [important link or interaction].

For a preview:

> The change is ready for you to review and is not live. I changed [visible result] and checked [pages/screen sizes].

For a blocked publication:

> The change is ready and checked, but it is not live because [plain reason]. The next step is [one action].

For a decision:

> I kept both versions safe. I need one choice from you: [plain comparison].

Never say "live", "published", "fixed", or "healthy" based only on a local build, commit, push, or non-terminal deployment.
