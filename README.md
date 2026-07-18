# Frequency Shift

Ground-up redesign scaffold for Frequency Shift. The runtime is React 19 + TypeScript on the Sites-compatible vinext stack, with structured event, artist, and archive content kept separate from page layout.

Public device-preview deployment: [dosen-blip.github.io/Frequency-Shift](https://dosen-blip.github.io/Frequency-Shift/)

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

Every push to `main` exports the dynamic build as a static project site and deploys it through GitHub Actions. To verify that export locally, run `npm run export:pages`; the generated `out/` directory is intentionally ignored by Git.

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

Draft records are explicitly marked and must not be treated as public announcements. The included upcoming event and archive entry are structural seeds, not approved copy.

## Design foundation

Global tokens are in `app/globals.css`: colour, type roles, spacing, page width, and motion preferences. The initial visual shell is deliberately directional but restrained; it establishes hierarchy and responsive behaviour without locking the redesign into a final art direction.

The first visual pass is based on Figma frame `mdhZYjhB9Yj0ttf6tARaak / 6:2`. Exported photography, the FS mark, and utility icons live in `public/media/figma/`. Large source images were converted to metadata-free WebP files; the Figma file remains the source for future high-resolution exports.

## Media and release rules

- Follow `public/media/README.md` for image format, widths, alt text, and rights checks.
- Replace the current `NEXT_PUBLIC_SITE_URL` fallback when the production domain is chosen.
- Connect approved contact and social channels before launch.
- Replace draft privacy and terms routes with reviewed policies before launch.
- Run the full build and route tests before publishing.
