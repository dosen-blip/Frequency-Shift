import Link from "next/link";
import { NeonWordmark } from "./neon-wordmark";

export function HomeHero() {
  return (
    <section className="route-hero home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__media" aria-hidden="true">
        <img
          src="/media/figma/event-tech.webp"
          alt=""
          width="1600"
          height="1066"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="home-hero__veil" aria-hidden="true" />
      <div className="home-hero__content">
        <h1 id="home-hero-title" className="sr-only">
          Frequency Shift
        </h1>
        <NeonWordmark />
        <div className="home-hero__statement">
          <p className="home-hero__mantra route-hero__body">
            For the love of house.
          </p>
        </div>
        <div className="home-hero__actions route-hero__actions">
          <Link className="button button--solid" href="/events">
            See upcoming events
          </Link>
          <Link className="button button--ghost" href="/archive">
            Enter the archive
          </Link>
        </div>
      </div>
      <a
        className="home-hero__scroll"
        href="#next-transmission"
        aria-label="Next transmission"
      >
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
