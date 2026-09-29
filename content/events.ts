import type { EventRecord } from "./types";

export const events: EventRecord[] = [
  {
    slug: "frequency-shift-014",
    title: "Frequency Shift 014",
    summary:
      "Dark tech house at GRIDWRKS with Barry, Balla B2B Evander, Sean Vincent, and Tev.N.",
    description: [
      "We’re bringing Frequency Shift 014 to GRIDWRKS on Friday, October 16 for a dark tech house rave. Heavy bass, rolling percussion, and gritty late-night grooves set the tone as the room gets deeper into the night.",
      "On the lineup: Barry, Balla B2B Evander, Sean Vincent, and Tev.N.",
      "Join us at 221 Rideau Street in Ottawa from 10 PM to 2:30 AM. Doors open at 10 PM; you must be 19+ and bring valid ID. Tickets are on sale now through Eventbrite.",
    ],
    dateLabel: "October 16, 2026 · 10 PM–2:30 AM",
    startsAt: "2026-10-16T22:00:00-04:00",
    endsAt: "2026-10-17T02:30:00-04:00",
    venue: "GRIDWRKS · 221 Rideau St",
    city: "Ottawa, Canada",
    status: "tickets-live",
    ticketUrl:
      "https://www.eventbrite.ca/e/frequency-shift-014-tickets-2002572255524?aff=ebdssbdestsearch",
    genre: "Dark tech house",
    lineup: ["Barry", "Balla B2B Evander", "Sean Vincent", "Tev.N"],
    artistSlugs: [],
    featured: true,
    coverImage: "/media/events/frequency-shift-014.webp",
    coverAlt:
      "Black and pink Frequency Shift poster for October 16 at GRIDWRKS, featuring Barry, Balla B2B Evander, Sean Vincent, and Tev.N.",
  },
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
    lineup: ["Yaan", "Valium", "Seb B", "Balla", "Adekam & Friends"],
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
    lineup: ["Fantom K", "Zak Black", "ENKO b2b DJ Gabby", "DOSEN"],
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
    lineup: ["TOPAZ b2b EMBLEM", "MAC:D b2b DANFORD", "FASTR b2b CAMILLIE", "SEB B b2b BALLA"],
    artistSlugs: [],
    featured: false,
    coverImage: "/media/events/frequency-shift-boat-special.webp",
    coverAlt:
      "Pink and yellow Summer Closer poster for the September 17 sunset boat party.",
  },
];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

// Events without an end time are treated as over 12 hours after they start.
export function eventEndTime(event: EventRecord) {
  if (event.endsAt) return event.endsAt;
  if (!event.startsAt) return null;
  return new Date(Date.parse(event.startsAt) + 12 * 60 * 60 * 1000).toISOString();
}

export function isEventPast(event: EventRecord, now = Date.now()) {
  const end = eventEndTime(event);
  return event.status === "archived" || (end !== null && Date.parse(end) < now);
}

export function getUpcomingEvents(now = Date.now()) {
  return events
    .filter((event) => !isEventPast(event, now))
    .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));
}

export function getPastEvents(now = Date.now()) {
  return events
    .filter((event) => isEventPast(event, now))
    .sort((a, b) => (b.startsAt ?? "").localeCompare(a.startsAt ?? ""));
}

// The featured event leads while it is upcoming; otherwise the soonest one does.
export function getNextEvent(now = Date.now()) {
  const upcoming = getUpcomingEvents(now);
  return upcoming.find((event) => event.featured) ?? upcoming[0] ?? null;
}

export function ticketLabel(event: EventRecord) {
  if (!event.ticketUrl) return null;
  if (event.status === "announced") return "Ticket info";
  if (event.status === "sold-out") return "Sold out";
  if (event.status === "archived") return null;
  return "Get tickets";
}

// "2026-10-16T22:00:00-04:00" -> "Fri 16 Oct 2026", read from the local
// date written in the record so the build machine's time zone cannot shift it.
export function formatEventDate(iso: string | null, { weekday = false } = {}) {
  if (!iso) return "";
  const date = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.valueOf())) return "";
  const part = (options: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
  const day = `${part({ day: "2-digit" })} ${part({ month: "short" })} ${part({ year: "numeric" })}`;
  return weekday ? `${part({ weekday: "short" })} ${day}` : day;
}
