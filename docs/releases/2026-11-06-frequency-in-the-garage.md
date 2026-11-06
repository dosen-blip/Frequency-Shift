# Release handoff: Frequency in the Garage (2026-11-06)

Prepared and verified locally on `content/garage-event-2026-11-06`, branched from `origin/main` at `7e92e80` (the published state). Publication is the GitHub Pages workflow (`.github/workflows/pages.yml`) that runs on every push to `main`. Pushed to `main` by Claude at the client's request; the first Pages deploy of `69a4ecb` stalled in GitHub's file sync and timed out twice, so this note's commit triggers a fresh deployment.

## What ships

- New featured event `frequency-in-the-garage` in `content/events.ts`: Frequency Shift x Moose's Garage, Friday, November 20, 2026, 10 PM–2:30 AM (EST, `-05:00`), GRIDWRKS, 221 Rideau St. UK garage, 19+ with valid ID, tickets live on Eventbrite (`frequency-shift-x-mooses-garage-tickets-2004491756804`). Billed as the last Frequency Shift of 2026.
- Poster `public/media/events/frequency-in-the-garage.webp` (1200×1500, metadata-free, from the client's poster).
- Frequency Shift 014 is no longer `featured`; it already falls into Past nights by its end time, and its ticket link disappears there.
- Tests updated so the November night is the upcoming event and 014 is a past night.

## Sources

- Eventbrite listing (title, time, venue, age, ticket link, description) and the client's poster (title "Frequency in the Garage", lineup artwork).
- Lineup spelling: the poster reads **FASTR B2B BOUKINE**; the Eventbrite description lists "FASTR B2B BOUNNE". The site follows the poster. Confirm with the client and correct `content/events.ts` and `tests/rendered-html.test.mjs` if Eventbrite is right.

## Verified locally

- `git diff --check`, `npm run lint` and `npm test` pass.
- Home, `/events` and `/events/frequency-in-the-garage` checked at computer and phone widths: poster loads, header "Next event", the floating next-event bar and both ticket buttons point at the November night; no horizontal overflow; no console errors.
- Export budgets: homepage 14,391 / 14,500 bytes.

## Check on the live site after deploying

1. Home: the November poster and "Get tickets" lead below the hero; the next-event bar reads "Fri 20 Nov 2026 / GRIDWRKS".
2. `/events`: Frequency in the Garage is the only upcoming night; Frequency Shift 014 tops Past nights with no ticket link.
3. `/events/frequency-in-the-garage`: lineup, times and the Eventbrite link are correct.
