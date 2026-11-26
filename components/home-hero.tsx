import Link from "next/link";
import { NeonWordmark } from "./neon-wordmark";

// Before anything paints, a capable browser marks the page as launching: the laser room then opens the site as a
// full-screen power-on (public/laser-hero.js). Once a visit: coming back to the home page from another page, the
// show is already running (its start is kept in the session) and the room is simply there. The timer is a last
// resort, should that script never arrive.
const LAUNCH = `(function(d){var s;try{s=sessionStorage.getItem("fs-room-epoch")}catch(e){}try{if(!s&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&window.WebGL2RenderingContext){d.classList.add("is-launching");setTimeout(function(){d.classList.remove("is-launching")},9000)}}catch(e){}})(document.documentElement)`;

export function HomeHero() {
  return (
    <section className="route-hero home-hero" aria-labelledby="home-hero-title">
      <script dangerouslySetInnerHTML={{ __html: LAUNCH }} />
      <div className="home-hero__stage" data-laser-stage aria-hidden="true" />
      <div className="home-hero__veil" aria-hidden="true" />
      <div className="home-hero__content">
        <h1 id="home-hero-title" className="sr-only">
          Frequency Shift
        </h1>
        <NeonWordmark />
        <div className="home-hero__footer">
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
      </div>
      <a
        className="home-hero__scroll"
        href="#next-event"
        aria-label="Skip to the next event"
      >
        <span aria-hidden="true">↓</span>
      </a>
      <script src="/laser-hero.js" defer />
    </section>
  );
}
