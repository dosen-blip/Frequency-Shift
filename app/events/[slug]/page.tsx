import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArchiveForEvent } from "@/content/archives";
import { eventEndTime, events, getEvent, isEventPast, ticketLabel } from "@/content/events";
import { eventStatusLabels } from "@/content/types";

type EventPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = getEvent((await params).slug);
  return event
    ? { title: event.title, description: event.summary }
    : { title: "Event not found" };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = getEvent((await params).slug);
  if (!event) notFound();
  const location = [event.venue, event.city].filter(Boolean).join(", ");
  const past = isEventPast(event);
  const archive = getArchiveForEvent(event.slug);
  const tickets = past ? null : ticketLabel(event);
  const statusLabel = past ? "Past event" : eventStatusLabels[event.status];

  return (
    <article className="page-shell">
      <p className="eyebrow" data-reveal="up">{statusLabel}</p>
      <div className="detail-grid">
        <div className="detail-content">
          <h1 className="detail-title">{event.title}</h1>
          <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
            {event.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <aside data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <dl className="detail-meta">
            <div>
              <dt>Date</dt>
              <dd>{event.dateLabel}</dd>
            </div>
            {location ? (
              <div>
                <dt>Location</dt>
                <dd>{location}</dd>
              </div>
            ) : null}
            {event.lineup.length ? (
              <div>
                <dt>Lineup</dt>
                <dd>
                  <ul className="lineup-list">
                    {event.lineup.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {event.genre ? (
              <div>
                <dt>Sound</dt>
                <dd>{event.genre}</dd>
              </div>
            ) : null}
            <div>
              <dt>Tickets</dt>
              <dd>{statusLabel}</dd>
            </div>
          </dl>
          <div className="card-actions detail-actions">
            {event.ticketUrl && tickets ? (
              <a
                className="button button--solid"
                href={event.ticketUrl}
                rel="noreferrer"
                target="_blank"
                data-event-end={eventEndTime(event) ?? undefined}
              >
                {tickets}
              </a>
            ) : null}
            {archive ? (
              <Link className="button button--solid" href={`/archive/${archive.slug}`}>
                Photos & video
              </Link>
            ) : null}
            <Link className="button button--ghost" href="/events">
              All events
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
