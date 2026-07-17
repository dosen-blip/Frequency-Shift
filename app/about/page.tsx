import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "Why Frequency Shift exists and how it approaches events.",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Why we gather"
        title="About"
        intro="Frequency Shift creates room for exploratory dance music and the people who keep local culture moving."
      />
      <section className="split-section section--rule">
        <h2>Intentional by design.</h2>
        <div className="prose prose--large">
          <p>
            The site is structured around clarity first: a real event lifecycle,
            direct ticket state, accessible navigation, and useful information at
            every screen size.
          </p>
          <p>
            The visual system can still flex from edition to edition through art
            direction, typography, colour, photography, and motion—without making
            the experience harder to use.
          </p>
        </div>
      </section>
    </div>
  );
}
