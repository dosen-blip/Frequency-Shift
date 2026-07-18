import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "Why Frequency Shift is building Ottawa’s underground through house music, freedom, and community.",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Why we gather"
        title="About"
        intro="Frequency Shift channels raw underground energy into Ottawa rooms built for freedom, self-expression, and connection through music."
      />
      <section className="split-section section--rule">
        <h2 data-reveal="clip">Not just another night out.</h2>
        <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <p>
            The idea began with house music and a clear ambition: bring the raw,
            communal spirit people chase in larger scenes into Ottawa on its own
            terms. A Frequency Shift room should feel free, expressive, and fully
            connected to the dancefloor—not like a routine night at the club.
          </p>
          <p>
            Before the OGS018 collaboration, the collective remembered expecting
            70 people at the previous event and seeing nearly 200 arrive. That
            response turned an idea into a growing series of solo nights, partner
            takeovers, and the first two-stage Frequency Fest at Club SAW.
          </p>
          <a
            className="text-link"
            href="https://www.instagram.com/p/DMdwuDnvnKH/"
            target="_blank"
            rel="noreferrer"
          >
            Read the original statement <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <section className="split-section section--rule">
        <h2 data-reveal="clip">Built with the room.</h2>
        <div className="prose prose--large" data-reveal="up" style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          <p>
            Artists shape the sound. Production crews build stages and systems.
            Venues host, photographers keep the memory, collaborators widen the
            circle, and dancers complete the night. Frequency Shift is the signal
            that passes between all of them.
          </p>
          <p>
            The archive keeps those relationships visible alongside the images:
            names, lineups, places, credits, and source posts remain part of each
            event story rather than disappearing after the final track.
          </p>
        </div>
      </section>
    </div>
  );
}
