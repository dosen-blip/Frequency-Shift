import type { EventRecord } from "./types";

export const events: EventRecord[] = [
  {
    slug: "the-experiment",
    title: "The Experiment",
    summary:
      "We’re back at GRIDWRKS with Dopamine, Yaan, Valium, Seb B, Balla, and Adekam & Friends.",
    description: [
      "For The Experiment, we’re linking back up with Dopamine at GRIDWRKS for a bigger-stage follow-up with house-party energy in the club.",
      "Yaan, Valium, Seb B, Balla with a birthday set, and Adekam & Friends carry the night. We’re running from 9 PM to 2 AM, and the event is 19+ with ID required. Advance tickets are $10, with $4.50 Jagerbombs available all night.",
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
    coverImage: "/media/events/the-experiment.webp",
    coverAlt:
      "The Experiment event poster with neon green and magenta laboratory artwork and the August 7 lineup.",
  },
  {
    slug: "september-4",
    title: "Frequency Shift",
    summary: "We’re back at GRIDWRKS on September 4.",
    description: [
      "We’re back at GRIDWRKS on September 4, 2026. Follow along as the night takes shape.",
    ],
    dateLabel: "September 4, 2026",
    startsAt: "2026-09-04",
    endsAt: null,
    venue: "GRIDWRKS",
    city: "Ottawa, Canada",
    status: "announced",
    ticketUrl: null,
    genre: null,
    artistSlugs: [],
    featured: false,
    coverImage: null,
    coverAlt: "",
  },
  {
    slug: "boat-party",
    title: "Boat Party",
    summary: "Boat Party lands September 17.",
    description: [
      "We’re heading onto the water for Boat Party on September 17, 2026.",
    ],
    dateLabel: "September 17, 2026",
    startsAt: "2026-09-17",
    endsAt: null,
    venue: null,
    city: null,
    status: "announced",
    ticketUrl: null,
    genre: null,
    artistSlugs: [],
    featured: false,
    coverImage: null,
    coverAlt: "",
  },
];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}
