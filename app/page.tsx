import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { archives } from "@/content/archives";
import { events } from "@/content/events";
import { momentGallery } from "@/content/media";

export default function HomePage() {
  const featuredEvent = events.find((event) => event.featured && !event.draft);
  const featuredArchive = archives[0];

  return (
    <>
      <HomeHero />

      <section
        id="next-transmission"
        className="home-event"
        aria-labelledby="next-event-title"
      >
        <div className="home-section-index" data-reveal="up">
          <span>01</span>
          <span>Next transmission</span>
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
              <span className="home-event__visual-index" aria-hidden="true">
                FS / LIVE
              </span>
            </Link>
            <div className="home-event__content" data-reveal="up">
              <p className="kicker">{featuredEvent.status === "tickets-live" ? "Tickets live" : "Announced"}</p>
              <h2 id="next-event-title">{featuredEvent.title}</h2>
              <p className="home-event__summary">{featuredEvent.summary}</p>
              <dl className="home-event__facts">
                <div>
                  <dt>Date</dt>
                  <dd>{featuredEvent.dateLabel}</dd>
                </div>
                <div>
                  <dt>Room</dt>
                  <dd>{featuredEvent.venue ? `${featuredEvent.venue}, ${featuredEvent.city}` : featuredEvent.city}</dd>
                </div>
                {featuredEvent.genre ? (
                  <div>
                    <dt>Signal</dt>
                    <dd>{featuredEvent.genre}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="home-event__actions">
                {featuredEvent.ticketUrl ? (
                  <a
                    className="button button--solid"
                    href={featuredEvent.ticketUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get tickets
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
            The next date is being tuned. Check back soon.
          </p>
        )}
      </section>

      <section className="home-memory" aria-labelledby="memory-title">
        <div className="home-section-index" data-reveal="up">
          <span>02</span>
          <span>From the room</span>
        </div>
        <div className="home-memory__heading">
          <div data-reveal="clip">
            <p className="kicker">Moments from our last events</p>
            <h2 id="memory-title">In case you missed it.</h2>
          </div>
          {featuredArchive ? (
            <Link className="button button--ghost" href={`/archive/${featuredArchive.slug}`} data-reveal="up">
              Open the archive
            </Link>
          ) : null}
        </div>
        <div className="home-memory__grid" aria-label="Selected event moments">
          {momentGallery.slice(0, 5).map((image, index) => (
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
              <figcaption>
                <span>FS / {String(index + 1).padStart(2, "0")}</span>
                <span>Ottawa</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="home-manifesto" aria-labelledby="manifesto-title">
        <div className="home-section-index" data-reveal="up">
          <span>03</span>
          <span>Our frequency</span>
        </div>
        <div className="home-manifesto__layout">
          <h2 id="manifesto-title" data-reveal="clip">
            Ottawa’s underground,
            <span> on its own frequency.</span>
          </h2>
          <div className="home-manifesto__copy" data-reveal="up">
            <p>
              Frequency Shift channels the raw energy of a rave into Ottawa rooms
              built for dancers. Solo nights, partner takeovers, and two-stage
              gatherings all serve the same idea: freedom, self-expression, and a
              community that connects through sound.
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
