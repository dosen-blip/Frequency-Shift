export const eventStatuses = [
  "announced",
  "tickets-live",
  "limited",
  "sold-out",
  "event-day",
  "archived",
] as const;

export type EventStatus = (typeof eventStatuses)[number];

export const eventStatusLabels: Record<EventStatus, string> = {
  announced: "Announced",
  "tickets-live": "Tickets live",
  limited: "Limited tickets",
  "sold-out": "Sold out",
  "event-day": "Tonight",
  archived: "Archived",
};

export type EventRecord = {
  slug: string;
  title: string;
  summary: string;
  description: string[];
  dateLabel: string;
  startsAt: string | null;
  endsAt: string | null;
  venue: string | null;
  city: string;
  status: EventStatus;
  ticketUrl: string | null;
  genre: string | null;
  artistSlugs: string[];
  featured: boolean;
  draft: boolean;
  coverImage: string | null;
  coverAlt: string;
};

export type ArtistRecord = {
  slug: string;
  name: string;
  city: string | null;
  bio: string[];
  links: Array<{ label: string; href: string }>;
  portrait: string | null;
};

export type ArchiveRecord = {
  slug: string;
  title: string;
  dateLabel: string;
  summary: string;
  story: string[];
  eventSlug: string | null;
  gallery: Array<{ src: string; alt: string; width: number; height: number }>;
  draft: boolean;
};
