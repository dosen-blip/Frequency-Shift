import Link from "next/link";
import type { EventRecord } from "@/content/types";
import { eventStatusLabels } from "@/content/types";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <article className="event-card">
      <div className="event-card__body">
        <p className="status">{eventStatusLabels[event.status]}</p>
        <h2>
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h2>
        <p>{event.summary}</p>
      </div>
      <div className="event-card__meta">
        <dl>
          <div>
            <dt>Date</dt>
            <dd>{event.dateLabel}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{event.venue ? `${event.venue}, ${event.city}` : event.city}</dd>
          </div>
        </dl>
        <div className="card-actions">
          <Link className="button button--ghost" href={`/events/${event.slug}`}>
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
