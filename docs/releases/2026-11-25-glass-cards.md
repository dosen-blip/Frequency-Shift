# Release handoff: glass cards and panels (2026-11-25)

Prepared on `design/glass-cards-2026-11-25` from `origin/main` at `ea4d7b0`, and pushed to `main` by Claude at the client's request.

## What ships

- **Shared glass look:** panels, cards, photos, the phone dock and the next-event bar take the call-to-action buttons' material. That means smoked glass with a pink sheen from above and a cyan one from below, a pink-to-cyan rim, and a soft pink and cyan glow. It is defined once in "Glass, the buttons' way" at the end of `app/globals.css`.
- **Cards on hover:** they light up the way the main button does.
- **Performance:** no new blur layers, so the glass is painted and costs the room nothing.
- **Inner pages:** stay calm, with no new pulsing.

## Verified locally

- `git diff --check`, `npm run lint` and `npm test` (39) pass.
- Home, Events, Archive, an archive night and About were checked at 1440 and 390 wide.
