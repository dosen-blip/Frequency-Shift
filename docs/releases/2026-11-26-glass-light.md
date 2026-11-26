# Release handoff: light on the glass (2026-11-26)

Prepared on `design/glass-light-2026-11-25` from `origin/main` at `0b3da5f` (the glass cards release), and pushed to `main` by Claude at the client's request.

## What ships

- **`public/glass-light.js`**, loaded from `app/layout.tsx` and styled by "Light on the glass" in `app/globals.css`. With a mouse or trackpad (never on touch), the cursor becomes a light on the site's glass: panels, cards, buttons, the "Next event" button, the dock and the next-event bar.
  - **Face:** a soft pool, a wide soft core with pink and cyan fringes, and a faint image off the back face.
  - **Through the slab:** a gentle pink-to-cyan spread toward the far side.
  - **Bevels:** a crisp line, with glows inside and outside the edge, at the edge nearest the light and where the light comes out on the far side. Edges catch the light before the cursor is over the pane.
  - **Motion:** the light glides on a critically damped spring.
- **Performance:** every piece is drawn once and only moved and faded (transform and opacity). Each pane's edge masks are drawn once per size as SVG. An earlier draft repainted gradients and filters every frame and dropped frames on the archive cards. Measured with this build: no dropped frames across nine archive cards and buttons, about 0.6 ms of work per frame.
- **Rooms:** the light shows only where the room runs (`html.has-room`).

## Verified locally

- `git diff --check`, `npm run lint` and `npm test` (39) pass. No console errors.
- Close-ups were taken over and around panels, archive cards and buttons.
- Frame times were traced with the light on and off.
