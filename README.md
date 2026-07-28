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
- `/events` — authoritative upcoming-event index
- `/events/[slug]` — event detail and ticket state
- `/archive` — editorial history index
- `/archive/[slug]` — recap, credits, and selective media
- `/artists/[slug]` — reusable lineup biography pages
- `/about`, `/contact`, `/privacy`, `/terms`

## Content model

Content lives in `content/` as typed records. The event status model is:

`announced → tickets-live → limited/sold-out → event-day → archived`

Update the content object instead of rewriting page markup. A future CMS or local Markdown loader can replace the TypeScript data files without changing route components.

Only approved public event records belong in the event collection. Archive entries without verified documentary photography remain text-first records; promotional media is not substituted for event coverage.

## Design foundation

Global tokens are in `app/globals.css`: colour, type roles, spacing, page width, and motion preferences. The visual system pairs an editorial black field with the Frequency Shift pink/cyan signal, documentary photography, and restrained interaction.

The first visual pass is based on Figma frame `mdhZYjhB9Yj0ttf6tARaak / 6:2`. Exported photography, the FS mark, and utility icons live in `public/media/figma/`. Large source images were converted to metadata-free WebP files; the Figma file remains the source for future high-resolution exports.

## Media and release rules

- Follow `public/media/README.md` for image format, widths, alt text, and rights checks.
- Replace the current `NEXT_PUBLIC_SITE_URL` fallback when the production domain is chosen.
- Keep contact and social channels current.
- Review privacy and terms whenever the site’s data handling or ticket flow changes.
- Run the full build and route tests before publishing.
