---
name: manage-frequency-shift-site
description: Implement Frequency Shift website requests from ordinary language across content, events, archives, artists, pages, navigation, links, layout, styling, responsive behavior, interactions, and accessibility. Use for any request to add, update, fix, remove, rearrange, redesign, restyle, or preview something visitors see or use on the Frequency Shift website.
---

# Manage Frequency Shift Site

Convert a visible request into the smallest coherent, brand-consistent site change. Inspect the current implementation before choosing files or patterns.

## Required Context

- Read `references/site-map.md` for every site change.
- Read `references/design-language.md` for layout, style, hierarchy, responsive, or interaction changes.
- Read `references/change-recipes.md` for events, archive entries, shared facts, navigation, and multi-route updates.
- Also use `$manage-frequency-shift-media` when media is involved.

## Workflow

1. Restate the visible outcome internally.
2. Inspect repository status before editing.
3. Find every source of the visible content or behavior.
4. Determine whether the request is content, visual, behavioral, media, or a combination.
5. Reuse the shared content model, components, and visual tokens.
6. Implement both phone and computer behavior unless scope is limited.
7. Update affected tests when the public contract intentionally changes.
8. Run focused checks during iteration.
9. Render and inspect affected routes for visual work.
10. If the request should go live, hand off to `$coordinate-frequency-shift-git` and `$publish-frequency-shift-site`.

## Content Authority

- Put event facts in `content/events.ts`.
- Put archive editorial and source links in `content/archives.ts`.
- Put archive image declarations in `content/archive-media.ts`.
- Put artist biographies and links in `content/artists.ts`.
- Put shared identity and social links in `content/site.ts`.
- Keep record shapes consistent with `content/types.ts`.
- Do not duplicate a shared fact in a page component just to make one page look right.
- Never invent or silently "complete" facts.

## Visual Standards

- Preserve the neon pink, magenta, cyan, black, and editorial nightlife identity.
- Prefer existing CSS variables in `app/globals.css`.
- Reuse existing cards, headers, route heroes, and motion behavior before creating variants.
- Use natural responsive layout and content-driven sizing.
- Keep focus states, contrast, reduced motion, semantic headings, and useful link labels.
- Inspect around 390px and 1440px for meaningful visual changes.
- Do not make global visual changes to solve a single local complaint unless the user clearly wants a site-wide change.

## Scope and Safety

- Preserve unrelated changes and untracked files.
- Do not add packages, trackers, forms, or external services without approval.
- Ask before deleting substantial content, changing legal or privacy meaning, changing ticket destinations, or publishing unconfirmed event facts.
- Treat "show me first" as a local preview boundary.
- Treat a concrete live update as authorization for the normal verified release workflow, not unrelated cleanup.

## Verification

Before release:

```sh
git diff --check
npm run lint
npm test
```

For visible changes, inspect the rendered result. For factual changes, search for stale copies across content, routes, metadata, sitemap, and tests.
