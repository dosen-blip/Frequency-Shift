import type { EventRecord } from "./types";

export const events: EventRecord[] = [
  {
    slug: "the-experiment",
    title: "The Experiment",
    summary:
      "Frequency Shift and Dopamine return to GRIDWRKS with Yaan, Valium, Seb B, Balla, and Adekam & Friends.",
    description: [
      "The Experiment brings Frequency Shift and Dopamine back together at GRIDWRKS for a bigger-stage follow-up built around house-party energy in the club.",
      "Yaan, Valium, Seb B, Balla with a birthday set, and Adekam & Friends carry the night. The event runs from 9 PM to 2 AM and is 19+ with ID required. Advance tickets are $10, with $4.50 Jagerbombs available all night.",
    ],
    dateLabel: "August 7, 2026 · 9 PM–2 AM",
    startsAt: "2026-08-07T21:00:00-04:00",
    endsAt: "2026-08-08T02:00:00-04:00",
    venue: "GRIDWRKS · 221 Rideau St",
    city: "Ottawa, Canada",
    status: "tickets-live",
    ticketUrl:
      "https://www.eventbrite.ca/e/the-experiment-dopamine-x-frequency-shift-dopamine-029-tickets-1994983985805",
    genre: "House / Tech house",
    artistSlugs: [],
    featured: true,
    draft: false,
    coverImage: "/media/events/the-experiment.webp",
    coverAlt:
      "The Experiment event poster with neon green and magenta laboratory artwork and the August 7 lineup.",
  },
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
