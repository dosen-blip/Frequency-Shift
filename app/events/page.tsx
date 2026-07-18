import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { events } from "@/content/events";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming Frequency Shift events and ticket status.",
};

export default function EventsPage() {
  const publicEvents = events.filter((event) => !event.draft);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Live signal"
        title="Events"
        intro="When the next Frequency Shift lands, its date, lineup, venue, and ticket link will live here."
      />
      <section className="event-grid" aria-label="Upcoming events">
        {publicEvents.length ? (
          publicEvents.map((event) => <EventCard event={event} key={event.slug} />)
        ) : (
          <p className="empty-state">
            No new date is announced yet. Follow{" "}
            <a href={siteConfig.instagram.href} target="_blank" rel="noreferrer">
              {siteConfig.instagram.handle}
            </a>{" "}
            or step into the archive while the next room takes shape.
          </p>
        )}
      </section>
    </div>
  );
}
