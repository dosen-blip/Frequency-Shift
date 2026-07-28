import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the Frequency Shift website.",
};

export default function TermsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Site information"
        title="Terms"
        intro="A short guide to event information, tickets, media, and external links."
      />
      <section className="split-section section--rule">
        <h2>Event information.</h2>
        <div className="prose prose--large" data-reveal="up">
          <p>
            This site is an informational record of Frequency Shift events.
            Dates, lineups, set times, venues, and entry requirements can change.
            When details differ, the current organizer or ticket-provider listing
            takes precedence.
          </p>
          <p>
            Ticket purchases, refunds, transfers, and admission are governed by
            the ticket provider, event organizer, and venue involved in that
            event.
          </p>
        </div>
      </section>
      <section className="split-section section--rule">
        <h2>Archive and links.</h2>
        <div className="prose prose--large" data-reveal="up">
          <p>
            Photographs, artwork, names, and other credited material remain the
            property of their respective owners. Their appearance in the archive
            does not grant permission to reproduce or redistribute them.
          </p>
          <p>
            External links are provided for context and convenience. Frequency
            Shift does not control the content or availability of third-party
            services.
          </p>
          <p className="policy-date">Last updated July 28, 2026.</p>
        </div>
      </section>
    </div>
  );
}
