import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "Why Frequency Shift is building Ottawa’s underground through house music, freedom, and community.",
};

export default function AboutPage() {
  return (
    <div className="page-shell about-page">
      <PageHeader
        eyebrow="Why we gather"
        title="About"
        intro="Frequency Shift channels raw underground energy into Ottawa rooms built for freedom, self-expression, and connection through music."
        motion={false}
      />
      <section className="split-section section--rule about-section">
        <h2>Built for the dancefloor.</h2>
        <div className="prose prose--large">
          <p>
            Frequency Shift began with a simple idea: Ottawa deserved house
            nights with the intimacy of a local room and the charge of a larger
            underground scene. Every edition is shaped around the dancefloor—
            close, expressive, and driven by the people in it.
          </p>
          <p>
            What started as a single night has grown through solo editions,
            partner takeovers, and Frequency Fest at Club SAW. The format
            changes; the intent stays constant: strong sound, room to move, and
            a crowd that becomes part of the event.
          </p>
          <a
            className="text-link"
            href="https://www.instagram.com/p/DMdwuDnvnKH/"
            target="_blank"
            rel="noreferrer"
          >
            Read the original statement
          </a>
        </div>
      </section>
      <section className="split-section section--rule about-section">
        <h2>Made together.</h2>
        <div className="prose prose--large">
          <p>
            Each night is shared work. Artists set the direction; venues,
            production crews, photographers, and collaborators give it form;
            dancers give it life.
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
