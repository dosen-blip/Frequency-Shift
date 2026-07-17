import type { EventRecord } from "./types";

export const events: EventRecord[] = [
  {
    slug: "next-frequency-shift",
    title: "Next Frequency Shift",
    summary:
      "The next room is being assembled. This record is the content-ready shell for the announcement, lineup, and ticket states.",
    description: [
      "This is a draft event record, intentionally visible in the scaffold so the full event lifecycle can be developed without inventing public details.",
      "When the date is approved, update this one content object; the event listing, homepage module, event detail metadata, and status language will update from the same source.",
    ],
    dateLabel: "To be announced",
    startsAt: null,
    endsAt: null,
    venue: null,
    city: "Ottawa, Canada",
    status: "announced",
    ticketUrl: null,
    genre: "Tech house / techno",
    artistSlugs: [],
    featured: true,
    draft: true,
    coverImage: "/media/figma/event-tech.webp",
    coverAlt: "A Frequency Shift crowd dancing beneath red laser beams.",
  },
];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}
