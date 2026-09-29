import Link from "next/link";
import { eventEndTime, formatEventDate, getNextEvent, ticketLabel } from "@/content/events";

// A slim, persistent line to the next night and its tickets. It carries the
// event's end time so the client runtimes hide it once the night is over.
export function NextEventBar() {
  const event = getNextEvent();
  const tickets = event ? ticketLabel(event) : null;
  if (!event || !event.ticketUrl || !tickets) return null;

  return (
    <aside className="next-bar" aria-label="Next event" data-event-end={eventEndTime(event) ?? undefined}>
      <Link className="next-bar__event" href={`/events/${event.slug}`}>
        <span className="next-bar__label">Next</span>
        <span className="next-bar__title">{event.title}</span>
        <span className="next-bar__meta">
          {formatEventDate(event.startsAt, { weekday: true })}
          {event.venue ? ` / ${event.venue.split(" · ")[0]}` : ""}
        </span>
      </Link>
      <a className="button button--solid next-bar__cta" href={event.ticketUrl} target="_blank" rel="noreferrer">
        {tickets}
      </a>
    </aside>
  );
}
