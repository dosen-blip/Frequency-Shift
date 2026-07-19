import type { EventRecord } from "@/content/types";
import { eventStatusLabels } from "@/content/types";
import { SiteGlassAnchor, SiteGlassButton, SiteGlassLink } from "@/components/site-glass-controls";
import Link from "next/link";

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
          decoding="async"
        />
      ) : null}
      <div className="event-card__scrim" aria-hidden="true" />
      {event.genre ? <p className="event-card__genre">{event.genre}</p> : null}
      <div className="event-card__body">
        <p className="status">{eventStatusLabels[event.status]}</p>
        <h2>
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h2>
        <div className="event-card__facts">
          <span>
            {event.dateLabel}
          </span>
          <span>
            {event.venue ? `${event.venue}, ${event.city}` : event.city}
          </span>
        </div>
        <div className="card-actions">
          <SiteGlassLink variant="ghost" href={`/events/${event.slug}`}>
            Event details
          </SiteGlassLink>
          {event.ticketUrl ? (
            <SiteGlassAnchor variant="solid" href={event.ticketUrl} rel="noreferrer" target="_blank">
              Tickets
            </SiteGlassAnchor>
          ) : (
            <SiteGlassButton className="button--disabled" disabled aria-label="Tickets are not yet available">
              Details soon
            </SiteGlassButton>
          )}
        </div>
      </div>
    </article>
  );
}
