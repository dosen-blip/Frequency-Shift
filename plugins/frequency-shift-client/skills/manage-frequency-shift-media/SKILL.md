---
name: manage-frequency-shift-media
description: Prepare, inspect, optimize, place, replace, crop, credit, and verify photos, posters, artwork, logos, icons, and video for the Frequency Shift website. Use whenever a request includes an attached image, poster, event gallery, archive photo, visual asset, crop complaint, replacement media, photographer credit, alt text, responsive image, or media performance issue.
---

# Manage Frequency Shift Media

Publish intentional, rights-aware media that looks correct on phones and computers without losing source quality or documentary truth.

## Required Context

Read `references/media-workflow.md` and the repository's `public/media/README.md` before adding or replacing media.

## Workflow

1. Identify whether the asset is a poster, documentary photo, logo, icon, or motion.
2. Confirm the requested placement and public-use context.
3. Preserve the original outside the public route when practical.
4. Inspect orientation, dimensions, colour profile, metadata, file size, and focal point.
5. Export appropriate WebP or AVIF variants for photographs; keep SVG for simple approved marks.
6. Use stable, descriptive filenames and the existing media folder pattern.
7. Add meaningful alt text in the content record or component.
8. Record photographer credit and source links for archive media.
9. Update all content declarations that reference the asset.
10. Render and inspect phone and computer crops.
11. Run the reference audit script before release.

## Documentary Boundary

Do not present campaign art, flyers, announcement graphics, or unrelated crowd imagery as proof of an event. If genuine event photography is unavailable, use an honest record state rather than a misleading gallery.

Anonymous social access returning empty is not proof that media does not exist. State the access limit and seek an authenticated or supplied source before concluding absence.

## Reference Audit

After placing an asset:

```sh
node plugins/frequency-shift-client/skills/manage-frequency-shift-media/scripts/audit-media-references.mjs public/media/path/to/asset.webp
```

Confirm the expected content or component files reference it. Then run normal site tests and visually inspect the rendered result.

Do not delete a source or old public asset until every reference is understood and the user intended removal.
