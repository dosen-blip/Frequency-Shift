import Link from "next/link";
import type { EventRecord } from "@/content/types";
import { eventStatusLabels } from "@/content/types";

export function EventCard({ event, revealIndex = 0 }: { event: EventRecord; revealIndex?: number }) {
  const location = [event.venue, event.city].filter(Boolean).join(", ");
  const date = event.startsAt
    ? new Date(`${event.startsAt.slice(0, 10)}T12:00:00`)
    : null;
  const dateMark =
    date && !Number.isNaN(date.valueOf())
      ? date.toLocaleDateString("en-CA", { month: "short", day: "2-digit" }).replace(" ", " / ")
      : "";

  return (
    <article
      className={`event-card${event.coverImage ? "" : " event-card--text"}`}
      data-reveal="card"
      style={{ "--reveal-delay": `${Math.min(revealIndex, 3) * 70}ms` } as React.CSSProperties}
    >
      {event.coverImage ? (
        <img
          className="event-card__image"
          src={event.coverImage}
          alt={event.coverAlt}
          width="1200"
          height="1598"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      {event.coverImage ? null : (
        <div className="event-card__signal" aria-hidden="true">
          <span>F/S</span>
          <span>{dateMark}</span>
        </div>
      )}
      <div className="event-card__scrim" aria-hidden="true" />
      {event.genre ? <p className="event-card__genre">{event.genre}</p> : null}
      <div className="event-card__body">
        <p className="status">{eventStatusLabels[event.status]}</p>
        <h2>
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h2>
        <div className="event-card__facts">
          <span>{event.dateLabel}</span>
          {location ? <span>{location}</span> : null}
        </div>
        <div className="card-actions">
          <Link className="button button--ghost" href={`/events/${event.slug}`}>
            Event details
          </Link>
          {event.ticketUrl ? (
            <a className="button button--solid" href={event.ticketUrl} rel="noreferrer" target="_blank">
              Tickets
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
