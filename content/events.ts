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
    featured: false,
    coverImage: "/media/events/the-experiment.webp",
    coverAlt:
      "The Experiment event poster with neon green and magenta laboratory artwork and the August 7 lineup.",
  },
  {
    slug: "september-4",
    title: "Frequency Shift: Techno Special",
    summary:
      "Frequency Shift returns to GRIDWRKS with Fantom K, Zak Black, ENKO b2b DJ Gabby, and DOSEN.",
    description: [
      "We’re back at GRIDWRKS on September 4 for a techno special with Fantom K, Zak Black, ENKO b2b DJ Gabby, and DOSEN.",
      "Doors open at 10 PM. The event is 19+ with ID required, and tickets are available through Eventbrite.",
    ],
    dateLabel: "September 4, 2026 · Doors at 10 PM",
    startsAt: "2026-09-04T22:00:00-04:00",
    endsAt: null,
    venue: "GRIDWRKS · 221 Rideau St",
    city: "Ottawa, Canada",
    status: "tickets-live",
    ticketUrl:
      "https://www.eventbrite.com/e/frequency-shift-techno-special-tickets-1998427471363?aff=ebdssbdestsearch",
    genre: "Techno",
    artistSlugs: [],
    featured: false,
    coverImage: "/media/events/frequency-shift-techno-special.webp",
    coverAlt:
      "Frequency Shift Techno Special poster for September 4 at GRIDWRKS with Fantom K, Zak Black, ENKO b2b DJ Gabby, and DOSEN.",
  },
  {
    slug: "boat-party",
    title: "Frequency Shift: Boat Special",
    summary:
      "Summer Closer: a sunset boat party on the Ottawa River with Frequency Shift, Vivant Events, and Undercover.",
    description: [
      "We’re closing out the summer on the Ottawa River. Frequency Shift, Vivant Events, and Undercover come together for Summer Closer, a sunset boat party on Thursday, September 17, 2026.",
      "Four back-to-back sets carry the evening: TOPAZ b2b EMBLEM, MAC:D b2b DANFORD, FASTR b2b CAMILLIE, and SEB B b2b BALLA.",
      "Boarding starts at 6:30 PM at Parc Jacques-Cartier, 160 Rue Laurier in Gatineau. The boat runs from 7 PM to 11 PM. Arrive early for boarding; the event is 19+ with valid ID required.",
    ],
    dateLabel: "September 17, 2026 · 7–11 PM · Boarding at 6:30 PM",
    startsAt: "2026-09-17T18:30:00-04:00",
    endsAt: "2026-09-17T23:00:00-04:00",
    venue: "Parc Jacques-Cartier · 160 Rue Laurier",
    city: "Gatineau, QC",
    status: "announced",
    ticketUrl:
      "https://www.eventbrite.com/e/frequency-shift-boat-special-tickets-2000050919139?aff=erelpanelorg",
    genre: "House / Electronic",
    artistSlugs: [],
    featured: true,
    coverImage: "/media/events/frequency-shift-boat-special.webp",
    coverAlt:
      "Pink and yellow Summer Closer poster for the September 17 sunset boat party.",
  },
];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}
