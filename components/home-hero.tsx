import Link from "next/link";

function NeonWordmarkLayer({ className }: { className: string }) {
  return (
    <picture className={className} aria-hidden="true">
      <source
        media="(max-width: 760px)"
        srcSet="/media/brand/frequency-shift-wordmark-neon-mobile.svg"
      />
      <img
        src="/media/brand/frequency-shift-wordmark-neon.svg"
        alt=""
        width="1456"
        height="103"
        decoding="async"
      />
    </picture>
  );
}

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
        <p className="home-hero__meta route-hero__eyebrow">
          Ottawa · House music · Community
        </p>
        <h1 id="home-hero-title" className="sr-only">
          Frequency Shift
        </h1>
        <div className="neon-wordmark" aria-hidden="true">
          <NeonWordmarkLayer className="neon-wordmark__layer neon-wordmark__layer--ambient" />
          <NeonWordmarkLayer className="neon-wordmark__layer neon-wordmark__layer--bloom" />
          <NeonWordmarkLayer className="neon-wordmark__layer neon-wordmark__layer--core" />
        </div>
        <div className="home-hero__statement">
          <p className="home-hero__mantra route-hero__body">
            For the love of house.
          </p>
          <p className="home-hero__detail route-hero__mantra">
            Freedom, self-expression, and connection through music.
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
      <a className="home-hero__scroll" href="#next-transmission">
        <span>Next transmission</span>
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
