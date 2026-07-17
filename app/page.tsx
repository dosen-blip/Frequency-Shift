import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { RouteHero } from "@/components/route-hero";
import { archives } from "@/content/archives";
import { events } from "@/content/events";
import { momentGallery } from "@/content/media";

export default function HomePage() {
  const featuredEvent = events.find((event) => event.featured);
  const featuredArchive = archives[0];

  return (
    <>
      <RouteHero
        eyebrow="Ottawa / independent dance culture"
        title="Frequency Shift"
        body="Underground dance music rituals"
        detail="Raw energy / pure frequency"
        imageSrc="/media/figma/hero-crowd.webp"
        actions={
          <Link className="button button--light" href="/events">
            See what’s next
          </Link>
        }
      />

      <section className="section signal-section" aria-labelledby="next-event-title">
        <div className="section-heading">
          <div>
            <p className="kicker">Upcoming transmission</p>
            <h2 id="next-event-title">
              Next <span className="gradient-text">up</span>
            </h2>
          </div>
          <Link className="button button--ghost" href="/events">
            View all events
          </Link>
        </div>
        <div className="event-grid">
          {featuredEvent ? (
            <EventCard event={featuredEvent} />
          ) : (
            <p className="empty-state">The next date is being tuned. Check back soon.</p>
          )}
        </div>
      </section>

      <section className="memory-section" aria-labelledby="memory-title">
        <div className="section-heading">
          <div>
            <p className="kicker">Moments from our last events</p>
            <h2 id="memory-title">
              In case you <span className="gradient-text">missed it</span>
            </h2>
          </div>
          {featuredArchive ? (
            <Link className="button button--ghost" href={`/archive/${featuredArchive.slug}`}>
              Open the archive
            </Link>
          ) : null}
        </div>
        <div className="memory-strip" aria-label="Selected event moments">
          {momentGallery.slice(0, 5).map((image) => (
            <figure key={image.src}>
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
        <div>
          <p className="kicker">Our frequency</p>
          <h2 id="manifesto-title">Built around the room, not the algorithm.</h2>
        </div>
        <div className="prose prose--large">
          <p>
            Every event becomes a living story: announcement, lineup, ticket
            release, event day, and archive. Fast, legible, and expressive at
            every stage.
          </p>
          <Link className="text-link" href="/about">
            Read our approach <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
