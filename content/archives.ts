import type { ArchiveRecord } from "./types";
import { momentGallery } from "./media";

export const archives: ArchiveRecord[] = [
  {
    slug: "frequency-fest-vol-1",
    title: "Frequency Fest Vol. 1",
    dateLabel: "2026",
    summary:
      "A recap shell for the first Frequency Fest: editorial context, credits, selected media, and links back to participating artists.",
    story: [
      "This archive entry establishes the publishing structure for past events. Final copy, credits, and media can be added without rebuilding the page layout.",
      "The intended gallery is selective and responsive. It should privilege a concise edit over loading every full-resolution photograph at once.",
    ],
    eventSlug: null,
    gallery: [...momentGallery],
    draft: true,
  },
];

export function getArchive(slug: string) {
  return archives.find((entry) => entry.slug === slug);
}
