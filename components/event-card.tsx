import Link from "next/link";
import type { EventRecord } from "@/content/types";
import { eventStatusLabels } from "@/content/types";

export function EventCard({ event, revealIndex = 0 }: { event: EventRecord; revealIndex?: number }) {
  return (
    <article
      className="event-card"
      data-reveal="card"
      style={{ "--reveal-delay": `${Math.min(revealIndex, 3) * 70}ms` } as React.CSSProperties}
    >
      {event.coverImage ? (
        <img
          className="event-card__image"
          src={event.coverImage}
          alt={event.coverAlt}
          width="1600"
          height="1066"
          loading="lazy"
        />
      ) : null}
      <div className="event-card__scrim" aria-hidden="true" />
      {event.genre ? <p className="event-card__genre">{event.genre}</p> : null}
      <div className="event-card__body">
        <p className="status">{eventStatusLabels[event.status]}</p>
        <h2>
          <Link href={`/events/${event.slug}`} prefetch={false}>{event.title}</Link>
        </h2>
        <div className="event-card__facts">
          <span>
            <img src="/media/figma/icon-calendar.svg" alt="" width="16" height="16" />
            {event.dateLabel}
          </span>
          <span>
            <img src="/media/figma/icon-location.svg" alt="" width="16" height="16" />
            {event.venue ? `${event.venue}, ${event.city}` : event.city}
          </span>
        </div>
        <div className="card-actions">
          <Link className="button button--ghost" href={`/events/${event.slug}`} prefetch={false}>
            Event details
          </Link>
          {event.ticketUrl ? (
            <a className="button button--solid" href={event.ticketUrl} rel="noreferrer" target="_blank">
              Tickets
            </a>
          ) : (
            <span className="button button--disabled" aria-label="Tickets are not yet available">
              Details soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
