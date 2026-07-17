import type { ArchiveRecord } from "./types";

type ArchiveSlot = Pick<ArchiveRecord, "slug" | "title">;

const archiveSlots: ArchiveSlot[] = [
  { slug: "frequency-shift-001", title: "Frequency Shift 001" },
  { slug: "frequency-shift-002", title: "Frequency Shift 002" },
  { slug: "frequency-shift-003", title: "Frequency Shift 003" },
  { slug: "frequency-shift-004", title: "Frequency Shift 004" },
  { slug: "frequency-shift-005", title: "Frequency Shift 005" },
  { slug: "world-cup", title: "World Cup" },
  { slug: "solstice", title: "Solstice" },
  { slug: "dopamine", title: "Dopamine" },
];

export const archives: ArchiveRecord[] = archiveSlots.map((slot) => ({
  ...slot,
  dateLabel: "Details pending",
  locationLabel: null,
  summary: `${slot.title}, preserved as a Frequency Shift event record with space for the final story, credits, and photography.`,
  story: [
    `This archive slot has been established for ${slot.title}. Dates, venue details, lineup notes, and the final editorial recap will be added as the original event material is organized.`,
    "The image sequence below is intentionally held as a set of placeholders. Photography, credits, and captions can be added later without changing the archive layout.",
  ],
  eventSlug: null,
  gallery: [],
  gallerySlotCount: 12,
  draft: true,
}));

export function getArchive(slug: string) {
  return archives.find((entry) => entry.slug === slug);
}
