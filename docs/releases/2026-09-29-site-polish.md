# Release handoff: site polish (2026-09-29)

Prepared and verified locally; not yet pushed or published. Publish it with the Sites flow in `AGENTS.md` ("Sites Publication").

## What ships

Commits on `local/next-iteration`, fast-forwarded onto local `main` from `origin/main` at `b4abc0f`:

- Neon dot cursor for mouse users; the footer shows the neon "FREQUENCY SHIFT" sign (no FS icon) that ignites when scrolled into view.
- Events split into upcoming cards and a dated "Past nights" list; past event pages link to their archive instead of selling tickets. Ticket links and the next-event bar hide themselves after the event's end time.
- Frequency Shift 014 marked `tickets-live` (client confirmed on 2026-09-29); lineups added to every event record from the supplied descriptions.
- Filler labels replaced with factual ones; archive labels are edition codes or plain types; Contact explains what to include per enquiry type (Instagram stays the only channel).
- Archive videos show a poster and neon play button; native controls appear on play and remain the no-JavaScript fallback.
- Sticky header fixed (`body` uses `overflow-x: clip`).
- Typography: Fraunces headlines, Instrument Sans body, DM Mono labels, all self-hosted under the OFL. Headlines balance their line breaks.
- Quieter glow on cards and buttons; spacing fixes on About, Contact, event, and 404 pages.
- Docs and `AGENTS.md` repository truth updated for all of the above.

## Verified locally

- `git diff --check`, `npm run lint`, and `npm test` (36 tests) pass.
- Every route checked at 1440px and 390px: no horizontal overflow, no heading wider than its column, no side-by-side columns closer than 24px.
- Dev server and static export both checked in a browser, with no console errors.
- Export budgets: homepage 14.3 KB of 14.5 KB, `static-pages.js` 14.9 KB of 15 KB. Both limits were raised in this release to fit the cursor, neon footer, and event features.

## Check on the live site after deploying

1. Home: at the top, the hero buttons are clear and the next-event bar is hidden; it fades in after scrolling (Chrome and Safari; Firefox shows it all the time).
2. Events: Frequency Shift 014 reads "Tickets live" with a working Eventbrite link; the three past nights are listed with no ticket links.
3. `/archive/techno-special`: play buttons start the videos.
4. Fonts load from `/media/fonts/` on the deployed base path (Fraunces headings, not Georgia).
5. On a real phone: the footer sign glows without hard rectangular edges and the menu stays pinned. Desktop browsers cannot reproduce the known iOS glow-clipping issue.
