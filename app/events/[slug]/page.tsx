import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { events, getEvent } from "@/content/events";
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

  return (
    <article className="page-shell">
      <p className="eyebrow" data-reveal="up">{eventStatusLabels[event.status]}</p>
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
            <div>
              <dt>Ticket status</dt>
              <dd>{eventStatusLabels[event.status]}</dd>
            </div>
          </dl>
          <div className="card-actions" style={{ marginTop: "2rem" }}>
            {event.ticketUrl ? (
              <a className="button button--solid" href={event.ticketUrl} rel="noreferrer" target="_blank">
                Buy tickets
              </a>
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
