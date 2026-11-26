# Release handoff: phone dock icons (2026-11-25)

Prepared on `mobile/dock-icons-2026-11-25` from `origin/main` at `fd37cfe` (the laser room release) and pushed to `main` by Claude at the client's request. Publication is the GitHub Pages workflow on every push to `main`.

## What ships

- **Phone dock:** the rail, tick marks and page names are replaced by one small neon icon per page, matching that page's sign in the room: a house for Home, fast-forward for Events, rewind for Archive, a wave for About and a signal for Contact. The current page's icon is lit and glows in its room's colour, with a short bar of laser light under it that still runs to the next icon during a pan. Page names stay as screen-reader text. The dock is the same height as before.
- **Page titles:** after a move between pages, the title that takes the focus no longer shows the cyan focus ring.

## Verified locally

- `git diff --check`, `npm run lint` and `npm test` (39 tests) pass. The homepage export is 12,636 / 14,500 bytes.
- Tapped from Home to Events to About at 390×844 (touch) in the static export: there is no ring on the titles, and the icons light up and the light slides between them.
