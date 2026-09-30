# Frequency Shift

Editorial website and documentary event archive for Frequency Shift. The runtime is React 19 + TypeScript on the Sites-compatible vinext stack, with structured event, artist, and archive content kept separate from page layout.

Standalone deployment: [frequency-shift-ottawa.hydrogenyoga.chatgpt.site](https://frequency-shift-ottawa.hydrogenyoga.chatgpt.site/)

## Run it

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm test
```

The production site is published through its dedicated Sites project. To verify the optional static export locally, run `npm run export:pages`; the generated `out/` directory is intentionally ignored by Git.

## Route map

- `/` — identity, next event, manifesto, and recent archive entry
- `/events` — upcoming events as cards, then a dated "Past nights" list
- `/events/[slug]` — event detail, lineup, and ticket state (past events link to their archive instead of tickets)
- `/archive` — editorial history index
- `/archive/[slug]` — recap, credits, and selective media
- `/artists/[slug]` — reusable lineup biography pages
- `/about`, `/contact`, `/privacy`, `/terms`

## Content model

Content lives in `content/` as typed records. The event status model is:

`announced → tickets-live → limited/sold-out → event-day → archived`

Update the content object instead of rewriting page markup. A future CMS or local Markdown loader can replace the TypeScript data files without changing route components.

Events are sorted into upcoming and past by their end time (`endsAt`, or 12 hours after `startsAt` when there is no end time); nobody needs to move them by hand. The helpers in `content/events.ts` (`getUpcomingEvents`, `getPastEvents`, `getNextEvent`, `ticketLabel`, `formatEventDate`) drive every listing, the header "Next event" link, and the floating next-event bar. Every ticket link carries `data-event-end`, so the browser hides it once the night is over even if the site has not been rebuilt. `lineup` lists the billed names exactly as the client supplied them.

Labels carry facts, not atmosphere: section labels show real dates, venues, and counts (for example `Next event / Fri 16 Oct 2026 / GRIDWRKS`), and archive labels are edition codes (`FS 001`) or plain types (`Festival`, `Partner night`, `Special`).

Only approved public event records belong in the event collection. Archive entries without verified documentary photography remain text-first records; promotional media is not substituted for event coverage.

## Design foundation

Global tokens are in `app/globals.css`: colour, type roles, spacing, page width, and motion preferences. The visual system pairs an editorial black field with the Frequency Shift pink/cyan signal, documentary photography, and restrained interaction.

Type roles, all self-hosted from `public/media/fonts/` under the SIL Open Font License:

- `--font-display` — Fraunces, soft and slightly wonky (`--display-axes`), for every headline and the hero mantra.
- `--font-body` — Instrument Sans for body copy, subheads, buttons, and navigation.
- `--font-mono` — DM Mono for dates, labels, and other metadata, uppercase and lightly tracked.

The "Heading voice" and "Metadata voice" blocks near the end of `globals.css` apply these roles and win over older per-component rules. Headlines use balanced line breaks so no word is left alone on a line.

Neon is reserved: the hero sign, the footer sign (which ignites when scrolled into view), the neon dot cursor for mouse users, and a quieter glow on cards and buttons.

The first visual pass is based on Figma frame `mdhZYjhB9Yj0ttf6tARaak / 6:2`. Exported photography, the FS mark, and utility icons live in `public/media/figma/`. Large source images were converted to metadata-free WebP files; the Figma file remains the source for future high-resolution exports.

## Media and release rules

- Follow `public/media/README.md` for image format, widths, alt text, and rights checks.
- Replace the current `NEXT_PUBLIC_SITE_URL` fallback when the production domain is chosen.
- Keep contact and social channels current.
- Review privacy and terms whenever the site’s data handling or ticket flow changes.
- Run the full build and route tests before publishing.
- The static export does not ship React. Any behaviour added to a client component (`site-motion.tsx`, `neon-wordmark.tsx`, `neon-cursor.tsx`) must also be added to `public/static-pages.js`. `tests/pages-export.test.mjs` caps that script at 15 KB and the exported homepage at 14.5 KB.
