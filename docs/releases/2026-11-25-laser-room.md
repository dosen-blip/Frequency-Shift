# Release handoff: the laser room (2026-11-25)

Prepared and verified locally on `release/laser-room-2026-11-25`, branched from `origin/main` at `2d1a4a5` (the published state), and pushed to `main` by Claude at the client's request. Publication is the GitHub Pages workflow (`.github/workflows/pages.yml`) that runs on every push to `main`, not Sites.

## What ships

One squashed commit of the local `experiment/laser-room-2026-11-23` work (23–25 Nov):

- **Home hero:** a 3D laser room replaces the crowd photo. The FS sign hangs on the room's wall, the room launches on the first visit (skipped for reduced motion and without WebGL2), and the light show runs at full intensity on the home page.
- **A room behind every other page:** each page hangs its own neon sign along the same wall, with fewer beams at full strength and calmer movement.
- **Travel between pages:** in the static export, menu links pan the camera sideways along the wall to the next page, with motion blur.
- **Phone dock:** the phone navigation is a dock at the bottom laid out like the wall. Swipe along it to move to the next page.
- **Steady pace and smooth motion:** the room picks one frame rate per visit and holds it. The camera is re-aimed every screen frame, so scrolling and pans move smoothly even when the room is drawn at 30.
- **Client round:** the sign, the line and both buttons fit the first screen at real browser heights. There's less parallax and the spinning circle is rarer.
- New packages: `three` and `@types/three` (0.187.0). Floor textures from Poly Haven (CC0), credited in `public/media/laser-room/CREDITS.md`.
- Tests: the home hero and every page's room are checked in `tests/rendered-html.test.mjs`. That file's event checks are also updated because Frequency in the Garage (20 Nov) has ended: it is now the newest past night, and with no night on sale the home page points to Instagram and the floating next-event bar is gone.
- `AGENTS.md` repository truth now describes the room, the travel and the dock.

## Verified locally

- `git diff --check`, `npm run lint` and `npm test` (39 tests: glass 10, rendered pages 19, export 10) pass.
- The export was checked headless at 1440×900 and 390×844 (phone, touch): home, `/events` and `/events/frequency-in-the-garage`. The room runs on each, with no horizontal overflow and no console errors.
- Measuring so far is headless Chrome on an M4 Pro Mac, with slower devices simulated. **Real phones and Safari have not been tested yet.** Add `?laser-debug` to any address on the live site to see the room's frame rate on a real device.

## Check on the live site after deploying

1. Home: the room launches, the sign sits mid-screen with "For the love of house." and both buttons visible.
2. Events, Archive, About, Contact: each has its own sign, and the menu pans to it.
3. On a phone: the dock at the bottom works by tap and swipe, and the hero fits above it.
4. `/events`: Frequency in the Garage is listed under Past nights, with no ticket link.

## Notes

- `laser-room/laser-room.js` is about 870 KB and has no hash in its name. After later changes to it, browsers may keep the old copy until their cache expires.
- The Garage event page still says "Tickets are on sale now" in its description text (from `content/events.ts`). The ticket button is gone because the event is past; the client may want that sentence reworded.
