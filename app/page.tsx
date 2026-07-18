import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { RouteHero } from "@/components/route-hero";
import { archives } from "@/content/archives";
import { events } from "@/content/events";
import { momentGallery } from "@/content/media";

export default function HomePage() {
  const featuredEvent = events.find((event) => event.featured && !event.draft);
  const featuredArchive = archives[0];

  return (
    <>
      <RouteHero
        eyebrow="Ottawa / for the love of house"
        title="Frequency Shift"
        titleLines={["Frequency", "Shift"]}
        body="Raw energy. Pure frequency."
        detail="Freedom, self-expression, and connection through music."
        imageSrc="/media/figma/hero-crowd.webp"
        actions={
          <Link className="button button--light" href="/archive" prefetch={false}>
            Enter the archive
          </Link>
        }
      />

      <section className="section signal-section" aria-labelledby="next-event-title">
        <div className="section-heading">
          <div data-reveal="clip">
            <p className="kicker">Upcoming transmission</p>
            <h2 id="next-event-title">
              Next <span className="gradient-text">up</span>
            </h2>
          </div>
          <Link className="button button--ghost" href="/events" data-reveal="up" prefetch={false}>
            View all events
          </Link>
        </div>
        <div className="event-grid">
          {featuredEvent ? (
            <EventCard event={featuredEvent} />
          ) : (
            <p className="empty-state" data-reveal="up">The next date is being tuned. Check back soon.</p>
          )}
        </div>
      </section>

      <section className="memory-section" aria-labelledby="memory-title">
        <div className="section-heading">
          <div data-reveal="clip">
            <p className="kicker">Moments from our last events</p>
            <h2 id="memory-title">
              In case you <span className="gradient-text">missed it</span>
            </h2>
          </div>
          {featuredArchive ? (
            <Link className="button button--ghost" href={`/archive/${featuredArchive.slug}`} data-reveal="up" prefetch={false}>
              Open the archive
            </Link>
          ) : null}
        </div>
        <div className="memory-strip" aria-label="Selected event moments">
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
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="split-section about-teaser" aria-labelledby="manifesto-title">
        <div data-reveal="clip">
          <p className="kicker">Our frequency</p>
          <h2 id="manifesto-title">Ottawa’s underground, on its own frequency.</h2>
        </div>
        <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <p>
            Frequency Shift channels the raw energy of a rave into Ottawa rooms
            built for dancers. Solo nights, partner takeovers, and two-stage
            gatherings all serve the same idea: freedom, self-expression, and a
            community that connects through sound.
          </p>
          <Link className="text-link" href="/about" prefetch={false}>
            Read our story <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
