# Release handoff: sharper sign and Frequency Shift 014 promo (2026-10-16)

Prepared and verified locally, then pushed to `main` by Claude at the client's request. Publication is the GitHub Pages workflow (`.github/workflows/pages.yml`) that runs on every push to `main`, not Sites.

## What ships

Commits on `work/from-live-2026-10-16`, fast-forwarded onto local `main` from `origin/main` at `b6ab19b` (the published state):

- `bfb1b74`: sharper, smaller neon sign. The bloom layer no longer blurs a copy of the artwork, the core and bloom halos are tighter, and the ambient haze is lighter (`blur(1.6rem)`, opacity 0.17). The hero lockup is about 19% smaller on computers (`min(74vw, 72rem)`) and 12% smaller on phones (`min(72vw, 32rem)`). Phone hero buttons are now sized to the viewport so they keep their previous width. Footer sign shares the sharper glow at its existing size. Hover flicker, ignition, reduced-motion and touch behaviour are unchanged. Glow paint gutters still exceed the full filter reach.
- `26cb80c`: Frequency Shift 014 promo film on `/events/frequency-shift-014`, under the event details. A lossless remux of the client's 1920×1080 file (71 MB, about 12 Mbps H.264 + AAC, fast start), with a full-size WebP poster, the archive films' neon play button, `preload="none"` and no autoplay. New optional `promoVideo` on `EventRecord`; source notes in `docs/media/frequency-shift-014-promo.md`.
- This note, plus the `AGENTS.md` and `public/media/README.md` updates for the promo field.

## Verified locally

- `git diff --check`, `npm run lint` and `npm test` (38 tests, including new promo checks for the rendered page and the static export) pass.
- Home hero and footer checked at 1440px and 390px; event page checked at both widths with no horizontal overflow. The promo played at 1920×1080 with controls after pressing play.
- Export budgets: homepage 14,316 / 14,500 bytes; `static-pages.js` 14,895 / 15,000 (unchanged by this release).

## Notes for publishing

- The promo MP4 is 71 MB. GitHub accepts it (limit 100 MB per file) but warns above 50 MB. Confirm GitHub Pages serves it with range requests so playback starts before the download completes.
- The event is tonight (October 16, 10 PM–2:30 AM). The promo stays on the event page after the night ends.
- The unpublished `codex/neon-as-light` work branched from the same `b6ab19b` and rewrites the same hero glow rules in `app/globals.css`; expect conflicts there when it is integrated, and keep this release's sharper, smaller sign as the agreed direction.

## Check on the live site after deploying

1. Home: the sign is smaller and crisp at the edges, the icon's wave lines read as separate lines, and the hero buttons sit fully on screen on a laptop.
2. `/events/frequency-shift-014`: the "Promo" film shows its roundel poster and plays with sound after pressing play.
3. `/events`: no promo on the list page.
4. On a real phone: the hero sign ignites without hard rectangular glow edges, and "See upcoming events" fits on one line.
