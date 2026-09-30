import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { getArchiveForEvent } from "@/content/archives";
import { formatEventDate, getPastEvents, getUpcomingEvents } from "@/content/events";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Events",
  description: "Our upcoming events, ticket links, and past nights.",
};

export default function EventsPage() {
  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`Events / ${upcoming.length} upcoming`}
        title="Events"
        intro="Our upcoming nights, collaborations, and ticket links."
      />
      <section className="event-grid" aria-label="Upcoming events">
        {upcoming.length ? (
          upcoming.map((event, index) => <EventCard event={event} key={event.slug} revealIndex={index} />)
        ) : (
          <p className="empty-state" data-reveal="up">
            Follow us at{" "}
            <a href={siteConfig.instagram.href} target="_blank" rel="noreferrer">
              {siteConfig.instagram.handle}
            </a>{" "}
            for the next date, or step into the archive.
          </p>
        )}
      </section>
      {past.length ? (
        <section className="past-events" aria-labelledby="past-events-title">
          <h2 id="past-events-title" className="past-events__title" data-reveal="up">
            Past nights
          </h2>
          <ol className="past-events__list">
            {past.map((event) => {
              const archive = getArchiveForEvent(event.slug);
              const date = event.dateIso ?? event.startsAt;
              const hasMedia = archive && (archive.gallery.length > 0 || (archive.videos?.length ?? 0) > 0);
              const href = archive ? `/archive/${archive.slug}` : `/events/${event.slug}`;
              return (
                <li key={event.slug} data-reveal="up">
                  <Link href={href}>
                    <time dateTime={date?.slice(0, 10)}>{formatEventDate(date)}</time>
                    <span className="past-events__name">{event.title}</span>
                    <span className="past-events__venue">{event.venue?.split(" · ")[0]}</span>
                    <span className="past-events__action">{hasMedia ? "Photos & video" : "Details"}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
