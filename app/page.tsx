import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { RouteHero } from "@/components/route-hero";
import { archives } from "@/content/archives";
import { events } from "@/content/events";

export default function HomePage() {
  const featuredEvent = events.find((event) => event.featured);
  const featuredArchive = archives[0];

  return (
    <>
      <RouteHero
        eyebrow="Independent dance culture / Ottawa"
        title="A signal for people who move differently."
        body="Frequency Shift is an event platform for forward-facing electronic music, intentional rooms, and the community that forms around them."
        actions={
          <>
            <Link className="button button--solid" href="/events">
              See what’s next
            </Link>
            <Link className="button button--ghost" href="/archive">
              Enter the archive
            </Link>
          </>
        }
      />

      <section className="section section--rule" aria-labelledby="next-event-title">
        <div className="section-heading">
          <p className="kicker">Current transmission</p>
          <h2 id="next-event-title">Next event</h2>
        </div>
        {featuredEvent ? (
          <EventCard event={featuredEvent} />
        ) : (
          <p className="empty-state">The next date is being tuned. Check back soon.</p>
        )}
      </section>

      <section className="split-section section--rule" aria-labelledby="manifesto-title">
        <div>
          <p className="kicker">Our frequency</p>
          <h2 id="manifesto-title">Built around the room, not the algorithm.</h2>
        </div>
        <div className="prose prose--large">
          <p>
            The redesign treats every event as a living story: announcement,
            lineup, ticket release, event day, and archive. The experience stays
            fast and legible while the identity can become stranger, warmer, and
            more expressive over time.
          </p>
          <Link className="text-link" href="/about">
            Read our approach <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {featuredArchive ? (
        <section className="archive-teaser section--rule" aria-labelledby="archive-title">
          <div>
            <p className="kicker">Recently documented</p>
            <h2 id="archive-title">{featuredArchive.title}</h2>
            <p>{featuredArchive.summary}</p>
          </div>
          <Link className="button button--ghost" href={`/archive/${featuredArchive.slug}`}>
            View the recap
          </Link>
        </section>
      ) : null}
    </>
  );
}
