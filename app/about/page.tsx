import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "Why we’re building Ottawa’s underground through house music, freedom, and community.",
};

export default function AboutPage() {
  return (
    <div className="page-shell about-page">
      <PageHeader
        eyebrow="Why we gather"
        title="About"
        intro="We bring raw underground energy into Ottawa rooms built for freedom, self-expression, and connection through music."
        motion={false}
      />
      <section className="split-section section--rule about-section">
        <h2>Built for the dancefloor.</h2>
        <div className="prose prose--large">
          <p>
            We started Frequency Shift with a simple idea: Ottawa deserved
            house nights with the intimacy of a local room and the charge of a
            larger underground scene. We shape every edition around the
            dancefloor—close, expressive, and driven by the people in it.
          </p>
          <p>
            Since that first night, we’ve moved through solo editions, partner
            takeovers, and Frequency Fest at Club SAW. The format changes, but
            what matters stays the same: strong sound, room to move, and a crowd
            that becomes part of the night.
          </p>
          <a
            className="text-link"
            href="https://www.instagram.com/p/DMdwuDnvnKH/"
            target="_blank"
            rel="noreferrer"
          >
            Read where it started
          </a>
        </div>
      </section>
      <section className="split-section section--rule about-section">
        <h2>Made together.</h2>
        <div className="prose prose--large">
          <p>
            Every night is shared work. Artists set the direction; venues,
            production crews, photographers, and collaborators help us build
            the room; dancers give it life.
          </p>
          <p>
            We keep those relationships visible in the archive alongside the
            images. Names, lineups, places, credits, and original posts stay
            with each event instead of disappearing after the final track.
          </p>
        </div>
      </section>
    </div>
  );
}
