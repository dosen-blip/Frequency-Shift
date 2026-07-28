import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the Frequency Shift website handles visitor information.",
};

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Site information"
        title="Privacy"
        intro="A plain-language note on what this website does—and does not—collect."
      />
      <section className="split-section section--rule">
        <h2>On this site.</h2>
        <div className="prose prose--large" data-reveal="up">
          <p>
            Frequency Shift does not offer visitor accounts or collect personal
            information through forms on this website. We do not use the site to
            build marketing profiles.
          </p>
          <p>
            Our hosting provider may process standard request information needed
            to deliver and protect the site, such as an IP address, browser
            details, and request time.
          </p>
        </div>
      </section>
      <section className="split-section section--rule">
        <h2>Other platforms.</h2>
        <div className="prose prose--large" data-reveal="up">
          <p>
            Links to Instagram, ticket providers, artists, venues, and partners
            lead to services with their own privacy practices. Messages sent to
            Frequency Shift on Instagram are handled there, not by this website.
          </p>
          <p>
            For a privacy question, message{" "}
            <a href={siteConfig.instagram.href} target="_blank" rel="noreferrer">
              {siteConfig.instagram.handle}
            </a>
            .
          </p>
          <p className="policy-date">Last updated July 28, 2026.</p>
        </div>
      </section>
    </div>
  );
}
