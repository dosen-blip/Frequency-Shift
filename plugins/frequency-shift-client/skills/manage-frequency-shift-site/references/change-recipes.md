# Change Recipes

## Add or Update an Event

1. Collect only supplied or verified facts: name, date, start/end time, venue, city, lineup, age restriction, price, ticket URL, genre, poster, and status.
2. Ask only for a missing fact that blocks a truthful public result.
3. Update `content/events.ts` using the existing `EventRecord`.
4. Use an ISO timestamp with the correct Ottawa offset when a time is known.
5. Add artists to `content/artists.ts` only when a public artist page is warranted.
6. Add media through the media workflow.
7. Inspect home, events index, event detail, sitemap, metadata, and tests.
8. Do not announce tickets as live unless the link and availability are confirmed.

## Update an Archive

1. Identify the exact event.
2. Separate documentary media from promotional art.
3. Verify source links, date, location, lineup, photo credit, and usage context.
4. Update editorial truth in `content/archives.ts`.
5. Update gallery declarations in `content/archive-media.ts`.
6. Keep alt text specific to visible content.
7. Render archive index and detail.

## Change Shared Wording

1. Search for every exact and near match.
2. Determine which occurrence is canonical.
3. Update derived tests and metadata intentionally.
4. Check for stale copies in static export output only after rebuilding; do not edit build output.

## Change Navigation or a Shared Link

1. Confirm the destination.
2. Update the shared source instead of each route.
3. Check active states, phone menu, keyboard focus, external-link behavior, footer, and sitemap when applicable.

## Visual Change

1. Inspect the current route.
2. Read `design-language.md`.
3. Reuse an existing component or token.
4. Test phone, transition, and computer widths.
5. Verify surrounding sections and accessibility.
6. Show a preview when requested; otherwise continue through the release workflow.
