import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { archives } from "@/content/archives";
import { eventEndTime, formatEventDate, getNextEvent, ticketLabel } from "@/content/events";
import { momentGallery } from "@/content/media";
import { eventStatusLabels } from "@/content/types";

const firstNight = [...archives].sort((a, b) => a.dateIso.localeCompare(b.dateIso))[0];
const since = firstNight
  ? new Date(`${firstNight.dateIso}T12:00:00Z`).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
  : null;

export default function HomePage() {
  const featuredEvent = getNextEvent();
  const featuredArchive = archives[0];
  const tickets = featuredEvent ? ticketLabel(featuredEvent) : null;

  return (
    <>
      <HomeHero />

      <section
        id="next-event"
        className="home-event"
        aria-labelledby="next-event-title"
      >
        <div className="home-section-index" data-reveal="up">
          <span>Next event</span>
          {featuredEvent ? (
            <span>
              {formatEventDate(featuredEvent.startsAt, { weekday: true })}
              {featuredEvent.venue ? ` / ${featuredEvent.venue.split(" · ")[0]}` : ""}
            </span>
          ) : null}
        </div>
        {featuredEvent ? (
          <div className="home-event__layout">
            <Link
              className="home-event__visual"
              href={`/events/${featuredEvent.slug}`}
              data-reveal="media"
              aria-label={`Open ${featuredEvent.title} event details`}
            >
              <span className="home-event__media">
                <img
                  src={featuredEvent.coverImage ?? ""}
                  alt={featuredEvent.coverAlt}
                  width="1200"
                  height="1598"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </Link>
            <div className="home-event__content" data-reveal="up">
              <p className="kicker">{eventStatusLabels[featuredEvent.status]}</p>
              <h2 id="next-event-title">{featuredEvent.title}</h2>
              <p className="home-event__summary">{featuredEvent.summary}</p>
              <dl className="home-event__facts">
                <div>
                  <dt>Date</dt>
                  <dd>{featuredEvent.dateLabel}</dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{[featuredEvent.venue, featuredEvent.city].filter(Boolean).join(", ")}</dd>
                </div>
                {featuredEvent.lineup.length ? (
                  <div>
                    <dt>Lineup</dt>
                    <dd>{featuredEvent.lineup.join(" / ")}</dd>
                  </div>
                ) : null}
                {featuredEvent.genre ? (
                  <div>
                    <dt>Sound</dt>
                    <dd>{featuredEvent.genre}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="home-event__actions">
                {featuredEvent.ticketUrl && tickets ? (
                  <a
                    className="button button--solid"
                    href={featuredEvent.ticketUrl}
                    rel="noreferrer"
                    target="_blank"
                    data-event-end={eventEndTime(featuredEvent) ?? undefined}
                  >
                    {tickets}
                  </a>
                ) : null}
                <Link className="button button--ghost" href={`/events/${featuredEvent.slug}`}>
                  Event details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p className="empty-state" data-reveal="up">
            Follow Frequency Shift on Instagram for the next date.
          </p>
        )}
      </section>

      <section className="home-memory" aria-labelledby="memory-title">
        <div className="home-section-index" data-reveal="up">
          <span>From the archive</span>
          <span>{archives.length} nights on record</span>
        </div>
        <div className="home-memory__heading">
          <div data-reveal="clip">
            <h2 id="memory-title">In case you missed it.</h2>
          </div>
          {featuredArchive ? (
            <Link className="button button--ghost" href={`/archive/${featuredArchive.slug}`} data-reveal="up">
              Open the archive
            </Link>
          ) : null}
        </div>
        <div className="home-memory__grid" aria-label="Selected event moments">
          {momentGallery.slice(0, 6).map((image, index) => (
            <figure
              key={image.src}
              data-reveal="media"
              style={{ "--reveal-delay": `${Math.min(index, 3) * 70}ms` } as React.CSSProperties}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="home-manifesto" aria-labelledby="manifesto-title">
        <div className="home-section-index" data-reveal="up">
          <span>About</span>
          {since ? <span>Ottawa since {since}</span> : null}
        </div>
        <div className="home-manifesto__layout">
          <h2 id="manifesto-title" data-reveal="clip">
            Ottawa’s underground,
            <span> on its own frequency.</span>
          </h2>
          <div className="home-manifesto__copy" data-reveal="up">
            <p>
              We bring the raw energy of a rave into Ottawa rooms built for
              dancers. Whether it’s one of our own nights, a partner takeover, or
              a two-stage gathering, the point stays the same: freedom,
              self-expression, and a community that connects through sound.
            </p>
            <Link className="text-link" href="/about">
              Read our story
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
