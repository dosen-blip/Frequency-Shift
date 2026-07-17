import type { ArchiveRecord } from "./types";

export const archives: ArchiveRecord[] = [
  {
    slug: "frequency-fest-vol-1",
    title: "Frequency Fest Vol. 1",
    dateLabel: "July 2026",
    locationLabel: "Ottawa, Canada",
    summary:
      "The first Frequency Fest, preserved as an event record with space for the final photo edit, credits, and story.",
    story: [
      "Frequency Fest Vol. 1 is the first completed event album contained in the original Frequency Shift frames. This page preserves its title and date while the final editorial recap is being assembled.",
      "The image sequence below is intentionally held as a set of placeholders. Photography, credits, and captions can be added to this record later without changing the archive layout.",
    ],
    eventSlug: null,
    gallery: [],
    gallerySlotCount: 12,
    draft: true,
  },
];

export function getArchive(slug: string) {
  return archives.find((entry) => entry.slug === slug);
}
