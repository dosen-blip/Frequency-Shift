# Frequency Shift Site Map

## Public Routes

| Visitor page | Primary implementation | Content authority |
| --- | --- | --- |
| Home `/` | `app/page.tsx`, `components/home-hero.tsx` | Events, archives, and shared site records |
| Events `/events` | `app/events/page.tsx`, `components/event-card.tsx` | `content/events.ts` |
| Event detail `/events/[slug]` | `app/events/[slug]/page.tsx` | `content/events.ts`, `content/artists.ts` |
| Archive `/archive` | `app/archive/page.tsx`, `components/archive-card.tsx` | `content/archives.ts` |
| Archive detail `/archive/[slug]` | `app/archive/[slug]/page.tsx` | `content/archives.ts`, `content/archive-media.ts` |
| Artist `/artists/[slug]` | `app/artists/[slug]/page.tsx` | `content/artists.ts` |
| About `/about` | `app/about/page.tsx` | Page copy and shared site records |
| Contact `/contact` | `app/contact/page.tsx` | `content/site.ts` and page copy |
| Privacy `/privacy` | `app/privacy/page.tsx` | Reviewed page copy |
| Terms `/terms` | `app/terms/page.tsx` | Reviewed page copy |

Shared page chrome lives in `components/site-header.tsx`, `components/site-footer.tsx`, `components/page-header.tsx`, and `components/route-hero.tsx`.

## Shared Systems

- `app/globals.css`: colour, typography, spacing, layout, animation, breakpoints, and component styles.
- `app/layout.tsx`: document shell and shared metadata.
- `app/sitemap.ts`: public URL discovery.
- `app/robots.ts`: crawler rules.
- `content/types.ts`: allowed data structure and event statuses.
- `content/media.ts`: shared media references.
- `public/media/`: production media.
- `tests/rendered-html.test.mjs`: rendered route and public-copy expectations.
- `tests/pages-export.test.mjs`: static export expectations.

## Event Status

The allowed progression is:

`announced -> tickets-live -> limited/sold-out -> event-day -> archived`

Use the closest truthful status. Do not infer availability from an old post or missing ticket link.

## Change Impact

When changing an event, inspect:

- Home featured event
- Events index
- Event detail
- Ticket button and status label
- Metadata and sitemap
- Tests
- Related archive after the event

When changing site identity, navigation, or shared links, inspect all routes and both screen sizes.

When changing archive media, update both the gallery declaration and editorial provenance. Promotional artwork is not documentary event photography.
