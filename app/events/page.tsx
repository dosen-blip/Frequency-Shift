import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { events } from "@/content/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming Frequency Shift events and ticket status.",
};

export default function EventsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Live signal"
        title="Events"
        intro="One authoritative place for dates, lineups, ticket state, venue information, and event-day updates."
      />
      <section className="event-grid" aria-label="Upcoming events">
        {events.length ? (
          events.map((event) => <EventCard event={event} key={event.slug} />)
        ) : (
          <p className="empty-state">No events are currently announced.</p>
        )}
      </section>
    </div>
  );
}
