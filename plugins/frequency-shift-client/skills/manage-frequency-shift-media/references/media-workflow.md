# Frequency Shift Media Workflow

## Choose the Right Treatment

| Asset | Preferred treatment |
| --- | --- |
| Event poster with text | Preserve the full design when legibility matters; avoid aggressive crop |
| Documentary event photo | Create responsive WebP/AVIF variants and preserve the focal point |
| Archive gallery | Curate rather than publish every source file; include credit and provenance |
| Logo or simple icon | Use the approved SVG when available |
| Intentional motion | Use MP4/WebM with a still fallback and reduced-motion behavior |

## File Placement

- Event covers: `public/media/events/`
- Archive galleries: `public/media/archive/<slug>/`
- Shared brand assets: `public/media/brand/`
- Existing Figma-derived assets: `public/media/figma/`

Follow the established naming pattern in the target directory. Do not create a second competing folder for the same event.

## Responsive Output

- Keep a display-quality primary asset.
- For editorial photographs, provide at least a phone-oriented width around 480px and a larger width around 800-960px when the existing gallery pattern expects them.
- Avoid enlarging a source beyond its useful resolution.
- Strip unnecessary metadata from public derivatives.
- Do not convert a text-heavy poster to a format or size that makes small copy unreadable.

## Alt Text

Describe what a visitor needs to understand:

- Good: "The Experiment poster with neon laboratory artwork and the August 7 lineup."
- Poor: "poster image"

Do not repeat nearby captions word-for-word. Use empty alt text only for genuinely decorative assets.

## Credits and Truth

For archive media, record:

- Photographer or creator
- Source URL
- Event identity
- Usage approval or supplied-source context
- Whether the image is documentary or promotional

Do not assign a photographer credit by guess. Do not use promotional art as event-documentation evidence.

## Crop Check

Inspect:

- Whole composition
- Faces and bodies near edges
- Embedded poster text
- Phone and computer aspect ratios
- `object-fit` and `object-position`
- Nearby text contrast
- Loading and layout shift
