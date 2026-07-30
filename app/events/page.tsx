import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { events } from "@/content/events";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Events",
  description: "Our upcoming events and ticket status.",
};

export default function EventsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Live signal"
        title="Events"
        intro="Our upcoming nights, collaborations, and ticket links."
      />
      <section className="event-grid" aria-label="Upcoming events">
        {events.length ? (
          events.map((event, index) => <EventCard event={event} key={event.slug} revealIndex={index} />)
        ) : (
          <p className="empty-state" data-reveal="up">
            Follow us at{" "}
            <a href={siteConfig.instagram.href} target="_blank" rel="noreferrer">
              {siteConfig.instagram.handle}
            </a>{" "}
            for the next transmission, or step into the archive.
          </p>
        )}
      </section>
    </div>
  );
}
